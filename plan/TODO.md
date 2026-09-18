# Todo

### Summary - General (T-1)
Il corso F82B3JBZT (Van Tri Truong) è ora ricorrente come "Workshop: 12 Massaggi mattutini": sempre in vetrina via $or prodId $in (course-shop server), re-iniettato dal filtro mese via recurringProdIds e mostrato con "Il 15 di ogni mese" sulla card (course-shop svelte); in course-detail l'azione new salta listSubscribers/courseJoined per RECURRING_COURSES consentendo la re-iscrizione mensile e routa la mail a new-order-12massaggi, che ora brancha sul prodId del corso nel carrello: F82B3JBZT riceve un template dedicato (titolo dinamico del corso, riga "il 15 di ogni mese", link di registrazione Zoom us06web) mentre il template 12 Massaggi resta byte-identico. Verificato con npm run check (0 errori nuovi), SSR/DOM live della vetrina e probe API; il test end-to-end dell'invio mail non è stato eseguito per non creare ordini reali su MongoDB di produzione. Aperto: verificare in admin che eventStartDate di F82B3JBZT cada su un giorno 15.

### Summary - T-1
See Summary - General (T-1) — single-list chain, no separate scope chunks.
