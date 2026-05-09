import { NextRequest } from 'next/server'
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const color = decodeURIComponent(req.nextUrl.searchParams.get('color') ?? '%23002B72') || '#002B72'

  return new ImageResponse(
    (
      <div
        style={{
          width: '512px',
          height: '512px',
          background: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '96px',
          fontSize: '320px',
        }}
      >
        ⚽
      </div>
    ),
    { width: 512, height: 512 },
  )
}
