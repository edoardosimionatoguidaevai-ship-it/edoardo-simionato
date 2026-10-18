import { Domanda, urlFigura } from '@/lib/quiz'

export default function TestoDomanda({ domanda }: { domanda: Domanda }) {
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
    </div>
  )
}
