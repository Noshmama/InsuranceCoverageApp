// =============================================================================
// INSURANCE COVERAGE ADVISOR - Main Application
// Mobile-first Progressive Web App
// =============================================================================

const App = {
  currentScreen: 'home',
  zipData: null,
  vehicleValue: 15000,
  selectedTier: null,
  customCoverage: {},

  init() {
    this.bindEvents();
    this.showScreen('home');
    this.populateRecentSearches();
  },

  bindEvents() {
    const zipInput = document.getElementById('zipInput');
    if (zipInput) {
      zipInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 5);
        this.handleZipSearch(e.target.value);
      });
      zipInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.target.value.length === 5) {
          this.analyzeZip(e.target.value);
        }
      });
    }
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', () => this.showScreen(el.dataset.nav));
    });
  },

  showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`screen-${screen}`);
    if (target) {
      target.classList.add('active');
      this.currentScreen = screen;
    }
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`[data-nav="${screen}"]`)?.classList.add('active');
    const appContent = document.getElementById('app-content');
    if (appContent) appContent.scrollTop = 0;
    window.scrollTo(0, 0);

    // Always render screen content on navigation
    if (screen === 'results') {
      this.renderAnalysis();
    } else if (screen === 'builder') {
      this.renderCustomBuilder();
    }
  },

  handleZipSearch(query) {
    const suggestionsEl = document.getElementById('zipSuggestions');
    if (!suggestionsEl) return;
    if (query.length < 2) {
      suggestionsEl.innerHTML = '';
      suggestionsEl.style.display = 'none';
      return;
    }
    const results = InsuranceData.searchZipCodes(query);
    if (results.length === 0) {
      suggestionsEl.innerHTML = '<div class="suggestion-item">No matching zip codes found</div>';
      suggestionsEl.style.display = 'block';
      return;
    }
    suggestionsEl.innerHTML = results.map(r =>
      `<div class="suggestion-item" onclick="App.analyzeZip('${r.zip}')">
        <span class="suggestion-zip">${r.zip}</span>
        <span class="suggestion-area">${r.area}, ${r.county} Co.</span>
      </div>`
    ).join('');
    suggestionsEl.style.display = 'block';
  },

  analyzeZip(zip) {
    const homeInput = document.getElementById('zipInput');
    if (homeInput) homeInput.value = zip;
    const homeSuggestions = document.getElementById('zipSuggestions');
    if (homeSuggestions) homeSuggestions.style.display = 'none';

    this.zipData = InsuranceData.getZipData(zip);
    if (!this.zipData) {
      this.showNotification('Zip code not found in our database. Try another California zip code.', 'error');
      return;
    }
    this.saveRecentSearch(zip);
    this.renderHomeSnapshot(this.zipData);
    this.renderAnalysis();

    // If on builder screen, re-render it with the new zip data
    if (this.currentScreen === 'builder') {
      this.renderCustomBuilder();
    }
  },

  renderHomeSnapshot(data) {
    const container = document.getElementById('zipSnapshot');
    if (!container) return;

    const bi = data.avgClaims.bodilyInjury;
    const pd = data.avgClaims.propertyDamage;
    const coll = data.avgClaims.collision;
    const avgAccidentCost = bi + pd + coll;
    const worstCasePocket = Math.max(0, bi - 30000) + Math.max(0, pd - 15000) + coll;
    const riskLevel = data.riskLevel;

    container.innerHTML = `
      <div class="snapshot-card">
        <div class="snapshot-header">
          <div class="snapshot-area">
            <strong>${data.area}</strong>, ${data.county} County
          </div>
          <span class="snapshot-badge" style="background:${riskLevel.color}">${riskLevel.level} Risk</span>
        </div>
        <div class="snapshot-stats">
          <div class="snapshot-stat">
            <div class="snapshot-stat-value">$${avgAccidentCost.toLocaleString()}</div>
            <div class="snapshot-stat-label">Avg accident cost (BI + PD + Collision)</div>
          </div>
          <div class="snapshot-stat">
            <div class="snapshot-stat-value">${data.uninsuredPct}</div>
            <div class="snapshot-stat-label">Uninsured driver rate</div>
          </div>
          <div class="snapshot-stat">
            <div class="snapshot-stat-value">$${data.avgAnnualPremium.toLocaleString()}</div>
            <div class="snapshot-stat-label">Avg annual premium</div>
          </div>
        </div>
        <div class="snapshot-gap">
          <span class="snapshot-gap-label">Worst case out-of-pocket at CA minimums:</span>
          <span class="snapshot-gap-value text-red">$${worstCasePocket.toLocaleString()}</span>
        </div>
        <div class="snapshot-attr">Based on CA statewide claim data (NAIC/CDI), adjusted for ${data.county} County risk factors</div>
        <button class="btn-primary snapshot-cta" onclick="App.showAnalysisScreen()">See Full Analysis</button>
      </div>
    `;
  },

  // Reusable inline zip input for screens that need a zip before showing data
  _renderInlineZipInput(screenLabel) {
    return `
      <div class="inline-zip-prompt">
        <h2>Enter Your Zip Code</h2>
        <p>We need your California zip code to show ${screenLabel}.</p>
        <div class="zip-input-group">
          <input type="tel" class="inline-zip-input" placeholder="Enter zip code (e.g. 91604)"
                 maxlength="5" autocomplete="off" inputmode="numeric">
          <div class="zip-suggestions inline-zip-suggestions"></div>
        </div>
      </div>
    `;
  },

  _bindInlineZipInput(container) {
    const input = container.querySelector('.inline-zip-input');
    const suggestions = container.querySelector('.inline-zip-suggestions');
    if (!input || !suggestions) return;

    input.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 5);
      const query = e.target.value;
      if (query.length < 2) {
        suggestions.innerHTML = '';
        suggestions.style.display = 'none';
        return;
      }
      const results = InsuranceData.searchZipCodes(query);
      if (results.length === 0) {
        suggestions.innerHTML = '<div class="suggestion-item">No matching zip codes found</div>';
        suggestions.style.display = 'block';
        return;
      }
      suggestions.innerHTML = results.map(r =>
        `<div class="suggestion-item" data-zip="${r.zip}">
          <span class="suggestion-zip">${r.zip}</span>
          <span class="suggestion-area">${r.area}, ${r.county} Co.</span>
        </div>`
      ).join('');
      suggestions.style.display = 'block';
      suggestions.querySelectorAll('.suggestion-item[data-zip]').forEach(item => {
        item.addEventListener('click', () => {
          this.analyzeZip(item.dataset.zip);
        });
      });
    });

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && e.target.value.length === 5) {
        this.analyzeZip(e.target.value);
      }
    });

    input.focus();
  },

  showAnalysisScreen() {
    this.showScreen('results');
    this.renderAnalysis();
  },

  renderAnalysisEmpty() {
    const container = document.getElementById('screen-results');
    container.innerHTML = this._renderInlineZipInput('personalized accident cost analysis');
    this._bindInlineZipInput(container);
  },

  // =========================================================================
  // MAIN ANALYSIS RENDER — leads with ACCIDENT COST scenarios
  // =========================================================================
  renderAnalysis() {
    const data = this.zipData;
    const container = document.getElementById('screen-results');
    if (!data) {
      this.renderAnalysisEmpty();
      return;
    }

    try {
    const recommendation = InsuranceData.getRecommendation(data.zip, this.vehicleValue);
    if (recommendation) this.selectedTier = recommendation.tier;

    const bi = data.avgClaims.bodilyInjury;
    const pd = data.avgClaims.propertyDamage;
    const comp = data.avgClaims.comprehensive;
    const coll = data.avgClaims.collision;
    const riskLevel = data.riskLevel;
    const avgAccidentCost = bi + pd + coll;

    // Build accident scenarios specific to this zip
    const scenarios = this._buildScenarios(data);

    container.innerHTML = `
      <button class="back-btn" onclick="App.showScreen('home')">&#8249; Back to Search</button>

      <!-- COMPACT HEADER -->
      <div class="results-header-compact">
        <div class="rhc-left">
          <span class="rhc-zip">${data.zip}</span>
          <span class="rhc-area">${data.area}, ${data.county} Co.</span>
        </div>
        <span class="rhc-badge" style="background:${riskLevel.color}">${riskLevel.level}</span>
        <div class="rhc-cost">
          <span class="rhc-cost-value">$${avgAccidentCost.toLocaleString()}</span>
          <span class="rhc-cost-label">avg accident</span>
        </div>
      </div>

      <!-- TABS -->
      <div class="analysis-tabs">
        <button class="analysis-tab active" data-tab="costs" onclick="App.switchAnalysisTab('costs')">Costs</button>
        <button class="analysis-tab" data-tab="coverage" onclick="App.switchAnalysisTab('coverage')">Coverage</button>
      </div>

      <!-- ========== COSTS TAB ========== -->
      <div class="tab-content tab-costs active">

        <!-- Coverage Gap Table -->
        <div class="gap-section">
          <h2>The Coverage Gap</h2>
          <p>What happens when the accident costs more than your insurance pays?<br><strong>You pay the difference out of pocket.</strong></p>

          <div class="gap-table">
            <div class="gap-row gap-header-row">
              <div class="gap-cell gap-label-cell">Coverage Type</div>
              <div class="gap-cell">Avg Cost</div>
              <div class="gap-cell">CA Min Pays</div>
              <div class="gap-cell gap-danger-cell">Your Pocket</div>
            </div>
            <div class="gap-row">
              <div class="gap-cell gap-label-cell">Bodily Injury<br><span class="gap-sub">per person you injure</span></div>
              <div class="gap-cell"><strong>$${bi.toLocaleString()}</strong></div>
              <div class="gap-cell">$30,000</div>
              <div class="gap-cell gap-danger-cell"><strong class="${bi > 30000 ? 'text-red' : 'text-green'}">$${Math.max(0, bi - 30000).toLocaleString()}</strong></div>
            </div>
            <div class="gap-row">
              <div class="gap-cell gap-label-cell">Property Dmg<br><span class="gap-sub">other car</span></div>
              <div class="gap-cell"><strong>$${pd.toLocaleString()}</strong></div>
              <div class="gap-cell">$15,000</div>
              <div class="gap-cell gap-danger-cell"><strong class="${pd > 15000 ? 'text-red' : 'text-green'}">$${Math.max(0, pd - 15000).toLocaleString()}</strong></div>
            </div>
            <div class="gap-row">
              <div class="gap-cell gap-label-cell">Collision<br><span class="gap-sub">your car</span></div>
              <div class="gap-cell"><strong>$${coll.toLocaleString()}</strong></div>
              <div class="gap-cell">$0</div>
              <div class="gap-cell gap-danger-cell"><strong class="text-red">$${coll.toLocaleString()}</strong></div>
            </div>
            <div class="gap-row">
              <div class="gap-cell gap-label-cell">Comprehensive<br><span class="gap-sub">theft/vandalism</span></div>
              <div class="gap-cell"><strong>$${comp.toLocaleString()}</strong></div>
              <div class="gap-cell">$0</div>
              <div class="gap-cell gap-danger-cell"><strong class="text-red">$${comp.toLocaleString()}</strong></div>
            </div>
            <div class="gap-row gap-total-row">
              <div class="gap-cell gap-label-cell"><strong>Worst-Case Total</strong></div>
              <div class="gap-cell"></div>
              <div class="gap-cell"></div>
              <div class="gap-cell gap-danger-cell"><strong class="text-red big-number">$${(Math.max(0,bi-30000) + Math.max(0,pd-15000) + coll + comp).toLocaleString()}</strong></div>
            </div>
          </div>
        </div>

        <!-- Scenario Cards (top 3, with toggle for more) -->
        <div class="scenarios-container">
          ${scenarios.slice(0, 3).map((s, i) => this._renderScenario(s, i)).join('')}
          <div class="scenarios-more" id="scenariosMore" style="display:none">
            ${scenarios.slice(3).map((s, i) => this._renderScenario(s, i + 3)).join('')}
          </div>
          ${scenarios.length > 3 ? `<button class="scenarios-toggle" id="scenariosToggle" onclick="App.toggleMoreScenarios()">Show ${scenarios.length - 3} more scenarios</button>` : ''}
        </div>

        <!-- Compact Risk Stats -->
        <div class="risk-pills">
          <div class="risk-pill">
            <span class="risk-pill-value" style="color:${data.uninsuredRate > 0.18 ? '#dc2626' : data.uninsuredRate > 0.14 ? '#ca8a04' : '#16a34a'}">${data.uninsuredPct}</span>
            <span class="risk-pill-label">Uninsured</span>
          </div>
          <div class="risk-pill">
            <span class="risk-pill-value" style="color:${riskLevel.color}">${data.effectiveRisk.toFixed(2)}x</span>
            <span class="risk-pill-label">Risk Factor</span>
          </div>
          <div class="risk-pill">
            <span class="risk-pill-value" style="color:${data.theftRisk === 'very high' || data.theftRisk === 'high' ? '#dc2626' : data.theftRisk === 'medium' ? '#ca8a04' : '#16a34a'}">${data.theftRisk.charAt(0).toUpperCase() + data.theftRisk.slice(1)}</span>
            <span class="risk-pill-label">Theft</span>
          </div>
          <div class="risk-pill">
            <span class="risk-pill-value">$${data.avgAnnualPremium.toLocaleString()}</span>
            <span class="risk-pill-label">Avg Premium</span>
          </div>
        </div>

        <div class="data-attribution">CA statewide claim data (NAIC/CDI), adjusted for ${data.county} County</div>
      </div>

      <!-- ========== COVERAGE TAB ========== -->
      <div class="tab-content tab-coverage">

        <!-- Recommendation -->
        <div id="recommendation"></div>

        <!-- Coverage-by-coverage breakdown (compact rows) -->
        <div id="coverageBreakdown"></div>

        <!-- Compare All Tiers -->
        <div class="comparison-section">
          <h2>Compare Coverage Tiers</h2>
          <p class="section-subtitle">Tap a tier to select. Scroll to see all.</p>
          <div id="coverageComparison"></div>
        </div>

        <!-- Action -->
        <div style="text-align:center; margin:16px 0 10px">
          <button class="btn-primary" onclick="App.renderCustomBuilder(); App.showScreen('builder')">
            Build Custom Coverage
          </button>
        </div>
      </div>
    `;

    // Render dynamic sub-sections
    if (recommendation) {
      this.renderRecommendation(recommendation);
    }
    this.renderCoverageBreakdownCompact(data);
    this.renderCoverageComparison();

    } catch (err) {
      container.innerHTML = `
        <div class="inline-zip-prompt">
          <h2>Something went wrong</h2>
          <p>Error rendering analysis: ${err.message}</p>
          <button class="btn-primary" onclick="App.showScreen('home')">Go Home</button>
        </div>`;
    }
  },

  switchAnalysisTab(tab) {
    document.querySelectorAll('.analysis-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.analysis-tab[data-tab="${tab}"]`)?.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector(`.tab-${tab}`)?.classList.add('active');
  },

  toggleMoreScenarios() {
    const more = document.getElementById('scenariosMore');
    const btn = document.getElementById('scenariosToggle');
    if (!more || !btn) return;
    const showing = more.style.display !== 'none';
    more.style.display = showing ? 'none' : 'block';
    btn.textContent = showing ? `Show ${this._buildScenarios(this.zipData).length - 3} more scenarios` : 'Show fewer';
  },

  // Build realistic accident scenarios for this zip code
  _buildScenarios(data) {
    const bi = data.avgClaims.bodilyInjury;
    const pd = data.avgClaims.propertyDamage;
    const comp = data.avgClaims.comprehensive;
    const coll = data.avgClaims.collision;

    return [
      {
        title: "Fender Bender",
        emoji: "🚗💥🚙",
        description: `You rear-end someone at a stoplight in ${data.area}. Their bumper, trunk, and taillights are damaged. Minor whiplash.`,
        costs: [
          { label: "Other car repairs", amount: Math.round(pd * 0.6) },
          { label: "Their medical bills (whiplash)", amount: Math.round(bi * 0.2) },
          { label: "Your car repairs", amount: Math.round(coll * 0.5) },
        ],
        coverageNeeded: ["Property Damage", "Bodily Injury", "Collision"]
      },
      {
        title: "Moderate Injury Accident",
        emoji: "🏥",
        description: `You cause an accident on the freeway. The other driver breaks an arm and needs surgery. Two vehicles significantly damaged.`,
        costs: [
          { label: "Other driver's medical + lost wages", amount: bi },
          { label: "Other car (totaled)", amount: pd },
          { label: "Your car repairs", amount: coll },
          { label: "Rental car (14 days)", amount: 700 },
        ],
        coverageNeeded: ["Bodily Injury", "Property Damage", "Collision", "Rental"]
      },
      {
        title: "Serious Multi-Injury Crash",
        emoji: "🚨",
        description: `A serious intersection collision. Two people in the other car are hospitalized with spinal injuries.`,
        costs: [
          { label: "Victim 1 medical + pain/suffering", amount: Math.round(bi * 1.8) },
          { label: "Victim 2 medical + pain/suffering", amount: Math.round(bi * 1.2) },
          { label: "Other car (luxury SUV, totaled)", amount: Math.round(pd * 1.5) },
          { label: "Your car (totaled)", amount: this.vehicleValue },
        ],
        coverageNeeded: ["Bodily Injury (HIGH)", "Property Damage", "Collision"]
      },
      {
        title: "Uninsured Driver Hits You",
        emoji: "⚠️",
        description: `An uninsured driver runs a red light and hits you. ${data.uninsuredPct} of drivers in your area have no insurance.`,
        costs: [
          { label: "Your medical bills", amount: Math.round(bi * 0.6) },
          { label: "Your car repairs", amount: coll },
          { label: "Lost wages (2 weeks)", amount: 3000 },
        ],
        coverageNeeded: ["UM/UIM Bodily Injury", "Collision", "Medical Payments"]
      },
      {
        title: "Car Stolen / Catalytic Converter",
        emoji: "🔓",
        description: `Your car is stolen from a ${data.area} parking lot, or the catalytic converter is cut off overnight. ${data.theftRisk === 'high' || data.theftRisk === 'very high' ? 'This area has elevated theft.' : ''}`,
        costs: [
          { label: data.theftRisk === 'very high' || data.theftRisk === 'high' ? "Full vehicle theft" : "Catalytic converter replacement", amount: data.theftRisk === 'very high' || data.theftRisk === 'high' ? Math.min(this.vehicleValue, 25000) : 2500 },
        ],
        coverageNeeded: ["Comprehensive"]
      }
    ];
  },

  _renderScenario(scenario, index) {
    const total = scenario.costs.reduce((sum, c) => sum + c.amount, 0);
    return `
      <div class="scenario-card" onclick="this.classList.toggle('expanded')">
        <div class="scenario-header">
          <div class="scenario-emoji">${scenario.emoji}</div>
          <div class="scenario-info">
            <div class="scenario-title">${scenario.title}</div>
            <div class="scenario-total">Total cost: <strong>$${total.toLocaleString()}</strong></div>
          </div>
          <div class="scenario-expand">&#8250;</div>
        </div>
        <div class="scenario-body">
          <p class="scenario-desc">${scenario.description}</p>
          <div class="scenario-costs">
            ${scenario.costs.map(c => `
              <div class="scenario-cost-row">
                <span>${c.label}</span>
                <strong>$${c.amount.toLocaleString()}</strong>
              </div>
            `).join('')}
            <div class="scenario-cost-total">
              <span>Total Accident Cost</span>
              <strong>$${total.toLocaleString()}</strong>
            </div>
          </div>
          <div class="scenario-coverage">
            <span class="scenario-coverage-label">Coverage needed:</span>
            ${scenario.coverageNeeded.map(c => `<span class="coverage-tag">${c}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
  },

  // Compact coverage breakdown rows for the Coverage tab
  renderCoverageBreakdownCompact(data) {
    const container = document.getElementById('coverageBreakdown');
    if (!container) return;

    const items = [
      {
        key: 'bodilyInjury', name: 'Bodily Injury', icon: '🏥',
        avgCost: data.avgClaims.bodilyInjury, caMin: 30000,
        recommendation: data.avgClaims.bodilyInjury > 50000 ? '$100K/$300K+' : '$50K/$100K+'
      },
      {
        key: 'propertyDamage', name: 'Property Damage', icon: '🚗',
        avgCost: data.avgClaims.propertyDamage, caMin: 15000,
        recommendation: '$50K-$100K'
      },
      {
        key: 'uninsuredMotorist', name: 'UM/UIM', icon: '⚠️',
        avgCost: data.avgClaims.bodilyInjury, caMin: 30000,
        recommendation: 'Match BI limits'
      },
      {
        key: 'collision', name: 'Collision', icon: '💥',
        avgCost: data.avgClaims.collision, caMin: 0,
        recommendation: this.vehicleValue > 10000 ? '$500-$1K ded.' : (this.vehicleValue > 5000 ? '$1K-$2K ded.' : 'Skip if car <$5K')
      },
      {
        key: 'comprehensive', name: 'Comprehensive', icon: '🛡️',
        avgCost: data.avgClaims.comprehensive, caMin: 0,
        recommendation: data.theftRisk === 'high' || data.theftRisk === 'very high' ? '$250-$500 ded.' : '$500-$1K ded.'
      },
      {
        key: 'medicalPayments', name: 'MedPay', icon: '💊',
        avgCost: data.avgClaims.medicalPayments, caMin: 0,
        recommendation: '$5K-$10K'
      }
    ];

    container.innerHTML = `
      <h3 class="breakdown-title-compact">Coverage Breakdown</h3>
      <div class="breakdown-compact-list">
        ${items.map(item => {
          const gap = Math.max(0, item.avgCost - item.caMin);
          return `
            <div class="breakdown-row" onclick="App.showCoverageDetail('${item.key}')">
              <span class="brc-icon">${item.icon}</span>
              <span class="brc-name">${item.name}</span>
              <span class="brc-cost">$${item.avgCost.toLocaleString()}</span>
              <span class="brc-gap ${gap > 0 ? 'text-red' : 'text-green'}">${gap > 0 ? '-$' + gap.toLocaleString() : 'Covered'}</span>
              <span class="brc-rec">${item.recommendation}</span>
            </div>
          `;
        }).join('')}
      </div>
      <div class="data-attribution">Avg costs based on CA statewide data (NAIC/CDI), adjusted for ${data.county} County</div>
    `;
  },

  // Full coverage breakdown cards (used by Guide screen modal flow)
  renderCoverageBreakdown(data) {
    const container = document.getElementById('coverageBreakdown');
    if (!container) return;
    this.renderCoverageBreakdownCompact(data);
  },

  renderRecommendation(rec) {
    const container = document.getElementById('recommendation');
    if (!container) return;
    const estimatedPremium = InsuranceData.estimatePremium(rec.zipData.zip, rec.tier);

    container.innerHTML = `
      <div class="rec-card">
        <div class="rec-header">
          <div class="rec-badge">${rec.tierData.label}</div>
          <div class="rec-subtitle">Recommended tier for ${rec.zipData.area}</div>
        </div>
        <div class="rec-details">
          <div class="rec-coverage-grid">
            <div class="rec-item">
              <span class="rec-item-label">Bodily Injury</span>
              <span class="rec-item-value">$${(rec.tierData.bodilyInjury.perPerson/1000)}K/$${(rec.tierData.bodilyInjury.perAccident/1000)}K</span>
            </div>
            <div class="rec-item">
              <span class="rec-item-label">Property Damage</span>
              <span class="rec-item-value">$${(rec.tierData.propertyDamage/1000)}K</span>
            </div>
            <div class="rec-item">
              <span class="rec-item-label">Med Payments</span>
              <span class="rec-item-value">${rec.tierData.medicalPayments > 0 ? '$' + (rec.tierData.medicalPayments/1000) + 'K' : 'None'}</span>
            </div>
            <div class="rec-item">
              <span class="rec-item-label">UM/UIM BI</span>
              <span class="rec-item-value">$${(rec.tierData.uninsuredMotorist.perPerson/1000)}K/$${(rec.tierData.uninsuredMotorist.perAccident/1000)}K</span>
            </div>
            <div class="rec-item">
              <span class="rec-item-label">Comprehensive</span>
              <span class="rec-item-value">${rec.tierData.comprehensive ? '$' + rec.tierData.comprehensive.deductible + ' ded.' : 'None'}</span>
            </div>
            <div class="rec-item">
              <span class="rec-item-label">Collision</span>
              <span class="rec-item-value">${rec.tierData.collision ? '$' + rec.tierData.collision.deductible + ' ded.' : 'None'}</span>
            </div>
          </div>
          <div class="rec-premium">
            <span>Estimated Annual Premium</span>
            <strong>~$${estimatedPremium.toLocaleString()}</strong>
          </div>
        </div>
        <div class="rec-reasons">
          <div class="rec-reasons-title">Why this recommendation:</div>
          ${rec.reasons.map(r => `<div class="rec-reason"><span class="reason-bullet">&#8226;</span> ${r}</div>`).join('')}
        </div>
      </div>
    `;
  },

  renderCoverageComparison() {
    const container = document.getElementById('coverageComparison');
    if (!container) return;
    const tiers = InsuranceData.COVERAGE_TIERS;
    const zip = this.zipData?.zip;

    const headers = Object.keys(tiers).map(key => {
      const isSelected = key === this.selectedTier;
      const premium = zip ? InsuranceData.estimatePremium(zip, key) : 0;
      return `<th class="${isSelected ? 'selected-tier' : ''}" onclick="App.selectTier('${key}')">
        <div class="tier-name">${tiers[key].label}</div>
        ${zip ? `<div class="tier-price">~$${premium.toLocaleString()}/yr</div>` : ''}
        ${isSelected ? '<div class="tier-badge">Rec.</div>' : ''}
      </th>`;
    }).join('');

    const rows = [
      { label: 'Bodily Injury', key: 'bodilyInjury', format: (v) => v ? `$${v.perPerson/1000}K/$${v.perAccident/1000}K` : '-' },
      { label: 'Property Damage', key: 'propertyDamage', format: (v) => v ? `$${v/1000}K` : '-' },
      { label: 'Medical Payments', key: 'medicalPayments', format: (v) => v > 0 ? `$${v/1000}K` : 'None' },
      { label: 'UM/UIM BI', key: 'uninsuredMotorist', format: (v) => v ? `$${v.perPerson/1000}K/$${v.perAccident/1000}K` : '-' },
      { label: 'Comprehensive', key: 'comprehensive', format: (v) => v ? `$${v.deductible} ded.` : 'None' },
      { label: 'Collision', key: 'collision', format: (v) => v ? `$${v.deductible} ded.` : 'None' },
      { label: 'Rental Car', key: 'rentalCar', format: (v) => v > 0 ? `$${v}/day` : 'None' }
    ];

    container.innerHTML = `
      <div class="comparison-wrapper">
        <table class="comparison-table">
          <thead><tr>
            <th class="coverage-label-col">Coverage</th>
            ${headers}
          </tr></thead>
          <tbody>
            ${rows.map(row => `<tr>
              <td class="coverage-label-col">${row.label}</td>
              ${Object.keys(tiers).map(key => {
                const isSelected = key === this.selectedTier;
                return `<td class="${isSelected ? 'selected-tier' : ''}">${row.format(tiers[key][row.key])}</td>`;
              }).join('')}
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  selectTier(tier) {
    this.selectedTier = tier;
    this.renderCoverageComparison();
    const rec = InsuranceData.getRecommendation(this.zipData.zip, this.vehicleValue);
    rec.tier = tier;
    rec.tierData = InsuranceData.COVERAGE_TIERS[tier];
    this.renderRecommendation(rec);
  },

  showCoverageDetail(coverageKey) {
    const info = InsuranceData.COVERAGE_INFO[coverageKey];
    if (!info) return;
    const modal = document.getElementById('coverageModal');
    const avgClaim = this.zipData?.avgClaims?.[coverageKey];

    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-icon">${info.icon}</span>
          <h2>${info.name}</h2>
          <button class="modal-close" onclick="App.closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <p class="modal-desc">${info.description}</p>
          <div class="modal-stats">
            <div class="modal-stat">
              <span class="modal-stat-label">CA Minimum (current)</span>
              <span class="modal-stat-value">${info.caMinimum}</span>
            </div>
            <div class="modal-stat">
              <span class="modal-stat-label">Recommended</span>
              <span class="modal-stat-value highlight">${info.recommended}</span>
            </div>
            <div class="modal-stat">
              <span class="modal-stat-label">CA Avg Claim</span>
              <span class="modal-stat-value">${info.avgClaimCA}</span>
            </div>
            ${avgClaim ? `
            <div class="modal-stat">
              <span class="modal-stat-label">Your Area Avg</span>
              <span class="modal-stat-value highlight">$${avgClaim.toLocaleString()}</span>
            </div>` : ''}
          </div>
          <div class="modal-why">
            <h3>Why It Matters</h3>
            <p>${info.whyItMatters}</p>
          </div>
          ${this.zipData && avgClaim ? `
          <div class="modal-warning warning-red">
            <strong>In your area (${this.zipData.area}):</strong> The average claim is <strong>$${avgClaim.toLocaleString()}</strong>. Make sure your coverage limits are at least this high, or you risk paying the difference out of your own pocket.
          </div>` : ''}
        </div>
      </div>
    `;
    modal.classList.add('active');
  },

  closeModal() {
    document.getElementById('coverageModal').classList.remove('active');
  },

  renderCoverageGuide() {
    const container = document.getElementById('coverageGuideList');
    if (!container) return;
    container.innerHTML = Object.entries(InsuranceData.COVERAGE_INFO).map(([key, info]) => `
      <div class="guide-card" onclick="App.showCoverageDetail('${key}')">
        <div class="guide-icon">${info.icon}</div>
        <div class="guide-info">
          <div class="guide-name">${info.name}</div>
          <div class="guide-summary">${info.description.substring(0, 80)}...</div>
          <div class="guide-meta">
            <span class="guide-min">Min: ${info.caMinimum}</span>
            <span class="guide-avg">CA Avg: ${info.avgClaimCA}</span>
          </div>
        </div>
        <div class="guide-arrow">&#8250;</div>
      </div>
    `).join('');
  },

  renderCustomBuilder() {
    const container = document.getElementById('customBuilder');
    if (!container) return;
    if (!this.zipData) {
      container.innerHTML = this._renderInlineZipInput('personalized coverage recommendations');
      this._bindInlineZipInput(container);
      return;
    }
    const coverageOptions = {
      bodilyInjury: { label: 'Bodily Injury', options: [
        { value: '30/60', label: '$30K/$60K (Min)', premium: 0.8 },
        { value: '50/100', label: '$50K/$100K', premium: 1.0 },
        { value: '100/300', label: '$100K/$300K', premium: 1.4 },
        { value: '250/500', label: '$250K/$500K', premium: 1.8 }
      ]},
      propertyDamage: { label: 'Property Damage', options: [
        { value: '15', label: '$15K (Min)', premium: 0.6 },
        { value: '25', label: '$25K', premium: 0.8 },
        { value: '50', label: '$50K', premium: 1.0 },
        { value: '100', label: '$100K', premium: 1.3 }
      ]},
      medicalPayments: { label: 'Medical Payments', options: [
        { value: '0', label: 'None', premium: 0 },
        { value: '5', label: '$5K', premium: 0.8 },
        { value: '10', label: '$10K', premium: 1.0 },
        { value: '25', label: '$25K', premium: 1.4 }
      ]},
      uninsuredMotorist: { label: 'UM/UIM BI', options: [
        { value: '30/60', label: '$30K/$60K (Min)', premium: 0.8 },
        { value: '50/100', label: '$50K/$100K', premium: 1.0 },
        { value: '100/300', label: '$100K/$300K', premium: 1.4 },
        { value: '250/500', label: '$250K/$500K', premium: 1.8 }
      ]},
      comprehensive: { label: 'Comprehensive', options: [
        { value: 'none', label: 'None', premium: 0 },
        { value: '1000', label: '$1K ded.', premium: 0.7 },
        { value: '500', label: '$500 ded.', premium: 1.0 },
        { value: '250', label: '$250 ded.', premium: 1.3 }
      ]},
      collision: { label: 'Collision', options: [
        { value: 'none', label: 'None', premium: 0 },
        { value: '2000', label: '$2K ded.', premium: 0.7 },
        { value: '1000', label: '$1K ded.', premium: 1.0 },
        { value: '500', label: '$500 ded.', premium: 1.3 }
      ]},
      rentalCar: { label: 'Rental Car', options: [
        { value: '0', label: 'None', premium: 0 },
        { value: '30', label: '$30/day', premium: 0.8 },
        { value: '50', label: '$50/day', premium: 1.0 }
      ]}
    };

    container.innerHTML = `
      <div class="builder-header"><h3>Build Your Coverage</h3><p>${this.zipData.area}, ${this.zipData.county} Co. (${this.zipData.zip})</p></div>
      ${Object.entries(coverageOptions).map(([key, config]) => {
        const currentValue = this.customCoverage[key] || config.options[0].value;
        const avgClaim = this.zipData.avgClaims[key];
        return `
          <div class="builder-row">
            <div class="builder-label">
              <span>${InsuranceData.COVERAGE_INFO[key]?.icon || ''} ${config.label}</span>
              ${avgClaim ? `<span class="builder-avg">Avg claim: $${avgClaim.toLocaleString()}</span>` : ''}
            </div>
            <div class="builder-options">
              ${config.options.map(opt => `
                <button class="opt-btn ${currentValue === opt.value ? 'active' : ''}"
                        onclick="App.setCustomCoverage('${key}', '${opt.value}')">${opt.label}</button>
              `).join('')}
            </div>
          </div>`;
      }).join('')}
      <div class="builder-total"><span>Estimated Annual Premium</span><strong>$${this.calculateCustomPremium().toLocaleString()}</strong></div>
    `;
  },

  setCustomCoverage(key, value) {
    this.customCoverage[key] = value;
    this.renderCustomBuilder();
  },

  calculateCustomPremium() {
    if (!this.zipData) return 0;
    const basePremiums = { bodilyInjury: 480, propertyDamage: 320, medicalPayments: 120, uninsuredMotorist: 180, comprehensive: 200, collision: 800, rentalCar: 80 };
    const multipliers = {
      bodilyInjury: { '30/60': 0.8, '50/100': 1.0, '100/300': 1.4, '250/500': 1.8 },
      propertyDamage: { '15': 0.6, '25': 0.8, '50': 1.0, '100': 1.3 },
      medicalPayments: { '0': 0, '5': 0.8, '10': 1.0, '25': 1.4 },
      uninsuredMotorist: { '30/60': 0.8, '50/100': 1.0, '100/300': 1.4, '250/500': 1.8 },
      comprehensive: { 'none': 0, '1000': 0.7, '500': 1.0, '250': 1.3 },
      collision: { 'none': 0, '2000': 0.7, '1000': 1.0, '500': 1.3 },
      rentalCar: { '0': 0, '30': 0.8, '50': 1.0 }
    };
    let total = 0;
    for (const [key, base] of Object.entries(basePremiums)) {
      const selection = this.customCoverage[key] || Object.keys(multipliers[key])[0];
      const mult = multipliers[key][selection] || 0;
      total += base * mult;
    }
    return Math.round(total * this.zipData.effectiveRisk);
  },

  saveRecentSearch(zip) {
    let recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    recent = recent.filter(z => z !== zip);
    recent.unshift(zip);
    recent = recent.slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(recent));
    this.populateRecentSearches();
  },

  populateRecentSearches() {
    const container = document.getElementById('recentSearches');
    if (!container) return;
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    if (recent.length === 0) { container.style.display = 'none'; return; }
    container.style.display = 'block';
    container.innerHTML = `
      <div class="recent-label">Recent Searches</div>
      <div class="recent-chips">
        ${recent.map(zip => {
          const data = InsuranceData.getZipData(zip);
          return `<button class="recent-chip" onclick="App.analyzeZip('${zip}')">${zip}${data ? ` - ${data.area}` : ''}</button>`;
        }).join('')}
      </div>`;
  },

  showNotification(message, type = 'info') {
    const notif = document.createElement('div');
    notif.className = `notification notification-${type}`;
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => notif.classList.add('show'), 10);
    setTimeout(() => { notif.classList.remove('show'); setTimeout(() => notif.remove(), 300); }, 3000);
  },

  updateVehicleValue(value) {
    this.vehicleValue = parseInt(value);
    const display = document.getElementById('vehicleValueDisplay');
    if (display) display.textContent = '$' + this.vehicleValue.toLocaleString();
    if (this.zipData) {
      const rec = InsuranceData.getRecommendation(this.zipData.zip, this.vehicleValue);
      if (rec) {
        this.selectedTier = rec.tier;
        this.renderRecommendation(rec);
        if (document.querySelector('.breakdown-compact-list')) {
          this.renderCoverageBreakdownCompact(this.zipData);
        }
        this.renderCoverageComparison();
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
  App.renderCoverageGuide();
});
