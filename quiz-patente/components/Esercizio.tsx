'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DomandaConCapitolo } from '@/lib/quiz'
import { registraRisposte } from '@/lib/progressi'
import TestoDomanda from './TestoDomanda'

// Esercizio con correzione immediata, usato per i capitoli e per il ripasso errori.
export default function Esercizio({ domande, onRicomincia }: {
  domande: DomandaConCapitolo[]
  onRicomincia: () => void
}) {
  const [indice, setIndice] = useState(0)
  const [risposta, setRisposta] = useState<boolean | null>(null)
  const [giuste, setGiuste] = useState(0)

  if (domande.length === 0) {
    return <p className="text-center text-slate-500 py-12">Nessuna domanda da mostrare.</p>
  }

  if (indice >= domande.length) {
    const sbagliate = domande.length - giuste
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6 text-center">
        <p className="text-5xl mb-2">{sbagliate === 0 ? '🎉' : '📘'}</p>
        <p className="text-xl font-bold text-slate-800">{giuste} giuste su {domande.length}</p>
        <p className="text-slate-500 mb-6">
          {sbagliate === 0 ? 'Perfetto!' : `${sbagliate} da ripassare: le trovi in “Ripasso errori”.`}
        </p>
        <div className="flex flex-col gap-2">
          <button onClick={onRicomincia} className="bg-green-800 text-white rounded-lg py-3 font-semibold">
            Altre domande
          </button>
          <Link href="/" className="rounded-lg py-3 border border-slate-300 text-slate-700">
            Torna alla home
          </Link>
        </div>
      </div>
    )
  }

  const domanda = domande[indice]
  const corretta = risposta === domanda.a

  function rispondi(valore: boolean) {
    if (risposta !== null) return
    setRisposta(valore)
    if (valore === domanda.a) setGiuste(g => g + 1)
    registraRisposte([{ id: domanda.id, corretta: valore === domanda.a }])
  }

  function avanti() {
    setRisposta(null)
    setIndice(i => i + 1)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between text-sm text-slate-500">
        <span>Domanda {indice + 1} di {domande.length}</span>
        <span>✓ {giuste}</span>
      </div>
      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div className="h-full bg-green-700" style={{ width: `${(indice / domande.length) * 100}%` }} />
      </div>

      <TestoDomanda domanda={domanda} />

      <div className="grid grid-cols-2 gap-3">
        {[true, false].map(valore => {
          let stile = 'bg-white border-slate-300 text-slate-800'
          if (risposta !== null) {
            if (valore === domanda.a) stile = 'bg-green-600 border-green-600 text-white'
            else if (valore === risposta) stile = 'bg-red-500 border-red-500 text-white'
            else stile = 'bg-white border-slate-200 text-slate-400'
          }
          return (
            <button
              key={String(valore)}
              onClick={() => rispondi(valore)}
              className={`rounded-lg border-2 py-4 text-lg font-bold ${stile}`}
            >
              {valore ? 'VERO' : 'FALSO'}
            </button>
          )
        })}
      </div>

      {risposta !== null && (
        <>
          <p className={`text-center font-semibold ${corretta ? 'text-green-700' : 'text-red-600'}`}>
            {corretta ? '✓ Risposta esatta' : `✗ Sbagliato: la risposta era ${domanda.a ? 'VERO' : 'FALSO'}`}
          </p>
          <button onClick={avanti} className="bg-green-800 text-white rounded-lg py-3 font-semibold">
            {indice + 1 < domande.length ? 'Avanti →' : 'Vedi risultato'}
          </button>
        </>
      )}
    </div>
  )
}
