// ── Serveur API local pour le développement ──────────────────────────────────
// Tourne sur le port 3001, Vite proxy /api/* vers lui.
// Charge les handlers du dossier api/ comme des modules ESM.

import { createServer } from 'http'
import { readFileSync, existsSync } from 'fs'
import { resolve, join } from 'path'
import { pathToFileURL } from 'url'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// Charger le fichier .env
const envFile = resolve(__dirname, '.env')
try {
  const envContent = readFileSync(envFile, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx > 0) {
      const key = trimmed.slice(0, idx).trim()
      const val = trimmed.slice(idx + 1).trim()
      if (!process.env[key]) process.env[key] = val
    }
  }
} catch {}

const API_ROOT = resolve(__dirname, 'api')
const PORT = process.env.API_PORT || 3001

// Cache des handlers importés
const handlerCache = new Map()

async function loadHandler(routePath) {
  if (handlerCache.has(routePath)) return handlerCache.get(routePath)

  const filePath = resolve(API_ROOT, routePath + '.js')
  if (!existsSync(filePath)) return null

  const fileUrl = pathToFileURL(filePath).href
  const mod = await import(fileUrl)
  const handler = mod.default
  handlerCache.set(routePath, handler)
  return handler
}

function parseBody(req) {
  return new Promise((resolve) => {
    if (req.method === 'GET' || req.method === 'HEAD') return resolve({})
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8')
      try { resolve(raw ? JSON.parse(raw) : {}) } catch { resolve({}) }
    })
  })
}

const server = createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return }

  const url = new URL(req.url, `http://localhost:${PORT}`)
  const routePath = url.pathname.replace(/^\/+/, '').replace(/\.js$/, '')

  // Monter les query params
  const query = {}
  url.searchParams.forEach((v, k) => { query[k] = v })

  try {
    const handler = await loadHandler(routePath)
    if (!handler) {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: `Not found: ${routePath}` }))
      return
    }

    // Parser le body
    req.body = await parseBody(req)
    req.query = query

    // Mock res.status().json().send()
    let statusCode = 200
    const resObj = {
      status: (code) => { statusCode = code; return resObj },
      json: (obj) => {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(obj))
      },
      send: (buf) => {
        res.writeHead(statusCode, {
          'Content-Type': buf instanceof Buffer ? 'audio/wav' : 'text/plain',
        })
        res.end(buf)
      },
      setHeader: (k, v) => res.setHeader(k, v),
    }

    await handler(req, resObj)
  } catch (err) {
    console.error(`[api-server] Error on ${routePath}:`, err.message)
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: err.message }))
    }
  }
})

server.listen(PORT, () => {
  console.log(`[api-server] Running on http://localhost:${PORT}`)
  console.log(`[api-server] API root: ${API_ROOT}`)
})
