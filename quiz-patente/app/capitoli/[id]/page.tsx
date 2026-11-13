'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Intestazione from '@/components/Intestazione'
import Esercizio from '@/components/Esercizio'
import { Capitolo, DomandaConCapitolo, caricaCapitoli, domandeCapitoli, domandeCapitolo } from '@/lib/quiz'

const DOMANDE_PER_GIRO = 30

export default function EsercizioCapitolo() {
  const params = useParams<{ id: string }>()
  const ids = (params.id ?? '').split(',').filter(Boolean)
  const idsKey = ids.join(',')

  const [capitoliScelti, setCapitoliScelti] = useState<Capitolo[] | null | undefined>(undefined)
  const [domande, setDomande] = useState<DomandaConCapitolo[]>([])
  const [giro, setGiro] = useState(0)

  useEffect(() => {
    if (!idsKey) return
    const idSet = new Set(idsKey.split(','))
    caricaCapitoli()
      .then(capitoli => {
        const scelti = capitoli.filter(c => idSet.has(c.id))
        setCapitoliScelti(scelti.length > 0 ? scelti : null)
        if (scelti.length === 1) setDomande(domandeCapitolo(scelti[0], DOMANDE_PER_GIRO))
        else if (scelti.length > 1) setDomande(domandeCapitoli(scelti, DOMANDE_PER_GIRO))
      })
      .catch(() => setCapitoliScelti(null))
  }, [idsKey])

  function ricomincia() {
    if (!capitoliScelti) return
    setDomande(
      capitoliScelti.length === 1
        ? domandeCapitolo(capitoliScelti[0], DOMANDE_PER_GIRO)
        : domandeCapitoli(capitoliScelti, DOMANDE_PER_GIRO)
    )
    setGiro(g => g + 1)
  }

  const singolo = capitoliScelti && capitoliScelti.length === 1 ? capitoliScelti[0] : null
  const titolo = singolo ? singolo.titolo : capitoliScelti ? `${capitoliScelti.length} capitoli` : 'Capitolo'
  const sottotitolo = singolo
    ? `Capitolo ${singolo.numero}`
    : capitoliScelti
      ? `Capitoli ${capitoliScelti.map(c => c.numero).sort((a, b) => a - b).join(', ')}`
      : undefined

  return (
    <div className="min-h-full">
      <Intestazione titolo={titolo} sottotitolo={sottotitolo} indietro="/capitoli" />
      <main className="max-w-xl mx-auto px-4 py-4">
        {capitoliScelti === undefined && <p className="text-center text-slate-400 py-8">Caricamento…</p>}
        {capitoliScelti === null && <p className="text-center text-red-600 py-8">Capitolo non trovato.</p>}
        {capitoliScelti && <Esercizio key={giro} domande={domande} onRicomincia={ricomincia} />}
      </main>
    </div>
  )
}
