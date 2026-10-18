// Converte il listato ministeriale A/B nel file compatto public/quiz.json usato dall'app.
//
// Sorgente: data/bank.json del repository AaronGreedy/patente-zero, estratto dal PDF
// "domande AB italiano 23 04 2025" del Portale dell'Automobilista (la fonte e l'hash
// SHA-256 del PDF sono nel campo metadata). Le figure vanno copiate in public/images/.
//
// Uso: npm run converti-listato -- percorso/bank.json
//
// Gli id sono quelli ufficiali del listato: errori e progressi salvati sui telefoni
// degli allievi restano validi quando il listato viene aggiornato.

import { readFileSync, writeFileSync } from 'node:fs'

const sorgente = process.argv[2]
if (!sorgente) {
  console.error('Specificare il file del listato: npm run converti-listato -- bank.json')
  process.exit(1)
}

const { metadata, chapters, questions } = JSON.parse(readFileSync(sorgente, 'utf8'))

const capitoli = chapters.map((c, i) => ({
  id: c.id,
  numero: i + 1,
  titolo: c.title,
  domande: questions
    .filter(q => q.chapterId === c.id)
    .map(q => {
      const d = { id: q.id, q: q.text.trim(), a: q.answer }
      return q.image ? { ...d, img: '/' + q.image } : d
    }),
}))

const totale = capitoli.reduce((n, c) => n + c.domande.length, 0)
if (totale !== questions.length) {
  console.error(`Attenzione: ${questions.length - totale} domande senza capitolo valido`)
  process.exit(1)
}

const fonte = { data: metadata.sourceListDate, url: metadata.sourcePage }
writeFileSync(new URL('../public/quiz.json', import.meta.url), JSON.stringify({ fonte, capitoli }))
console.log(`Scritte ${totale} domande in ${capitoli.length} capitoli (listato del ${fonte.data}) su public/quiz.json`)
