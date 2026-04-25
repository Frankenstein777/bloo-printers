/**
 * applyWatermark
 * Reads an image File, draws it onto a canvas, overlays a repeating diagonal watermark, 
 * and returns the manipulated image as a Blob (wrapped in a File).
 */
export async function applyWatermark(file: File, watermarkText: string = 'Made by Octoplans'): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = URL.createObjectURL(file)
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      
      if (!ctx) return reject(new Error('No canvas context available'))

      // Draw original image
      ctx.drawImage(img, 0, 0)

      // Calculate dynamic font size based on image width (much smaller now)
      const fontSize = Math.max(Math.floor(img.width * 0.018), 16)
      ctx.font = `500 ${fontSize}px sans-serif`
      
      // Very faint semi-transparent white
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // Extremely subtle shadow for faint contrast
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
      ctx.shadowBlur = 2
      ctx.shadowOffsetX = 1
      ctx.shadowOffsetY = 1

      // Set up diagonal transform
      const diagonalLength = Math.sqrt(img.width * img.width + img.height * img.height)
      
      // Widely spread out grid pattern
      const stepX = img.width * 0.25
      const stepY = img.height * 0.25

      ctx.translate(img.width / 2, img.height / 2)
      ctx.rotate(-Math.PI / 4)

      // Tile the watermark
      for (let x = -diagonalLength / 2; x < diagonalLength; x += stepX) {
        for (let y = -diagonalLength / 2; y < diagonalLength; y += stepY) {
            ctx.fillText(watermarkText, x, y)
        }
      }

      // Convert back to File
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Canvas to Blob failed'))
        const watermarkedFile = new File([blob], file.name, { type: file.type || 'image/jpeg' })
        resolve(watermarkedFile)
        URL.revokeObjectURL(img.src)
      }, file.type || 'image/jpeg', 0.9)
    }
    
    img.onerror = () => reject(new Error('Failed to load image for watermarking'))
  })
}
