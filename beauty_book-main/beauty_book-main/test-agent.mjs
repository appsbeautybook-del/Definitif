import { chromium, devices } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5173';
const SCREENSHOTS_DIR = path.join(process.cwd(), 'test-screenshots');
const RESULTS = [];

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

function log(msg) {
  const line = `[AGENT] ${new Date().toLocaleTimeString()} ${msg}`;
  console.log(line);
}

function record(page, name, status, details = '') {
  RESULTS.push({ page, name, status, details, time: new Date().toLocaleTimeString() });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  log(`${icon} [${page}] ${name} — ${status} ${details}`);
}

async function screenshot(page, name) {
  const fileName = `${name.replace(/[^a-z0-9]/gi, '_')}.png`;
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, fileName), fullPage: false });
  log(`📸 Screenshot: ${fileName}`);
  return fileName;
}

async function safeRun(page, testName, fn) {
  try {
    await fn();
    record(page.url(), testName, 'PASS');
    return true;
  } catch (e) {
    record(page.url(), testName, 'FAIL', e.message.slice(0, 120));
    return false;
  }
}

(async () => {
  log('🚀 Démarrage de l\'agent de test AI...');

  const iPhone = devices['iPhone 14 Pro'];
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Users\\G15\\AppData\\Local\\ms-playwright\\chromium-1208\\chrome-win64\\chrome.exe',
  });
  const context = await browser.newContext({
    ...iPhone,
    locale: 'fr-FR',
    timezoneId: 'Europe/Paris',
    permissions: ['geolocation'],
    geolocation: { latitude: 48.8566, longitude: 2.3522 },
  });
  const page = await context.newPage();

  // Bypass onboarding gate
  await page.addInitScript(() => {
    localStorage.setItem('bb_onboarded', 'true');
  });

  // Collect console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  // ========== 1. PAGE D'ACCUEIL ==========
  log('📍 Test: Page d\'accueil');
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  // Ensure onboarding is bypassed
  await page.evaluate(() => {
    localStorage.setItem('bb_onboarded', 'true');
  });
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  await screenshot(page, '01_homepage');

  await safeRun(page, 'Hero banner visible', async () => {
    await page.locator('text=Offre exclusive').first().waitFor({ timeout: 8000 });
  });

  await safeRun(page, 'Bottom nav visible', async () => {
    await page.locator('nav').first().waitFor({ timeout: 5000 });
  });

  await safeRun(page, 'Categories section', async () => {
    await page.locator('text=Categories').first().waitFor({ timeout: 8000 });
  });

  // Scroll down on home
  await page.evaluate(() => {
    const el = document.querySelector('#app-content') || document.querySelector('[class*="overflow"]');
    if (el) el.scrollTop = 600;
  });
  await page.waitForTimeout(1000);
  await screenshot(page, '02_home_scrolled');

  // ========== 2. NAVIGATION BOTTOM NAV ==========
  log('📍 Test: Navigation Bottom Nav');

  // Click Services tab
  await safeRun(page, 'BottomNav > Services tab', async () => {
    const navButtons = page.locator('nav button');
    await navButtons.first().waitFor({ timeout: 5000 });
    await navButtons.nth(1).click();
    await page.waitForTimeout(2000);
    await screenshot(page, '03_services_tab');
  });

  // Click Maria (AI) tab
  await safeRun(page, 'BottomNav > Maria (AI) tab', async () => {
    await page.locator('nav button').nth(2).click();
    await page.waitForTimeout(2000);
    await screenshot(page, '04_maria_tab');
  });

  // Click RDV tab
  await safeRun(page, 'BottomNav > RDV tab', async () => {
    await page.locator('nav button').nth(3).click();
    await page.waitForTimeout(2000);
    await screenshot(page, '05_rdv_tab');
  });

  // Click Profil tab
  await safeRun(page, 'BottomNav > Profil tab', async () => {
    await page.locator('nav button').nth(4).click();
    await page.waitForTimeout(2000);
    await screenshot(page, '06_profil_tab');
  });

  // Back to home
  await page.locator('nav button').nth(0).click();
  await page.waitForTimeout(1500);

  // ========== 3. PAGE SERVICES ==========
  log('📍 Test: Page Services');
  await page.goto(`${BASE_URL}/services`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await screenshot(page, '07_services_page');

  await safeRun(page, 'Search bar present', async () => {
    await page.locator('input[placeholder*="echerch"]').first().waitFor({ timeout: 5000 });
  });

  await safeRun(page, 'Category filters present', async () => {
    const cats = await page.locator('[class*="overflow-x-auto"]').first().isVisible();
    if (!cats) throw new Error('Category scroll not visible');
  });

  // ========== 4. PAGE SERVICES SALONS ==========
  log('📍 Test: Page Services Salons');
  await page.goto(`${BASE_URL}/services-salons`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await screenshot(page, '08_services_salons');

  // ========== 5. PAGE MESSAGES ==========
  log('📍 Test: Page Messages');
  await page.goto(`${BASE_URL}/messages`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await screenshot(page, '09_messages');

  // ========== 6. PAGE NOTIFICATIONS ==========
  log('📍 Test: Page Notifications');
  await page.goto(`${BASE_URL}/notifications`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await screenshot(page, '10_notifications');

  // ========== 7. PAGE PANIER ==========
  log('📍 Test: Page Panier');
  await page.goto(`${BASE_URL}/panier`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await screenshot(page, '11_panier');

  // ========== 8. PAGE PARAMETRES ==========
  log('📍 Test: Page Parametres');
  await page.goto(`${BASE_URL}/parametres`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await screenshot(page, '12_parametres');

  // ========== 9. PAGE REELS ==========
  log('📍 Test: Page Reels');
  await page.goto(`${BASE_URL}/reels`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await screenshot(page, '13_reels');

  // ========== 10. PAGE LIVE ==========
  log('📍 Test: Page Live');
  await page.goto(`${BASE_URL}/live`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await screenshot(page, '14_live');

  // ========== 11. PAGE EXPLORER (MAP) ==========
  log('📍 Test: Page Explorer');
  await page.goto(`${BASE_URL}/explorer`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);
  await screenshot(page, '15_explorer');

  // ========== 12. PAGE BOUTIQUE ==========
  log('📍 Test: Page Boutique');
  await page.goto(`${BASE_URL}/boutique`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await screenshot(page, '16_boutique');

  // ========== 13. CONNEXION ==========
  log('📍 Test: Page Connexion');
  await page.goto(`${BASE_URL}/connexion`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await screenshot(page, '17_connexion');

  await safeRun(page, 'Login form visible', async () => {
    await page.locator('input[type="email"], input[placeholder*="mail"]').first().waitFor({ timeout: 5000 });
  });

  await safeRun(page, 'Google OAuth button', async () => {
    await page.locator('text=Google').first().waitFor({ timeout: 3000 });
  });

  // ========== 14. ONBOARDING ==========
  log('📍 Test: Page Onboarding');
  await page.goto(`${BASE_URL}/onboarding`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await screenshot(page, '18_onboarding');

  // ========== 15. ADMIN LOGIN ==========
  log('📍 Test: Admin Login');
  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await screenshot(page, '19_admin_login');

  // ========== 16. VENDEUR LOGIN ==========
  log('📍 Test: Vendeur Login');
  await page.goto(`${BASE_URL}/vendeur/login`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await screenshot(page, '20_vendeur_login');

  // ========== 17. PROFIL PRO ==========
  log('📍 Test: Profil Pro');
  await page.goto(`${BASE_URL}/profil-pro`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await screenshot(page, '21_profil_pro');

  // ========== 18. ANALYTICS ==========
  log('📍 Test: Analytics');
  await page.goto(`${BASE_URL}/pro/analytics`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await screenshot(page, '22_analytics');

  // ========== 19. CATALOGUE SERVICES ==========
  log('📍 Test: Catalogue Services');
  await page.goto(`${BASE_URL}/pro/catalogue-services`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await screenshot(page, '23_catalogue_services');

  // ========== 20. GESTION AGENDA ==========
  log('📍 Test: Gestion Agenda');
  await page.goto(`${BASE_URL}/pro/gestion-agenda`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await screenshot(page, '24_gestion_agenda');

  // ========== 21. TEST SCROLL & INTERACTION ==========
  log('📍 Test: Scroll & Interactions');
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);

  // Test pull-to-refresh gesture
  await safeRun(page, 'Pull-to-refresh gesture', async () => {
    const box = await page.locator('#app-content, [class*="overflow"]').first().boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + 50);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2, box.y + 150, { steps: 10 });
      await page.mouse.up();
      await page.waitForTimeout(500);
    }
  });

  // Test touch scroll
  await safeRun(page, 'Touch scroll works', async () => {
    await page.evaluate(() => {
      const el = document.querySelector('#app-content') || document.querySelector('[class*="overflow"]');
      if (el) el.scrollTop = 1200;
    });
    await page.waitForTimeout(500);
    const scrolled = await page.evaluate(() => {
      const el = document.querySelector('#app-content') || document.querySelector('[class*="overflow"]');
      return el ? el.scrollTop : 0;
    });
    if (scrolled < 100) throw new Error('Scroll did not work');
  });

  // ========== CONSOLE ERRORS ==========
  if (consoleErrors.length > 0) {
    log(`⚠️ ${consoleErrors.length} erreurs console détectées:`);
    consoleErrors.slice(0, 10).forEach((e, i) => log(`  ${i + 1}. ${e.slice(0, 150)}`));
  } else {
    log('✅ Aucune erreur console');
  }

  // ========== RAPPORT FINAL ==========
  const passed = RESULTS.filter(r => r.status === 'PASS').length;
  const failed = RESULTS.filter(r => r.status === 'FAIL').length;
  const warned = RESULTS.filter(r => r.status === 'WARN').length;

  log('');
  log('═══════════════════════════════════════════════');
  log(`📊 RAPPORT FINAL: ${passed} PASS / ${failed} FAIL / ${warned} WARN`);
  log('═══════════════════════════════════════════════');

  RESULTS.forEach(r => {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`  ${icon} ${r.name} — ${r.details || 'OK'}`);
  });

  log('');
  log(`📸 Screenshots sauvegardés dans: ${SCREENSHOTS_DIR}`);

  // Write JSON report
  const report = {
    timestamp: new Date().toISOString(),
    summary: { passed, failed, warned, total: RESULTS.length },
    consoleErrors: consoleErrors.slice(0, 20),
    results: RESULTS,
    screenshots: fs.readdirSync(SCREENSHOTS_DIR).filter(f => f.endsWith('.png')),
  };
  fs.writeFileSync(path.join(SCREENSHOTS_DIR, 'report.json'), JSON.stringify(report, null, 2));
  log('📄 Rapport JSON: test-screenshots/report.json');

  await browser.close();
  log('🏁 Test terminé!');
})();
