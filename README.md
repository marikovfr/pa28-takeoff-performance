# PA-28-181 Ground Roll Lab — v0.5

**NON VALIDATE PER USO OPERATIVO. Non usare per decisioni di volo.**

La v0.5 aggiunge la visualizzazione delle scansioni originali delle figure POH **5-11** e **5-13**; clic/tap sulla scansione registra il punto relativo normalizzato (x,y) assieme alla lettura manuale, *senza trasformare la posizione in una distanza*. Esportazione JSON e dati locali delle versioni precedenti vengono mantenuti (chiave dati invariata).

**Importante:** le scansioni sono a risoluzione limitata; non è possibile estrarre curve affidabili o ricavare performance validate da questa versione. Nessun punto non verificato entra nel modello. Il motore di calcolo resta lo stesso della v0.4: due esempi documentati e una modalità simulativa separata, non derivata dalle curve.

La cache PWA passa a network-first, con fallback offline. Per GitHub Pages caricare tutti i file, incluse le due immagini PNG, nella root del repository e fare commit.

POH di riferimento: https://www.mfu-pilotenclub.at/wp-content/uploads/2023/04/kbs-poh.pdf (PA-28-181 Archer II, VB-1120; verificare applicabilità all'esemplare).
