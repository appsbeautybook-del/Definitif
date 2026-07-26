export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, response_json_schema, file_urls, model } = req.body;

  const OPENROUTER_KEY = process.env.OPENROUTER_KEY || '';

  // Map Base44 model names → OpenRouter model IDs
  const modelMap = {
    'claude_sonnet_4_6': 'anthropic/claude-sonnet-4',
    'claude_3_5_sonnet': 'anthropic/claude-3.5-sonnet',
    'claude_3_haiku': 'anthropic/claude-3-haiku',
    'gpt-4o': 'openai/gpt-4o',
    'gpt-4o-mini': 'openai/gpt-4o-mini',
    'gemini-2.5-flash': 'google/gemini-2.5-flash',
    'gemini-2.5-pro': 'google/gemini-2.5-pro',
  };
  const resolvedModel = modelMap[model] || model || 'google/gemini-2.5-flash';

  try {
    // Build messages with optional vision (image URLs)
    const userContent = [];

    // Add images first if provided (vision)
    if (file_urls && file_urls.length > 0) {
      for (const url of file_urls) {
        userContent.push({
          type: 'image_url',
          image_url: { url }
        });
      }
    }

    // Add text prompt
    userContent.push({ type: 'text', text: prompt });

    const messages = [{ role: 'user', content: userContent }];

    // If JSON schema requested, append instruction to prompt
    if (response_json_schema) {
      const schemaHint = `\n\nIMPORTANT: Return ONLY valid JSON matching this schema. No markdown, no explanation, just raw JSON:\n${JSON.stringify(response_json_schema, null, 2)}`;
      // Append to the last text content
      const lastText = userContent.findLast(c => c.type === 'text');
      if (lastText) lastText.text += schemaHint;
    }

    const body = JSON.stringify({
      model: resolvedModel,
      messages,
      temperature: 0.7,
      max_tokens: 4096,
    });

    const apiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'HTTP-Referer': 'https://definitif-beta.vercel.app',
        'X-Title': 'BeautyBook AI',
      },
      body,
    });

    if (!apiRes.ok) {
      const errBody = await apiRes.text().catch(() => 'Unknown error');
      return res.status(apiRes.status).json({ error: `OpenRouter error: ${errBody}` });
    }

    const data = await apiRes.json();
    const content = data?.choices?.[0]?.message?.content || '';

    // Try to parse JSON from the response
    if (response_json_schema) {
      try {
        // Strip markdown code fences if present
        const cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
        const parsed = JSON.parse(cleaned);
        return res.status(200).json(parsed);
      } catch {
        // If JSON parse fails, return raw content as { raw: content }
        return res.status(200).json({ raw: content, parse_error: true });
      }
    }

    return res.status(200).json({ content, model: resolvedModel });
  } catch (err) {
    console.error('[api/ai/invoke-llm] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
