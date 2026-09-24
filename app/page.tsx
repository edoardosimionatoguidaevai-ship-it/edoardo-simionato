'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Allievo, addAllievo, deleteAllievo, getAllievi } from '@/lib/allievi'
import { condividiOScaricaBackup, importaBackupDaFile } from '@/lib/backup'

export default function Home() {
  const router = useRouter()
  const [allievi, setAllievi] = useState<Allievo[]>([])
  const [filtro, setFiltro] = useState('')
  const [nuovoNome, setNuovoNome] = useState('')
  const [nuovoCognome, setNuovoCognome] = useState('')
  const [formAperto, setFormAperto] = useState(false)
  const [messaggioBackup, setMessaggioBackup] = useState('')

  useEffect(() => {
    setAllievi(getAllievi())
  }, [])

  function handleAggiungi(e: React.FormEvent) {
    e.preventDefault()
    if (!nuovoNome.trim() || !nuovoCognome.trim()) return
    addAllievo({ nome: nuovoNome.trim(), cognome: nuovoCognome.trim() })
    setAllievi(getAllievi())
    setNuovoNome('')
    setNuovoCognome('')
    setFormAperto(false)
  }

  function handleElimina(id: string) {
    if (!confirm('Eliminare questo allievo e la sua scheda?')) return
    deleteAllievo(id)
    setAllievi(getAllievi())
  }

  const allieviFiltrati = allievi.filter(a =>
    `${a.nome} ${a.cognome}`.toLowerCase().includes(filtro.toLowerCase())
  )

  async function handleEsporta() {
    setMessaggioBackup('')
    await condividiOScaricaBackup()
  }

  async function handleImporta(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const numero = await importaBackupDaFile(file)
      setAllievi(getAllievi())
      setMessaggioBackup(`✓ Importati/aggiornati ${numero} allievi.`)
    } catch {
      setMessaggioBackup('⚠️ File di backup non valido.')
    }
  }

  return (
    <div className="min-h-full bg-slate-50">
      <header className="sticky top-0 z-10 bg-blue-900 text-white px-4 py-4 shadow">
        <h1 className="text-lg font-bold">Guide</h1>
        <p className="text-sm text-blue-200">Elenco allievi</p>
      </header>

      <main className="max-w-xl mx-auto px-4 py-4">
        <input
          type="text"
          placeholder="Cerca allievo..."
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base mb-4"
        />

        <ul className="space-y-2 mb-4">
          {allieviFiltrati.map(a => (
            <li key={a.id} className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/allievo/${a.id}`)}
                className="flex-1 flex items-center gap-3 text-left bg-white rounded-lg border border-slate-200 px-4 py-3 shadow-sm active:bg-slate-100"
              >
                {a.foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.foto}
                    alt={`Foto di ${a.nome} ${a.cognome}`}
                    className="w-14 h-14 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-2xl shrink-0">
                    👤
                  </div>
                )}
                <span className="font-semibold text-slate-800">{a.cognome} {a.nome}</span>
              </button>
              <button
                onClick={() => handleElimina(a.id)}
                aria-label="Elimina allievo"
                className="text-red-500 px-3 py-3 text-xl"
              >
                ✕
              </button>
            </li>
          ))}
          {allieviFiltrati.length === 0 && (
            <li className="text-center text-slate-400 py-8">Nessun allievo trovato</li>
          )}
        </ul>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          {formAperto ? (
            <form onSubmit={handleAggiungi} className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nome"
                  value={nuovoNome}
                  onChange={e => setNuovoNome(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-3"
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="Cognome"
                  value={nuovoCognome}
                  onChange={e => setNuovoCognome(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-3"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-900 text-white rounded-lg py-3 font-semibold">
                  Aggiungi
                </button>
                <button type="button" onClick={() => setFormAperto(false)} className="px-4 py-3 rounded-lg border border-slate-300">
                  Annulla
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setFormAperto(true)}
              className="w-full block bg-blue-900 text-white rounded-lg py-3 font-semibold"
            >
              + Nuovo allievo
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4 mt-4">
          <p className="text-xs text-slate-500 mb-3">
            Backup: salva una copia di tutti gli allievi e le schede, o ripristinala su un altro dispositivo.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleEsporta}
              className="flex-1 bg-slate-100 text-slate-700 rounded-lg py-3 text-sm font-semibold border border-slate-300"
            >
              ⬇️ Esporta backup
            </button>
            <label className="flex-1 bg-slate-100 text-slate-700 rounded-lg py-3 text-sm font-semibold border border-slate-300 text-center cursor-pointer">
              ⬆️ Importa backup
              <input type="file" accept="application/json" className="hidden" onChange={handleImporta} />
            </label>
          </div>
          {messaggioBackup && <p className="text-xs text-slate-600 mt-2">{messaggioBackup}</p>}
        </div>
      </main>
    </div>
  )
}
