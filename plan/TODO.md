# Todo

### Summary - General (T-1..T-3)
Portale SvelteKit 5 (DaisyUI/Tailwind, MongoDB+Mongoose, Stripe, nodemailer, pdfmake client-side) per l'associazione: membership, albo, corsi/eventi con certificati, shop con ordini e sconti, aree protette per user/riflessologo/formatore/admin, più un builder PDF condiviso ($lib/tools/trainingPdf) che stampa il riepilogo formazione dall'area personale e dal user-table. Invariante corsi ricorrenti: CQ112QCNK e F82B3JBZT sono sempre in vetrina ($or prodId) e re-iniettati dal filtro mese (recurringProdIds); course-detail salta listSubscribers/courseJoined per RECURRING_COURSES e instrada la mail a new-order-12massaggi, che brancha sul prodId (F82B3JBZT = corso del 15 di ogni mese con link Zoom dedicato; CQ112QCNK = template 12 Massaggi byte-identico). Le email di ordine mostrano nome/cognome/telefono del riflessologo titolare del corso (lookup non bloccante in new-order).

### Summary - T-6 (RISOLTA 2026-10-19 — regola decisa dall'utente)
**Rinnovo ANTICIPATO: un anno si somma alla scadenza attuale. TARDIVO o prima tessera: 12 mesi dalla data di pagamento confermato.**
Carta: `membershipHandler` legge la scadenza a DB dentro `once(pending, 'membershipApplied')` e somma, altrimenti parte da adesso; vitalizio 100 anni. Bonifico: stessa regola in `order-table` pending→done. Il `once()` serve: senza, un retry del webhook aggiungerebbe un anno.

### Summary - T-8
La card di /course-shop mostra la città del corso (`product.location`) su una riga sotto la provincia, troncata a una riga con tooltip, e la nasconde quando vale "Online" (la provincia è già "Online"). Le altezze fisse sono passate a h-132/h-146 perché la riga in più tagliava il bottone; verificato a schermo: 67 card a 582px, zero clip. Vedi plan/GOTCHAS.md T-8.
