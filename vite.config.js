import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

// Dev-only image proxy matching Vercel's /api/image-proxy route
const imageProxyPlugin = {
  name: 'image-proxy',
  configureServer(server) {
    server.middlewares.use('/api/image-proxy', async (req, res) => {
      try {
        const imageUrl = new URL(req.url, 'http://localhost').searchParams.get('url')
        if (!imageUrl) { res.statusCode = 400; res.end('missing url'); return }

        const upstream = await fetch(imageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': new URL(imageUrl).origin + '/',
            'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
          },
        })

        if (!upstream.ok) { res.statusCode = upstream.status; res.end(`upstream ${upstream.status}`); return }

        const contentType = upstream.headers.get('content-type') || 'image/gif'
        const buffer = Buffer.from(await upstream.arrayBuffer())
        res.setHeader('Content-Type', contentType)
        res.setHeader('Cache-Control', 'public, max-age=86400')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.statusCode = 200
        res.end(buffer)
      } catch (e) {
        res.statusCode = 502; res.end(e.message)
      }
    })
  },
}

export default defineConfig({
  plugins: [react(), imageProxyPlugin],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
