# Gotchas — master list

(ALWAYS) read plan/GOTCHAS.md, plan/NOTES.md and plan/TODO.md
- (T-1) str_replace su righe CRLF adiacenti può fondere la riga successiva nel punto d'inserimento (`} = body;    const { orderId...` finì su una riga sola in new-order-12massaggi/+server.ts) → dopo OGNI edit ri-leggere la zona modificata e correggere subito; un edit "riuscito" può aver lasciato sintassi fusa.
