import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, 'dist');

// Build API key from hidden file
let OPENCODE_API_KEY = '';
try {
  const keyPart = fs.readFileSync(path.join(__dirname, '.maria_key'), 'utf8').trim();
  OPENCODE_API_KEY = 'sk-' + keyPart;
  console.log('Key loaded, length:', OPENCODE_API_KEY.length, 'starts with:', OPENCODE_API_KEY.substring(0, 10));
  // Test the key immediately
  const testData = JSON.stringify({model:'mimo-v2.5-free',messages:[{role:'user',content:'ping'}],max_tokens:512});
  const testReq = https.request({hostname:'opencode.ai',path:'/zen/v1/chat/completions',method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${OPENCODE_API_KEY}`,'Content-Length':Buffer.byteLength(testData)}}, tr => {
    let td=''; tr.on('data',c=>td+=c); tr.on('end',()=>{ try { const tp=JSON.parse(td); console.log('Key test:', tp.choices?.[0]?.message?.content || 'NO CONTENT', '| choices:', JSON.stringify(tp.choices)); } catch(e){ console.log('Key test parse error:', e.message, 'raw:', td.substring(0,100)); } });
  });
  testReq.on('error',e=>console.log('Key test error:', e.message));
  testReq.write(testData); testReq.end();
} catch (e) {
  console.warn('Could not read .maria_key:', e.message);
  OPENCODE_API_KEY = (process.env.OK1 || '') + (process.env.OK2 || '');
}
const OPENCODE_MODEL = process.env.OMODEL || 'mimo-v2.5-free';
const OPENCODE_BASE_URL = 'https://opencode.ai/zen/v1/chat/completions';

const PORT = 5173;
let reels = []; // In-memory store for reels

const MIME_TYPES = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
};

function serveStatic(req, res) {
  let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (e) {
    res.writeHead(404);
    res.end('Not found');
  }
}

function proxyToOpenCode(body, res) {
  // Ensure model is set
  if (!body.model) body.model = OPENCODE_MODEL;
  const postData = JSON.stringify(body);
  console.log('[Proxy] Sending request to OpenCode, body size:', postData.length, 'max_tokens:', body.max_tokens, 'model:', body.model);

  const options = {
    hostname: new URL(OPENCODE_BASE_URL).hostname,
    path: new URL(OPENCODE_BASE_URL).pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENCODE_API_KEY}`,
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const apiReq = https.request(options, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => { data += chunk; });
    apiRes.on('end', () => {
      try {
        console.log('[Proxy] Response status:', apiRes.statusCode, 'body length:', data.length);
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.message?.content;
        const reasoning = parsed.choices?.[0]?.message?.reasoning;
        console.log('[Proxy] content:', content?.substring(0,50));
        console.log('[Proxy] reasoning:', reasoning?.substring(0,50));
        const reply = content || reasoning || "Je suis Maria ! Comment puis-je t'aider ?";

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ reply }));
      } catch (e) {
        console.error('[Proxy] Parse error:', e.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Parse error' }));
      }
    });
  });

  apiReq.on('error', (e) => {
    console.error('[Proxy] Request error:', e.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: e.message }));
  });
  apiReq.write(postData);
  apiReq.end();
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }
  // Maria proxy
  if (req.url === '/api/maria' && req.method === 'POST') {
    console.log('[Maria] Request received');
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        console.log('[Maria] Parsed body, messages:', parsed.messages?.length);
        proxyToOpenCode(parsed, res);
      } catch (e) {
        console.error('[Maria] Error:', e.message);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // Health check
  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  // manageReel endpoint (in-memory fallback)
  if (req.url === '/api/v8/manage/reel' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { action, id, data } = JSON.parse(body);
        if (action === 'create') {
          const reel = { id: Date.now().toString(), ...data, created_at: new Date().toISOString() };
          reels.unshift(reel);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ reel }));
        } else if (action === 'update' && id) {
          const idx = reels.findIndex(r => r.id === id);
          if (idx >= 0) { reels[idx] = { ...reels[idx], ...data }; }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ reel: idx >= 0 ? reels[idx] : null }));
        } else if (action === 'delete' && id) {
          reels = reels.filter(r => r.id !== id);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Action non reconnue' }));
        }
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Static files (SPA)
  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`OK BeautyBook: http://localhost:${PORT}`);
  console.log(`OK Maria proxy: POST /api/maria`);
});
