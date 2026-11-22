/**
 * Annadaan — Native SVG & JavaScript Data Visualizations
 * File: js/statistics-charts.js
 *
 * Implements 100% native SVG visualizations:
 * 1. #district-impact-chart: Six-segment interactive SVG donut chart with center total & legend
 * 2. #people-fed-chart: 30-day vertical SVG bar chart with daily counts & summary metrics
 * 3. #correlation-heatmap-chart: 6x6 symmetric correlation SVG matrix with continuous color gradient
 *
 * Strictly code-based. No static images, no broken placeholders.
 */

(function () {
  'use strict';

  // Ensure global tooltip exists
  function getOrCreateTooltip() {
    let tip = document.getElementById('annadaan-chart-tooltip');
    if (!tip) {
      tip = document.createElement('div');
      tip.id = 'annadaan-chart-tooltip';
      tip.className = 'annadaan-chart-tooltip';
      document.body.appendChild(tip);
    }
    return tip;
  }

  function showTooltip(html, x, y) {
    const tip = getOrCreateTooltip();
    tip.innerHTML = html;
    tip.style.display = 'block';

    const padding = 12;
    let left = x + padding;
    let top = y + padding;

    // Prevent off-screen overflow
    const rect = tip.getBoundingClientRect();
    if (left + rect.width > window.innerWidth - 10) {
      left = x - rect.width - padding;
    }
    if (top + rect.height > window.innerHeight - 10) {
      top = y - rect.height - padding;
    }

    tip.style.left = Math.max(10, left) + 'px';
    tip.style.top = Math.max(10, top) + 'px';
  }

  function hideTooltip() {
    const tip = getOrCreateTooltip();
    tip.style.display = 'none';
  }

  // =========================================================================
  // 1. IMPACT BY DISTRICT: NATIVE SVG DONUT CHART
  // =========================================================================
  function renderDistrictImpactDonut(containerId, districts, isDemo) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn('Annadaan: Container not found:', containerId);
      return;
    }

    if (!districts || !districts.length) {
      districts = (window.AnnadaanStatistics && window.AnnadaanStatistics.DEMO_DISTRICTS) || [
        { district: 'Chennai Central', meals: 420, color: '#2D6A4F' },
        { district: 'Tambaram', meals: 350, color: '#10B981' },
        { district: 'Madurai', meals: 290, color: '#52B788' },
        { district: 'Coimbatore', meals: 240, color: '#60A5FA' },
        { district: 'Trichy', meals: 180, color: '#A78BFA' },
        { district: 'Salem', meals: 120, color: '#FBBF24' }
      ];
    }

    const totalMeals = districts.reduce((acc, d) => acc + d.meals, 0);

    // SVG geometry
    const cx = 150;
    const cy = 150;
    const rOuter = 126;
    const rInner = 78;
    const rad = Math.PI / 180;

    let currentAngle = -90; // Start at top
    let slicesSvg = '';

    districts.forEach((d, idx) => {
      const slicePct = totalMeals > 0 ? (d.meals / totalMeals) : (1 / districts.length);
      const angleSweep = slicePct * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angleSweep;
      currentAngle = endAngle;

      // Arc endpoints
      const x1 = cx + rOuter * Math.cos(startAngle * rad);
      const y1 = cy + rOuter * Math.sin(startAngle * rad);
      const x2 = cx + rOuter * Math.cos(endAngle * rad);
      const y2 = cy + rOuter * Math.sin(endAngle * rad);
      const x3 = cx + rInner * Math.cos(endAngle * rad);
      const y3 = cy + rInner * Math.sin(endAngle * rad);
      const x4 = cx + rInner * Math.cos(startAngle * rad);
      const y4 = cy + rInner * Math.sin(startAngle * rad);

      const largeArc = angleSweep > 180 ? 1 : 0;
      const pathD = `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L ${x3.toFixed(2)} ${y3.toFixed(2)} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4.toFixed(2)} ${y4.toFixed(2)} Z`;

      const pctStr = (slicePct * 100).toFixed(1);

      slicesSvg += `
        <path class="donut-slice"
              id="donut-slice-${idx}"
              d="${pathD}"
              fill="${d.color}"
              stroke="#FFFFFF"
              stroke-width="2.5"
              data-district="${d.district}"
              data-meals="${d.meals}"
              data-pct="${pctStr}"
              data-color="${d.color}">
        </path>
      `;
    });

    // Legend HTML
    const legendHtml = districts.map((d, idx) => {
      const pctStr = totalMeals > 0 ? ((d.meals / totalMeals) * 100).toFixed(1) : '0.0';
      return `
        <div class="district-legend-card" id="district-legend-${idx}" data-idx="${idx}">
          <div class="legend-card-left">
            <span class="legend-card-swatch" style="background-color: ${d.color};"></span>
            <div>
              <div class="legend-district-title">${d.district}</div>
              <div class="legend-district-subtitle">${d.meals.toLocaleString()} meals distributed</div>
            </div>
          </div>
          <span class="legend-district-pct">${pctStr}%</span>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="donut-chart-component">
        <div class="chart-disclaimer-badge">
          <i class="fas fa-flask"></i> DEMO DATA · ILLUSTRATIVE VALUES
        </div>
        <div class="donut-chart-flex">
          <div class="donut-svg-wrapper">
            <svg viewBox="0 0 300 300" class="donut-svg" xmlns="http://www.w3.org/2000/svg">
              <g class="donut-slices-group">
                ${slicesSvg}
              </g>
              <!-- Center Total Label -->
              <circle cx="150" cy="150" r="${rInner - 2}" fill="#FFFFFF" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.06))"></circle>
              <text x="150" y="142" text-anchor="middle" font-size="28" font-weight="800" fill="#1E293B" font-family="Inter, sans-serif">
                ${totalMeals.toLocaleString()}
              </text>
              <text x="150" y="165" text-anchor="middle" font-size="11" font-weight="700" fill="#64748B" letter-spacing="0.5" font-family="Inter, sans-serif">
                MEALS DISTRIBUTED
              </text>
            </svg>
          </div>
          <div class="district-legend-container">
            ${legendHtml}
          </div>
        </div>
      </div>
    `;

    // Attach event listeners for slice & legend interactions
    const slices = container.querySelectorAll('.donut-slice');
    const legendCards = container.querySelectorAll('.district-legend-card');

    slices.forEach((slice, idx) => {
      slice.addEventListener('mouseenter', (e) => {
        const district = slice.getAttribute('data-district');
        const meals = slice.getAttribute('data-meals');
        const pct = slice.getAttribute('data-pct');
        const color = slice.getAttribute('data-color');

        slice.style.transform = 'scale(1.025)';
        slice.style.transformOrigin = '150px 150px';
        slice.style.filter = 'drop-shadow(0 4px 10px rgba(0,0,0,0.25))';
        slice.style.stroke = '#1E293B';
        slice.style.strokeWidth = '3px';

        if (legendCards[idx]) {
          legendCards[idx].classList.add('highlighted');
        }

        showTooltip(`
          <div style="font-weight: 700; color: #F8FAFC; margin-bottom: 2px;">
            <span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${color};margin-right:6px;"></span>${district}
          </div>
          <div style="font-size: 13px; color: #34D399; font-weight: 800;">
            ${parseInt(meals).toLocaleString()} Meals (${pct}%)
          </div>
          <div style="font-size: 11px; color: #94A3B8; margin-top: 2px;">
            Tamil Nadu Distribution Cluster
          </div>
        `, e.pageX, e.pageY);
      });

      slice.addEventListener('mousemove', (e) => {
        const tip = getOrCreateTooltip();
        tip.style.left = (e.pageX + 14) + 'px';
        tip.style.top = (e.pageY + 14) + 'px';
      });

      slice.addEventListener('mouseleave', () => {
        slice.style.transform = '';
        slice.style.filter = '';
        slice.style.stroke = '#FFFFFF';
        slice.style.strokeWidth = '2.5px';
        if (legendCards[idx]) {
          legendCards[idx].classList.remove('highlighted');
        }
        hideTooltip();
      });
    });

    legendCards.forEach((card, idx) => {
      card.addEventListener('mouseenter', () => {
        const slice = slices[idx];
        if (slice) {
          slice.style.transform = 'scale(1.025)';
          slice.style.transformOrigin = '150px 150px';
          slice.style.filter = 'drop-shadow(0 4px 10px rgba(0,0,0,0.25))';
          slice.style.stroke = '#1E293B';
          slice.style.strokeWidth = '3px';
        }
      });
      card.addEventListener('mouseleave', () => {
        const slice = slices[idx];
        if (slice) {
          slice.style.transform = '';
          slice.style.filter = '';
          slice.style.stroke = '#FFFFFF';
          slice.style.strokeWidth = '2.5px';
        }
      });
    });
  }

  // =========================================================================
  // 2. PEOPLE FED OVERVIEW: NATIVE SVG 30-DAY VERTICAL BAR CHART
  // =========================================================================
  function renderPeopleFedBarChart(containerId, thirtyDays, isDemo) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn('Annadaan: Container not found:', containerId);
      return;
    }

    if (!thirtyDays || thirtyDays.length === 0) {
      thirtyDays = (window.AnnadaanStatistics && window.AnnadaanStatistics.generate30DayTrend)
        ? window.AnnadaanStatistics.generate30DayTrend()
        : [];
    }

    // Dynamic metrics calculation
    const counts = thirtyDays.map(d => d.count);
    const totalPeople = counts.reduce((a, b) => a + b, 0);
    const dailyAvg = Math.round(totalPeople / counts.length);

    let peakDay = thirtyDays[0];
    thirtyDays.forEach(d => {
      if (d.count > (peakDay ? peakDay.count : 0)) {
        peakDay = d;
      }
    });

    // Chart Dimensions
    const svgWidth = 840;
    const svgHeight = 310;
    const leftMargin = 55;
    const rightMargin = 20;
    const topMargin = 30;
    const bottomMargin = 45;

    const plotWidth = svgWidth - leftMargin - rightMargin;
    const plotHeight = svgHeight - topMargin - bottomMargin;

    // Y Scale (0 to 250)
    const maxVal = Math.max(250, Math.ceil(peakDay.count / 50) * 50);
    const ySteps = 5;
    let gridLinesSvg = '';

    for (let i = 0; i <= ySteps; i++) {
      const stepVal = (maxVal / ySteps) * i;
      const y = topMargin + plotHeight - (stepVal / maxVal) * plotHeight;

      gridLinesSvg += `
        <line x1="${leftMargin}" y1="${y}" x2="${svgWidth - rightMargin}" y2="${y}" stroke="#E2E8F0" stroke-width="1" stroke-dasharray="${i === 0 ? '0' : '4,3'}"/>
        <text x="${leftMargin - 10}" y="${y + 4}" text-anchor="end" font-size="11" fill="#64748B" font-family="Inter, sans-serif">
          ${Math.round(stepVal)}
        </text>
      `;
    }

    // Bars SVG
    const barSlotWidth = plotWidth / thirtyDays.length;
    const barWidth = Math.max(12, Math.floor(barSlotWidth * 0.72));
    let barsSvg = '';
    let xAxisLabelsSvg = '';

    thirtyDays.forEach((d, idx) => {
      const barH = (d.count / maxVal) * plotHeight;
      const x = leftMargin + idx * barSlotWidth + (barSlotWidth - barWidth) / 2;
      const y = topMargin + plotHeight - barH;

      const isPeak = d.isPeak || d.count === peakDay.count;
      const fillColor = isPeak ? '#1B4332' : '#10B981';
      const strokeColor = isPeak ? '#F59E0B' : '#059669';
      const strokeW = isPeak ? 2.5 : 1;

      barsSvg += `
        <g class="bar-group" 
           data-date="${d.fullDateStr || d.label}" 
           data-count="${d.count}" 
           data-peak="${isPeak ? 'true' : 'false'}"
           data-diff="${Math.round(((d.count - dailyAvg) / dailyAvg) * 100)}">
          <rect class="fed-bar"
                x="${x.toFixed(1)}"
                y="${y.toFixed(1)}"
                width="${barWidth}"
                height="${barH.toFixed(1)}"
                rx="4"
                ry="4"
                fill="${fillColor}"
                stroke="${strokeColor}"
                stroke-width="${strokeW}">
          </rect>
          ${isPeak ? `
            <circle cx="${(x + barWidth / 2).toFixed(1)}" cy="${(y - 8).toFixed(1)}" r="4.5" fill="#F59E0B"/>
            <text x="${(x + barWidth / 2).toFixed(1)}" y="${(y - 15).toFixed(1)}" text-anchor="middle" font-size="10" font-weight="800" fill="#B45309">PEAK</text>
          ` : ''}
        </g>
      `;

      // Show X axis labels (skip alternate on narrow views, or display every 3rd day)
      if (idx % 3 === 0 || idx === thirtyDays.length - 1) {
        xAxisLabelsSvg += `
          <text x="${(x + barWidth / 2).toFixed(1)}" y="${svgHeight - bottomMargin + 18}" text-anchor="middle" font-size="11" font-weight="500" fill="#64748B" font-family="Inter, sans-serif">
            ${d.label}
          </text>
        `;
      }
    });

    container.innerHTML = `
      <div class="people-fed-component">
        <div class="chart-disclaimer-badge">
          <i class="fas fa-flask"></i> DEMO DATA · ILLUSTRATIVE VALUES
        </div>
        
        <!-- Summary Metrics Strip -->
        <div class="people-fed-metrics-strip">
          <div class="fed-metric-card">
            <span class="fed-metric-label">30-Day Total Served</span>
            <span class="fed-metric-value">${totalPeople.toLocaleString()}</span>
            <span class="fed-metric-desc">Nutritious meals provided</span>
          </div>
          <div class="fed-metric-card">
            <span class="fed-metric-label">Daily Average</span>
            <span class="fed-metric-value">${dailyAvg.toLocaleString()}</span>
            <span class="fed-metric-desc">People nourished per day</span>
          </div>
          <div class="fed-metric-card highlight">
            <span class="fed-metric-label"><i class="fas fa-trophy" style="color: #F59E0B;"></i> Peak Single Day</span>
            <span class="fed-metric-value">${peakDay.count.toLocaleString()}</span>
            <span class="fed-metric-desc">${peakDay.label} (Highest in 30 days)</span>
          </div>
        </div>

        <div class="bar-svg-wrapper">
          <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="bar-svg" xmlns="http://www.w3.org/2000/svg">
            <!-- Y-Axis Title -->
            <text x="16" y="${topMargin + plotHeight / 2}" transform="rotate(-90 16,${topMargin + plotHeight / 2})" text-anchor="middle" font-size="11" font-weight="700" fill="#475569" font-family="Inter, sans-serif">
              PEOPLE SERVED
            </text>
            <!-- Grid Lines -->
            ${gridLinesSvg}
            <!-- Bars -->
            ${barsSvg}
            <!-- X-Axis Labels -->
            ${xAxisLabelsSvg}
          </svg>
        </div>
      </div>
    `;

    // Tooltip listeners for bars
    const barGroups = container.querySelectorAll('.bar-group');
    barGroups.forEach(group => {
      group.addEventListener('mouseenter', (e) => {
        const date = group.getAttribute('data-date');
        const count = group.getAttribute('data-count');
        const isPeak = group.getAttribute('data-peak') === 'true';
        const diff = parseInt(group.getAttribute('data-diff') || '0');

        const rect = group.querySelector('.fed-bar');
        if (rect) {
          rect.style.opacity = '0.82';
          rect.style.stroke = '#1E293B';
          rect.style.strokeWidth = '2px';
        }

        const diffText = diff >= 0 ? `+${diff}% above 30-day average` : `${diff}% below 30-day average`;

        showTooltip(`
          <div style="font-weight: 700; color: #F8FAFC; margin-bottom: 2px;">
            ${date}
          </div>
          <div style="font-size: 14px; color: ${isPeak ? '#FBBF24' : '#34D399'}; font-weight: 800;">
            ${parseInt(count).toLocaleString()} People Fed
          </div>
          <div style="font-size: 11px; color: #94A3B8; margin-top: 3px;">
            ${isPeak ? '★ Highest distribution day' : diffText}
          </div>
        `, e.pageX, e.pageY);
      });

      group.addEventListener('mousemove', (e) => {
        const tip = getOrCreateTooltip();
        tip.style.left = (e.pageX + 14) + 'px';
        tip.style.top = (e.pageY + 14) + 'px';
      });

      group.addEventListener('mouseleave', () => {
        const rect = group.querySelector('.fed-bar');
        if (rect) {
          rect.style.opacity = '1.0';
          const isPeak = group.getAttribute('data-peak') === 'true';
          rect.style.stroke = isPeak ? '#F59E0B' : '#059669';
          rect.style.strokeWidth = isPeak ? '2.5px' : '1px';
        }
        hideTooltip();
      });
    });
  }

  // =========================================================================
  // 3. CORRELATION HEATMAP: NATIVE SVG SYMMETRIC MATRIX
  // =========================================================================
  function renderCorrelationHeatmapChart(containerId, factors, matrix, isDemo) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn('Annadaan: Container not found:', containerId);
      return;
    }

    if (!factors || !factors.length) {
      factors = [
        'Food Demand',
        'Population Density',
        'Food Donations',
        'Delivery Coverage',
        'NGO Capacity',
        'Food Availability'
      ];
    }

    if (!matrix || !matrix.length) {
      matrix = [
        [ 1.00,  0.84, -0.32,  0.42,  0.51, -0.68 ],
        [ 0.84,  1.00, -0.28,  0.35,  0.46, -0.58 ],
        [-0.32, -0.28,  1.00,  0.64,  0.58,  0.88 ],
        [ 0.42,  0.35,  0.64,  1.00,  0.76,  0.52 ],
        [ 0.51,  0.46,  0.58,  0.76,  1.00,  0.45 ],
        [-0.68, -0.58,  0.88,  0.52,  0.45,  1.00 ]
      ];
    }

    const n = factors.length;
    const svgWidth = 680;
    const svgHeight = 490;
    const leftMargin = 160;
    const topMargin = 105;
    const gridWidth = svgWidth - leftMargin - 15;
    const cellSize = Math.floor(gridWidth / n);
    const gap = 5;
    const cellActualSize = cellSize - gap;

    // Build SVG
    let colHeadersSvg = '';
    for (let j = 0; j < n; j++) {
      const x = leftMargin + j * cellSize + cellActualSize / 2;
      const y = topMargin - 10;
      colHeadersSvg += `
        <g transform="translate(${x}, ${y}) rotate(-35)">
          <text x="0" y="0" text-anchor="start" font-size="11.5" font-weight="600" fill="#475569" font-family="Inter, sans-serif">
            ${factors[j]}
          </text>
        </g>
      `;
    }

    let rowsSvg = '';
    for (let i = 0; i < n; i++) {
      const rowY = topMargin + i * cellSize;

      // Row Label
      rowsSvg += `
        <text x="${leftMargin - 12}" y="${rowY + cellActualSize / 2 + 4}" text-anchor="end" font-size="12" font-weight="600" fill="#334155" font-family="Inter, sans-serif">
          ${factors[i]}
        </text>
      `;

      // Cells
      for (let j = 0; j < n; j++) {
        const colX = leftMargin + j * cellSize;
        const r = matrix[i][j];
        const fillColor = getHeatmapColor(r);
        const textColor = Math.abs(r) >= 0.45 ? '#FFFFFF' : '#1E293B';
        const displayVal = r === 1.0 ? '1.00' : (r > 0 ? `+${r.toFixed(2)}` : r.toFixed(2));
        const interpretation = getCorrelationInterpretation(r);

        rowsSvg += `
          <g class="heatmap-cell-group" 
             data-factor-a="${factors[i]}" 
             data-factor-b="${factors[j]}" 
             data-val="${displayVal}" 
             data-interp="${interpretation}">
            <rect class="heatmap-cell" 
                  x="${colX}" 
                  y="${rowY}" 
                  width="${cellActualSize}" 
                  height="${cellActualSize}" 
                  rx="6" 
                  ry="6" 
                  fill="${fillColor}" 
                  stroke="#FFFFFF" 
                  stroke-width="1.5" />
            <text x="${colX + cellActualSize / 2}" 
                  y="${rowY + cellActualSize / 2 + 4}" 
                  text-anchor="middle" 
                  font-size="12" 
                  font-weight="700" 
                  fill="${textColor}" 
                  pointer-events="none" 
                  font-family="Inter, monospace">
              ${displayVal}
            </text>
          </g>
        `;
      }
    }

    container.innerHTML = `
      <div class="heatmap-component">
        <div class="chart-disclaimer-badge">
          <i class="fas fa-flask"></i> DEMO DATA · ILLUSTRATIVE VALUES
        </div>
        <div class="heatmap-svg-scroll">
          <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="heatmap-svg" xmlns="http://www.w3.org/2000/svg">
            ${colHeadersSvg}
            ${rowsSvg}
          </svg>
        </div>
        
        <!-- Heatmap Legend -->
        <div class="heatmap-legend-strip">
          <div class="heatmap-legend-scale">
            <span style="color: #DC2626;"><i class="fas fa-minus-circle"></i> Negative (-1.0)</span>
            <span style="color: #64748B;">Neutral (0.0)</span>
            <span style="color: #059669;"><i class="fas fa-plus-circle"></i> Positive (+1.0)</span>
          </div>
          <div class="heatmap-gradient-bar"></div>
          <div class="heatmap-caption">
            <i class="fas fa-info-circle"></i>
            <span>Symmetric illustrative correlation matrix among 6 community hunger and distribution factors. Synthetic demonstration values.</span>
          </div>
        </div>
      </div>
    `;

    // Tooltip listeners for heatmap cells
    const cellGroups = container.querySelectorAll('.heatmap-cell-group');
    cellGroups.forEach(cell => {
      cell.addEventListener('mouseenter', (e) => {
        const factorA = cell.getAttribute('data-factor-a');
        const factorB = cell.getAttribute('data-factor-b');
        const val = cell.getAttribute('data-val');
        const interp = cell.getAttribute('data-interp');

        const rect = cell.querySelector('.heatmap-cell');
        if (rect) {
          rect.style.stroke = '#1E293B';
          rect.style.strokeWidth = '2.5px';
        }

        showTooltip(`
          <div style="font-weight: 700; color: #F1F5F9; margin-bottom: 2px;">
            ${factorA} ↔ ${factorB}
          </div>
          <div style="font-size: 13px; color: #34D399; font-weight: 800; margin-bottom: 2px;">
            Correlation r = ${val}
          </div>
          <div style="font-size: 11px; color: #94A3B8;">
            ${interp}
          </div>
        `, e.pageX, e.pageY);
      });

      cell.addEventListener('mousemove', (e) => {
        const tip = getOrCreateTooltip();
        tip.style.left = (e.pageX + 14) + 'px';
        tip.style.top = (e.pageY + 14) + 'px';
      });

      cell.addEventListener('mouseleave', () => {
        const rect = cell.querySelector('.heatmap-cell');
        if (rect) {
          rect.style.stroke = '#FFFFFF';
          rect.style.strokeWidth = '1.5px';
        }
        hideTooltip();
      });
    });
  }

  // Smooth RGB interpolation: -1.0 (Coral #EF4444) -> 0.0 (Cream #F8FAF9) -> +1.0 (Emerald #059669)
  function getHeatmapColor(r) {
    if (r >= 0) {
      const t = Math.min(1, Math.max(0, r));
      const red = Math.round(248 + t * (5 - 248));
      const green = Math.round(250 + t * (150 - 250));
      const blue = Math.round(249 + t * (105 - 249));
      return `rgb(${red}, ${green}, ${blue})`;
    } else {
      const t = Math.min(1, Math.max(0, Math.abs(r)));
      const red = Math.round(248 + t * (239 - 248));
      const green = Math.round(250 + t * (68 - 250));
      const blue = Math.round(249 + t * (68 - 249));
      return `rgb(${red}, ${green}, ${blue})`;
    }
  }

  function getCorrelationInterpretation(r) {
    if (r === 1.0) return 'Identity (Perfect Autocorrelation)';
    if (r >= 0.70) return 'Strong Positive Correlation (Direct)';
    if (r >= 0.35) return 'Moderate Positive Correlation';
    if (r > 0.0) return 'Weak Positive Correlation';
    if (r <= -0.70) return 'Strong Negative Correlation (Inverse)';
    if (r <= -0.35) return 'Moderate Negative Correlation';
    if (r < 0.0) return 'Weak Negative Correlation';
    return 'Neutral / No Correlation';
  }

  // Main Coordinator
  async function initializeAllStatisticsCharts() {
    let stats = null;
    if (window.AnnadaanStatistics && window.AnnadaanStatistics.resolveStatistics) {
      stats = await window.AnnadaanStatistics.resolveStatistics();
    }

    if (!stats) {
      stats = {
        isDemo: true,
        districts: [
          { district: 'Chennai Central', meals: 420, color: '#2D6A4F' },
          { district: 'Tambaram', meals: 350, color: '#10B981' },
          { district: 'Madurai', meals: 290, color: '#52B788' },
          { district: 'Coimbatore', meals: 240, color: '#60A5FA' },
          { district: 'Trichy', meals: 180, color: '#A78BFA' },
          { district: 'Salem', meals: 120, color: '#FBBF24' }
        ],
        thirtyDays: (window.AnnadaanStatistics && window.AnnadaanStatistics.generate30DayTrend)
          ? window.AnnadaanStatistics.generate30DayTrend() : [],
        heatmapFactors: (window.AnnadaanStatistics && window.AnnadaanStatistics.HEATMAP_FACTORS) || [],
        heatmapMatrix: (window.AnnadaanStatistics && window.AnnadaanStatistics.HEATMAP_MATRIX) || []
      };
    }

    // 1. Render Impact by District Donut
    renderDistrictImpactDonut('district-impact-chart', stats.districts, stats.isDemo);

    // 2. Render People Fed Bar Chart
    renderPeopleFedBarChart('people-fed-chart', stats.thirtyDays, stats.isDemo);

    // 3. Render Correlation Heatmap
    renderCorrelationHeatmapChart('correlation-heatmap-chart', stats.heatmapFactors, stats.heatmapMatrix, stats.isDemo);
  }

  // Export functions to global scope
  window.AnnadaanCharts = {
    renderDistrictImpactDonut,
    renderPeopleFedBarChart,
    renderCorrelationHeatmapChart,
    initializeAllStatisticsCharts
  };

  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAllStatisticsCharts);
  } else {
    initializeAllStatisticsCharts();
  }

})();

