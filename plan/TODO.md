# Todo

### Summary - General (T-1..T-3)
Portale SvelteKit 5 (DaisyUI/Tailwind, MongoDB+Mongoose, Stripe, nodemailer, pdfmake client-side) per l'associazione: membership, albo, corsi/eventi con certificati, shop con ordini e sconti, aree protette per user/riflessologo/formatore/admin, più un builder PDF condiviso ($lib/tools/trainingPdf) che stampa il riepilogo formazione dall'area personale e dal user-table. Invariante corsi ricorrenti: CQ112QCNK e F82B3JBZT sono sempre in vetrina ($or prodId) e re-iniettati dal filtro mese (recurringProdIds); course-detail salta listSubscribers/courseJoined per RECURRING_COURSES e instrada la mail a new-order-12massaggi, che brancha sul prodId (F82B3JBZT = corso del 15 di ogni mese con link Zoom dedicato; CQ112QCNK = template 12 Massaggi byte-identico). Le email di ordine mostrano nome/cognome/telefono del riflessologo titolare del corso (lookup non bloccante in new-order).

### Summary - T-4
Il tab Gestione Formazione di /profile-area ha ora un bottone Scarica PDF Formazione che genera client-side (pdfmake) un riepilogo A4 con logo Dienchan in header, tabella Data/Descrizione/Ore/Stato di tutte le voci e riga totali con ore approvate e conteggio approvate. Verificato con probe che renderizza il PDF reale (1 pagina, logo incluso) + autofixer + check.

### Summary - T-5
L'admin stampa lo storico formazione di qualsiasi utente dal modal del user-table: il builder è stato estratto in $lib/tools/trainingPdf (usato anche dal profile-area, output PDF byte-identico) e il modal preferisce la riga più fresca di tableList, con fallback sullo stato. Verificato con autofixer, npm run check (0 errori nuovi) e probe che ri-renderizza il PDF.
