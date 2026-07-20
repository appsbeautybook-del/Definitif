import http from 'http';
import https from 'https';

const PORT = 3001;

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check
  if (req.url === '/api/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  // Maria proxy
  if (req.url === '/api/maria' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { messages, model = 'mimo-v2.5-free', max_tokens = 1024 } = JSON.parse(body);

        const postData = JSON.stringify({ model, messages, max_tokens });

        const options = {
          hostname: 'opencode.ai',
          path: '/zen/v1/chat/completions',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer sk-ziv83S32mc2ZSb6g5h4faZnuIhXAZGlRYZSAOkMOX4KeqvL5FOHpmGnMeA5Jnsfw',
            'Content-Length': Buffer.byteLength(postData),
          },
        };

        const apiReq = https.request(options, (apiRes) => {
          let data = '';
          apiRes.on('data', chunk => { data += chunk; });
          apiRes.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.message?.content;
              const reasoning = parsed.choices?.[0]?.message?.reasoning;
              const reply = content || reasoning || "Je suis Maria ! Comment puis-je t'aider ?";

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ reply }));
            } catch (e) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Parse error', raw: data }));
            }
          });
        });

        apiReq.on('error', (e) => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        });

        apiReq.write(postData);
        apiReq.end();
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`✅ Maria proxy: http://localhost:${PORT}`);
});
