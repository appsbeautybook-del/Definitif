import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnvFile() {
  const envPaths = [
    join(__dirname, '../../.env'),
    join(__dirname, '../../../.env'),
    join(__dirname, '../../../../.env'),
  ];
  for (const p of envPaths) {
    if (existsSync(p)) {
      const content = readFileSync(p, 'utf-8');
      const vars = {};
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const idx = trimmed.indexOf('=');
        if (idx > 0) {
          vars[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
        }
      }
      return vars;
    }
  }
  return {};
}

let _envCache = null;
function getEnv() {
  if (!_envCache) _envCache = loadEnvFile();
  return _envCache;
}

export function getOpenRouterKey() {
  return process.env.OPENROUTER_KEY || getEnv().OPENROUTER_KEY || getEnv().VITE_OPENROUTER_KEY || '';
}

export function getFalKey() {
  return process.env.FAL_KEY || getEnv().FAL_KEY || '';
}
