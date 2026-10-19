'use client'

import { useState } from 'react'
import { DomandaConCapitolo, urlFigura } from '@/lib/quiz'
import { Simulazione } from '@/lib/progressi'

export function formattaTempo(secondi: number): string {
  const m = Math.floor(secondi / 60)
  const s = secondi % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

// Esito di una simulazione con l'elenco delle domande e le figure.
// Usato dall'allievo a fine prova e dall'istruttore quando apre la scheda ricevuta su WhatsApp.
export default function RisultatoSimulazione({ domande, risposte, simulazione, azioni }: {
  domande: DomandaConCapitolo[]
  risposte: (boolean | null)[]
  simulazione: Simulazione
  azioni?: React.ReactNode
}) {
  const [soloErrori, setSoloErrori] = useState(true)
  const elenco = domande.map((d, i) => ({ d, i })).filter(({ d, i }) => !soloErrori || risposte[i] !== d.a)

  return (
    <div className="flex flex-col gap-4">
      <div className={`rounded-lg p-6 text-center text-white ${simulazione.superato ? 'bg-green-700' : 'bg-red-600'}`}>
        <p className="text-2xl font-bold">{simulazione.superato ? 'IDONEO' : 'NON IDONEO'}</p>
        <p className="mt-1">
          {simulazione.errori} {simulazione.errori === 1 ? 'errore' : 'errori'} su {domande.length} · tempo{' '}
          {formattaTempo(simulazione.durataSecondi)}
        </p>
      </div>

      {azioni}

      <div className="flex rounded-lg border border-slate-300 overflow-hidden text-sm font-semibold">
        <button onClick={() => setSoloErrori(true)} className={`flex-1 py-2 ${soloErrori ? 'bg-slate-700 text-white' : 'bg-white text-slate-600'}`}>
          Solo errori ({simulazione.errori})
        </button>
        <button onClick={() => setSoloErrori(false)} className={`flex-1 py-2 ${!soloErrori ? 'bg-slate-700 text-white' : 'bg-white text-slate-600'}`}>
          Tutte ({domande.length})
        </button>
      </div>

      <ul className="flex flex-col gap-3">
        {elenco.map(({ d, i }) => {
          const giusta = risposte[i] === d.a
          return (
            <li key={d.id} className={`bg-white rounded-lg border-l-4 ${giusta ? 'border-green-600' : 'border-red-500'} border border-slate-200 p-4`}>
              <p className="text-xs text-slate-400 mb-2">Domanda {i + 1}</p>
              {d.img && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={urlFigura(d.img)} alt="Figura della domanda" className="mx-auto mb-3 max-h-40 w-auto object-contain" />
              )}
              <p className="text-slate-800">{d.q}</p>
              <p className="text-sm mt-2">
                <span className="text-slate-500">Risposta corretta: </span>
                <span className="font-bold text-green-700">{d.a ? 'VERO' : 'FALSO'}</span>
                {!giusta && (
                  <>
                    <span className="text-slate-500"> · risposta data: </span>
                    <span className="font-bold text-red-600">
                      {risposte[i] === null ? 'nessuna' : risposte[i] ? 'VERO' : 'FALSO'}
                    </span>
                  </>
                )}
              </p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
