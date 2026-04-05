import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const url = new URL(req.url)
  const imageUrl = url.searchParams.get('url')

  if (!imageUrl) {
    return new Response('Missing url parameter', { status: 400 })
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Literature-Tracker/1.0)',
      },
    })

    if (!response.ok) {
      return new Response(`Failed to fetch image: ${response.status}`, { status: response.status })
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const body = await response.arrayBuffer()

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=86400', // Cache for 1 day
      },
    })
  } catch (error) {
    console.error('Error fetching image:', error)
    return new Response('Error fetching image', { status: 500 })
  }
})