import Link from 'next/link'

export default function Intestazione({ titolo, sottotitolo, indietro, destra }: {
  titolo: string
  sottotitolo?: string
  indietro?: string
  destra?: React.ReactNode
}) {
  return (
    <header className="sticky top-0 z-10 bg-green-900 text-white px-4 py-3 shadow flex items-center gap-3">
      {indietro && (
        <Link href={indietro} aria-label="Indietro" className="text-2xl leading-none px-1 -ml-1">
          ‹
        </Link>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-bold truncate">{titolo}</h1>
        {sottotitolo && <p className="text-sm text-green-200 truncate">{sottotitolo}</p>}
      </div>
      {destra}
    </header>
  )
}
