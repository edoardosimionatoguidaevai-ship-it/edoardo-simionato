export interface Allievo {
  id: string
  nome: string
  cognome: string
  telefono?: string
  dataEsame?: string // YYYY-MM-DD
  foto?: string // data URL (JPEG compresso), solo per riconoscimento nell'app
  note?: string // note libere dell'istruttore, non incluse nel report PDF
}

const KEY = 'guidapratica-allievi'

export function getAllievi(): Allievo[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(KEY)
  const allievi: Allievo[] = data ? JSON.parse(data) : []
  return allievi.sort((a, b) => a.cognome.localeCompare(b.cognome) || a.nome.localeCompare(b.nome))
}

export function saveAllievi(allievi: Allievo[]): void {
  localStorage.setItem(KEY, JSON.stringify(allievi))
}

export function getAllievo(id: string): Allievo | undefined {
  return getAllievi().find(a => a.id === id)
}

export function addAllievo(allievo: Omit<Allievo, 'id'>): Allievo {
  const allievi = getAllievi()
  const nuovo: Allievo = { ...allievo, id: Date.now().toString() }
  allievi.push(nuovo)
  saveAllievi(allievi)
  return nuovo
}

export function deleteAllievo(id: string): void {
  saveAllievi(getAllievi().filter(a => a.id !== id))
}

export function updateAllievo(id: string, updates: Partial<Allievo>): void {
  const allievi = getAllievi()
  const idx = allievi.findIndex(a => a.id === id)
  if (idx === -1) return
  allievi[idx] = { ...allievi[idx], ...updates }
  saveAllievi(allievi)
}
