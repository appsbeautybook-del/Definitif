export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const OPENROUTER_KEY = process.env.VITE_OPENROUTER_KEY;

  try {
    const { messages, model, temperature, max_tokens } = req.body;

    const apiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'HTTP-Referer': 'https://definitif-beta.vercel.app',
        'X-Title': 'BeautyBook Maria AI',
      },
      body: JSON.stringify({ model, messages, temperature, max_tokens }),
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
      return res.status(apiRes.status).json(data);
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).json(data);
  } catch (err) {
    console.error('[api/ai/maria] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
