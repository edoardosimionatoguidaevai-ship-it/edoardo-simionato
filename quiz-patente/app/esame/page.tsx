'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Intestazione from '@/components/Intestazione'
import TestoDomanda from '@/components/TestoDomanda'
import {
  Capitolo,
  DomandaConCapitolo,
  ESAME_DOMANDE,
  ESAME_ERRORI_MAX,
  ESAME_MINUTI,
  caricaCapitoli,
  generaEsame,
  urlFigura,
} from '@/lib/quiz'
import { Simulazione, getNome, registraRisposte, registraSimulazione } from '@/lib/progressi'
import { linkWhatsApp, messaggioSimulazione } from '@/lib/whatsapp'

type Fase = 'inizio' | 'in-corso' | 'risultato'

function formattaTempo(secondi: number): string {
  const m = Math.floor(secondi / 60)
  const s = secondi % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function Esame() {
  const [fase, setFase] = useState<Fase>('inizio')
  const [capitoli, setCapitoli] = useState<Capitolo[]>([])
  const [domande, setDomande] = useState<DomandaConCapitolo[]>([])
  const [risposte, setRisposte] = useState<(boolean | null)[]>([])
  const [indice, setIndice] = useState(0)
  const [inizio, setInizio] = useState(0)
  const [rimanenti, setRimanenti] = useState(ESAME_MINUTI * 60)
  const [simulazione, setSimulazione] = useState<Simulazione | null>(null)
  const [soloErrori, setSoloErrori] = useState(true)
  const [caricamento, setCaricamento] = useState(false)
  const [errore, setErrore] = useState(false)
  const [confermaConsegna, setConfermaConsegna] = useState(false)

  async function inizia() {
    setCaricamento(true)
    setErrore(false)
    try {
      const tutti = await caricaCapitoli()
      const nuove = generaEsame(tutti)
      setCapitoli(tutti)
      setDomande(nuove)
      setRisposte(nuove.map(() => null))
      setIndice(0)
      setInizio(Date.now())
      setRimanenti(ESAME_MINUTI * 60)
      setSoloErrori(true)
      setConfermaConsegna(false)
      setFase('in-corso')
    } catch {
      setErrore(true)
    } finally {
      setCaricamento(false)
    }
  }

  const consegna = useCallback(() => {
    const esiti = domande.map((d, i) => ({ id: d.id, corretta: risposte[i] === d.a }))
    const errori = esiti.filter(e => !e.corretta).length
    const secondi = Math.min(ESAME_MINUTI * 60, Math.round((Date.now() - inizio) / 1000))
    const nuova: Simulazione = {
      data: new Date().toISOString(),
      errori,
      superato: errori <= ESAME_ERRORI_MAX,
      durataSecondi: secondi,
    }
    registraRisposte(esiti)
    registraSimulazione(nuova)
    setSimulazione(nuova)
    setFase('risultato')
    window.scrollTo(0, 0)
  }, [domande, risposte, inizio])

  const consegnaRef = useRef(consegna)
  useEffect(() => {
    consegnaRef.current = consegna
  }, [consegna])

  // Timer: calcolato dall'ora di inizio, così resta corretto anche se il telefono va in standby.
  // Allo scadere la scheda viene consegnata automaticamente.
  useEffect(() => {
    if (fase !== 'in-corso') return
    const timer = setInterval(() => {
      const resto = Math.max(0, ESAME_MINUTI * 60 - Math.floor((Date.now() - inizio) / 1000))
      setRimanenti(resto)
      if (resto === 0) {
        clearInterval(timer)
        consegnaRef.current()
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [fase, inizio])

  useEffect(() => {
    if (fase !== 'in-corso') return
    const avviso = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', avviso)
    return () => window.removeEventListener('beforeunload', avviso)
  }, [fase])

  function rispondi(valore: boolean) {
    setRisposte(r => r.map((v, i) => (i === indice ? valore : v)))
  }

  if (fase === 'inizio') {
    return (
      <div className="min-h-full">
        <Intestazione titolo="Simulazione d'esame" indietro="/" />
        <main className="max-w-xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <ul className="text-slate-700 space-y-2 mb-6">
              <li>📋 {ESAME_DOMANDE} domande Vero/Falso da tutti i capitoli</li>
              <li>⏱️ {ESAME_MINUTI} minuti di tempo</li>
              <li>✅ Superato con al massimo {ESAME_ERRORI_MAX} errori</li>
              <li>↔️ Puoi cambiare le risposte fino alla consegna</li>
              <li>⚠️ Le domande senza risposta contano come errori</li>
            </ul>
            <button
              onClick={inizia}
              disabled={caricamento}
              className="w-full bg-green-800 text-white rounded-lg py-4 text-lg font-bold disabled:opacity-60"
            >
              {caricamento ? 'Caricamento…' : 'Inizia la prova'}
            </button>
            {errore && <p className="text-red-600 text-sm mt-3 text-center">Impossibile caricare le domande. Controlla la connessione.</p>}
          </div>
        </main>
      </div>
    )
  }

  if (fase === 'risultato' && simulazione) {
    const errori = domande.filter((d, i) => risposte[i] !== d.a).length
    const superato = errori <= ESAME_ERRORI_MAX
    const elenco = domande.map((d, i) => ({ d, i })).filter(({ d, i }) => !soloErrori || risposte[i] !== d.a)
    return (
      <div className="min-h-full">
        <Intestazione titolo="Risultato" indietro="/" />
        <main className="max-w-xl mx-auto px-4 py-4 flex flex-col gap-4">
          <div className={`rounded-lg p-6 text-center text-white ${superato ? 'bg-green-700' : 'bg-red-600'}`}>
            <p className="text-2xl font-bold">{superato ? 'IDONEO' : 'NON IDONEO'}</p>
            <p className="mt-1">
              {errori} {errori === 1 ? 'errore' : 'errori'} su {domande.length} · tempo {formattaTempo(simulazione.durataSecondi)}
            </p>
          </div>

          <a
            href={linkWhatsApp(messaggioSimulazione(getNome(), simulazione, domande, risposte, capitoli))}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center bg-[#25D366] text-white rounded-lg py-3 font-bold"
          >
            📤 Invia all&apos;istruttore su WhatsApp
          </a>

          <div className="flex gap-2">
            <button onClick={inizia} className="flex-1 bg-green-800 text-white rounded-lg py-3 font-semibold">
              Nuova simulazione
            </button>
            <Link href="/" className="flex-1 text-center rounded-lg py-3 border border-slate-300 text-slate-700 bg-white">
              Home
            </Link>
          </div>

          <div className="flex rounded-lg border border-slate-300 overflow-hidden text-sm font-semibold">
            <button onClick={() => setSoloErrori(true)} className={`flex-1 py-2 ${soloErrori ? 'bg-slate-700 text-white' : 'bg-white text-slate-600'}`}>
              Solo errori ({errori})
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
                  <div className="flex gap-3">
                    {d.img && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={urlFigura(d.img)} alt="Figura della domanda" className="w-20 h-20 object-contain shrink-0" />
                    )}
                    <p className="text-slate-800">{d.q}</p>
                  </div>
                  <p className="text-sm mt-2">
                    <span className="text-slate-500">Risposta corretta: </span>
                    <span className="font-bold text-green-700">{d.a ? 'VERO' : 'FALSO'}</span>
                    {!giusta && (
                      <>
                        <span className="text-slate-500"> · tua: </span>
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
        </main>
      </div>
    )
  }

  const domanda = domande[indice]
  const risposta = risposte[indice]
  const date = risposte.filter(r => r !== null).length
  const mancanti = domande.length - date

  return (
    <div className="min-h-full">
      <Intestazione
        titolo={`Domanda ${indice + 1} di ${domande.length}`}
        sottotitolo={`Risposte date: ${date}/${domande.length}`}
        destra={
          <span className={`font-mono text-lg font-bold px-2 py-1 rounded ${rimanenti <= 60 ? 'bg-red-600' : 'bg-green-800'}`}>
            ⏱ {formattaTempo(rimanenti)}
          </span>
        }
      />
      <main className="max-w-xl mx-auto px-4 py-4 flex flex-col gap-4">
        <TestoDomanda domanda={domanda} />

        <div className="grid grid-cols-2 gap-3">
          {[true, false].map(valore => (
            <button
              key={String(valore)}
              onClick={() => rispondi(valore)}
              className={`rounded-lg border-2 py-4 text-lg font-bold ${
                risposta === valore ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              {valore ? 'VERO' : 'FALSO'}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIndice(i => i - 1)}
            disabled={indice === 0}
            className="flex-1 rounded-lg py-3 border border-slate-300 bg-white text-slate-700 font-semibold disabled:opacity-40"
          >
            ← Indietro
          </button>
          <button
            onClick={() => setIndice(i => i + 1)}
            disabled={indice === domande.length - 1}
            className="flex-1 rounded-lg py-3 border border-slate-300 bg-white text-slate-700 font-semibold disabled:opacity-40"
          >
            Avanti →
          </button>
        </div>

        <div className="grid grid-cols-10 gap-1">
          {domande.map((d, i) => (
            <button
              key={d.id}
              onClick={() => setIndice(i)}
              aria-label={`Vai alla domanda ${i + 1}`}
              className={`aspect-square rounded text-xs font-semibold ${
                i === indice
                  ? 'ring-2 ring-green-700 ring-offset-1'
                  : ''
              } ${risposte[i] === null ? 'bg-white border border-slate-300 text-slate-500' : 'bg-slate-700 text-white'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {confermaConsegna ? (
          <div className="bg-white rounded-lg border-2 border-green-800 p-4 mt-2 flex flex-col gap-3">
            <p className="text-slate-800 font-semibold text-center">
              {mancanti > 0
                ? `Hai ancora ${mancanti} ${mancanti === 1 ? 'domanda' : 'domande'} senza risposta: contano come errori. Consegnare?`
                : 'Consegnare la scheda?'}
            </p>
            <div className="flex gap-2">
              <button onClick={consegna} className="flex-1 bg-green-800 text-white rounded-lg py-3 font-bold">
                Sì, consegna
              </button>
              <button onClick={() => setConfermaConsegna(false)} className="flex-1 rounded-lg py-3 border border-slate-300 text-slate-700">
                Continua
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setConfermaConsegna(true)} className="bg-green-800 text-white rounded-lg py-4 text-lg font-bold mt-2">
            Consegna
          </button>
        )}
      </main>
    </div>
  )
}
