/**
 * Shim: override base44.integrations.Core.InvokeLLM → backend /api/ai/invoke-llm (MiMo V2.5)
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

if (typeof window !== 'undefined') {
  window.base44 = window.base44 || {};
  window.base44.integrations = window.base44.integrations || {};
  window.base44.integrations.Core = window.base44.integrations.Core || {};
  window.base44.integrations.Core.InvokeLLM = invokeLLMBackend;
  console.log('[base44Shim] InvokeLLM → backend /api/ai/invoke-llm');
}
