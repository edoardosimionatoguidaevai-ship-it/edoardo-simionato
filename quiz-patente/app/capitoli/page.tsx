'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Intestazione from '@/components/Intestazione'
import { Capitolo, caricaCapitoli } from '@/lib/quiz'
import { useRisposte } from '@/lib/progressi'

export default function Capitoli() {
  const [capitoli, setCapitoli] = useState<Capitolo[] | null>(null)
  const risposte = useRisposte() ?? {}
  const [errore, setErrore] = useState(false)
  const [selezionati, setSelezionati] = useState<Set<string>>(new Set())

  useEffect(() => {
    caricaCapitoli().then(setCapitoli).catch(() => setErrore(true))
  }, [])

  function toggleSelezione(id: string) {
    setSelezionati(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="min-h-full">
      <Intestazione titolo="Esercizio per capitolo" indietro="/" />
      <main className={`max-w-xl mx-auto px-4 py-4 ${selezionati.size > 0 ? 'pb-24' : ''}`}>
        {errore && <p className="text-center text-red-600 py-8">Impossibile caricare le domande. Controlla la connessione.</p>}
        {!capitoli && !errore && <p className="text-center text-slate-400 py-8">Caricamento…</p>}
        {capitoli && (
          <p className="text-xs text-slate-500 mb-3">
            Tocca un capitolo per esercitarti subito, oppure spunta più capitoli per un esercizio misto.
          </p>
        )}
        <ul className="space-y-2">
          {capitoli?.map(c => {
            const fatte = c.domande.filter(d => d.id in risposte)
            const giuste = fatte.filter(d => risposte[d.id] === 1).length
            const percFatte = Math.round((fatte.length / c.domande.length) * 100)
            return (
              <li key={c.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selezionati.has(c.id)}
                  onChange={() => toggleSelezione(c.id)}
                  aria-label={`Seleziona ${c.titolo}`}
                  className="w-5 h-5 shrink-0 accent-green-800"
                />
                <Link
                  href={`/capitoli/${c.id}`}
                  className="flex-1 block bg-white rounded-lg border border-slate-200 px-4 py-3 shadow-sm active:bg-slate-100"
                >
                  <p className="font-semibold text-slate-800">
                    <span className="text-slate-400 mr-1">{c.numero}.</span> {c.titolo}
                  </p>
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>{c.domande.length} domande · svolte {percFatte}%</span>
                    {fatte.length > 0 && <span>{Math.round((giuste / fatte.length) * 100)}% giuste</span>}
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-green-600" style={{ width: `${percFatte}%` }} />
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </main>

      {selezionati.size > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 p-4 flex items-center gap-3">
          <button
            onClick={() => setSelezionati(new Set())}
            className="text-sm text-slate-500 underline shrink-0"
          >
            Annulla
          </button>
          <Link
            href={`/capitoli/${[...selezionati].join(',')}`}
            className="flex-1 block text-center bg-green-800 text-white rounded-lg py-3 font-semibold"
          >
            Inizia con {selezionati.size} {selezionati.size === 1 ? 'capitolo' : 'capitoli'}
          </Link>
        </div>
      )}
    </div>
  )
}
