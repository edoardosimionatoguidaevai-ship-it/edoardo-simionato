export type Livello = 0 | 1 | 2 | 3 | 4 // 0 = non valutato, 1 = da migliorare, 2 = sufficiente, 3 = buono, 4 = ottimo

export const LIVELLO_LABELS: Record<Livello, string> = {
  0: 'Non valutato',
  1: 'Da migliorare',
  2: 'Sufficiente',
  3: 'Buono',
  4: 'Ottimo',
}

export interface Voce {
  id: string
  area: string
  argomento: string
  puntiChiave: string
}

export const AREE = ['PREPARAZIONE', 'COMANDI', 'MANOVRE', 'TECNICA', 'AMBIENTI'] as const

export const VOCI: Voce[] = [
  { id: 'posizione-guida', area: 'PREPARAZIONE', argomento: 'Posizione di guida', puntiChiave: 'Sedile, schienale, poggiatesta, specchi, cintura, distanza dai pedali.' },
  { id: 'volante', area: 'PREPARAZIONE', argomento: 'Volante', puntiChiave: 'Posizione mani, sterzata, ritorno controllato, traiettoria.' },
  { id: 'gas', area: 'COMANDI', argomento: 'Gas', puntiChiave: 'Pressione e rilascio progressivi; mantenimento velocità.' },
  { id: 'freno', area: 'COMANDI', argomento: 'Freno', puntiChiave: 'Frenata progressiva; arresto preciso; distanza; emergenza.' },
  { id: 'frizione', area: 'COMANDI', argomento: 'Frizione', puntiChiave: 'Punto di stacco; partenza; cambio; arresto; piede libero.' },
  { id: 'cambio-1-2', area: 'COMANDI', argomento: 'Cambio 1ª–2ª marcia', puntiChiave: 'Tempismo, frizione, fluidità nel passaggio dalla 1ª alla 2ª.' },
  { id: 'cambio-2-3', area: 'COMANDI', argomento: 'Cambio 2ª–3ª marcia', puntiChiave: 'Coordinamento gas-frizione nel passaggio dalla 2ª alla 3ª.' },
  { id: 'cambio-4-5', area: 'COMANDI', argomento: 'Cambio 4ª–5ª marcia', puntiChiave: 'Passaggio dalla 4ª alla 5ª; marcia adeguata a velocità di crociera.' },
  { id: 'parcheggio-s', area: 'MANOVRE', argomento: 'Parcheggio a S', puntiChiave: 'Posizione; controlli; retro; sterzata/controsterzata; allineamento.' },
  { id: 'parcheggio-l', area: 'MANOVRE', argomento: 'Parcheggio a L', puntiChiave: 'Posizione; controlli; retro lenta; sterzata; allineamento/correzioni.' },
  { id: 'inversione', area: 'MANOVRE', argomento: 'Inversione di marcia', puntiChiave: 'Luogo sicuro; controlli; segnalazione; pedali-volante; conclusione.' },
  { id: 'rallento-scalo', area: 'TECNICA', argomento: 'Rallento e scalo', puntiChiave: 'Specchi; rilascio gas; freno; frizione; marcia adeguata; ripresa.' },
  { id: 'extraurbana', area: 'AMBIENTI', argomento: 'Extraurbana', puntiChiave: 'Velocità; curve; distanza; sorpasso; marcia; segnaletica.' },
  { id: 'extraurbana-principale', area: 'AMBIENTI', argomento: 'Extraurbana principale', puntiChiave: 'Accelerazione; inserimento; corsie; sorpasso; decelerazione; uscita.' },
  { id: 'citta', area: 'AMBIENTI', argomento: 'Città', puntiChiave: 'Precedenze; pedoni/ciclisti; sosta; semafori; svolte; pericoli.' },
  { id: 'rotatorie', area: 'AMBIENTI', argomento: 'Rotatorie', puntiChiave: 'Rallenta; precedenza; corsia; frecce; specchi/angolo cieco; uscita.' },
]

export interface GuideCertificate {
  extraurbana: boolean
  autostrada: boolean
  notturne: boolean
}

export const GUIDE_LABELS: { key: keyof GuideCertificate; label: string }[] = [
  { key: 'extraurbana', label: 'Extraurbana' },
  { key: 'autostrada', label: 'Autostrada' },
  { key: 'notturne', label: 'Notturne' },
]

export interface Scheda {
  allievoId: string
  aggiornata: string // ISO date
  voci: Record<string, Livello>
  spiegato: Record<string, boolean>
  guideCertificate: GuideCertificate
}

const KEY_PREFIX = 'guidapratica-scheda-'

function schedaVuota(allievoId: string): Scheda {
  return {
    allievoId,
    aggiornata: '',
    voci: {},
    spiegato: {},
    guideCertificate: { extraurbana: false, autostrada: false, notturne: false },
  }
}

export function getScheda(allievoId: string): Scheda {
  if (typeof window === 'undefined') return schedaVuota(allievoId)
  const data = localStorage.getItem(KEY_PREFIX + allievoId)
  if (!data) return schedaVuota(allievoId)
  return { ...schedaVuota(allievoId), ...JSON.parse(data) }
}

export function saveScheda(scheda: Scheda): void {
  const aggiornata = { ...scheda, aggiornata: new Date().toISOString() }
  localStorage.setItem(KEY_PREFIX + scheda.allievoId, JSON.stringify(aggiornata))
}

export function deleteScheda(allievoId: string): void {
  localStorage.removeItem(KEY_PREFIX + allievoId)
}
