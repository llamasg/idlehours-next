import { NextRequest, NextResponse } from 'next/server'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json(null, { headers: CORS_HEADERS })
}

export async function POST(req: NextRequest) {
  const clientId = process.env.TWITCH_CLIENT_ID
  const clientSecret = process.env.TWITCH_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: 'TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET must be set' },
      { status: 500, headers: CORS_HEADERS },
    )
  }

  try {
    // Get Twitch token
    const tokenRes = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
      { method: 'POST' },
    )
    if (!tokenRes.ok) {
      return NextResponse.json(
        { error: `Twitch auth failed: ${tokenRes.status}` },
        { status: 502, headers: CORS_HEADERS },
      )
    }
    const { access_token } = await tokenRes.json()

    // Forward to IGDB
    const body = await req.text()
    const igdbRes = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'text/plain',
      },
      body,
    })

    const data = await igdbRes.json()
    return NextResponse.json(data, { headers: CORS_HEADERS })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'IGDB proxy error' },
      { status: 500, headers: CORS_HEADERS },
    )
  }
}
