'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Intestazione from '@/components/Intestazione'
import { Capitolo, ESAME_DOMANDE, ESAME_ERRORI_MAX, ESAME_MINUTI, caricaCapitoli } from '@/lib/quiz'
import { azzeraProgressi, idErrori, salvaNome, useNome, useRisposte, useSimulazioni } from '@/lib/progressi'
import { linkWhatsApp, messaggioProgressi } from '@/lib/whatsapp'

function RichiestaNome({ iniziale, onSalvato, onAnnulla }: {
  iniziale: string
  onSalvato: () => void
  onAnnulla?: () => void
}) {
  const [nome, setNome] = useState(iniziale)

  function handleSalva(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) return
    salvaNome(nome)
    onSalvato()
  }

  return (
    <form onSubmit={handleSalva} className="bg-white rounded-lg border border-slate-200 p-6 flex flex-col gap-3">
      <p className="text-lg font-bold text-slate-800">👋 Come ti chiami?</p>
      <p className="text-sm text-slate-500">Il tuo nome comparirà nei risultati che invii all&apos;istruttore.</p>
      <input
        type="text"
        placeholder="Nome e cognome"
        value={nome}
        onChange={e => setNome(e.target.value)}
        autoFocus
        className="rounded-lg border border-slate-300 px-4 py-3 text-base text-slate-800"
      />
      <button type="submit" disabled={!nome.trim()} className="bg-green-800 text-white rounded-lg py-3 font-semibold disabled:opacity-50">
        Inizia
      </button>
      {onAnnulla && (
        <button type="button" onClick={onAnnulla} className="text-sm text-slate-500">
          Annulla
        </button>
      )}
    </form>
  )
}

export default function Home() {
  const nome = useNome()
  const risposte = useRisposte()
  const simulazioni = useSimulazioni()
  const [capitoli, setCapitoli] = useState<Capitolo[] | null>(null)
  const [modificaNome, setModificaNome] = useState(false)
  const [confermaAzzera, setConfermaAzzera] = useState(false)
  const errori = risposte ? idErrori(risposte).size : 0

  // Servono per il riepilogo dei progressi da inviare su WhatsApp
  useEffect(() => {
    caricaCapitoli().then(setCapitoli).catch(() => {})
  }, [])

  if (nome === null) return <Intestazione titolo="Quiz Patente B" sottotitolo="Domande ministeriali" />

  if (nome === '' || modificaNome) {
    return (
      <div className="min-h-full">
        <Intestazione titolo="Quiz Patente B" sottotitolo="Domande ministeriali" />
        <main className="max-w-xl mx-auto px-4 py-6">
          <RichiestaNome
            iniziale={nome}
            onSalvato={() => setModificaNome(false)}
            onAnnulla={nome ? () => setModificaNome(false) : undefined}
            key={String(modificaNome)}
          />
        </main>
      </div>
    )
  }

  function handleAzzera() {
    azzeraProgressi()
    setConfermaAzzera(false)
  }

  const ultime = (simulazioni ?? []).slice(0, 10)
  const superate = ultime.filter(s => s.superato).length

  return (
    <div className="min-h-full">
      <Intestazione
        titolo="Quiz Patente B"
        sottotitolo={`Ciao, ${nome}`}
        destra={
          <button onClick={() => setModificaNome(true)} className="text-sm text-green-200 underline">
            Cambia nome
          </button>
        }
      />

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

        {capitoli ? (
          <a
            href={linkWhatsApp(messaggioProgressi(nome, simulazioni ?? [], risposte ?? {}, capitoli))}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center bg-[#25D366] text-white rounded-lg py-3 font-bold"
          >
            📤 Invia i miei progressi all&apos;istruttore
          </a>
        ) : (
          <p className="text-center bg-[#25D366] text-white rounded-lg py-3 font-bold opacity-60">
            📤 Invia i miei progressi all&apos;istruttore
          </p>
        )}

        <p className="text-xs text-slate-400 text-center mt-4">
          Domande ufficiali del listato ministeriale A/B del 23/04/2025
        </p>

        {confermaAzzera ? (
          <div className="bg-white rounded-lg border border-red-300 p-4 flex flex-col gap-3">
            <p className="text-sm text-slate-700 text-center">Cancellare tutti i progressi e lo storico delle simulazioni?</p>
            <div className="flex gap-2">
              <button onClick={handleAzzera} className="flex-1 bg-red-600 text-white rounded-lg py-2 font-semibold">
                Sì, cancella
              </button>
              <button onClick={() => setConfermaAzzera(false)} className="flex-1 rounded-lg py-2 border border-slate-300 text-slate-700">
                Annulla
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setConfermaAzzera(true)} className="text-xs text-slate-400 underline self-center">
            Azzera progressi
          </button>
        )}
      </main>
    </div>
  )
}
