// Lettura ad alta voce delle domande con la sintesi vocale del telefono (Web Speech API).

export function voceDisponibile(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

function voceItaliana(): SpeechSynthesisVoice | undefined {
  const voci = window.speechSynthesis.getVoices()
  return voci.find(v => v.lang === 'it-IT' && v.localService) ?? voci.find(v => v.lang.startsWith('it'))
}

export function leggi(testo: string, onFine?: () => void): void {
  if (!voceDisponibile()) return
  window.speechSynthesis.cancel()
  const frase = new SpeechSynthesisUtterance(testo)
  frase.lang = 'it-IT'
  frase.rate = 0.95
  const voce = voceItaliana()
  if (voce) frase.voice = voce
  if (onFine) {
    frase.onend = onFine
    frase.onerror = onFine
  }
  window.speechSynthesis.speak(frase)
}

export function fermaLettura(): void {
  if (voceDisponibile()) window.speechSynthesis.cancel()
}
