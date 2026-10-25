# PA-28-181 Ground Roll Lab — v0.3

**NON VALIDATE PER USO OPERATIVO.** Vietato usarla per decisioni di decollo.

## Cosa cambia
- **Modalità prudente predefinita:** fuori dai due esempi documentati, il calcolatore NON mostra distanze arbitrarie.
- **Modalità sperimentale opt-in:** le vecchie stime proxy v0.1/v0.2 possono essere abilitate soltanto per test software; non sono basate sulle curve.
- Aggiunto `data-poh.json` con provenienza, due esempi documentati e contenitore vuoto per futura digitalizzazione verificabile.
- 8 controlli software, con `node tests.js`. Non sono prove di accuratezza di volo.
- Layout mobile, aggiornamento automatico e offline PWA conservati.

## Perché non abbiamo chiamato questa release “interpolazione POH”
I due esempi disponibili non consentono di ricostruire un modello in 4 variabili. Occorre estrarre più punti da entrambe le figure 5-11 e 5-13 e verificare su punti non utilizzati in calibrazione. I numeri mostrati in modalità sperimentale sono gli stessi coefficienti euristici precedenti, mai garantiti conservativi.

## Istruzioni di caricamento GitHub
Caricare tutti i file contenuti in questa cartella direttamente alla radice del repository GitHub Pages, sovrascrivendo gli omonimi. La cache usa `pa28-groundroll-v03` per forzare l'aggiornamento. Accertarsi che `index.html` sia nella root e che compaia `v0.3` in pagina.

## Condizioni di riferimento
POH Piper Archer II Report VB-1120: figure 5-11 (flap 0°, 2.000 ft, 21 °C, 2.400 lb, 8 kt headwind, 1.100 ft ground roll) e 5-13 (flap 25°, 2.000 ft, 21 °C, 2.400 lb, 10 kt headwind, 950 ft ground roll). Usare solo il POH approvato specifico per la cellula.
