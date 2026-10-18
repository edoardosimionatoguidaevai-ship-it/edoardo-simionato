'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Intestazione from '@/components/Intestazione'
import Esercizio from '@/components/Esercizio'
import { DomandaConCapitolo, caricaCapitoli, domandePerId, mescola } from '@/lib/quiz'
import { getIdErrori } from '@/lib/progressi'

const DOMANDE_PER_GIRO = 30

export default function Ripasso() {
  const [domande, setDomande] = useState<DomandaConCapitolo[] | null>(null)
  const [giro, setGiro] = useState(0)
  const [errore, setErrore] = useState(false)

  function prepara() {
    caricaCapitoli()
      .then(capitoli => {
        setDomande(mescola(domandePerId(capitoli, getIdErrori())).slice(0, DOMANDE_PER_GIRO))
        setGiro(g => g + 1)
      })
      .catch(() => setErrore(true))
  }

  useEffect(prepara, [])

  return (
    <div className="min-h-full">
      <Intestazione titolo="Ripasso errori" sottotitolo="Una risposta giusta toglie la domanda dal ripasso" indietro="/" />
      <main className="max-w-xl mx-auto px-4 py-4">
        {errore && <p className="text-center text-red-600 py-8">Impossibile caricare le domande. Controlla la connessione.</p>}
        {!domande && !errore && <p className="text-center text-slate-400 py-8">Caricamento…</p>}
        {domande?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-5xl mb-2">✅</p>
            <p className="text-slate-600 mb-6">Nessun errore da ripassare.</p>
            <Link href="/" className="text-green-800 font-semibold underline">Torna alla home</Link>
          </div>
        )}
        {domande && domande.length > 0 && <Esercizio key={giro} domande={domande} onRicomincia={prepara} />}
      </main>
    </div>
  )
}
