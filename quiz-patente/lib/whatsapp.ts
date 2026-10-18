import { Capitolo, DomandaConCapitolo } from './quiz'
import { Risposte, Simulazione, idErrori } from './progressi'

// Numero WhatsApp dell'istruttore, con prefisso internazionale e senza spazi o "+" (es. '393331234567').
// Se vuoto, WhatsApp chiede all'allievo a quale contatto inviare il messaggio.
export const NUMERO_WHATSAPP_ISTRUTTORE = '393408605334'

const MAX_CARATTERI_DOMANDA = 90

export function linkWhatsApp(testo: string): string {
  return `https://wa.me/${NUMERO_WHATSAPP_ISTRUTTORE}?text=${encodeURIComponent(testo)}`
}

function abbrevia(testo: string): string {
  return testo.length > MAX_CARATTERI_DOMANDA ? testo.slice(0, MAX_CARATTERI_DOMANDA - 1) + '…' : testo
}

function formattaData(iso: string): string {
  const d = new Date(iso)
  return `${d.toLocaleDateString('it-IT')} ${d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`
}

function formattaDurata(secondi: number): string {
  return `${Math.floor(secondi / 60)}:${(secondi % 60).toString().padStart(2, '0')}`
}

export function messaggioSimulazione(
  nome: string,
  simulazione: Simulazione,
  domande: DomandaConCapitolo[],
  risposte: (boolean | null)[],
  capitoli: Capitolo[],
): string {
  const titoli = new Map(capitoli.map(c => [c.id, c.titolo]))
  const righe = [
    '📝 *Quiz Patente B – Simulazione d\'esame*',
    `Allievo: ${nome}`,
    `Data: ${formattaData(simulazione.data)}`,
    `Esito: *${simulazione.superato ? 'IDONEO' : 'NON IDONEO'}* – ${simulazione.errori} ${simulazione.errori === 1 ? 'errore' : 'errori'} su ${domande.length} (tempo ${formattaDurata(simulazione.durataSecondi)})`,
  ]
  const sbagliate = domande.map((d, i) => ({ d, r: risposte[i] })).filter(({ d, r }) => r !== d.a)
  if (sbagliate.length > 0) {
    righe.push('', '*Errori:*')
    sbagliate.forEach(({ d, r }, i) => {
      const tua = r === null ? 'nessuna risposta' : `risposto ${r ? 'V' : 'F'}`
      righe.push(`${i + 1}. [${titoli.get(d.capitoloId) ?? d.capitoloId}] ${abbrevia(d.q)} → giusta ${d.a ? 'V' : 'F'}, ${tua}`)
    })
  }
  return righe.join('\n')
}

export function messaggioProgressi(
  nome: string,
  simulazioni: Simulazione[],
  risposte: Risposte,
  capitoli: Capitolo[],
): string {
  const totaleDomande = capitoli.reduce((n, c) => n + c.domande.length, 0)
  const ultime = simulazioni.slice(0, 10)
  const righe = [
    '📊 *Quiz Patente B – Progressi*',
    `Allievo: ${nome}`,
    `Data: ${formattaData(new Date().toISOString())}`,
    '',
    `Simulazioni svolte: ${simulazioni.length}`,
  ]
  if (ultime.length > 0) {
    righe.push(`Ultime ${ultime.length}: superate ${ultime.filter(s => s.superato).length} (errori: ${ultime.map(s => s.errori).join(', ')})`)
  }
  righe.push(
    `Domande svolte: ${Object.keys(risposte).length} su ${totaleDomande}`,
    `Errori da ripassare: ${idErrori(risposte).size}`,
  )

  const perCapitolo = capitoli
    .map(c => {
      const fatte = c.domande.filter(d => d.id in risposte)
      const giuste = fatte.filter(d => risposte[d.id] === 1).length
      return { c, fatte: fatte.length, perc: fatte.length ? Math.round((giuste / fatte.length) * 100) : 0 }
    })
    .filter(x => x.fatte >= 5)
    .sort((a, b) => a.perc - b.perc)
    .slice(0, 5)
  if (perCapitolo.length > 0) {
    righe.push('', '*Capitoli più deboli:*')
    for (const { c, perc } of perCapitolo) righe.push(`• ${c.titolo}: ${perc}% giuste`)
  }
  return righe.join('\n')
}
