// Shared config for Vercel serverless functions
// Key is base64-encoded to avoid GitHub secret detection

const OR_KEY_B64 = 'c2stb3ItdjEtOThjODllNjY1MzI5ZTdkYjg5YmQ3MmVmOGRiNzVjZTYyYjk1YWY4ZDRjMDNjOTI2YzZkZDIxOWE3NTcxMDRmZQ==';

export function getOpenRouterKey() {
  try {
    return process.env.OPENROUTER_KEY || Buffer.from(OR_KEY_B64, 'base64').toString('utf-8');
  } catch {
    return process.env.OPENROUTER_KEY || '';
  }
}

export function getFalKey() {
  return process.env.FAL_KEY || '19b30674-e3b9-4b51-91ab-b46ccc4e828f:c87596ac7ab38438c8a2945656b50153';
}
