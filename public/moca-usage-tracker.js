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
 *   - ACTIVE time spent inside the app
 *
 * Active-time model (so an app left open but idle does NOT inflate the data):
 *   - Time is counted only between real user interactions (click, keydown,
 *     scroll, touch, wheel, pointerdown).
 *   - The gap between two interactions counts as active ONLY if it is shorter
 *     than the idle timeout (default 2 minutes).
 *   - If there are no interactions for longer than the idle timeout, the
 *     session is frozen and closed (the idle gap is never counted).
 *   - The next interaction within the timeout resumes the same session; after
 *     the timeout it starts a brand-new opening.
 *
 * Include AFTER moca-sdk.js:
 *   <script src="/moca-usage-tracker.js"></script>
 *
 * Optional overrides (set before this script runs):
 *   window.__MOCA_HUB_URL__       = 'https://your-hub.netlify.app';
 *   window.__MOCA_IDLE_MINUTES__  = 2;   // inactivity timeout in minutes
 *
 * @version 2.0.0
 */
(function () {
  'use strict';

  var HUB_URL = (window.__MOCA_HUB_URL__ || 'https://moca-central-hub.netlify.app').replace(/\/$/, '');
  var ENDPOINT = HUB_URL + '/api/track-usage';
  var SESSION_KEY = 'moca_session';
  var TRACK_KEY = 'moca_usage_tracker';

  var IDLE_MIN = Number(window.__MOCA_IDLE_MINUTES__);
  if (!isFinite(IDLE_MIN) || IDLE_MIN <= 0) IDLE_MIN = 2;
  var IDLE_MS = IDLE_MIN * 60 * 1000;   // inactivity timeout
  var TICK_MS = 15 * 1000;              // check/report cadence
  var WAIT_MS = 500;                    // poll interval waiting for the session
  var WAIT_MAX = 60;                    // give up after ~30s

  // Never track local development / mock mode.
  var host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') return;

  var st = {
    sid: null,
    activeMs: 0,        // accumulated ACTIVE time for the current session
    lastActivity: 0,    // ts of last interaction (or session start)
    active: false,      // a live (not yet closed) session exists
    stamp: '',          // moca_session timestamp (ties a session to a login)
    identity: null,
  };

  function nowMs() { return new Date().getTime(); }

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
      if (!s || !s.user) return null; // need at least a role to attribute
      return s;
    } catch (e) {
      return null;
    }
  }

  function identityFrom(session) {
    var user = session.user || {};
    var app = session.application || {};
    var client = session.client || {};
    return {
      application_id: app.id || null,
      application_name: app.name || null,
      client_id: client.id || null,
      client_name: client.name || null,
      role: user.role || null,
      page_path: window.location.pathname || '/',
      user_agent: navigator.userAgent || null,
    };
  }

  function persist() {
    try {
      sessionStorage.setItem(TRACK_KEY, JSON.stringify({
        sid: st.sid, activeMs: st.activeMs, lastActivity: st.lastActivity,
        active: st.active, stamp: st.stamp,
      }));
    } catch (e) { /* noop */ }
  }

  // Send as text/plain so it's a "simple" CORS request (no preflight); the
  // function JSON.parses the body regardless of content-type.
  function send(payload, useBeacon) {
    var data = JSON.stringify(payload);
    try {
      if (useBeacon && navigator.sendBeacon) {
        navigator.sendBeacon(ENDPOINT, new Blob([data], { type: 'text/plain;charset=UTF-8' }));
        return;
      }
    } catch (e) { /* fall through */ }
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

  function durationSec() { return Math.max(0, Math.round(st.activeMs / 1000)); }

  function startSession(atMs) {
    st.sid = uuid();
    st.activeMs = 0;
    st.lastActivity = atMs;
    st.active = true;
    persist();
    var payload = { event: 'start', session_id: st.sid };
    for (var k in st.identity) payload[k] = st.identity[k];
    send(payload, false);
  }

  function endSession(useBeacon) {
    if (!st.active || !st.sid) return;
    st.active = false;
    persist();
    send({ event: 'end', session_id: st.sid, active_seconds: durationSec() }, !!useBeacon);
  }

  function heartbeat() {
    if (!st.active || !st.sid) return;
    send({ event: 'heartbeat', session_id: st.sid, active_seconds: durationSec() }, false);
  }

  // A real interaction happened.
  function onActivity() {
    var t = nowMs();
    if (!st.active) { startSession(t); return; }
    var gap = t - st.lastActivity;
    if (gap > IDLE_MS) {
      // Too long since the last interaction → close the old session and open
      // a new one. The idle gap is never counted.
      endSession(false);
      startSession(t);
      return;
    }
    // Engaged: count the gap between interactions as active time.
    st.activeMs += gap;
    st.lastActivity = t;
    persist();
  }

  // Periodic check: freeze/close on idle, otherwise report progress.
  function tick() {
    if (!st.active) return;
    var gap = nowMs() - st.lastActivity;
    if (gap > IDLE_MS) {
      endSession(false); // idle → freeze the count (duration stays at last activity)
    } else {
      heartbeat();
    }
  }

  function begin(session) {
    st.stamp = String(session.timestamp || '');
    st.identity = identityFrom(session);

    // Resume a session across reloads within the same login, if the tab was
    // reloaded quickly (within the idle timeout).
    var stored = null;
    try { stored = JSON.parse(sessionStorage.getItem(TRACK_KEY) || 'null'); } catch (e) { /* noop */ }

    var t = nowMs();
    if (stored && stored.active && stored.stamp === st.stamp && stored.sid &&
        (t - stored.lastActivity) <= IDLE_MS) {
      st.sid = stored.sid;
      st.activeMs = (stored.activeMs || 0) + (t - stored.lastActivity); // reload counts as engagement
      st.lastActivity = t;
      st.active = true;
      persist();
      heartbeat();
    } else {
      startSession(t); // brand-new opening
    }

    // Interaction listeners (passive, capture so nested handlers can't swallow).
    var opts = { capture: true, passive: true };
    ['click', 'pointerdown', 'keydown', 'scroll', 'touchstart', 'wheel'].forEach(function (ev) {
      window.addEventListener(ev, onActivity, opts);
    });

    setInterval(tick, TICK_MS);

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') heartbeat();
    });
    window.addEventListener('pagehide', function () { endSession(true); });
    window.addEventListener('beforeunload', function () { endSession(true); });
  }

  // Wait for the Moca SDK to establish the session, then start.
  var tries = 0;
  (function waitForSession() {
    var session = readSession();
    if (session) { begin(session); return; }
    if (tries++ >= WAIT_MAX) return;
    setTimeout(waitForSession, WAIT_MS);
  })();
})();
