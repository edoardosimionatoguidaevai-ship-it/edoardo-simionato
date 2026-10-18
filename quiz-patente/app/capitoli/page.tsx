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

  useEffect(() => {
    caricaCapitoli().then(setCapitoli).catch(() => setErrore(true))
  }, [])

  return (
    <div className="min-h-full">
      <Intestazione titolo="Esercizio per capitolo" indietro="/" />
      <main className="max-w-xl mx-auto px-4 py-4">
        {errore && <p className="text-center text-red-600 py-8">Impossibile caricare le domande. Controlla la connessione.</p>}
        {!capitoli && !errore && <p className="text-center text-slate-400 py-8">Caricamento…</p>}
        <ul className="space-y-2">
          {capitoli?.map(c => {
            const fatte = c.domande.filter(d => d.id in risposte)
            const giuste = fatte.filter(d => risposte[d.id] === 1).length
            const percFatte = Math.round((fatte.length / c.domande.length) * 100)
            return (
              <li key={c.id}>
                <Link
                  href={`/capitoli/${c.id}`}
                  className="block bg-white rounded-lg border border-slate-200 px-4 py-3 shadow-sm active:bg-slate-100"
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
    </div>
  )
}
