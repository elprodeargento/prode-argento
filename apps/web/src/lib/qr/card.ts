import QRCode from 'qrcode'

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export async function generateQRCard(params: {
  shareUrl: string
  businessName: string
  primaryColor: string
  logoUrl?: string | null
}): Promise<Blob> {
  const { shareUrl, businessName, primaryColor, logoUrl } = params

  await document.fonts.ready

  const W = 1080, H = 1080
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // ── BACKGROUND ──
  ctx.fillStyle = primaryColor
  ctx.fillRect(0, 0, W, H)

  // Dot pattern
  ctx.fillStyle = 'rgba(255,255,255,0.07)'
  for (let x = 18; x < W; x += 36) {
    for (let y = 18; y < H; y += 36) {
      ctx.beginPath()
      ctx.arc(x, y, 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // ── LOAD ASSETS ──
  const qrDataUrl = await QRCode.toDataURL(shareUrl, {
    width: 480,
    margin: 1,
    color: { dark: primaryColor, light: '#FFFFFF' },
    errorCorrectionLevel: 'M',
  })

  const [qrImg, logoImg] = await Promise.all([
    loadImg(qrDataUrl),
    logoUrl ? loadImg(logoUrl).catch(() => null) : Promise.resolve(null),
  ])

  // ── LOGO ──
  const logoR = 46
  const logoCX = W / 2
  const logoCY = 108

  if (logoImg) {
    ctx.fillStyle = 'rgba(255,255,255,0.18)'
    ctx.beginPath()
    ctx.arc(logoCX, logoCY, logoR + 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.save()
    ctx.beginPath()
    ctx.arc(logoCX, logoCY, logoR, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(logoImg, logoCX - logoR, logoCY - logoR, logoR * 2, logoR * 2)
    ctx.restore()
  } else {
    ctx.font = '76px serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('⚽', logoCX, logoCY)
  }

  // ── BUSINESS NAME ──
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 76px "Bebas Neue", Impact, "Arial Narrow", sans-serif'
  const maxNameWidth = W - 120
  let nameFontSize = 76
  ctx.font = `bold ${nameFontSize}px "Bebas Neue", Impact, "Arial Narrow", sans-serif`
  while (ctx.measureText(businessName.toUpperCase()).width > maxNameWidth && nameFontSize > 36) {
    nameFontSize -= 4
    ctx.font = `bold ${nameFontSize}px "Bebas Neue", Impact, "Arial Narrow", sans-serif`
  }
  ctx.fillText(businessName.toUpperCase(), W / 2, 232)

  // ── SUBTITLE ──
  ctx.font = 'bold 26px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.65)'
  ctx.fillText('⚽  PRODE MUNDIAL 2026  ⚽', W / 2, 278)

  // ── QR CARD ──
  const cardPad = 38
  const qrSize = 442
  const cardW = qrSize + cardPad * 2
  const urlLabelH = 36
  const cardH = qrSize + cardPad * 2 + urlLabelH
  const cardX = (W - cardW) / 2
  const cardY = 308

  // Drop shadow
  ctx.shadowColor = 'rgba(0,0,0,0.3)'
  ctx.shadowBlur = 48
  ctx.shadowOffsetY = 12
  drawRoundRect(ctx, cardX, cardY, cardW, cardH, 28)
  ctx.fillStyle = '#FFFFFF'
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0

  // QR image
  ctx.drawImage(qrImg, cardX + cardPad, cardY + cardPad, qrSize, qrSize)

  // URL label inside card
  ctx.textAlign = 'center'
  ctx.font = `bold 20px sans-serif`
  ctx.fillStyle = primaryColor
  ctx.globalAlpha = 0.75
  ctx.fillText(shareUrl.replace('https://', ''), W / 2, cardY + cardPad + qrSize + 26)
  ctx.globalAlpha = 1

  // ── BOTTOM ──
  const bottomY = cardY + cardH + 48

  ctx.fillStyle = 'rgba(255,255,255,0.88)'
  ctx.font = 'bold 28px sans-serif'
  ctx.fillText('Escaneá y participá gratis  🎯', W / 2, bottomY)

  // Divider
  const divY = bottomY + 34
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(W / 2 - 160, divY)
  ctx.lineTo(W / 2 + 160, divY)
  ctx.stroke()

  // elprode.ar
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 48px "Bebas Neue", Impact, "Arial Narrow", sans-serif'
  ctx.fillText('⚽  elprode.ar', W / 2, divY + 66)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
      'image/png',
    )
  })
}
