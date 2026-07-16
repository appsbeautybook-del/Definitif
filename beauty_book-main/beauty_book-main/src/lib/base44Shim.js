/**
 * Shim: override base44.integrations.Core.InvokeLLM → backend /api/ai/invoke-llm (MiMo V2.5)
 * Loaded before any component mounts.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
  // For now, return empty — TTS handled by Web Speech API on frontend
  return { url: '' };
}

// Patch base44 global when it exists
function patchBase44() {
  if (typeof window !== 'undefined' && window.base44?.integrations?.Core) {
    window.base44.integrations.Core.InvokeLLM = invokeLLMBackend;
    window.base44.integrations.Core.GenerateSpeech = generateSpeechBackend;
    console.log('[BeautyBook AI] base44.integrations.Core patched → MiMo V2.5 backend');
  }
}

// Patch immediately if base44 already loaded
patchBase44();

// Also patch after a short delay (base44 plugin may load async)
setTimeout(patchBase44, 500);
setTimeout(patchBase44, 2000);

// Export for manual import if needed
export { invokeLLMBackend, generateSpeechBackend };
