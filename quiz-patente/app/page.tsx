'use client'

import Link from 'next/link'
import Intestazione from '@/components/Intestazione'
import { ESAME_DOMANDE, ESAME_ERRORI_MAX, ESAME_MINUTI } from '@/lib/quiz'
import { azzeraProgressi, idErrori, useRisposte, useSimulazioni } from '@/lib/progressi'

export default function Home() {
  const risposte = useRisposte()
  const simulazioni = useSimulazioni()
  const errori = risposte ? idErrori(risposte).size : 0

  function handleAzzera() {
    if (!confirm('Cancellare tutti i progressi e lo storico delle simulazioni?')) return
    azzeraProgressi()
  }

  const ultime = (simulazioni ?? []).slice(0, 10)
  const superate = ultime.filter(s => s.superato).length

  return (
    <div className="min-h-full">
      <Intestazione titolo="Quiz Patente B" sottotitolo="Domande ministeriali" />

      <main className="max-w-xl mx-auto px-4 py-4 flex flex-col gap-3">
        <Link href="/esame" className="block bg-green-800 text-white rounded-lg p-4 shadow active:bg-green-900">
          <p className="text-lg font-bold">📝 Simulazione d&apos;esame</p>
          <p className="text-sm text-green-100">
            {ESAME_DOMANDE} domande, {ESAME_MINUTI} minuti, massimo {ESAME_ERRORI_MAX} errori
          </p>
        </Link>

        <Link href="/capitoli" className="block bg-white rounded-lg border border-slate-200 p-4 shadow-sm active:bg-slate-100">
          <p className="text-lg font-bold text-slate-800">📚 Esercizio per capitolo</p>
          <p className="text-sm text-slate-500">Scegli un argomento, correzione immediata</p>
        </Link>

        <Link
          href="/ripasso"
          className="block bg-white rounded-lg border border-slate-200 p-4 shadow-sm active:bg-slate-100"
        >
          <p className="text-lg font-bold text-slate-800">🔁 Ripasso errori</p>
          <p className="text-sm text-slate-500">
            {errori === 0 ? 'Nessun errore da ripassare' : `${errori} ${errori === 1 ? 'domanda sbagliata' : 'domande sbagliate'} da ripassare`}
          </p>
        </Link>

        <section className="bg-white rounded-lg border border-slate-200 p-4 mt-2">
          <h2 className="font-bold text-slate-800 mb-1">Ultime simulazioni</h2>
          {ultime.length === 0 ? (
            <p className="text-sm text-slate-400">Nessuna simulazione svolta.</p>
          ) : (
            <>
              <p className="text-sm text-slate-500 mb-3">Superate {superate} delle ultime {ultime.length}</p>
              <ul className="divide-y divide-slate-100">
                {ultime.map(s => (
                  <li key={s.data} className="flex justify-between py-2 text-sm">
                    <span className="text-slate-600">
                      {new Date(s.data).toLocaleDateString('it-IT')}{' '}
                      {new Date(s.data).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={s.superato ? 'text-green-700 font-semibold' : 'text-red-600 font-semibold'}>
                      {s.superato ? 'Superato' : 'Non superato'} · {s.errori} {s.errori === 1 ? 'errore' : 'errori'}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <button onClick={handleAzzera} className="text-xs text-slate-400 underline mt-4 self-center">
          Azzera progressi
        </button>
      </main>
    </div>
  )
}
