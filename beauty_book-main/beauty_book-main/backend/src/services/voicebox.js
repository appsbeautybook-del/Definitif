/**
 * Voicebox TTS Service — Remote Mode with Edge-TTS fallback
 * Connects to a remote Voicebox instance for production use.
 * Falls back to Microsoft Edge TTS (free, natural voices) when Voicebox is unavailable.
 * 
 * Environment variables:
 *   VOICEBOX_URL        — Remote Voicebox server URL (default: http://127.0.0.1:17493)
 *   VOICEBOX_API_KEY    — API key for authentication (optional, for reverse proxy)
 *   VOICEBOX_CLIENT_ID  — Client identifier (default: beautybook)
 *   VOICEBOX_PROFILE    — Default voice profile (default: Maria)
 *   VOICEBOX_ENGINE     — Default TTS engine (default: qwen)
 *   VOICEBOX_LANGUAGE   — Default language (default: fr)
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import { existsSync, readFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const execFileAsync = promisify(execFile);

const VOICEBOX_URL = process.env.VOICEBOX_URL || 'http://127.0.0.1:17493';
const VOICEBOX_API_KEY = process.env.VOICEBOX_API_KEY || '';
const VOICEBOX_CLIENT_ID = process.env.VOICEBOX_CLIENT_ID || 'beautybook';
const DEFAULT_PROFILE = process.env.VOICEBOX_PROFILE || 'Maria';
const DEFAULT_ENGINE = process.env.VOICEBOX_ENGINE || 'qwen';
const DEFAULT_LANGUAGE = process.env.VOICEBOX_LANGUAGE || 'fr';

// Edge-TTS voice mapping for natural French voices
const EDGE_TTS_VOICES = {
  'Maria': 'fr-FR-DeniseNeural',      // Female, warm & natural
  'Denise': 'fr-FR-DeniseNeural',
  'Henri': 'fr-FR-HenriNeural',       // Male, natural
  'default': 'fr-FR-DeniseNeural',
};

// Simple in-memory cache for generated audio (avoids re-generation)
const speechCache = new Map();
const CACHE_MAX_SIZE = 500;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function getCacheKey(text, profile, engine, language) {
  return `${text}|${profile}|${engine}|${language}`;
}

function getCached(key) {
  const entry = speechCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    speechCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  if (speechCache.size >= CACHE_MAX_SIZE) {
    // Evict oldest
    const oldest = speechCache.keys().next().value;
    speechCache.delete(oldest);
  }
  speechCache.set(key, { data, ts: Date.now() });
}

/**
 * Build headers for Voicebox requests
 */
function buildHeaders() {
  const headers = {
    'Content-Type': 'application/json',
    'X-Voicebox-Client-Id': VOICEBOX_CLIENT_ID,
  };
  if (VOICEBOX_API_KEY) {
    headers['Authorization'] = `Bearer ${VOICEBOX_API_KEY}`;
  }
  return headers;
}

/**
 * Generate speech via Microsoft Edge-TTS (free, natural voices)
 * Used as fallback when Voicebox is unavailable
 */
async function edgeTTSSpeak(text, profile = 'Maria') {
  const voice = EDGE_TTS_VOICES[profile] || EDGE_TTS_VOICES['default'];
  const tmpFile = join(__dirname, `tts_${Date.now()}.mp3`);
  const pyScript = join(__dirname, 'tts_generate.py');
  const pythonPath = process.env.PYTHON_PATH || 'C:\\Users\\G15\\.local\\bin\\python3.11.exe';

  try {
    await execFileAsync(pythonPath, [pyScript, text, voice, tmpFile], { timeout: 30000 });

    if (existsSync(tmpFile)) {
      const audioData = readFileSync(tmpFile);
      const audioBase64 = audioData.toString('base64');
      unlinkSync(tmpFile); // cleanup

      // Return as data URL so frontend can play it directly
      return {
        audio_url: `data:audio/mpeg;base64,${audioBase64}`,
        status: 'completed',
        source: 'edge-tts',
        voice,
      };
    }
  } catch (e) {
    console.error('[Edge-TTS] error:', e.message);
    if (existsSync(tmpFile)) unlinkSync(tmpFile);
  }
  return null;
}

/**
 * List available voice profiles from Voicebox
 */
export async function listProfiles() {
  try {
    const res = await fetch(`${VOICEBOX_URL}/api/profiles`, {
      headers: buildHeaders(),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`Voicebox ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error('[Voicebox] listProfiles error:', e.message);
    return { profiles: [] };
  }
}

/**
 * Generate speech via Voicebox REST API, falls back to Edge-TTS
 * @param {string} text - Text to speak
 * @param {object} options - { profile, engine, language, personality }
 * @returns {Promise<{ generation_id, audio_url, status, cached }>}
 */
export async function speak(text, options = {}) {
  const {
    profile = DEFAULT_PROFILE,
    engine = DEFAULT_ENGINE,
    language = DEFAULT_LANGUAGE,
    personality = false,
    useCache = true,
  } = options;

  // Check cache first
  if (useCache) {
    const cacheKey = getCacheKey(text, profile, engine, language);
    const cached = getCached(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }
  }

  try {
    const res = await fetch(`${VOICEBOX_URL}/speak`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ text, profile, engine, language, personality }),
      signal: AbortSignal.timeout(60000), // 60s timeout for generation
    });

    if (!res.ok) {
      const err = await res.text().catch(() => '');
      throw new Error(`Voicebox speak ${res.status}: ${err}`);
    }

    const data = await res.json();

    // Poll for completion if async
    if (data.generation_id && (data.status === 'generating' || data.status === 'pending')) {
      const result = await pollGeneration(data.generation_id);
      if (useCache) {
        setCache(getCacheKey(text, profile, engine, language), result);
      }
      return { ...result, cached: false };
    }

    // Synchronous result
    const result = {
      generation_id: data.generation_id || null,
      audio_url: data.audio_url || (data.generation_id ? `${VOICEBOX_URL}/audio/${data.generation_id}` : null),
      status: data.status || 'completed',
    };

    if (useCache && result.audio_url) {
      setCache(getCacheKey(text, profile, engine, language), result);
    }

    return { ...result, cached: false };
  } catch (e) {
    console.warn('[Voicebox] speak failed, falling back to Edge-TTS:', e.message);
    // Fallback to Edge-TTS (free, natural Microsoft voices)
    const edgeResult = await edgeTTSSpeak(text, profile);
    if (edgeResult) {
      if (useCache) {
        setCache(getCacheKey(text, profile, engine, language), edgeResult);
      }
      return { ...edgeResult, cached: false };
    }
    throw e;
  }
}

/**
 * Poll a generation until complete
 */
async function pollGeneration(generationId, maxAttempts = 40) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`${VOICEBOX_URL}/generate/${generationId}/status`, {
        headers: buildHeaders(),
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error(`Poll ${res.status}`);
      const data = await res.json();
      if (data.status === 'completed' || data.status === 'done') {
        return {
          generation_id: generationId,
          audio_url: data.audio_url || `${VOICEBOX_URL}/audio/${generationId}`,
          status: 'completed',
        };
      }
      if (data.status === 'failed' || data.status === 'error') {
        throw new Error(data.error || 'Generation failed');
      }
    } catch (e) {
      if (i === maxAttempts - 1) throw e;
    }
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error('Generation timeout');
}

/**
 * Generate speech and return as base64 (for direct embedding)
 */
export async function speakToBase64(text, options = {}) {
  const result = await speak(text, options);
  if (result.audio_url) {
    try {
      const audioRes = await fetch(result.audio_url, {
        headers: buildHeaders(),
        signal: AbortSignal.timeout(30000),
      });
      if (audioRes.ok) {
        const buffer = await audioRes.arrayBuffer();
        return {
          ...result,
          audio_base64: Buffer.from(buffer).toString('base64'),
          content_type: audioRes.headers.get('content-type') || 'audio/wav',
        };
      }
    } catch {}
  }
  return result;
}

/**
 * Check if Voicebox is available (or Edge-TTS fallback)
 */
export async function healthCheck() {
  try {
    const res = await fetch(`${VOICEBOX_URL}/api/health`, {
      headers: buildHeaders(),
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    // Voicebox unavailable, but Edge-TTS is always available
    return true;
  }
}

/**
 * Get cache stats
 */
export function getCacheStats() {
  return {
    size: speechCache.size,
    maxSize: CACHE_MAX_SIZE,
    ttlMinutes: CACHE_TTL_MS / 60000,
  };
}
