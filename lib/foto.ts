export async function comprimiImmagine(file: File, maxLato = 480, qualita = 0.75): Promise<string> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = reject
      image.src = url
    })

    const scala = Math.min(1, maxLato / Math.max(img.width, img.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.width * scala)
    canvas.height = Math.round(img.height * scala)

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas non supportato')
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    return canvas.toDataURL('image/jpeg', qualita)
  } finally {
    URL.revokeObjectURL(url)
  }
}
