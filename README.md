# PA28 v0.14 — correzioni visualizzazione

- Etichetta della distanza collocata sotto il segmento di lettura finale.
- Tratta del peso disegnata mediante interpolazione geometrica fra due curve rosse originali (pendenza verificata sul caso POH).
- Prolungamento limitato delle curve di quota verso il basso per basse temperature, non oltre 65 px dal tracciato e non oltre il pannello.
- Blocchi invariati: fuori dalle curve peso o vento nessuna estrapolazione indiscriminata; vento in coda non disponibile.

Test: 2000 ft, 21°C, 2400 lb, +10 kt -> 967.82 ft; pendenza del peso = media ponderata delle due curve rosse.

**NON VALIDATO PER USO OPERATIVO**
