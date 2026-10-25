# PA-28-181 Ground Roll Lab — v0.2

**NON VALIDATE PER USO OPERATIVO — NON UTILIZZARE PER LA PIANIFICAZIONE O DECISIONE DI DECOLLO.**

PWA mobile-first, senza dipendenze. Quote pressione in ft, OAT in °C, massa in kg, vento lungo pista in kt, risultato in m. Flap 0° / 25°.

## Avvio

Aprire `index.html` localmente per provarne l'interfaccia. Per installazione offline tramite Service Worker ospitare **l'intera cartella** su HTTPS (ad esempio GitHub Pages o un server web HTTPS), aprire la pagina dallo smartphone, quindi usare «Aggiungi a schermata Home» (Safari iOS) o «Installa app» (Chrome Android). Il collegamento al POH richiede rete; il calcolo sperimentale no.

## Fondamento e limiti del motore

POH Piper Archer II report VB-1120, figura 5-11: 2000 ft / 21 °C / 2400 lb / 8 kt frontali / 1100 ft rullata (335,28 m). Figura 5-13: medesime condizioni, flap 25° e vento 10 kt / 950 ft rullata (289,56 m).

**Il motore non è una digitalizzazione della nomografia.** Al variare dei parametri utilizza formule proxy sperimentali in `app.js` (densità, peso, vento), non validate e non garantite conservative. L'app riproduce solo i due esempi citati alle rispettive condizioni. Tutti gli altri risultati sono stime fittizie a scopo di prototipazione dell'interfaccia.

Non interpreta ostacoli, erba, slope, contaminazione, technique, condizioni motore. Non approvato da Piper/FAA/EASA.

## Passi successivi

1. Digitizzare diversi punti sull'intera nomografia dal POH applicabile alla cellula.
2. Sostituire `provisionalEstimate` con lookup/interpolazione e test automatici su punti POH indipendenti.
3. Gestire condizioni fuori campo senza estrapolare.
4. Aggiungere takeoff over 50 ft solo dopo validazione del modello ground roll.

Fonte: https://www.andrews.edu/cp/aviation/resources/archerii-poh.pdf

## Novità v0.2

- Motore separato (`engine.js`) e test automatici (`tests.js`), eseguibili con `node tests.js`.
- Distingue conversione di un **esempio POH noto** (`ESEMPIO POH`) da una stima approssimata (`STIMA SPERIMENTALE`).
- Aggiornamento istantaneo su input, avvisi fuori campo e cache PWA aggiornata.
- Importante: la formula fuori dai punti POH è **ancora quella provvisoria v0.1**, non un'interpolazione digitalizzata, quindi la precisione NON è migliorata.
- L'adeguamento numerico alle curve originali richiede ulteriori misurazioni e verifica indipendente.

## Aggiornamento GitHub Pages

Sostituire i file esistenti con tutti i file della cartella `pa28-pwa` (incluso `engine.js`) alla radice del repository. Attendere il completamento della pubblicazione e ricaricare la pagina; il service worker usa una nuova chiave di cache `pa28-groundroll-v02`.
