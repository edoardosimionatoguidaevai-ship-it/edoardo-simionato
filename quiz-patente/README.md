# Quiz Patente B

App web (installabile su telefono) per far esercitare gli allievi sui quiz ministeriali della patente B.

- **Simulazione d'esame**: 30 domande Vero/Falso da tutti i capitoli, 20 minuti, superata con al massimo 3 errori.
- **Esercizio per capitolo**: 30 domande a caso del capitolo scelto, con correzione immediata.
- **Ripasso errori**: ripropone le domande sbagliate; una risposta giusta le toglie dal ripasso.

I progressi restano sul telefono dell'allievo (localStorage), senza account né database.
Al primo avvio l'allievo inserisce nome e cognome; con i pulsanti verdi può inviare all'istruttore
su WhatsApp il risultato di una simulazione (con l'elenco degli errori) o il riepilogo dei progressi.
Il numero dell'istruttore si imposta in `lib/whatsapp.ts` (`NUMERO_WHATSAPP_ISTRUTTORE`); se è vuoto,
WhatsApp chiede all'allievo a quale contatto inviare.
Al primo avvio l'allievo inserisce nome e cognome; con i pulsanti verdi può inviare all'istruttore
su WhatsApp il risultato di una simulazione (con l'elenco degli errori) o il riepilogo dei progressi.
Il numero dell'istruttore si imposta in `lib/whatsapp.ts` (`NUMERO_WHATSAPP_ISTRUTTORE`); se è vuoto,
WhatsApp chiede all'allievo a quale contatto inviare.

## Domande

`public/quiz.json` contiene 7131 domande in 25 capitoli (listato ministeriale 2023, dal repository
[Ed0ardo/QuizPatenteB](https://github.com/Ed0ardo/QuizPatenteB)); le figure sono in `public/img_sign/`.
Per aggiornare il listato con un file nello stesso formato:

```bash
npm run converti-listato -- percorso/quizPatenteB.json
```

## Sviluppo

```bash
npm install
npm run dev
```

## Pubblicazione su Vercel

È un progetto separato dall'app "Guide": su Vercel creare un nuovo progetto dallo stesso repository
e impostare **Root Directory** = `quiz-patente`.
