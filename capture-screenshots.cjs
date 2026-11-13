const path = require('path');
const fs = require('fs');

// We installed puppeteer-core in unit-5/client/node_modules
const puppeteer = require(path.join(__dirname, 'unit-5', 'client', 'node_modules', 'puppeteer-core'));

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function capture() {
  console.log('🚀 Launching Chrome for automated screenshot capture...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1280, height: 850, deviceScaleFactor: 1.5 }
  });

  const page = await browser.newPage();

  const unit5Dir = path.join(__dirname, 'unit-5', 'screenshots');
  const finalDir = path.join(__dirname, 'final-project', 'screenshots');

  if (!fs.existsSync(unit5Dir)) fs.mkdirSync(unit5Dir, { recursive: true });
  if (!fs.existsSync(finalDir)) fs.mkdirSync(finalDir, { recursive: true });

  // 1. Capture Login Screen (With Demo Account Selector)
  console.log('📸 1. Capturing 01-login-screen.png...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.waitForTimeout ? page.waitForTimeout(1000) : new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(unit5Dir, '01-login-screen.png') });
  await page.screenshot({ path: path.join(finalDir, '01-production-login.png') });

  // 2. Log in as Rahul Sharma
  console.log('🔑 Logging into Rahul Sharma demo account...');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 1500));

  // 3. Capture Dashboard
  console.log('📸 2. Capturing 02-dashboard-personal-budgets.png...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(unit5Dir, '02-dashboard-personal-budgets.png') });
  await page.screenshot({ path: path.join(finalDir, '02-production-dashboard.png') });

  // 4. Capture Expenses Tracker
  console.log('📸 3. Capturing 03-expenses-tracker-crud.png...');
  await page.goto('http://localhost:5173/expenses', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(unit5Dir, '03-expenses-tracker-crud.png') });

  // 5. Capture Groups Overview
  console.log('📸 4. Capturing 04-groups-overview.png...');
  await page.goto('http://localhost:5173/groups', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(unit5Dir, '04-groups-overview.png') });

  // 6. Capture Group Detail & Debt Simplification
  console.log('📸 5. Capturing 05-group-detail-simplified-debts.png...');
  await page.goto('http://localhost:5173/groups/1', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(unit5Dir, '05-group-detail-simplified-debts.png') });
  await page.screenshot({ path: path.join(finalDir, '03-production-group-debts.png') });

  // 7. Capture Settle Up
  console.log('📸 6. Capturing 06-settle-up-balances.png...');
  await page.goto('http://localhost:5173/settle', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(unit5Dir, '06-settle-up-balances.png') });

  // 8. Capture Microservice Analytics Report
  console.log('📸 7. Capturing 07-microservice-analytics-report.png...');
  await page.goto('http://localhost:5173/reports', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(unit5Dir, '07-microservice-analytics-report.png') });
  await page.screenshot({ path: path.join(finalDir, '04-production-microservices-analytics.png') });

  // 9. Capture Dark Theme
  console.log('📸 8. Capturing 10-dark-mode-theme.png...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));
  await page.click('button.theme-btn');
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(unit5Dir, '10-dark-mode-theme.png') });

  // 10. Capture Mobile View
  console.log('📸 9. Capturing 09-mobile-responsive-view.png...');
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(unit5Dir, '09-mobile-responsive-view.png') });
  await page.screenshot({ path: path.join(finalDir, '05-production-mobile-layout.png') });

  await browser.close();
  console.log('✅ ALL SCREENSHOTS SUCCESSFULLY CAPTURED AND UPDATED!');
}

capture().catch(err => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
