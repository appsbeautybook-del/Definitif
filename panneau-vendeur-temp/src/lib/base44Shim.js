/**
 * Shim: override base44.integrations.Core.InvokeLLM → /api/ai/maria (OpenRouter)
 * Loaded before any component mounts.
 */

const API_BASE = import.meta.env.VITE_BACKEND_URL || '';

async function invokeLLMBackend({ prompt, response_json_schema, file_urls, model }) {
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

  // Build user content with optional images
  const contentParts = [];
  if (file_urls && file_urls.length > 0) {
    for (const url of file_urls) {
      contentParts.push({ type: 'image_url', image_url: { url } });
    }
  }

  let fullPrompt = prompt;
  if (response_json_schema) {
    fullPrompt += `\n\nIMPORTANT: Return ONLY valid JSON matching this schema. No markdown, no explanation, just raw JSON:\n${JSON.stringify(response_json_schema, null, 2)}`;
  }
  contentParts.push({ type: 'text', text: fullPrompt });

  const messages = [{ role: 'user', content: contentParts }];

  const res = await fetch(`${API_BASE}/api/ai/maria`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, model: resolvedModel, temperature: 0.7, max_tokens: 4096 }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'LLM request failed' }));
    throw new Error(err.error || 'LLM request failed');
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || '';

  if (response_json_schema) {
    try {
      const cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return { raw: content, parse_error: true };
    }
  }

  return { content, model: resolvedModel };
}

async function generateSpeechBackend({ text, voice, language_code }) {
  return { url: '' };
}

// Ensure window.base44 exists so the shim can patch it
if (typeof window !== 'undefined' && !window.base44) {
  window.base44 = { integrations: { Core: {} } };
}

// Patch base44 global
function patchBase44() {
  if (typeof window !== 'undefined' && window.base44?.integrations?.Core) {
    window.base44.integrations.Core.InvokeLLM = invokeLLMBackend;
    window.base44.integrations.Core.GenerateSpeech = generateSpeechBackend;
    console.log('[BeautyBook AI] base44.integrations.Core patched → /api/ai/maria');
  }
}

patchBase44();
setTimeout(patchBase44, 500);
setTimeout(patchBase44, 2000);

export { invokeLLMBackend, generateSpeechBackend };
