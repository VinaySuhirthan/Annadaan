const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test.describe('Volunteer Statistics & Native SVG Data Visualizations', () => {
  const statsPageUrl = 'http://localhost:8000/volunteer/statistics.html';

  test('Page loads and all 3 native SVG visualizations render with zero broken images', async ({ page }) => {
    // Monitor console errors and failed network requests
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    const failedRequests = [];
    page.on('requestfailed', req => {
      failedRequests.push(`${req.method()} ${req.url()}: ${req.failure().errorText}`);
    });

    // Inject session
    await page.addInitScript(() => {
      localStorage.setItem('currentUser', JSON.stringify({
        id: 'VOL_TEST_101',
        name: 'Test Volunteer Partner',
        phone: '9876543210',
        type: 'volunteer'
      }));
    });

    await page.goto(statsPageUrl);
    await page.waitForLoadState('networkidle');

    // 1. Assert required chart containers exist
    const districtContainer = await page.waitForSelector('#district-impact-chart');
    const peopleFedContainer = await page.waitForSelector('#people-fed-chart');
    const heatmapContainer = await page.waitForSelector('#correlation-heatmap-chart');

    expect(districtContainer).not.toBeNull();
    expect(peopleFedContainer).not.toBeNull();
    expect(heatmapContainer).not.toBeNull();

    // 2. Assert NO broken chart images or old image elements exist
    const images = await page.$$eval('img', imgs => imgs.map(i => ({ src: i.src, alt: i.alt })));
    const brokenChartImgs = images.filter(i => 
      i.src.includes('pie.png') || 
      i.src.includes('bar.png') || 
      i.src.includes('heatmap.png') ||
      i.alt.includes('Pie Chart') || 
      i.alt.includes('Bar Chart') || 
      i.alt.includes('Correlation Heatmap')
    );
    expect(brokenChartImgs.length).toBe(0);

    // 3. Verify Chart 1: Impact by District SVG Donut Chart
    const donutSvg = await page.waitForSelector('#district-impact-chart svg.donut-svg');
    expect(donutSvg).not.toBeNull();
    const donutBox = await donutSvg.boundingBox();
    expect(donutBox.width).toBeGreaterThan(50);
    expect(donutBox.height).toBeGreaterThan(50);

    // Verify 6 SVG slices
    const donutSlices = await page.$$('#district-impact-chart .donut-slice');
    expect(donutSlices.length).toBe(6);

    // Verify Center Total text (1,600 meals)
    const donutText = await page.textContent('#district-impact-chart svg text');
    expect(donutText).toContain('1,600');

    // Verify 6 legend items with districts
    const legendItems = await page.$$('#district-impact-chart .district-legend-card');
    expect(legendItems.length).toBe(6);

    const legendText = await page.textContent('#district-impact-chart .district-legend-container');
    expect(legendText).toContain('Chennai Central');
    expect(legendText).toContain('Tambaram');
    expect(legendText).toContain('Madurai');
    expect(legendText).toContain('Coimbatore');
    expect(legendText).toContain('Trichy');
    expect(legendText).toContain('Salem');

    // 4. Verify Chart 2: People Fed Overview SVG Bar Chart
    const barSvg = await page.waitForSelector('#people-fed-chart svg.bar-svg');
    expect(barSvg).not.toBeNull();
    const barBox = await barSvg.boundingBox();
    expect(barBox.width).toBeGreaterThan(100);
    expect(barBox.height).toBeGreaterThan(100);

    // Verify 30 SVG bars
    const bars = await page.$$('#people-fed-chart .fed-bar');
    expect(bars.length).toBe(30);

    // Verify 3 summary metric cards
    const totalFed = await page.textContent('#people-fed-chart .fed-metric-card:nth-child(1) .fed-metric-value');
    const dailyAvg = await page.textContent('#people-fed-chart .fed-metric-card:nth-child(2) .fed-metric-value');
    const peakDay = await page.textContent('#people-fed-chart .fed-metric-card:nth-child(3) .fed-metric-value');

    console.log('Bar Chart Metrics:', { totalFed, dailyAvg, peakDay });
    expect(parseInt(totalFed.replace(/,/g, ''))).toBeGreaterThan(3000);
    expect(parseInt(dailyAvg.replace(/,/g, ''))).toBeGreaterThan(80);
    expect(parseInt(peakDay.replace(/,/g, ''))).toBeGreaterThan(190);

    // 5. Verify Chart 3: Correlation Heatmap SVG Matrix
    const heatmapSvg = await page.waitForSelector('#correlation-heatmap-chart svg.heatmap-svg');
    expect(heatmapSvg).not.toBeNull();
    const heatmapBox = await heatmapSvg.boundingBox();
    expect(heatmapBox.width).toBeGreaterThan(100);
    expect(heatmapBox.height).toBeGreaterThan(100);

    // Verify 36 cells (6x6 matrix)
    const cells = await page.$$('#correlation-heatmap-chart .heatmap-cell');
    expect(cells.length).toBe(36);

    // Verify 6 diagonal values are 1.00
    const cellTexts = await page.$$eval('#correlation-heatmap-chart .heatmap-cell-group text', els => els.map(e => e.textContent.trim()));
    const diagonalOnes = cellTexts.filter(t => t === '1.00');
    expect(diagonalOnes.length).toBe(6);

    // Verify DEMO DATA label is visible
    const disclaimerBadges = await page.$$eval('.chart-disclaimer-badge', els => els.map(e => e.textContent.trim()));
    expect(disclaimerBadges.length).toBe(3);
    disclaimerBadges.forEach(b => expect(b).toContain('DEMO DATA · ILLUSTRATIVE VALUES'));

    // Verify no JS errors or failed script loads
    expect(failedRequests).toEqual([]);
    expect(consoleErrors).toEqual([]);

    // 6. Capture full page screenshot
    const screenshotDir = path.resolve(__dirname, '../../test-results');
    if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });
    const screenshotPath = path.join(screenshotDir, 'volunteer-statistics-verified.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('Verified screenshot saved to:', screenshotPath);
  });

  test('Mobile responsive layout test (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.addInitScript(() => {
      localStorage.setItem('currentUser', JSON.stringify({
        id: 'VOL_TEST_101',
        name: 'Mobile Volunteer',
        phone: '9876543210',
        type: 'volunteer'
      }));
    });

    await page.goto(statsPageUrl);
    await page.waitForLoadState('networkidle');

    // Verify no horizontal overflow
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    console.log('Mobile horizontal overflow check (scrollWidth > clientWidth):', hasOverflow);
    expect(hasOverflow).toBe(false);

    // Capture mobile screenshot
    const mobileScreenshotPath = path.resolve(__dirname, '../../test-results/volunteer-statistics-mobile.png');
    await page.screenshot({ path: mobileScreenshotPath, fullPage: true });
    console.log('Mobile screenshot saved to:', mobileScreenshotPath);
  });
});
