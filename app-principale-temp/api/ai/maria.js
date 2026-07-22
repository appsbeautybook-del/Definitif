export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages, model, temperature, max_tokens } = req.body;

  const OPENCODE_KEY = 'sk-FPP6sh78YsOhyjj0mmztchS7PGvuH2EE3nIM8vCNeaWUYhAmzlADOrSJtZ0QTu5u';
  const OPENROUTER_KEY = process.env.OPENROUTER_KEY || '';

  const systemMsg = messages.find(m => m.role === 'system');
  const userMsgs = messages.filter(m => m.role !== 'system');

  const body = JSON.stringify({
    model: model || 'deepseek/deepseek-chat-v3-0324',
    messages,
    temperature: temperature || 0.7,
    max_tokens: max_tokens || 2048,
  });

  try {
    let apiRes = await fetch('https://opencode.ai/zen/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENCODE_KEY}` },
      body: JSON.stringify({ model: 'mimo-v2.5-free', messages, temperature: temperature || 0.7, max_tokens: max_tokens || 2048 }),
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      return res.status(200).json(data);
    }

    console.log('[api/ai/maria] OpenCode failed:', apiRes.status, '- trying OpenRouter');

    if (OPENROUTER_KEY) {
      apiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_KEY}`,
          'HTTP-Referer': 'https://definitif-beta.vercel.app',
          'X-Title': 'BeautyBook Maria AI',
        },
        body,
      });

      if (apiRes.ok) {
        const data = await apiRes.json();
        return res.status(200).json(data);
      }
    }

    const errBody = await apiRes.text().catch(() => 'Unknown error');
    return res.status(apiRes.status).json({ error: `AI APIs unavailable: ${errBody}` });
  } catch (err) {
    console.error('[api/ai/maria] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
