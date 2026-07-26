/**
 * Shim: override base44.integrations.Core.InvokeLLM → backend /api/ai/invoke-llm
 * Loaded before any component mounts.
 */

const API_BASE = import.meta.env.VITE_BACKEND_URL || '';

async function invokeLLMBackend({ prompt, response_json_schema, file_urls, model }) {
  const res = await fetch(`${API_BASE}/api/ai/invoke-llm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, response_json_schema, file_urls, model }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'LLM request failed' }));
    throw new Error(err.error || 'LLM request failed');
  }
  return res.json();
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
    console.log('[BeautyBook AI] base44.integrations.Core patched → backend /api/ai/invoke-llm');
  }
}

patchBase44();
setTimeout(patchBase44, 500);
setTimeout(patchBase44, 2000);

export { invokeLLMBackend, generateSpeechBackend };
