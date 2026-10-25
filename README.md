# PA-28-181 Figure 5-13 · prototipo v0.9

**NON VALIDATO PER USO OPERATIVO.**

Questa cartella è direttamente pubblicabile su GitHub Pages: caricare **tutti i file** nella radice del repository e attivare Settings → Pages → Deploy from a branch. Non è un aggiornamento automatico del sito dell’utente.

Funziona su HTTPS (PWA offline dopo il primo caricamento). La pagina è utilizzabile su iPhone/Android. Tutti i risultati derivano da geometrie preliminari delle linee tracciate manualmente, non da dati approvati per l'uso aeronautico.

**Campo:** solo Figure 5-13 ground roll flap 25°, vento frontale da 0 a 15 kt. Vento in coda, flap 0° e ostacolo 50 ft non sono calcolati. Interpolazione di quota fra curve adiacenti solo quando entrambi i tratti sono disponibili. Scala °C e massa lb in coordinate ancora approssimate.

Punto POH noto 2.000 ft, 21 °C, 2.400 lb, 10 kt frontali, 950 ft. Tolleranza ±2% riferita soltanto alla digitalizzazione di quell'esempio. La prova singola **non valida** la superficie generale del nomogramma né le prestazioni reali.

Per collaudare, usare `python -m http.server 8000` dalla cartella e aprire `http://localhost:8000`. Il calcolo con massa è in kg (2.400 lb = circa 1088,622 kg).
