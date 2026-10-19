'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Intestazione from '@/components/Intestazione'
import RisultatoSimulazione from '@/components/RisultatoSimulazione'
import { caricaCapitoli } from '@/lib/quiz'
import { SchedaRicevuta, leggiScheda } from '@/lib/scheda'

function Scheda() {
  const parametri = useSearchParams()
  const [scheda, setScheda] = useState<SchedaRicevuta | null | undefined>(undefined)

  useEffect(() => {
    caricaCapitoli()
      .then(capitoli => setScheda(leggiScheda(new URLSearchParams(parametri.toString()), capitoli)))
      .catch(() => setScheda(null))
  }, [parametri])

  const data = scheda?.simulazione.data ? new Date(scheda.simulazione.data) : null

  return (
    <div className="min-h-full">
      <Intestazione
        titolo={scheda?.nome ? `Scheda di ${scheda.nome}` : 'Scheda simulazione'}
        sottotitolo={
          data
            ? `${data.toLocaleDateString('it-IT')} ${data.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`
            : undefined
        }
      />
      <main className="max-w-xl mx-auto px-4 py-4">
        {scheda === undefined && <p className="text-center text-slate-400 py-8">Caricamento…</p>}
        {scheda === null && (
          <p className="text-center text-red-600 py-8">
            Link della scheda non valido o incompleto. Chiedi all&apos;allievo di inviarlo di nuovo.
          </p>
        )}
        {scheda && <RisultatoSimulazione domande={scheda.domande} risposte={scheda.risposte} simulazione={scheda.simulazione} />}
      </main>
    </div>
  )
}

export default function PaginaScheda() {
  return (
    <Suspense>
      <Scheda />
    </Suspense>
  )
}
