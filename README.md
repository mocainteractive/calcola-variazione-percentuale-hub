# Calcola Variazione Percentuale — Moca Hub

App satellite del **Moca Hub** per calcolare velocemente le variazioni percentuali.

## Funzionalità

1. **Variazione tra due valori** — inserisci un valore iniziale e uno finale e ottieni la
   variazione percentuale, la differenza assoluta e un grafico "prima/dopo".
2. **Applica una variazione percentuale** — inserisci un valore, scegli aumento o diminuzione
   e la percentuale (es. +20%) per ottenere il risultato, la differenza e il grafico "prima/dopo".

Il grafico prima/dopo è disegnato in SVG puro (nessuna libreria esterna) e colora in
verde gli aumenti e in rosso le diminuzioni. I numeri vengono interpretati e mostrati in
formato italiano (virgola come separatore decimale).

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS (Design System Moca v2.0 — font Figtree, icone `lucide-react`)
- Autenticazione tramite Moca SDK (launch token flow + Mock Mode in locale)

L'app è interamente client-side: non richiede backend, Netlify Functions o database.

## Sviluppo locale

```bash
npm install
npm run dev
```

In locale (`localhost`) il Moca SDK entra automaticamente in **Mock Mode** con un cliente e un
utente demo, quindi non serve un token del Hub per lavorare. In produzione l'app va aperta
tramite il Moca Hub, che fornisce il `moca_token`; senza token viene mostrata la schermata
"Accesso Negato".

## Build

```bash
npm run build      # type-check + build di produzione in dist/
npm run preview    # anteprima della build
```

## Deploy

Configurato per Netlify (vedi `netlify.toml`): build `npm run build`, cartella pubblicata `dist`,
redirect SPA in `public/_redirects`.
