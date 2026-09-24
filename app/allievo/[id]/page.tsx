'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Allievo, getAllievo, updateAllievo } from '@/lib/allievi'
import { AREE, GUIDE_LABELS, GuideCertificate, Livello, Scheda, VOCI, getScheda, saveScheda } from '@/lib/scheda'
import { condividiOScaricaReport } from '@/lib/report'
import { comprimiImmagine } from '@/lib/foto'

const LIVELLI: { value: Livello; label: string; attivo: string; inattivo: string }[] = [
  { value: 1, label: 'Da migliorare', attivo: 'bg-red-500 text-white', inattivo: 'bg-red-50 text-red-700' },
  { value: 2, label: 'Sufficiente', attivo: 'bg-amber-500 text-white', inattivo: 'bg-amber-50 text-amber-700' },
  { value: 3, label: 'Buono', attivo: 'bg-lime-600 text-white', inattivo: 'bg-lime-50 text-lime-700' },
  { value: 4, label: 'Ottimo', attivo: 'bg-green-600 text-white', inattivo: 'bg-green-50 text-green-700' },
]

function formattaData(iso: string): string {
  if (!iso) return 'Mai aggiornata'
  const d = new Date(iso)
  return `Aggiornata il ${d.toLocaleDateString('it-IT')} alle ${d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`
}

export default function SchedaAllievo() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [allievo, setAllievo] = useState<Allievo | undefined>(undefined)
  const [scheda, setScheda] = useState<Scheda | null>(null)
  const [generandoReport, setGenerandoReport] = useState(false)

  useEffect(() => {
    if (!params.id) return
    setAllievo(getAllievo(params.id))
    setScheda(getScheda(params.id))
  }, [params.id])

  function aggiorna(next: Scheda) {
    saveScheda(next)
    setScheda(getScheda(next.allievoId))
  }

  function setLivello(voceId: string, livello: Livello) {
    if (!scheda) return
    const attuale = scheda.voci[voceId]
    const nuoviVoci = { ...scheda.voci }
    if (attuale === livello) {
      delete nuoviVoci[voceId]
    } else {
      nuoviVoci[voceId] = livello
    }
    aggiorna({ ...scheda, voci: nuoviVoci })
  }

  function toggleSpiegato(voceId: string) {
    if (!scheda) return
    aggiorna({ ...scheda, spiegato: { ...scheda.spiegato, [voceId]: !scheda.spiegato[voceId] } })
  }

  function toggleGuida(key: keyof GuideCertificate) {
    if (!scheda) return
    aggiorna({ ...scheda, guideCertificate: { ...scheda.guideCertificate, [key]: !scheda.guideCertificate[key] } })
  }

  function setDataEsame(value: string) {
    if (!allievo) return
    updateAllievo(allievo.id, { dataEsame: value })
    setAllievo(getAllievo(allievo.id))
  }

  function setNote(value: string) {
    if (!allievo) return
    updateAllievo(allievo.id, { note: value })
    setAllievo(getAllievo(allievo.id))
  }

  async function caricaFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !allievo) return
    const dataUrl = await comprimiImmagine(file)
    updateAllievo(allievo.id, { foto: dataUrl })
    setAllievo(getAllievo(allievo.id))
  }

  async function generaReport() {
    if (!allievo || !scheda) return
    setGenerandoReport(true)
    try {
      await condividiOScaricaReport(allievo, scheda)
    } finally {
      setGenerandoReport(false)
    }
  }

  if (!allievo || !scheda) {
    return (
      <div className="min-h-full flex items-center justify-center bg-slate-50 px-4 text-center">
        <div>
          <p className="text-slate-500 mb-4">Allievo non trovato.</p>
          <button onClick={() => router.push('/')} className="text-blue-900 font-semibold underline">
            Torna all&apos;elenco
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-slate-50 pb-10">
      <header className="sticky top-0 z-10 bg-blue-900 text-white px-4 py-3 shadow">
        <button onClick={() => router.push('/')} className="text-blue-200 text-sm mb-1">
          ← Elenco allievi
        </button>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold">{allievo.cognome} {allievo.nome}</h1>
            <div className="flex items-center gap-2 mt-1">
              <label htmlFor="data-esame" className="text-xs text-blue-200">Data esame</label>
              <input
                id="data-esame"
                type="date"
                value={allievo.dataEsame ?? ''}
                onChange={e => setDataEsame(e.target.value)}
                className="rounded-md px-2 py-1 text-xs text-slate-800 bg-white"
              />
            </div>
          </div>
          <label className="relative shrink-0 cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={caricaFoto} />
            {allievo.foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={allievo.foto}
                alt={`Foto di ${allievo.nome} ${allievo.cognome}`}
                className="w-24 h-24 rounded-full object-cover border-2 border-blue-300"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-800 border-2 border-blue-300 flex items-center justify-center text-3xl">
                📷
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-xs">
              ✏️
            </span>
          </label>
        </div>
        <p className="text-xs text-blue-200 mt-1">{formattaData(scheda.aggiornata)}</p>
      </header>

      <main className="max-w-xl mx-auto px-4 py-4 space-y-6">
        <section>
          <h2 className="bg-sky-100 text-sky-900 font-bold text-sm px-3 py-2 rounded-t-lg">NOTE</h2>
          <div className="bg-white rounded-b-lg border border-slate-200 p-3">
            <textarea
              value={allievo.note ?? ''}
              onChange={e => setNote(e.target.value)}
              placeholder="Scrivi o detta (🎤 tastiera) una nota per questo allievo…"
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
            />
          </div>
        </section>

        {AREE.map(area => (
          <section key={area}>
            <h2 className="bg-sky-100 text-sky-900 font-bold text-sm px-3 py-2 rounded-t-lg">{area}</h2>
            <div className="bg-white rounded-b-lg border border-slate-200 divide-y divide-slate-100">
              {VOCI.filter(v => v.area === area).map(voce => {
                const spiegato = !!scheda.spiegato[voce.id]
                return (
                  <div key={voce.id} className="p-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-slate-800">{voce.argomento}</p>
                      <button
                        onClick={() => toggleSpiegato(voce.id)}
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold border ${spiegato ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-slate-500 border-slate-300'}`}
                      >
                        {spiegato ? '✓ Spiegato' : 'Spiegato'}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{voce.puntiChiave}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {LIVELLI.map(l => {
                        const attivo = scheda.voci[voce.id] === l.value
                        return (
                          <button
                            key={l.value}
                            onClick={() => setLivello(voce.id, l.value)}
                            className={`rounded-lg py-2 text-xs font-semibold transition-colors ${attivo ? l.attivo : l.inattivo}`}
                          >
                            {l.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))}

        <section>
          <h2 className="bg-sky-100 text-sky-900 font-bold text-sm px-3 py-2 rounded-t-lg">GUIDE CERTIFICATE</h2>
          <div className="bg-white rounded-b-lg border border-slate-200 p-3 grid grid-cols-3 gap-2">
            {GUIDE_LABELS.map(g => {
              const attivo = scheda.guideCertificate[g.key]
              return (
                <button
                  key={g.key}
                  onClick={() => toggleGuida(g.key)}
                  className={`rounded-lg py-3 text-sm font-semibold border ${attivo ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-slate-600 border-slate-300'}`}
                >
                  {attivo ? '✓ ' : ''}{g.label}
                </button>
              )
            })}
          </div>
        </section>

        <button
          onClick={generaReport}
          disabled={generandoReport}
          className="w-full bg-green-700 text-white rounded-lg py-4 font-semibold shadow-sm disabled:opacity-60"
        >
          {generandoReport ? 'Genero il PDF…' : '📄 Genera report finale (PDF)'}
        </button>
      </main>
    </div>
  )
}
