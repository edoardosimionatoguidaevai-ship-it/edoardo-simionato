'use client'

import { useEffect, useState } from 'react'
import { Domanda, urlFigura } from '@/lib/quiz'
import { useLetturaAutomatica } from '@/lib/progressi'
import { fermaLettura, leggi, voceDisponibile } from '@/lib/voce'

export default function TestoDomanda({ domanda }: { domanda: Domanda }) {
  const automatica = useLetturaAutomatica()
  const [inLettura, setInLettura] = useState(false)
  const [disponibile, setDisponibile] = useState(false)

  useEffect(() => {
    // La sintesi vocale esiste solo nel browser: il controllo va fatto dopo il caricamento
    setDisponibile(voceDisponibile()) // eslint-disable-line react-hooks/set-state-in-effect
  }, [])

  useEffect(() => {
    if (automatica && voceDisponibile()) {
      leggi(domanda.q, () => setInLettura(false))
      setInLettura(true) // eslint-disable-line react-hooks/set-state-in-effect
    }
    return () => {
      fermaLettura()
      setInLettura(false)
    }
  }, [domanda.id, domanda.q, automatica])

  function handleAscolta() {
    if (inLettura) {
      fermaLettura()
      setInLettura(false)
    } else {
      leggi(domanda.q, () => setInLettura(false))
      setInLettura(true)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      {domanda.img && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={urlFigura(domanda.img)}
          alt="Figura della domanda"
          className="mx-auto mb-4 max-h-48 w-auto object-contain"
        />
      )}
      <p className="text-lg text-slate-800 leading-snug">{domanda.q}</p>
      {disponibile && (
        <button
          onClick={handleAscolta}
          className={`mt-3 rounded-full px-4 py-2 text-sm font-semibold border ${
            inLettura ? 'bg-green-800 text-white border-green-800' : 'bg-white text-green-800 border-green-800'
          }`}
        >
          {inLettura ? '⏹ Ferma' : '🔊 Ascolta'}
        </button>
      )}
    </div>
  )
}
