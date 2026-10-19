// La scheda di una simulazione codificata in un link, da inviare all'istruttore:
// aprendolo vede le stesse domande, con le figure, e le risposte date dall'allievo.

import { Capitolo, DomandaConCapitolo, ESAME_ERRORI_MAX } from './quiz'
import { Simulazione } from './progressi'

export interface SchedaRicevuta {
  nome: string
  simulazione: Simulazione
  domande: DomandaConCapitolo[]
  risposte: (boolean | null)[]
}

export function linkScheda(
  nome: string,
  simulazione: Simulazione,
  domande: DomandaConCapitolo[],
  risposte: (boolean | null)[],
): string {
  const parametri = new URLSearchParams({
    n: nome,
    d: simulazione.data,
    t: String(simulazione.durataSecondi),
    // numero ufficiale della domanda + risposta data: v = vero, f = falso, n = nessuna
    q: domande.map((d, i) => d.id + (risposte[i] === null ? 'n' : risposte[i] ? 'v' : 'f')).join('.'),
  })
  return `${window.location.origin}/scheda?${parametri}`
}

export function leggiScheda(parametri: URLSearchParams, capitoli: Capitolo[]): SchedaRicevuta | null {
  const codici = parametri.get('q')?.split('.') ?? []
  if (codici.length === 0) return null
  const perId = new Map<string, DomandaConCapitolo>()
  for (const c of capitoli) for (const d of c.domande) perId.set(d.id, { ...d, capitoloId: c.id })

  const domande: DomandaConCapitolo[] = []
  const risposte: (boolean | null)[] = []
  for (const codice of codici) {
    const m = codice.match(/^(\d+)([vfn])$/)
    const domanda = m && perId.get(m[1])
    if (!m || !domanda) return null
    domande.push(domanda)
    risposte.push(m[2] === 'n' ? null : m[2] === 'v')
  }

  // L'esito si ricalcola dalle risposte, non si prende dal link
  const errori = domande.filter((d, i) => risposte[i] !== d.a).length
  return {
    nome: parametri.get('n') ?? '',
    simulazione: {
      data: parametri.get('d') ?? '',
      errori,
      superato: errori <= ESAME_ERRORI_MAX,
      durataSecondi: Number(parametri.get('t')) || 0,
    },
    domande,
    risposte,
  }
}
