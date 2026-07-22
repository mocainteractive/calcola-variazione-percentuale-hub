/**
 * Moca Usage Tracker
 *
 * Lightweight, framework-agnostic usage telemetry for Moca Hub satellite apps.
 * Ships as a static script (like moca-sdk.js) and works in both React and
 * vanilla apps — it only reads the `moca_session` saved by the Moca SDK and
 * pings the Hub's `track-usage` function.
 *
 * What it measures (anonymous — no user id is ever sent):
 *   - app openings (how often each app is opened)
 *   - which role opens it
 *   - time spent inside the app (heartbeat while the tab is visible)
 *
 * Include AFTER moca-sdk.js:
 *   <script src="/moca-usage-tracker.js"></script>
 *
 * The Hub URL defaults to production; override before this script runs with:
 *   <script>window.__MOCA_HUB_URL__ = 'https://your-hub.netlify.app';</script>
 *
 * @version 1.0.0
 */
(function () {
  'use strict';

  var HUB_URL = (window.__MOCA_HUB_URL__ || 'https://moca-central-hub.netlify.app').replace(/\/$/, '');
  var ENDPOINT = HUB_URL + '/api/track-usage';
  var SESSION_KEY = 'moca_session';
  var TRACK_KEY = 'moca_usage_tracker';
  var HEARTBEAT_MS = 30 * 1000; // ping every 30s while visible
  var WAIT_MS = 500; // poll interval waiting for the session
  var WAIT_MAX = 60; // give up after ~30s

  // Never track local development / mock mode.
  var host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') return;

  var state = { sid: null, started: false, timer: null };

  function uuid() {
    try {
      if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    } catch (e) { /* noop */ }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function readSession() {
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      var s = JSON.parse(raw);
      // Need at least a user (for the role) to attribute the open.
      if (!s || !s.user) return null;
      return s;
    } catch (e) {
      return null;
    }
  }

  // Send a small JSON payload as text/plain so the browser treats it as a
  // "simple" request (no CORS preflight). The function JSON.parses the body
  // regardless of content-type.
  function send(payload, useBeacon) {
    var data = JSON.stringify(payload);
    try {
      if (useBeacon && navigator.sendBeacon) {
        var blob = new Blob([data], { type: 'text/plain;charset=UTF-8' });
        navigator.sendBeacon(ENDPOINT, blob);
        return;
      }
    } catch (e) { /* fall through to fetch */ }
    try {
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: data,
        keepalive: true,
        mode: 'cors',
      }).catch(function () { /* telemetry must never break the app */ });
    } catch (e) { /* noop */ }
  }

  function identity(session) {
    var user = session.user || {};
    var app = session.application || {};
    var client = session.client || {};
    return {
      session_id: state.sid,
      application_id: app.id || null,
      application_name: app.name || null,
      client_id: client.id || null,
      client_name: client.name || null,
      role: user.role || null,
      page_path: window.location.pathname || '/',
      user_agent: navigator.userAgent || null,
    };
  }

  function heartbeat(useBeacon, ended) {
    if (!state.sid) return;
    send({ event: ended ? 'end' : 'heartbeat', session_id: state.sid }, !!useBeacon);
  }

  function startTracking(session) {
    if (state.started) return;

    // Reuse the same usage session across reloads within the same app session
    // (keyed on the moca_session timestamp) so a refresh continues the dwell
    // time instead of counting a brand-new opening.
    var stamp = String(session.timestamp || '');
    var existing = null;
    try { existing = JSON.parse(sessionStorage.getItem(TRACK_KEY) || 'null'); } catch (e) { /* noop */ }

    if (existing && existing.stamp === stamp && existing.sid) {
      state.sid = existing.sid;
      state.started = true;
      heartbeat(false, false); // resume: refresh last_seen
    } else {
      state.sid = uuid();
      state.started = true;
      try { sessionStorage.setItem(TRACK_KEY, JSON.stringify({ sid: state.sid, stamp: stamp })); } catch (e) { /* noop */ }
      send(Object.assign({ event: 'start' }, identity(session)), false);
    }

    // Heartbeat only while the tab is actually visible.
    state.timer = setInterval(function () {
      if (document.visibilityState === 'visible') heartbeat(false, false);
    }, HEARTBEAT_MS);

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') heartbeat(true, false);
    });
    window.addEventListener('pagehide', function () { heartbeat(true, true); });
    window.addEventListener('beforeunload', function () { heartbeat(true, true); });
  }

  // Wait for the Moca SDK to establish the session, then start.
  var tries = 0;
  (function waitForSession() {
    var session = readSession();
    if (session) { startTracking(session); return; }
    if (tries++ >= WAIT_MAX) return;
    setTimeout(waitForSession, WAIT_MS);
  })();
})();
