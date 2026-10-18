export interface Domanda {
  id: string
  q: string
  a: boolean // risposta corretta: true = Vero, false = Falso
  img?: string
}

export interface Capitolo {
  id: string
  numero: number
  titolo: string
  domande: Domanda[]
}

export interface DomandaConCapitolo extends Domanda {
  capitoloId: string
}

// Regole dell'esame di teoria per la patente B
export const ESAME_DOMANDE = 30
export const ESAME_MINUTI = 20
export const ESAME_ERRORI_MAX = 3

let cache: Promise<Capitolo[]> | null = null

export function caricaCapitoli(): Promise<Capitolo[]> {
  if (!cache) {
    cache = fetch('/quiz.json')
      .then(r => {
        if (!r.ok) throw new Error('Impossibile caricare le domande')
        return r.json()
      })
      .then((data: { capitoli: Capitolo[] }) => data.capitoli)
      .catch(err => {
        cache = null
        throw err
      })
  }
  return cache
}

export function mescola<T>(elementi: T[]): T[] {
  const copia = [...elementi]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

function conCapitolo(c: Capitolo, d: Domanda): DomandaConCapitolo {
  return { ...d, capitoloId: c.id }
}

// Una domanda da ogni capitolo, le restanti da capitoli scelti a caso,
// poi ordinate per capitolo come nella scheda d'esame.
export function generaEsame(capitoli: Capitolo[]): DomandaConCapitolo[] {
  const extra = mescola(capitoli).slice(0, Math.max(0, ESAME_DOMANDE - capitoli.length))
  const scelte: DomandaConCapitolo[] = []
  for (const c of capitoli) {
    const quante = extra.includes(c) ? 2 : 1
    for (const d of mescola(c.domande).slice(0, quante)) scelte.push(conCapitolo(c, d))
  }
  return scelte.slice(0, ESAME_DOMANDE)
}

export function domandeCapitolo(capitolo: Capitolo, quante: number): DomandaConCapitolo[] {
  return mescola(capitolo.domande).slice(0, quante).map(d => conCapitolo(capitolo, d))
}

export function domandePerId(capitoli: Capitolo[], ids: Set<string>): DomandaConCapitolo[] {
  const trovate: DomandaConCapitolo[] = []
  for (const c of capitoli) {
    for (const d of c.domande) if (ids.has(d.id)) trovate.push(conCapitolo(c, d))
  }
  return trovate
}
