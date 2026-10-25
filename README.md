# PA-28-181 Ground Roll Lab — v0.4

**NON VALIDATE PER USO OPERATIVO.** Non utilizzare per decisioni di volo.

## Novità
- Laboratorio di acquisizione manuale di punti dai grafici **5-11 (flap 0°)** e **5-13 (flap 25°)** del POH Piper Archer II VB-1120.
- Form con quota pressione in ft, OAT in °C, massa in kg, vento in kt, ground roll in metri; verifica intervalli e duplicati.
- Salvataggio locale nel browser ed export JSON, con stato **unverified** per ogni lettura.
- I nuovi punti **NON alimentano il calcolo**: nessuna interpolazione viene dichiarata POH prima della ricostruzione e revisione indipendente delle curve.
- Due soli esempi POH verificati; modalità approssimata a consenso esplicito come nella v0.3.
- Cache offline versione v04; pannello mobile.

## Processo di digitalizzazione
1. Leggere un punto dal grafico originale e annotare figura e condizioni complete.
2. Registrarlo nel laboratorio, aggiungendo note sulle incertezze.
3. Esportare JSON e confrontare sistematicamente le letture con le figure originali (meglio se da scansioni ad alta risoluzione).
4. Solo dopo verifica indipendente, campionamento sufficiente e test su punti esterni sviluppare interpolazione delimitata dal dominio.

## GitHub Pages
Carica **tutti i file** di questa cartella nella root del repository, sovrascrivendo gli esistenti. Non caricare solo index.html.

## Fonte
https://www.mfu-pilotenclub.at/wp-content/uploads/2023/04/kbs-poh.pdf
Il manuale applicabile dipende dall'esemplare specifico e dalle revisioni.
