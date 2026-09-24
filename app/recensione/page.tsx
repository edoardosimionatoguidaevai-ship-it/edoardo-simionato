'use client'

import { useState } from 'react'

const EMAIL_ISTRUTTORE = 'edoardo.simionato@guidaevai.com'

export default function Recensione() {
  const [stelle, setStelle] = useState(0)
  const [commento, setCommento] = useState('')
  const [inviato, setInviato] = useState(false)

  async function invia() {
    if (stelle === 0) return
    const testo = `Recensione per Edo\nValutazione: ${stelle}/5 stelle${commento ? `\n\n${commento}` : ''}`

    const nav = navigator as Navigator & {
      share?: (data: { title?: string; text: string }) => Promise<void>
    }

    if (nav.share) {
      try {
        await nav.share({ title: 'Recensione per Edo', text: testo })
        setInviato(true)
        return
      } catch {
        // condivisione annullata, procedi con il fallback email
      }
    }

    const subject = encodeURIComponent('Recensione per Edo')
    window.location.href = `mailto:${EMAIL_ISTRUTTORE}?subject=${subject}&body=${encodeURIComponent(testo)}`
    setInviato(true)
  }

  return (
    <div className="min-h-full bg-slate-50 flex flex-col items-center justify-center px-6 py-10 text-center">
      <h1 className="text-xl font-bold text-blue-900 mb-2">Com&apos;è andata con Edo?</h1>
      <p className="text-slate-500 mb-6">Lascia una valutazione da 1 a 5 stelle</p>

      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            onClick={() => setStelle(n)}
            aria-label={`${n} stelle`}
            className={`text-4xl leading-none ${n <= stelle ? 'text-amber-500' : 'text-slate-300'}`}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        value={commento}
        onChange={e => setCommento(e.target.value)}
        placeholder="Un commento (facoltativo)…"
        rows={4}
        className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm mb-4 bg-white"
      />

      <button
        onClick={invia}
        disabled={stelle === 0}
        className="w-full max-w-sm bg-blue-900 text-white rounded-lg py-3 font-semibold disabled:opacity-40"
      >
        Invia recensione
      </button>

      {inviato && <p className="text-sm text-green-700 mt-4">Grazie per il tuo feedback! 🙏</p>}
    </div>
  )
}
