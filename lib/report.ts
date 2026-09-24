import jsPDF from 'jspdf'
import { Allievo } from './allievi'
import { AREE, LIVELLO_LABELS, Scheda, VOCI } from './scheda'

const BLU = [30, 58, 138] as const
const TESTO = [30, 41, 59] as const
const GRIGIO = [100, 116, 139] as const
const AREA_BG = [217, 234, 247] as const
const URL_RECENSIONE = 'https://guida-pratica-app.vercel.app/recensione'

const COLORE_LIVELLO: Record<number, readonly [number, number, number]> = {
  0: GRIGIO,
  1: [220, 38, 38],
  2: [180, 130, 8],
  3: [101, 163, 13],
  4: [22, 101, 52],
}

function formattaDataIt(iso: string): string {
  return new Date(iso).toLocaleDateString('it-IT')
}

function setColore(doc: jsPDF, colore: readonly [number, number, number]): void {
  doc.setTextColor(colore[0], colore[1], colore[2])
}

export function generaReportPdf(allievo: Allievo, scheda: Scheda): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const marginX = 18
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let y = 22

  function saltaPaginaSeNecessario(spazio: number) {
    if (y + spazio > pageHeight - 15) {
      doc.addPage()
      y = 22
    }
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...BLU)
  doc.text('Report Finale — Guide', marginX, y)
  y += 9

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(...TESTO)
  doc.text(`Allievo: ${allievo.cognome} ${allievo.nome}`, marginX, y)
  y += 6
  if (allievo.dataEsame) {
    doc.text(`Data esame: ${formattaDataIt(allievo.dataEsame)}`, marginX, y)
    y += 6
  }
  doc.setTextColor(...GRIGIO)
  doc.setFontSize(9)
  doc.text(`Report generato il ${new Date().toLocaleDateString('it-IT')}`, marginX, y)
  y += 10

  for (const area of AREE) {
    saltaPaginaSeNecessario(16)
    doc.setFillColor(...AREA_BG)
    doc.rect(marginX, y - 5, pageWidth - marginX * 2, 7, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...BLU)
    doc.text(area, marginX + 2, y)
    y += 9

    for (const voce of VOCI.filter(v => v.area === area)) {
      saltaPaginaSeNecessario(7)
      const livello = scheda.voci[voce.id] ?? 0
      const spiegato = !!scheda.spiegato[voce.id]

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(...TESTO)
      doc.text(voce.argomento, marginX, y)

      doc.setFontSize(9)
      setColore(doc, spiegato ? BLU : GRIGIO)
      doc.text(spiegato ? 'Spiegato' : 'Non spiegato', pageWidth - marginX - 60, y)

      setColore(doc, COLORE_LIVELLO[livello])
      doc.text(LIVELLO_LABELS[livello], pageWidth - marginX - 30, y)

      y += 6.5
    }
    y += 3
  }

  saltaPaginaSeNecessario(14)
  y += 4
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  setColore(doc, BLU)
  doc.textWithLink('★ Lascia una recensione (da 1 a 5 stelle)', marginX, y, { url: URL_RECENSIONE })
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  setColore(doc, GRIGIO)
  doc.text(URL_RECENSIONE, marginX, y)

  return doc
}

export function nomeFileReport(allievo: Allievo): string {
  return `Report_${allievo.cognome}_${allievo.nome}.pdf`.replace(/\s+/g, '_')
}

export async function condividiOScaricaReport(allievo: Allievo, scheda: Scheda): Promise<void> {
  const doc = generaReportPdf(allievo, scheda)
  const blob = doc.output('blob')
  const filename = nomeFileReport(allievo)

  const nav = navigator as Navigator & {
    canShare?: (data: { files: File[] }) => boolean
    share?: (data: { files: File[]; title?: string }) => Promise<void>
  }

  if (nav.canShare && nav.share) {
    const file = new File([blob], filename, { type: 'application/pdf' })
    if (nav.canShare({ files: [file] })) {
      try {
        await nav.share({ files: [file], title: filename })
        return
      } catch {
        // utente ha annullato la condivisione, procedi con il download
      }
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
