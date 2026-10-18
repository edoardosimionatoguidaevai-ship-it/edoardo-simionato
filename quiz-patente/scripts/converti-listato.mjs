// Converte il listato ministeriale (formato del repository Ed0ardo/QuizPatenteB)
// nel file compatto public/quiz.json usato dall'app.
//
// Uso: npm run converti-listato -- percorso/quizPatenteB2023.json
//
// Ogni domanda riceve un id stabile ricavato dal testo e dall'immagine, così
// errori e progressi salvati sui telefoni degli allievi restano validi anche
// se il listato viene aggiornato o riordinato.

import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

const TITOLI = {
  'definizioni-generali-doveri-strada': 'Definizioni generali e doveri nell\'uso della strada',
  'segnali-pericolo': 'Segnali di pericolo',
  'segnali-divieto': 'Segnali di divieto',
  'segnali-obbligo': 'Segnali di obbligo',
  'segnali-precedenza': 'Segnali di precedenza',
  'segnaletica-orizzontale-ostacoli': 'Segnaletica orizzontale e segni sugli ostacoli',
  'semafori-vigili': 'Semafori e segnali degli agenti',
  'segnali-indicazione': 'Segnali di indicazione',
  'segnali-complementari-cantiere': 'Segnali complementari e di cantiere',
  'pannelli-integrativi': 'Pannelli integrativi',
  'limiti-di-velocita': 'Limiti di velocità, pericolo e intralcio',
  'distanza-di-sicurezza': 'Distanza di sicurezza',
  'norme-di-circolazione': 'Norme sulla circolazione dei veicoli',
  'precedenza-incroci': 'Precedenza negli incroci',
  'sorpasso': 'Sorpasso',
  'fermata-sosta-arresto': 'Fermata, sosta, arresto e partenza',
  'norme-varie-autostrade-pannelli': 'Norme varie, autostrade e pannelli',
  'luci-dispositivi-acustici': 'Luci e dispositivi acustici',
  'cinture-casco-sicurezza': 'Cinture, casco e sistemi di sicurezza',
  'patente-punti-documenti': 'Patente, punti e documenti',
  'incidenti-stradali-comportamenti': 'Incidenti stradali e comportamenti',
  'alcool-droga-primo-soccorso': 'Alcool, droga, stanchezza e primo soccorso',
  'responsabilita-civile-penale-e-assicurazione': 'Responsabilità civile, penale e assicurazione',
  'consumi-ambiente-inquinamento': 'Consumi, ambiente e inquinamento',
  'elementi-veicolo-manutenzione-comportamenti': 'Elementi del veicolo, manutenzione e comportamenti',
}

const sorgente = process.argv[2]
if (!sorgente) {
  console.error('Specificare il file del listato: npm run converti-listato -- quizPatenteB2023.json')
  process.exit(1)
}

const listato = JSON.parse(readFileSync(sorgente, 'utf8'))
const visti = new Set()
let totale = 0

const capitoli = Object.entries(listato).map(([id, argomenti], i) => {
  const domande = []
  for (const elenco of Object.values(argomenti)) {
    for (const d of elenco) {
      const testo = d.q.trim()
      const img = d.img || undefined
      const hash = createHash('sha1').update(`${img ?? ''}|${testo}`).digest('base64url').slice(0, 10)
      if (visti.has(hash)) continue // domanda duplicata nel listato
      visti.add(hash)
      domande.push(img ? { id: hash, q: testo, a: d.a, img } : { id: hash, q: testo, a: d.a })
    }
  }
  totale += domande.length
  return { id, numero: i + 1, titolo: TITOLI[id] ?? id, domande }
})

writeFileSync(new URL('../public/quiz.json', import.meta.url), JSON.stringify({ capitoli }))
console.log(`Scritte ${totale} domande in ${capitoli.length} capitoli su public/quiz.json`)
