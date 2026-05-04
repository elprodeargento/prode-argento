import QRCode from 'qrcode'

export async function generateQRDataURL(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    width: 300,
    margin: 2,
    color: { dark: '#002B72', light: '#FFFFFF' },
    errorCorrectionLevel: 'M',
  })
}

export async function generateQRSVG(url: string): Promise<string> {
  return QRCode.toString(url, { type: 'svg', width: 300, margin: 2 })
}
