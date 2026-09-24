import { Allievo, getAllievi, saveAllievi } from './allievi'
import { Scheda, getScheda, saveScheda } from './scheda'

interface Backup {
  versione: 1
  esportatoIl: string
  allievi: Allievo[]
  schede: Scheda[]
}

function nomeFileBackup(): string {
  return `Backup_Guide_${new Date().toISOString().slice(0, 10)}.json`
}

function costruisciBackup(): Backup {
  const allievi = getAllievi()
  return {
    versione: 1,
    esportatoIl: new Date().toISOString(),
    allievi,
    schede: allievi.map(a => getScheda(a.id)),
  }
}

export async function condividiOScaricaBackup(): Promise<void> {
  const json = JSON.stringify(costruisciBackup(), null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const filename = nomeFileBackup()

  const nav = navigator as Navigator & {
    canShare?: (data: { files: File[] }) => boolean
    share?: (data: { files: File[]; title?: string }) => Promise<void>
  }

  if (nav.canShare && nav.share) {
    const file = new File([blob], filename, { type: 'application/json' })
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

function isBackupValido(dati: unknown): dati is Backup {
  if (!dati || typeof dati !== 'object') return false
  const d = dati as Partial<Backup>
  return Array.isArray(d.allievi) && Array.isArray(d.schede)
}

export async function importaBackupDaFile(file: File): Promise<number> {
  const testo = await file.text()
  const dati = JSON.parse(testo)
  if (!isBackupValido(dati)) {
    throw new Error('File di backup non valido')
  }

  const allieviAttuali = getAllievi()
  const perId = new Map(allieviAttuali.map(a => [a.id, a]))
  for (const importato of dati.allievi) perId.set(importato.id, importato)
  saveAllievi([...perId.values()])

  for (const scheda of dati.schede) saveScheda(scheda)

  return dati.allievi.length
}
