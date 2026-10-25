# PA-28-181 Ground Roll Lab — v0.6

**NON VALIDATE PER USO OPERATIVO — NON USARE PER PIANIFICARE DECOLLI.**

La v0.6 aggiunge importazione di backup JSON (`pa28-unverified-point-readings-v1`), esportazione CSV per revisione manuale e controllo di coerenza dei punti (range, duplicati e posizione sulla scansione). Tutte le letture rimangono **NON verificate** e **NON entrano nei calcoli**. Non è ancora una digitalizzazione matematica delle curve del POH: il motore mantiene solo gli esempi POH documentati e una modalità sperimentale esplicitamente opzionale.

I dati locali sono conservati sotto la chiave `pa28-manual-readings-v04`. Importare e salvare un file JSON non certifica un punto: il controllo rileva errori strutturali, non verifica il dato rispetto al grafico. Prima di aggiornare o cancellare i dati, effettuare un export JSON.

## Installazione GitHub Pages

Estrarre lo ZIP e caricare **tutti** i file nella root del repository (inclusi i due PNG). Pubblicare da branch `main`, root. Con una connessione disponibile la PWA usa rete prima della cache; in assenza di rete può usare i file precedentemente memorizzati.

Fonte: POH Piper PA-28-181 Archer II, Report VB-1120, figure 5-11 e 5-13. Verificare sempre l'applicabilità del POH all'aeromobile specifico.
