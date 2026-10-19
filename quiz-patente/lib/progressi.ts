// Progressi dell'allievo, salvati solo sul suo telefono (localStorage).

import { useMemo, useSyncExternalStore } from 'react'

const KEY_RISPOSTE = 'quizpatente-risposte'
const KEY_SIMULAZIONI = 'quizpatente-simulazioni'
const KEY_NOME = 'quizpatente-nome'
const KEY_LETTURA = 'quizpatente-lettura-automatica'
const MAX_SIMULAZIONI = 50

// Ultimo esito per ogni domanda: 1 = risposta giusta, 0 = sbagliata.
// Le domande con 0 sono quelle proposte nel ripasso errori.
export type Risposte = Record<string, 0 | 1>

export interface Simulazione {
  data: string // ISO date
  errori: number
  superato: boolean
  durataSecondi: number
}

const EVENTO_MODIFICA = 'quizpatente-modifica'

function analizza<T>(data: string | null, vuoto: T): T {
  try {
    return data ? JSON.parse(data) : vuoto
  } catch {
    return vuoto
  }
}

function leggi<T>(key: string, vuoto: T): T {
  if (typeof window === 'undefined') return vuoto
  return analizza(localStorage.getItem(key), vuoto)
}

function scrivi(key: string, valore: unknown): void {
  localStorage.setItem(key, JSON.stringify(valore))
  window.dispatchEvent(new Event(EVENTO_MODIFICA))
}

function iscriviti(callback: () => void): () => void {
  window.addEventListener(EVENTO_MODIFICA, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(EVENTO_MODIFICA, callback)
    window.removeEventListener('storage', callback)
  }
}

// Legge un valore salvato e si aggiorna quando cambia; null finché la pagina non è nel browser.
function useSalvato<T>(key: string, vuoto: T): T | null {
  const data = useSyncExternalStore(iscriviti, () => localStorage.getItem(key) ?? '', () => null)
  return useMemo(() => (data === null ? null : analizza(data, vuoto)), [data]) // eslint-disable-line react-hooks/exhaustive-deps
}

export function getRisposte(): Risposte {
  return leggi<Risposte>(KEY_RISPOSTE, {})
}

export function registraRisposte(esiti: { id: string; corretta: boolean }[]): void {
  const risposte = getRisposte()
  for (const { id, corretta } of esiti) risposte[id] = corretta ? 1 : 0
  scrivi(KEY_RISPOSTE, risposte)
}

export function useRisposte(): Risposte | null {
  return useSalvato<Risposte>(KEY_RISPOSTE, {})
}

export function idErrori(risposte: Risposte): Set<string> {
  return new Set(Object.entries(risposte).filter(([, v]) => v === 0).map(([id]) => id))
}

export function getIdErrori(): Set<string> {
  return idErrori(getRisposte())
}

export function getSimulazioni(): Simulazione[] {
  return leggi<Simulazione[]>(KEY_SIMULAZIONI, [])
}

export function registraSimulazione(s: Simulazione): void {
  const elenco = [s, ...getSimulazioni()].slice(0, MAX_SIMULAZIONI)
  scrivi(KEY_SIMULAZIONI, elenco)
}

export function useSimulazioni(): Simulazione[] | null {
  return useSalvato<Simulazione[]>(KEY_SIMULAZIONI, [])
}

// Nome e cognome dell'allievo, chiesto al primo avvio e inserito nei messaggi all'istruttore
export function useNome(): string | null {
  return useSalvato<string>(KEY_NOME, '')
}

export function getNome(): string {
  return leggi<string>(KEY_NOME, '')
}

export function salvaNome(nome: string): void {
  scrivi(KEY_NOME, nome.trim())
}

// Se attiva, ogni domanda viene letta ad alta voce appena compare
export function useLetturaAutomatica(): boolean {
  return useSalvato<boolean>(KEY_LETTURA, false) ?? false
}

export function salvaLetturaAutomatica(attiva: boolean): void {
  scrivi(KEY_LETTURA, attiva)
}

export function azzeraProgressi(): void {
  localStorage.removeItem(KEY_RISPOSTE)
  localStorage.removeItem(KEY_SIMULAZIONI)
  window.dispatchEvent(new Event(EVENTO_MODIFICA))
}
