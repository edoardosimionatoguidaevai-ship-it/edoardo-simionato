'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Intestazione from '@/components/Intestazione'
import Esercizio from '@/components/Esercizio'
import { Capitolo, DomandaConCapitolo, caricaCapitoli, domandeCapitolo } from '@/lib/quiz'

const DOMANDE_PER_GIRO = 30

export default function EsercizioCapitolo() {
  const params = useParams<{ id: string }>()
  const [capitolo, setCapitolo] = useState<Capitolo | null | undefined>(undefined)
  const [domande, setDomande] = useState<DomandaConCapitolo[]>([])
  const [giro, setGiro] = useState(0)

  useEffect(() => {
    if (!params.id) return
    caricaCapitoli()
      .then(capitoli => {
        const c = capitoli.find(c => c.id === params.id) ?? null
        setCapitolo(c)
        if (c) setDomande(domandeCapitolo(c, DOMANDE_PER_GIRO))
      })
      .catch(() => setCapitolo(null))
  }, [params.id])

  function ricomincia() {
    if (!capitolo) return
    setDomande(domandeCapitolo(capitolo, DOMANDE_PER_GIRO))
    setGiro(g => g + 1)
  }

  return (
    <div className="min-h-full">
      <Intestazione
        titolo={capitolo ? capitolo.titolo : 'Capitolo'}
        sottotitolo={capitolo ? `Capitolo ${capitolo.numero}` : undefined}
        indietro="/capitoli"
      />
      <main className="max-w-xl mx-auto px-4 py-4">
        {capitolo === undefined && <p className="text-center text-slate-400 py-8">Caricamento…</p>}
        {capitolo === null && <p className="text-center text-red-600 py-8">Capitolo non trovato.</p>}
        {capitolo && <Esercizio key={giro} domande={domande} onRicomincia={ricomincia} />}
      </main>
    </div>
  )
}
