// =============================================================================
// INSURANCE COVERAGE DATA ENGINE
// California Auto Insurance Claims Data by Zip Code
// Sources: California Department of Insurance, NAIC, III, public rate filings
// =============================================================================

const InsuranceData = {

  // Data sourcing documentation
  DATA_SOURCES: {
    claimAverages: {
      scope: "California statewide",
      sources: ["NAIC 2021 Auto Insurance Database Report", "CDI Frequency & Severity Bands"],
      note: "Base claim averages (BI, PD, Collision, Comp, MedPay) are California statewide figures, roughly 2x the national average for BI."
    },
    countyAdjustments: {
      scope: "California counties statewide",
      counties: ["Los Angeles", "Orange", "San Diego", "Riverside", "San Bernardino", "Ventura", "Santa Barbara", "Kern", "San Francisco", "Alameda", "Santa Clara", "Sacramento", "Contra Costa", "San Mateo", "Fresno", "San Joaquin", "Stanislaus", "Sonoma", "Solano", "Tulare", "Monterey", "Placer", "San Luis Obispo", "Marin", "Santa Cruz", "Merced", "Butte", "Yolo", "El Dorado", "Shasta", "Humboldt", "Napa", "Kings", "Madera", "Imperial"],
      sources: ["CDI county-level loss data", "Bankrate 2025 premium surveys", "IRC uninsured motorist estimates"],
      note: "County risk factors, uninsured rates, and average premiums are specific to each California county."
    },
    zipAdjustments: {
      scope: "Individual zip codes within covered counties",
      sources: ["CDI zip-level loss ratio data", "NICB theft reports", "CHP accident frequency data"],
      note: "Local risk multipliers adjust county averages up or down based on zip-level claim patterns."
    },
    attribution: "Based on CA statewide claim data (NAIC/CDI), adjusted for county and local risk factors."
  },

  // California minimum required coverage (SB 1107, effective Jan 1, 2025; current through 2034)
  CA_MINIMUMS: {
    bodilyInjury: { perPerson: 30000, perAccident: 60000 },
    propertyDamage: { perAccident: 15000 },
    uninsuredMotorist: { perPerson: 30000, perAccident: 60000 }
  },

  // Future CA minimums (effective Jan 1, 2035)
  CA_FUTURE_MINIMUMS: {
    bodilyInjury: { perPerson: 50000, perAccident: 100000 },
    propertyDamage: { perAccident: 25000 }
  },

  // Common coverage tiers
  COVERAGE_TIERS: {
    minimum: {
      label: "State Minimum",
      bodilyInjury: { perPerson: 30000, perAccident: 60000 },
      propertyDamage: 15000,
      medicalPayments: 0,
      uninsuredMotorist: { perPerson: 30000, perAccident: 60000 },
      comprehensive: null,
      collision: null,
      rentalCar: 0
    },
    basic: {
      label: "Basic Protection",
      bodilyInjury: { perPerson: 50000, perAccident: 100000 },
      propertyDamage: 25000,
      medicalPayments: 5000,
      uninsuredMotorist: { perPerson: 50000, perAccident: 100000 },
      comprehensive: { deductible: 1000 },
      collision: { deductible: 2000 },
      rentalCar: 30
    },
    standard: {
      label: "Standard",
      bodilyInjury: { perPerson: 50000, perAccident: 100000 },
      propertyDamage: 50000,
      medicalPayments: 10000,
      uninsuredMotorist: { perPerson: 50000, perAccident: 100000 },
      comprehensive: { deductible: 500 },
      collision: { deductible: 1000 },
      rentalCar: 40
    },
    enhanced: {
      label: "Enhanced",
      bodilyInjury: { perPerson: 100000, perAccident: 300000 },
      propertyDamage: 100000,
      medicalPayments: 25000,
      uninsuredMotorist: { perPerson: 100000, perAccident: 300000 },
      comprehensive: { deductible: 250 },
      collision: { deductible: 500 },
      rentalCar: 50
    },
    premium: {
      label: "Premium",
      bodilyInjury: { perPerson: 250000, perAccident: 500000 },
      propertyDamage: 100000,
      medicalPayments: 50000,
      uninsuredMotorist: { perPerson: 250000, perAccident: 500000 },
      comprehensive: { deductible: 100 },
      collision: { deductible: 250 },
      rentalCar: 75
    }
  },

  // California counties and their risk profiles
  // Risk factor: 1.0 = state average, higher = more claims/higher costs
  COUNTY_DATA: {
    "Los Angeles": {
      riskFactor: 1.35,
      uninsuredRate: 0.225,  // 20-25%, highest in CA, ~35% of all CA uninsured vehicles
      avgBodilyInjuryClaim: 51635, // CA avg per NAIC 2021 — ~2x national avg
      avgPropertyDamageClaim: 7200, // CA ~15-20% above national avg of $6,551
      avgCompClaim: 3500,   // CA ~25% above national; high cat converter theft in LA/OC
      avgCollisionClaim: 7200, // CA ~20% above national avg of $5,992
      avgMedPayClaim: 8900,
      theftRate: "high",
      accidentRate: 3.8, // per 1000 drivers
      avgAnnualPremium: 3149 // Per Bankrate 2025 data for LA
    },
    "Orange": {
      riskFactor: 1.15,
      uninsuredRate: 0.160,
      avgBodilyInjuryClaim: 46000, // Slightly below LA due to lower density
      avgPropertyDamageClaim: 6800,
      avgCompClaim: 3200,   // High cat converter theft region per State Farm
      avgCollisionClaim: 6500,
      avgMedPayClaim: 8200,
      theftRate: "medium",
      accidentRate: 3.2,
      avgAnnualPremium: 1944  // Per research data
    },
    "San Diego": {
      riskFactor: 1.10,
      uninsuredRate: 0.170,
      avgBodilyInjuryClaim: 44000,
      avgPropertyDamageClaim: 6500,
      avgCompClaim: 2900,
      avgCollisionClaim: 6200,
      avgMedPayClaim: 7800,
      theftRate: "medium",
      accidentRate: 3.0,
      avgAnnualPremium: 2835  // Per Bankrate 2025
    },
    "Riverside": {
      riskFactor: 1.20,
      uninsuredRate: 0.210,  // 18-25%, higher in low-income areas
      avgBodilyInjuryClaim: 42000,
      avgPropertyDamageClaim: 6200,
      avgCompClaim: 3100,
      avgCollisionClaim: 6000,
      avgMedPayClaim: 7500,
      theftRate: "high",
      accidentRate: 3.4,
      avgAnnualPremium: 1501
    },
    "San Bernardino": {
      riskFactor: 1.25,
      uninsuredRate: 0.220, // 18-25%, similar to Riverside
      avgBodilyInjuryClaim: 41000,
      avgPropertyDamageClaim: 6000,
      avgCompClaim: 3200,
      avgCollisionClaim: 5800,
      avgMedPayClaim: 7200,
      theftRate: "high",
      accidentRate: 3.5,
      avgAnnualPremium: 1579
    },
    "Ventura": {
      riskFactor: 1.05,
      uninsuredRate: 0.145, // 14-16%, near or below state avg
      avgBodilyInjuryClaim: 43000,
      avgPropertyDamageClaim: 6400,
      avgCompClaim: 2600,
      avgCollisionClaim: 6100,
      avgMedPayClaim: 7600,
      theftRate: "low",
      accidentRate: 2.8,
      avgAnnualPremium: 1950
    },
    "Santa Barbara": {
      riskFactor: 0.95,
      uninsuredRate: 0.130,
      avgBodilyInjuryClaim: 40000,
      avgPropertyDamageClaim: 6100,
      avgCompClaim: 2400,
      avgCollisionClaim: 5800,
      avgMedPayClaim: 7100,
      theftRate: "low",
      accidentRate: 2.5,
      avgAnnualPremium: 1850
    },
    "Kern": {
      riskFactor: 1.18,
      uninsuredRate: 0.200,
      avgBodilyInjuryClaim: 38000,
      avgPropertyDamageClaim: 5600,
      avgCompClaim: 3000,
      avgCollisionClaim: 5500,
      avgMedPayClaim: 6900,
      theftRate: "high",
      accidentRate: 3.3,
      avgAnnualPremium: 2180
    },

    // --- BAY AREA ---
    "San Francisco": {
      riskFactor: 1.30,
      uninsuredRate: 0.120,
      avgBodilyInjuryClaim: 54000,
      avgPropertyDamageClaim: 7500,
      avgCompClaim: 4200,
      avgCollisionClaim: 7000,
      avgMedPayClaim: 9200,
      theftRate: "very high",
      accidentRate: 3.5,
      avgAnnualPremium: 2850
    },
    "Alameda": {
      riskFactor: 1.25,
      uninsuredRate: 0.155,
      avgBodilyInjuryClaim: 48000,
      avgPropertyDamageClaim: 7000,
      avgCompClaim: 3800,
      avgCollisionClaim: 6800,
      avgMedPayClaim: 8500,
      theftRate: "high",
      accidentRate: 3.4,
      avgAnnualPremium: 2650
    },
    "Santa Clara": {
      riskFactor: 1.15,
      uninsuredRate: 0.130,
      avgBodilyInjuryClaim: 49000,
      avgPropertyDamageClaim: 7200,
      avgCompClaim: 3400,
      avgCollisionClaim: 6700,
      avgMedPayClaim: 8600,
      theftRate: "medium",
      accidentRate: 3.1,
      avgAnnualPremium: 2400
    },
    "Contra Costa": {
      riskFactor: 1.08,
      uninsuredRate: 0.130,
      avgBodilyInjuryClaim: 45000,
      avgPropertyDamageClaim: 6600,
      avgCompClaim: 3000,
      avgCollisionClaim: 6400,
      avgMedPayClaim: 8000,
      theftRate: "medium",
      accidentRate: 2.9,
      avgAnnualPremium: 2100
    },
    "San Mateo": {
      riskFactor: 1.05,
      uninsuredRate: 0.110,
      avgBodilyInjuryClaim: 50000,
      avgPropertyDamageClaim: 7400,
      avgCompClaim: 3200,
      avgCollisionClaim: 6800,
      avgMedPayClaim: 8800,
      theftRate: "medium",
      accidentRate: 2.7,
      avgAnnualPremium: 2350
    },
    "Marin": {
      riskFactor: 0.90,
      uninsuredRate: 0.090,
      avgBodilyInjuryClaim: 48000,
      avgPropertyDamageClaim: 7200,
      avgCompClaim: 2800,
      avgCollisionClaim: 6600,
      avgMedPayClaim: 8400,
      theftRate: "medium",
      accidentRate: 2.3,
      avgAnnualPremium: 2100
    },
    "Sonoma": {
      riskFactor: 1.00,
      uninsuredRate: 0.130,
      avgBodilyInjuryClaim: 42000,
      avgPropertyDamageClaim: 6200,
      avgCompClaim: 2700,
      avgCollisionClaim: 6000,
      avgMedPayClaim: 7500,
      theftRate: "low",
      accidentRate: 2.7,
      avgAnnualPremium: 1900
    },
    "Napa": {
      riskFactor: 0.95,
      uninsuredRate: 0.120,
      avgBodilyInjuryClaim: 43000,
      avgPropertyDamageClaim: 6300,
      avgCompClaim: 2500,
      avgCollisionClaim: 6100,
      avgMedPayClaim: 7500,
      theftRate: "low",
      accidentRate: 2.4,
      avgAnnualPremium: 1900
    },
    "Solano": {
      riskFactor: 1.12,
      uninsuredRate: 0.160,
      avgBodilyInjuryClaim: 42000,
      avgPropertyDamageClaim: 6100,
      avgCompClaim: 2900,
      avgCollisionClaim: 5900,
      avgMedPayClaim: 7400,
      theftRate: "medium",
      accidentRate: 3.1,
      avgAnnualPremium: 2000
    },

    // --- SACRAMENTO REGION ---
    "Sacramento": {
      riskFactor: 1.20,
      uninsuredRate: 0.175,
      avgBodilyInjuryClaim: 44000,
      avgPropertyDamageClaim: 6400,
      avgCompClaim: 3100,
      avgCollisionClaim: 6300,
      avgMedPayClaim: 7800,
      theftRate: "high",
      accidentRate: 3.4,
      avgAnnualPremium: 2200
    },
    "Placer": {
      riskFactor: 0.92,
      uninsuredRate: 0.100,
      avgBodilyInjuryClaim: 43000,
      avgPropertyDamageClaim: 6300,
      avgCompClaim: 2500,
      avgCollisionClaim: 6000,
      avgMedPayClaim: 7600,
      theftRate: "low",
      accidentRate: 2.4,
      avgAnnualPremium: 1750
    },
    "El Dorado": {
      riskFactor: 0.90,
      uninsuredRate: 0.100,
      avgBodilyInjuryClaim: 42000,
      avgPropertyDamageClaim: 6100,
      avgCompClaim: 2400,
      avgCollisionClaim: 5800,
      avgMedPayClaim: 7300,
      theftRate: "low",
      accidentRate: 2.3,
      avgAnnualPremium: 1700
    },
    "Yolo": {
      riskFactor: 1.00,
      uninsuredRate: 0.140,
      avgBodilyInjuryClaim: 41000,
      avgPropertyDamageClaim: 6000,
      avgCompClaim: 2500,
      avgCollisionClaim: 5800,
      avgMedPayClaim: 7200,
      theftRate: "medium",
      accidentRate: 2.7,
      avgAnnualPremium: 1800
    },

    // --- CENTRAL VALLEY ---
    "Fresno": {
      riskFactor: 1.22,
      uninsuredRate: 0.210,
      avgBodilyInjuryClaim: 39000,
      avgPropertyDamageClaim: 5800,
      avgCompClaim: 2900,
      avgCollisionClaim: 5600,
      avgMedPayClaim: 7000,
      theftRate: "high",
      accidentRate: 3.5,
      avgAnnualPremium: 1980
    },
    "San Joaquin": {
      riskFactor: 1.25,
      uninsuredRate: 0.215,
      avgBodilyInjuryClaim: 40000,
      avgPropertyDamageClaim: 5900,
      avgCompClaim: 3200,
      avgCollisionClaim: 5700,
      avgMedPayClaim: 7200,
      theftRate: "very high",
      accidentRate: 3.6,
      avgAnnualPremium: 2050
    },
    "Stanislaus": {
      riskFactor: 1.18,
      uninsuredRate: 0.195,
      avgBodilyInjuryClaim: 38000,
      avgPropertyDamageClaim: 5600,
      avgCompClaim: 3000,
      avgCollisionClaim: 5500,
      avgMedPayClaim: 6900,
      theftRate: "high",
      accidentRate: 3.3,
      avgAnnualPremium: 1850
    },
    "Tulare": {
      riskFactor: 1.15,
      uninsuredRate: 0.210,
      avgBodilyInjuryClaim: 37000,
      avgPropertyDamageClaim: 5500,
      avgCompClaim: 2700,
      avgCollisionClaim: 5300,
      avgMedPayClaim: 6700,
      theftRate: "medium",
      accidentRate: 3.2,
      avgAnnualPremium: 1750
    },
    "Merced": {
      riskFactor: 1.18,
      uninsuredRate: 0.215,
      avgBodilyInjuryClaim: 37000,
      avgPropertyDamageClaim: 5500,
      avgCompClaim: 2800,
      avgCollisionClaim: 5400,
      avgMedPayClaim: 6800,
      theftRate: "high",
      accidentRate: 3.3,
      avgAnnualPremium: 1800
    },
    "Kings": {
      riskFactor: 1.12,
      uninsuredRate: 0.200,
      avgBodilyInjuryClaim: 36000,
      avgPropertyDamageClaim: 5400,
      avgCompClaim: 2600,
      avgCollisionClaim: 5200,
      avgMedPayClaim: 6600,
      theftRate: "medium",
      accidentRate: 3.1,
      avgAnnualPremium: 1700
    },
    "Madera": {
      riskFactor: 1.12,
      uninsuredRate: 0.200,
      avgBodilyInjuryClaim: 37000,
      avgPropertyDamageClaim: 5500,
      avgCompClaim: 2700,
      avgCollisionClaim: 5300,
      avgMedPayClaim: 6700,
      theftRate: "medium",
      accidentRate: 3.1,
      avgAnnualPremium: 1750
    },

    // --- CENTRAL COAST ---
    "Monterey": {
      riskFactor: 1.05,
      uninsuredRate: 0.175,
      avgBodilyInjuryClaim: 41000,
      avgPropertyDamageClaim: 6000,
      avgCompClaim: 2600,
      avgCollisionClaim: 5800,
      avgMedPayClaim: 7200,
      theftRate: "medium",
      accidentRate: 2.8,
      avgAnnualPremium: 1880
    },
    "Santa Cruz": {
      riskFactor: 1.02,
      uninsuredRate: 0.140,
      avgBodilyInjuryClaim: 41000,
      avgPropertyDamageClaim: 6100,
      avgCompClaim: 2600,
      avgCollisionClaim: 5900,
      avgMedPayClaim: 7300,
      theftRate: "medium",
      accidentRate: 2.7,
      avgAnnualPremium: 1850
    },
    "San Luis Obispo": {
      riskFactor: 0.95,
      uninsuredRate: 0.120,
      avgBodilyInjuryClaim: 40000,
      avgPropertyDamageClaim: 6000,
      avgCompClaim: 2400,
      avgCollisionClaim: 5700,
      avgMedPayClaim: 7100,
      theftRate: "low",
      accidentRate: 2.5,
      avgAnnualPremium: 1800
    },
    "San Benito": {
      riskFactor: 1.00,
      uninsuredRate: 0.155,
      avgBodilyInjuryClaim: 40000,
      avgPropertyDamageClaim: 5900,
      avgCompClaim: 2500,
      avgCollisionClaim: 5700,
      avgMedPayClaim: 7100,
      theftRate: "low",
      accidentRate: 2.6,
      avgAnnualPremium: 1800
    },

    // --- NORTHERN CALIFORNIA ---
    "Butte": {
      riskFactor: 1.05,
      uninsuredRate: 0.155,
      avgBodilyInjuryClaim: 38000,
      avgPropertyDamageClaim: 5600,
      avgCompClaim: 2500,
      avgCollisionClaim: 5500,
      avgMedPayClaim: 6900,
      theftRate: "medium",
      accidentRate: 2.9,
      avgAnnualPremium: 1700
    },
    "Shasta": {
      riskFactor: 1.02,
      uninsuredRate: 0.155,
      avgBodilyInjuryClaim: 37000,
      avgPropertyDamageClaim: 5500,
      avgCompClaim: 2400,
      avgCollisionClaim: 5300,
      avgMedPayClaim: 6700,
      theftRate: "medium",
      accidentRate: 2.8,
      avgAnnualPremium: 1650
    },
    "Humboldt": {
      riskFactor: 0.95,
      uninsuredRate: 0.145,
      avgBodilyInjuryClaim: 36000,
      avgPropertyDamageClaim: 5300,
      avgCompClaim: 2200,
      avgCollisionClaim: 5100,
      avgMedPayClaim: 6500,
      theftRate: "low",
      accidentRate: 2.5,
      avgAnnualPremium: 1600
    },
    "Nevada": {
      riskFactor: 0.88,
      uninsuredRate: 0.110,
      avgBodilyInjuryClaim: 39000,
      avgPropertyDamageClaim: 5800,
      avgCompClaim: 2300,
      avgCollisionClaim: 5500,
      avgMedPayClaim: 7000,
      theftRate: "low",
      accidentRate: 2.2,
      avgAnnualPremium: 1650
    },
    "Sutter": {
      riskFactor: 1.08,
      uninsuredRate: 0.175,
      avgBodilyInjuryClaim: 38000,
      avgPropertyDamageClaim: 5600,
      avgCompClaim: 2600,
      avgCollisionClaim: 5400,
      avgMedPayClaim: 6800,
      theftRate: "medium",
      accidentRate: 3.0,
      avgAnnualPremium: 1700
    },

    // --- IMPERIAL ---
    "Imperial": {
      riskFactor: 1.15,
      uninsuredRate: 0.230,
      avgBodilyInjuryClaim: 36000,
      avgPropertyDamageClaim: 5300,
      avgCompClaim: 2500,
      avgCollisionClaim: 5100,
      avgMedPayClaim: 6500,
      theftRate: "medium",
      accidentRate: 3.2,
      avgAnnualPremium: 1800
    }
  },

  // Zip code to county mapping + local risk adjustments for California
  // Risk adjustment: multiplier on county base (1.0 = county average)
  ZIP_DATA: {
    // --- LOS ANGELES COUNTY ---
    // Downtown LA / Central LA
    "90001": { county: "Los Angeles", area: "Florence-Firestone", localRisk: 1.30, theftRisk: "very high" },
    "90002": { county: "Los Angeles", area: "Watts", localRisk: 1.35, theftRisk: "very high" },
    "90003": { county: "Los Angeles", area: "South LA", localRisk: 1.28, theftRisk: "very high" },
    "90004": { county: "Los Angeles", area: "Los Feliz", localRisk: 1.05, theftRisk: "medium" },
    "90005": { county: "Los Angeles", area: "Koreatown", localRisk: 1.18, theftRisk: "high" },
    "90006": { county: "Los Angeles", area: "Westlake", localRisk: 1.22, theftRisk: "high" },
    "90007": { county: "Los Angeles", area: "University Park", localRisk: 1.20, theftRisk: "high" },
    "90008": { county: "Los Angeles", area: "Baldwin Hills", localRisk: 1.08, theftRisk: "medium" },
    "90010": { county: "Los Angeles", area: "Mid-Wilshire", localRisk: 1.12, theftRisk: "high" },
    "90011": { county: "Los Angeles", area: "South Central LA", localRisk: 1.32, theftRisk: "very high" },
    "90012": { county: "Los Angeles", area: "Downtown LA", localRisk: 1.25, theftRisk: "very high" },
    "90013": { county: "Los Angeles", area: "Downtown LA", localRisk: 1.25, theftRisk: "very high" },
    "90014": { county: "Los Angeles", area: "Downtown LA", localRisk: 1.24, theftRisk: "very high" },
    "90015": { county: "Los Angeles", area: "Downtown LA", localRisk: 1.22, theftRisk: "high" },
    "90016": { county: "Los Angeles", area: "West Adams", localRisk: 1.15, theftRisk: "high" },
    "90017": { county: "Los Angeles", area: "Downtown LA", localRisk: 1.20, theftRisk: "very high" },
    "90018": { county: "Los Angeles", area: "Jefferson Park", localRisk: 1.18, theftRisk: "high" },
    "90019": { county: "Los Angeles", area: "Mid-City", localRisk: 1.10, theftRisk: "medium" },
    "90020": { county: "Los Angeles", area: "Koreatown", localRisk: 1.15, theftRisk: "high" },
    "90022": { county: "Los Angeles", area: "East LA", localRisk: 1.25, theftRisk: "high" },
    "90023": { county: "Los Angeles", area: "East LA", localRisk: 1.28, theftRisk: "high" },
    "90024": { county: "Los Angeles", area: "Westwood", localRisk: 0.88, theftRisk: "medium" },
    "90025": { county: "Los Angeles", area: "West LA", localRisk: 0.90, theftRisk: "medium" },
    "90026": { county: "Los Angeles", area: "Echo Park", localRisk: 1.12, theftRisk: "high" },
    "90027": { county: "Los Angeles", area: "Los Feliz", localRisk: 1.02, theftRisk: "medium" },
    "90028": { county: "Los Angeles", area: "Hollywood", localRisk: 1.18, theftRisk: "very high" },
    "90029": { county: "Los Angeles", area: "Thai Town", localRisk: 1.15, theftRisk: "high" },
    "90031": { county: "Los Angeles", area: "Lincoln Heights", localRisk: 1.20, theftRisk: "high" },
    "90032": { county: "Los Angeles", area: "El Sereno", localRisk: 1.15, theftRisk: "high" },
    "90033": { county: "Los Angeles", area: "Boyle Heights", localRisk: 1.25, theftRisk: "high" },
    "90034": { county: "Los Angeles", area: "Palms", localRisk: 0.95, theftRisk: "medium" },
    "90035": { county: "Los Angeles", area: "Carthay", localRisk: 0.92, theftRisk: "medium" },
    "90036": { county: "Los Angeles", area: "Fairfax", localRisk: 1.02, theftRisk: "medium" },
    "90037": { county: "Los Angeles", area: "Vermont Square", localRisk: 1.28, theftRisk: "very high" },
    "90038": { county: "Los Angeles", area: "Hollywood", localRisk: 1.15, theftRisk: "high" },
    "90039": { county: "Los Angeles", area: "Silver Lake", localRisk: 1.00, theftRisk: "medium" },
    "90040": { county: "Los Angeles", area: "Commerce", localRisk: 1.18, theftRisk: "high" },
    "90041": { county: "Los Angeles", area: "Eagle Rock", localRisk: 0.98, theftRisk: "medium" },
    "90042": { county: "Los Angeles", area: "Highland Park", localRisk: 1.08, theftRisk: "medium" },
    "90043": { county: "Los Angeles", area: "View Park", localRisk: 1.12, theftRisk: "high" },
    "90044": { county: "Los Angeles", area: "Athens", localRisk: 1.28, theftRisk: "very high" },
    "90045": { county: "Los Angeles", area: "Westchester", localRisk: 0.95, theftRisk: "medium" },
    "90046": { county: "Los Angeles", area: "West Hollywood Hills", localRisk: 0.95, theftRisk: "medium" },
    "90047": { county: "Los Angeles", area: "South LA", localRisk: 1.25, theftRisk: "high" },
    "90048": { county: "Los Angeles", area: "Beverly Grove", localRisk: 0.95, theftRisk: "medium" },
    "90049": { county: "Los Angeles", area: "Brentwood", localRisk: 0.82, theftRisk: "low" },
    "90056": { county: "Los Angeles", area: "Ladera Heights", localRisk: 1.02, theftRisk: "medium" },
    "90057": { county: "Los Angeles", area: "Pico-Union", localRisk: 1.25, theftRisk: "high" },
    "90058": { county: "Los Angeles", area: "Vernon", localRisk: 1.20, theftRisk: "high" },
    "90059": { county: "Los Angeles", area: "Willowbrook", localRisk: 1.30, theftRisk: "very high" },
    "90061": { county: "Los Angeles", area: "Athens-Westmont", localRisk: 1.28, theftRisk: "very high" },
    "90062": { county: "Los Angeles", area: "South LA", localRisk: 1.22, theftRisk: "high" },
    "90063": { county: "Los Angeles", area: "East LA", localRisk: 1.22, theftRisk: "high" },
    "90064": { county: "Los Angeles", area: "Rancho Park", localRisk: 0.88, theftRisk: "low" },
    "90065": { county: "Los Angeles", area: "Cypress Park", localRisk: 1.10, theftRisk: "medium" },
    "90066": { county: "Los Angeles", area: "Mar Vista", localRisk: 0.92, theftRisk: "medium" },
    "90067": { county: "Los Angeles", area: "Century City", localRisk: 0.85, theftRisk: "medium" },
    "90068": { county: "Los Angeles", area: "Hollywood Hills", localRisk: 0.90, theftRisk: "medium" },
    "90069": { county: "Los Angeles", area: "West Hollywood", localRisk: 0.95, theftRisk: "medium" },
    "90071": { county: "Los Angeles", area: "Downtown LA", localRisk: 1.20, theftRisk: "high" },
    "90077": { county: "Los Angeles", area: "Bel Air", localRisk: 0.78, theftRisk: "low" },

    // San Fernando Valley
    "91201": { county: "Los Angeles", area: "Glendale", localRisk: 1.02, theftRisk: "medium" },
    "91202": { county: "Los Angeles", area: "Glendale", localRisk: 0.98, theftRisk: "medium" },
    "91203": { county: "Los Angeles", area: "Glendale", localRisk: 1.00, theftRisk: "medium" },
    "91204": { county: "Los Angeles", area: "Glendale", localRisk: 1.05, theftRisk: "medium" },
    "91205": { county: "Los Angeles", area: "Glendale", localRisk: 1.08, theftRisk: "medium" },
    "91206": { county: "Los Angeles", area: "Glendale", localRisk: 0.95, theftRisk: "low" },
    "91301": { county: "Los Angeles", area: "Agoura Hills", localRisk: 0.82, theftRisk: "low" },
    "91302": { county: "Los Angeles", area: "Calabasas", localRisk: 0.78, theftRisk: "low" },
    "91303": { county: "Los Angeles", area: "Canoga Park", localRisk: 1.12, theftRisk: "high" },
    "91304": { county: "Los Angeles", area: "Canoga Park", localRisk: 1.10, theftRisk: "high" },
    "91306": { county: "Los Angeles", area: "Winnetka", localRisk: 1.05, theftRisk: "medium" },
    "91307": { county: "Los Angeles", area: "West Hills", localRisk: 0.88, theftRisk: "low" },
    "91311": { county: "Los Angeles", area: "Chatsworth", localRisk: 0.92, theftRisk: "medium" },
    "91316": { county: "Los Angeles", area: "Encino", localRisk: 0.85, theftRisk: "low" },
    "91321": { county: "Los Angeles", area: "Newhall", localRisk: 0.90, theftRisk: "low" },
    "91324": { county: "Los Angeles", area: "Northridge", localRisk: 0.98, theftRisk: "medium" },
    "91325": { county: "Los Angeles", area: "Northridge", localRisk: 0.95, theftRisk: "medium" },
    "91326": { county: "Los Angeles", area: "Porter Ranch", localRisk: 0.82, theftRisk: "low" },
    "91330": { county: "Los Angeles", area: "Northridge (CSUN)", localRisk: 1.00, theftRisk: "medium" },
    "91331": { county: "Los Angeles", area: "Pacoima", localRisk: 1.22, theftRisk: "high" },
    "91335": { county: "Los Angeles", area: "Reseda", localRisk: 1.08, theftRisk: "medium" },
    "91340": { county: "Los Angeles", area: "San Fernando", localRisk: 1.18, theftRisk: "high" },
    "91342": { county: "Los Angeles", area: "Sylmar", localRisk: 1.10, theftRisk: "high" },
    "91343": { county: "Los Angeles", area: "North Hills", localRisk: 1.12, theftRisk: "high" },
    "91344": { county: "Los Angeles", area: "Granada Hills", localRisk: 0.90, theftRisk: "low" },
    "91345": { county: "Los Angeles", area: "Mission Hills", localRisk: 1.08, theftRisk: "medium" },
    "91350": { county: "Los Angeles", area: "Santa Clarita", localRisk: 0.82, theftRisk: "low" },
    "91351": { county: "Los Angeles", area: "Canyon Country", localRisk: 0.88, theftRisk: "low" },
    "91352": { county: "Los Angeles", area: "Sun Valley", localRisk: 1.15, theftRisk: "high" },
    "91354": { county: "Los Angeles", area: "Valencia", localRisk: 0.80, theftRisk: "low" },
    "91355": { county: "Los Angeles", area: "Valencia", localRisk: 0.80, theftRisk: "low" },
    "91356": { county: "Los Angeles", area: "Tarzana", localRisk: 0.90, theftRisk: "medium" },
    "91360": { county: "Ventura", area: "Thousand Oaks", localRisk: 0.78, theftRisk: "low" },
    "91361": { county: "Ventura", area: "Westlake Village", localRisk: 0.75, theftRisk: "low" },
    "91362": { county: "Ventura", area: "Thousand Oaks", localRisk: 0.78, theftRisk: "low" },
    "91364": { county: "Los Angeles", area: "Woodland Hills", localRisk: 0.88, theftRisk: "low" },
    "91367": { county: "Los Angeles", area: "Woodland Hills", localRisk: 0.88, theftRisk: "low" },
    "91381": { county: "Los Angeles", area: "Stevenson Ranch", localRisk: 0.80, theftRisk: "low" },
    "91384": { county: "Los Angeles", area: "Castaic", localRisk: 0.82, theftRisk: "low" },
    "91401": { county: "Los Angeles", area: "Van Nuys", localRisk: 1.12, theftRisk: "high" },
    "91402": { county: "Los Angeles", area: "Panorama City", localRisk: 1.22, theftRisk: "high" },
    "91403": { county: "Los Angeles", area: "Sherman Oaks", localRisk: 0.90, theftRisk: "medium" },
    "91405": { county: "Los Angeles", area: "Van Nuys", localRisk: 1.15, theftRisk: "high" },
    "91406": { county: "Los Angeles", area: "Van Nuys", localRisk: 1.10, theftRisk: "high" },
    "91411": { county: "Los Angeles", area: "Van Nuys", localRisk: 1.12, theftRisk: "high" },
    "91423": { county: "Los Angeles", area: "Sherman Oaks", localRisk: 0.88, theftRisk: "low" },
    "91436": { county: "Los Angeles", area: "Encino", localRisk: 0.82, theftRisk: "low" },
    "91501": { county: "Los Angeles", area: "Burbank", localRisk: 0.95, theftRisk: "medium" },
    "91502": { county: "Los Angeles", area: "Burbank", localRisk: 0.95, theftRisk: "medium" },
    "91504": { county: "Los Angeles", area: "Burbank", localRisk: 0.92, theftRisk: "medium" },
    "91505": { county: "Los Angeles", area: "Burbank", localRisk: 0.92, theftRisk: "medium" },
    "91506": { county: "Los Angeles", area: "Burbank", localRisk: 0.90, theftRisk: "low" },
    "91601": { county: "Los Angeles", area: "North Hollywood", localRisk: 1.10, theftRisk: "high" },
    "91602": { county: "Los Angeles", area: "North Hollywood", localRisk: 1.00, theftRisk: "medium" },
    "91604": { county: "Los Angeles", area: "Studio City", localRisk: 0.88, theftRisk: "medium" },
    "91605": { county: "Los Angeles", area: "North Hollywood", localRisk: 1.15, theftRisk: "high" },
    "91606": { county: "Los Angeles", area: "North Hollywood", localRisk: 1.12, theftRisk: "high" },
    "91607": { county: "Los Angeles", area: "Valley Village", localRisk: 0.95, theftRisk: "medium" },
    "91608": { county: "Los Angeles", area: "Universal City", localRisk: 0.92, theftRisk: "medium" },

    // South Bay / Beach Cities
    "90245": { county: "Los Angeles", area: "El Segundo", localRisk: 0.85, theftRisk: "low" },
    "90247": { county: "Los Angeles", area: "Gardena", localRisk: 1.15, theftRisk: "high" },
    "90248": { county: "Los Angeles", area: "Gardena", localRisk: 1.12, theftRisk: "high" },
    "90249": { county: "Los Angeles", area: "Gardena", localRisk: 1.15, theftRisk: "high" },
    "90250": { county: "Los Angeles", area: "Hawthorne", localRisk: 1.18, theftRisk: "high" },
    "90254": { county: "Los Angeles", area: "Hermosa Beach", localRisk: 0.82, theftRisk: "low" },
    "90260": { county: "Los Angeles", area: "Lawndale", localRisk: 1.12, theftRisk: "high" },
    "90261": { county: "Los Angeles", area: "Lawndale", localRisk: 1.10, theftRisk: "medium" },
    "90266": { county: "Los Angeles", area: "Manhattan Beach", localRisk: 0.78, theftRisk: "low" },
    "90274": { county: "Los Angeles", area: "Palos Verdes", localRisk: 0.72, theftRisk: "low" },
    "90275": { county: "Los Angeles", area: "Rancho Palos Verdes", localRisk: 0.72, theftRisk: "low" },
    "90277": { county: "Los Angeles", area: "Redondo Beach", localRisk: 0.85, theftRisk: "low" },
    "90278": { county: "Los Angeles", area: "Redondo Beach", localRisk: 0.85, theftRisk: "low" },
    "90291": { county: "Los Angeles", area: "Venice", localRisk: 1.02, theftRisk: "high" },
    "90292": { county: "Los Angeles", area: "Marina del Rey", localRisk: 0.88, theftRisk: "medium" },
    "90293": { county: "Los Angeles", area: "Playa del Rey", localRisk: 0.85, theftRisk: "low" },
    "90301": { county: "Los Angeles", area: "Inglewood", localRisk: 1.22, theftRisk: "high" },
    "90302": { county: "Los Angeles", area: "Inglewood", localRisk: 1.20, theftRisk: "high" },
    "90303": { county: "Los Angeles", area: "Inglewood", localRisk: 1.22, theftRisk: "high" },
    "90304": { county: "Los Angeles", area: "Lennox", localRisk: 1.25, theftRisk: "high" },
    "90401": { county: "Los Angeles", area: "Santa Monica", localRisk: 0.90, theftRisk: "medium" },
    "90402": { county: "Los Angeles", area: "Santa Monica", localRisk: 0.82, theftRisk: "low" },
    "90403": { county: "Los Angeles", area: "Santa Monica", localRisk: 0.88, theftRisk: "medium" },
    "90404": { county: "Los Angeles", area: "Santa Monica", localRisk: 0.92, theftRisk: "medium" },
    "90405": { county: "Los Angeles", area: "Santa Monica", localRisk: 0.90, theftRisk: "medium" },
    "90501": { county: "Los Angeles", area: "Torrance", localRisk: 0.88, theftRisk: "medium" },
    "90502": { county: "Los Angeles", area: "Torrance", localRisk: 0.90, theftRisk: "medium" },
    "90503": { county: "Los Angeles", area: "Torrance", localRisk: 0.85, theftRisk: "low" },
    "90504": { county: "Los Angeles", area: "Torrance", localRisk: 0.88, theftRisk: "low" },
    "90505": { county: "Los Angeles", area: "Torrance", localRisk: 0.82, theftRisk: "low" },

    // Long Beach / Southeast LA
    "90706": { county: "Los Angeles", area: "Bellflower", localRisk: 1.12, theftRisk: "high" },
    "90712": { county: "Los Angeles", area: "Lakewood", localRisk: 0.98, theftRisk: "medium" },
    "90713": { county: "Los Angeles", area: "Lakewood", localRisk: 0.95, theftRisk: "medium" },
    "90715": { county: "Los Angeles", area: "Lakewood", localRisk: 0.98, theftRisk: "medium" },
    "90716": { county: "Los Angeles", area: "Hawaiian Gardens", localRisk: 1.15, theftRisk: "high" },
    "90717": { county: "Los Angeles", area: "Lomita", localRisk: 0.92, theftRisk: "medium" },
    "90731": { county: "Los Angeles", area: "San Pedro", localRisk: 1.05, theftRisk: "medium" },
    "90732": { county: "Los Angeles", area: "San Pedro", localRisk: 0.95, theftRisk: "medium" },
    "90740": { county: "Orange", area: "Seal Beach", localRisk: 0.80, theftRisk: "low" },
    "90744": { county: "Los Angeles", area: "Wilmington", localRisk: 1.22, theftRisk: "high" },
    "90745": { county: "Los Angeles", area: "Carson", localRisk: 1.10, theftRisk: "high" },
    "90746": { county: "Los Angeles", area: "Carson", localRisk: 1.10, theftRisk: "high" },
    "90802": { county: "Los Angeles", area: "Long Beach", localRisk: 1.18, theftRisk: "high" },
    "90803": { county: "Los Angeles", area: "Long Beach (Belmont Shore)", localRisk: 0.95, theftRisk: "medium" },
    "90804": { county: "Los Angeles", area: "Long Beach", localRisk: 1.10, theftRisk: "high" },
    "90805": { county: "Los Angeles", area: "North Long Beach", localRisk: 1.25, theftRisk: "very high" },
    "90806": { county: "Los Angeles", area: "Long Beach", localRisk: 1.12, theftRisk: "high" },
    "90807": { county: "Los Angeles", area: "Long Beach (Bixby Knolls)", localRisk: 1.00, theftRisk: "medium" },
    "90808": { county: "Los Angeles", area: "Long Beach (East)", localRisk: 0.92, theftRisk: "medium" },
    "90810": { county: "Los Angeles", area: "Long Beach", localRisk: 1.15, theftRisk: "high" },
    "90813": { county: "Los Angeles", area: "Long Beach", localRisk: 1.22, theftRisk: "high" },
    "90814": { county: "Los Angeles", area: "Long Beach (Alamitos Beach)", localRisk: 1.00, theftRisk: "medium" },
    "90815": { county: "Los Angeles", area: "Long Beach (East)", localRisk: 0.90, theftRisk: "low" },

    // San Gabriel Valley / Eastside
    "91001": { county: "Los Angeles", area: "Altadena", localRisk: 0.95, theftRisk: "medium" },
    "91006": { county: "Los Angeles", area: "Arcadia", localRisk: 0.85, theftRisk: "low" },
    "91007": { county: "Los Angeles", area: "Arcadia", localRisk: 0.85, theftRisk: "low" },
    "91010": { county: "Los Angeles", area: "Duarte", localRisk: 0.95, theftRisk: "medium" },
    "91011": { county: "Los Angeles", area: "La Canada Flintridge", localRisk: 0.75, theftRisk: "low" },
    "91016": { county: "Los Angeles", area: "Monrovia", localRisk: 0.92, theftRisk: "medium" },
    "91024": { county: "Los Angeles", area: "Sierra Madre", localRisk: 0.78, theftRisk: "low" },
    "91030": { county: "Los Angeles", area: "South Pasadena", localRisk: 0.85, theftRisk: "low" },
    "91101": { county: "Los Angeles", area: "Pasadena", localRisk: 0.95, theftRisk: "medium" },
    "91103": { county: "Los Angeles", area: "Pasadena", localRisk: 1.05, theftRisk: "medium" },
    "91104": { county: "Los Angeles", area: "Pasadena", localRisk: 0.98, theftRisk: "medium" },
    "91105": { county: "Los Angeles", area: "Pasadena", localRisk: 0.82, theftRisk: "low" },
    "91106": { county: "Los Angeles", area: "Pasadena", localRisk: 0.85, theftRisk: "low" },
    "91107": { county: "Los Angeles", area: "Pasadena", localRisk: 0.88, theftRisk: "low" },
    "91108": { county: "Los Angeles", area: "San Marino", localRisk: 0.75, theftRisk: "low" },

    // Pomona Valley / East SGV
    "91701": { county: "San Bernardino", area: "Rancho Cucamonga", localRisk: 0.88, theftRisk: "medium" },
    "91709": { county: "San Bernardino", area: "Chino Hills", localRisk: 0.82, theftRisk: "low" },
    "91710": { county: "San Bernardino", area: "Chino", localRisk: 1.02, theftRisk: "medium" },
    "91730": { county: "San Bernardino", area: "Rancho Cucamonga", localRisk: 0.90, theftRisk: "medium" },
    "91737": { county: "San Bernardino", area: "Rancho Cucamonga", localRisk: 0.85, theftRisk: "low" },
    "91739": { county: "San Bernardino", area: "Rancho Cucamonga", localRisk: 0.85, theftRisk: "low" },
    "91740": { county: "Los Angeles", area: "Glendora", localRisk: 0.85, theftRisk: "low" },
    "91741": { county: "Los Angeles", area: "Glendora", localRisk: 0.82, theftRisk: "low" },
    "91750": { county: "Los Angeles", area: "La Verne", localRisk: 0.85, theftRisk: "low" },
    "91761": { county: "San Bernardino", area: "Ontario", localRisk: 1.12, theftRisk: "high" },
    "91762": { county: "San Bernardino", area: "Ontario", localRisk: 1.10, theftRisk: "high" },
    "91763": { county: "Los Angeles", area: "Montclair", localRisk: 1.05, theftRisk: "medium" },
    "91764": { county: "San Bernardino", area: "Ontario", localRisk: 1.05, theftRisk: "medium" },
    "91766": { county: "Los Angeles", area: "Pomona", localRisk: 1.18, theftRisk: "high" },
    "91767": { county: "Los Angeles", area: "Pomona", localRisk: 1.12, theftRisk: "high" },
    "91768": { county: "Los Angeles", area: "Pomona", localRisk: 1.15, theftRisk: "high" },
    "91786": { county: "Los Angeles", area: "Upland", localRisk: 0.92, theftRisk: "medium" },
    "91789": { county: "Los Angeles", area: "Walnut", localRisk: 0.82, theftRisk: "low" },

    // Beverly Hills / West Side
    "90210": { county: "Los Angeles", area: "Beverly Hills", localRisk: 0.78, theftRisk: "medium" },
    "90211": { county: "Los Angeles", area: "Beverly Hills", localRisk: 0.82, theftRisk: "medium" },
    "90212": { county: "Los Angeles", area: "Beverly Hills", localRisk: 0.80, theftRisk: "medium" },
    "90230": { county: "Los Angeles", area: "Culver City", localRisk: 0.95, theftRisk: "medium" },
    "90232": { county: "Los Angeles", area: "Culver City", localRisk: 0.92, theftRisk: "medium" },

    // Whittier / Southeast
    "90601": { county: "Los Angeles", area: "Whittier", localRisk: 1.00, theftRisk: "medium" },
    "90602": { county: "Los Angeles", area: "Whittier", localRisk: 0.95, theftRisk: "medium" },
    "90603": { county: "Los Angeles", area: "Whittier", localRisk: 0.88, theftRisk: "low" },
    "90604": { county: "Los Angeles", area: "Whittier", localRisk: 0.92, theftRisk: "medium" },
    "90605": { county: "Los Angeles", area: "Whittier", localRisk: 0.95, theftRisk: "medium" },
    "90606": { county: "Los Angeles", area: "Whittier", localRisk: 1.00, theftRisk: "medium" },
    "90620": { county: "Orange", area: "Buena Park", localRisk: 1.05, theftRisk: "medium" },
    "90621": { county: "Orange", area: "Buena Park", localRisk: 1.02, theftRisk: "medium" },
    "90630": { county: "Orange", area: "Cypress", localRisk: 0.90, theftRisk: "low" },
    "90631": { county: "Los Angeles", area: "La Habra", localRisk: 0.95, theftRisk: "medium" },
    "90638": { county: "Los Angeles", area: "La Mirada", localRisk: 0.90, theftRisk: "low" },
    "90650": { county: "Los Angeles", area: "Norwalk", localRisk: 1.12, theftRisk: "high" },
    "90660": { county: "Los Angeles", area: "Pico Rivera", localRisk: 1.10, theftRisk: "high" },
    "90670": { county: "Los Angeles", area: "Santa Fe Springs", localRisk: 1.05, theftRisk: "medium" },

    // --- ORANGE COUNTY ---
    "92602": { county: "Orange", area: "Irvine", localRisk: 0.75, theftRisk: "low" },
    "92603": { county: "Orange", area: "Irvine (Turtle Rock)", localRisk: 0.70, theftRisk: "low" },
    "92604": { county: "Orange", area: "Irvine", localRisk: 0.78, theftRisk: "low" },
    "92606": { county: "Orange", area: "Irvine", localRisk: 0.78, theftRisk: "low" },
    "92610": { county: "Orange", area: "Foothill Ranch", localRisk: 0.75, theftRisk: "low" },
    "92612": { county: "Orange", area: "Irvine (UCI)", localRisk: 0.80, theftRisk: "low" },
    "92614": { county: "Orange", area: "Irvine", localRisk: 0.78, theftRisk: "low" },
    "92618": { county: "Orange", area: "Irvine (Spectrum)", localRisk: 0.78, theftRisk: "low" },
    "92620": { county: "Orange", area: "Irvine (Northwood)", localRisk: 0.75, theftRisk: "low" },
    "92624": { county: "Orange", area: "Capistrano Beach", localRisk: 0.82, theftRisk: "low" },
    "92625": { county: "Orange", area: "Corona del Mar", localRisk: 0.72, theftRisk: "low" },
    "92626": { county: "Orange", area: "Costa Mesa", localRisk: 0.95, theftRisk: "medium" },
    "92627": { county: "Orange", area: "Costa Mesa", localRisk: 0.98, theftRisk: "medium" },
    "92630": { county: "Orange", area: "Lake Forest", localRisk: 0.82, theftRisk: "low" },
    "92637": { county: "Orange", area: "Laguna Woods", localRisk: 0.78, theftRisk: "low" },
    "92646": { county: "Orange", area: "Huntington Beach", localRisk: 0.85, theftRisk: "low" },
    "92647": { county: "Orange", area: "Huntington Beach", localRisk: 0.88, theftRisk: "medium" },
    "92648": { county: "Orange", area: "Huntington Beach", localRisk: 0.85, theftRisk: "low" },
    "92649": { county: "Orange", area: "Huntington Beach", localRisk: 0.82, theftRisk: "low" },
    "92651": { county: "Orange", area: "Laguna Beach", localRisk: 0.75, theftRisk: "low" },
    "92653": { county: "Orange", area: "Laguna Hills", localRisk: 0.80, theftRisk: "low" },
    "92655": { county: "Orange", area: "Midway City", localRisk: 1.02, theftRisk: "medium" },
    "92656": { county: "Orange", area: "Aliso Viejo", localRisk: 0.78, theftRisk: "low" },
    "92657": { county: "Orange", area: "Newport Coast", localRisk: 0.70, theftRisk: "low" },
    "92660": { county: "Orange", area: "Newport Beach", localRisk: 0.72, theftRisk: "low" },
    "92661": { county: "Orange", area: "Newport Beach (Balboa)", localRisk: 0.78, theftRisk: "low" },
    "92663": { county: "Orange", area: "Newport Beach", localRisk: 0.75, theftRisk: "low" },
    "92672": { county: "Orange", area: "San Clemente", localRisk: 0.80, theftRisk: "low" },
    "92673": { county: "Orange", area: "San Clemente", localRisk: 0.80, theftRisk: "low" },
    "92675": { county: "Orange", area: "San Juan Capistrano", localRisk: 0.82, theftRisk: "low" },
    "92677": { county: "Orange", area: "Laguna Niguel", localRisk: 0.78, theftRisk: "low" },
    "92679": { county: "Orange", area: "Coto de Caza", localRisk: 0.72, theftRisk: "low" },
    "92688": { county: "Orange", area: "Rancho Santa Margarita", localRisk: 0.78, theftRisk: "low" },
    "92691": { county: "Orange", area: "Mission Viejo", localRisk: 0.80, theftRisk: "low" },
    "92692": { county: "Orange", area: "Mission Viejo", localRisk: 0.78, theftRisk: "low" },
    "92701": { county: "Orange", area: "Santa Ana", localRisk: 1.25, theftRisk: "very high" },
    "92703": { county: "Orange", area: "Santa Ana", localRisk: 1.20, theftRisk: "high" },
    "92704": { county: "Orange", area: "Santa Ana", localRisk: 1.18, theftRisk: "high" },
    "92705": { county: "Orange", area: "Santa Ana", localRisk: 0.90, theftRisk: "medium" },
    "92706": { county: "Orange", area: "Santa Ana", localRisk: 1.10, theftRisk: "high" },
    "92707": { county: "Orange", area: "Santa Ana", localRisk: 1.22, theftRisk: "high" },
    "92708": { county: "Orange", area: "Fountain Valley", localRisk: 0.88, theftRisk: "low" },
    "92780": { county: "Orange", area: "Tustin", localRisk: 0.92, theftRisk: "medium" },
    "92782": { county: "Orange", area: "Tustin Ranch", localRisk: 0.82, theftRisk: "low" },
    "92801": { county: "Orange", area: "Anaheim", localRisk: 1.12, theftRisk: "high" },
    "92802": { county: "Orange", area: "Anaheim (Resort)", localRisk: 1.08, theftRisk: "high" },
    "92804": { county: "Orange", area: "Anaheim", localRisk: 1.10, theftRisk: "high" },
    "92805": { county: "Orange", area: "Anaheim", localRisk: 1.15, theftRisk: "high" },
    "92806": { county: "Orange", area: "Anaheim", localRisk: 1.05, theftRisk: "medium" },
    "92807": { county: "Orange", area: "Anaheim Hills", localRisk: 0.82, theftRisk: "low" },
    "92808": { county: "Orange", area: "Anaheim Hills", localRisk: 0.80, theftRisk: "low" },
    "92821": { county: "Orange", area: "Brea", localRisk: 0.85, theftRisk: "low" },
    "92831": { county: "Orange", area: "Fullerton", localRisk: 0.92, theftRisk: "medium" },
    "92832": { county: "Orange", area: "Fullerton", localRisk: 0.98, theftRisk: "medium" },
    "92833": { county: "Orange", area: "Fullerton", localRisk: 0.95, theftRisk: "medium" },
    "92835": { county: "Orange", area: "Fullerton", localRisk: 0.88, theftRisk: "low" },
    "92840": { county: "Orange", area: "Garden Grove", localRisk: 1.08, theftRisk: "high" },
    "92841": { county: "Orange", area: "Garden Grove", localRisk: 1.05, theftRisk: "medium" },
    "92843": { county: "Orange", area: "Garden Grove", localRisk: 1.10, theftRisk: "high" },
    "92844": { county: "Orange", area: "Garden Grove", localRisk: 1.08, theftRisk: "medium" },
    "92845": { county: "Orange", area: "Garden Grove", localRisk: 0.98, theftRisk: "medium" },
    "92860": { county: "Riverside", area: "Norco", localRisk: 0.88, theftRisk: "medium" },
    "92861": { county: "Orange", area: "Villa Park", localRisk: 0.78, theftRisk: "low" },
    "92865": { county: "Orange", area: "Orange", localRisk: 0.90, theftRisk: "medium" },
    "92866": { county: "Orange", area: "Orange", localRisk: 0.92, theftRisk: "medium" },
    "92867": { county: "Orange", area: "Orange", localRisk: 0.88, theftRisk: "low" },
    "92868": { county: "Orange", area: "Orange", localRisk: 1.00, theftRisk: "medium" },
    "92869": { county: "Orange", area: "Orange", localRisk: 0.85, theftRisk: "low" },
    "92870": { county: "Orange", area: "Placentia", localRisk: 0.90, theftRisk: "medium" },
    "92886": { county: "Orange", area: "Yorba Linda", localRisk: 0.78, theftRisk: "low" },
    "92887": { county: "Orange", area: "Yorba Linda", localRisk: 0.78, theftRisk: "low" },

    // --- SAN DIEGO COUNTY ---
    "92101": { county: "San Diego", area: "Downtown San Diego", localRisk: 1.15, theftRisk: "high" },
    "92102": { county: "San Diego", area: "Golden Hill", localRisk: 1.12, theftRisk: "high" },
    "92103": { county: "San Diego", area: "Hillcrest", localRisk: 1.00, theftRisk: "medium" },
    "92104": { county: "San Diego", area: "North Park", localRisk: 1.02, theftRisk: "medium" },
    "92105": { county: "San Diego", area: "City Heights", localRisk: 1.22, theftRisk: "high" },
    "92106": { county: "San Diego", area: "Point Loma", localRisk: 0.88, theftRisk: "low" },
    "92107": { county: "San Diego", area: "Ocean Beach", localRisk: 0.92, theftRisk: "medium" },
    "92108": { county: "San Diego", area: "Mission Valley", localRisk: 0.98, theftRisk: "medium" },
    "92109": { county: "San Diego", area: "Pacific Beach", localRisk: 0.95, theftRisk: "medium" },
    "92110": { county: "San Diego", area: "Morena", localRisk: 0.95, theftRisk: "medium" },
    "92111": { county: "San Diego", area: "Linda Vista", localRisk: 1.02, theftRisk: "medium" },
    "92113": { county: "San Diego", area: "Logan Heights", localRisk: 1.28, theftRisk: "very high" },
    "92114": { county: "San Diego", area: "Encanto", localRisk: 1.18, theftRisk: "high" },
    "92115": { county: "San Diego", area: "College Area", localRisk: 1.05, theftRisk: "medium" },
    "92116": { county: "San Diego", area: "Normal Heights", localRisk: 0.98, theftRisk: "medium" },
    "92117": { county: "San Diego", area: "Clairemont", localRisk: 0.92, theftRisk: "medium" },
    "92118": { county: "San Diego", area: "Coronado", localRisk: 0.72, theftRisk: "low" },
    "92119": { county: "San Diego", area: "San Carlos", localRisk: 0.88, theftRisk: "low" },
    "92120": { county: "San Diego", area: "Del Cerro", localRisk: 0.88, theftRisk: "low" },
    "92121": { county: "San Diego", area: "Sorrento Valley", localRisk: 0.82, theftRisk: "low" },
    "92122": { county: "San Diego", area: "University City", localRisk: 0.85, theftRisk: "low" },
    "92123": { county: "San Diego", area: "Serra Mesa", localRisk: 0.95, theftRisk: "medium" },
    "92124": { county: "San Diego", area: "Tierrasanta", localRisk: 0.85, theftRisk: "low" },
    "92126": { county: "San Diego", area: "Mira Mesa", localRisk: 0.90, theftRisk: "medium" },
    "92127": { county: "San Diego", area: "Rancho Bernardo", localRisk: 0.78, theftRisk: "low" },
    "92128": { county: "San Diego", area: "Rancho Bernardo", localRisk: 0.78, theftRisk: "low" },
    "92129": { county: "San Diego", area: "Rancho Penasquitos", localRisk: 0.80, theftRisk: "low" },
    "92130": { county: "San Diego", area: "Carmel Valley", localRisk: 0.75, theftRisk: "low" },
    "92131": { county: "San Diego", area: "Scripps Ranch", localRisk: 0.78, theftRisk: "low" },
    "92139": { county: "San Diego", area: "Paradise Hills", localRisk: 1.12, theftRisk: "high" },
    "92154": { county: "San Diego", area: "Otay Mesa", localRisk: 1.15, theftRisk: "high" },
    "92173": { county: "San Diego", area: "San Ysidro", localRisk: 1.20, theftRisk: "high" },

    // North County San Diego
    "92008": { county: "San Diego", area: "Carlsbad", localRisk: 0.80, theftRisk: "low" },
    "92009": { county: "San Diego", area: "Carlsbad", localRisk: 0.78, theftRisk: "low" },
    "92010": { county: "San Diego", area: "Carlsbad", localRisk: 0.80, theftRisk: "low" },
    "92011": { county: "San Diego", area: "Carlsbad", localRisk: 0.78, theftRisk: "low" },
    "92014": { county: "San Diego", area: "Del Mar", localRisk: 0.72, theftRisk: "low" },
    "92024": { county: "San Diego", area: "Encinitas", localRisk: 0.78, theftRisk: "low" },
    "92025": { county: "San Diego", area: "Escondido", localRisk: 1.02, theftRisk: "medium" },
    "92026": { county: "San Diego", area: "Escondido", localRisk: 1.00, theftRisk: "medium" },
    "92027": { county: "San Diego", area: "Escondido", localRisk: 1.05, theftRisk: "medium" },
    "92028": { county: "San Diego", area: "Fallbrook", localRisk: 0.88, theftRisk: "low" },
    "92029": { county: "San Diego", area: "Escondido", localRisk: 0.92, theftRisk: "medium" },
    "92054": { county: "San Diego", area: "Oceanside", localRisk: 0.98, theftRisk: "medium" },
    "92056": { county: "San Diego", area: "Oceanside", localRisk: 0.95, theftRisk: "medium" },
    "92057": { county: "San Diego", area: "Oceanside", localRisk: 0.98, theftRisk: "medium" },
    "92058": { county: "San Diego", area: "Oceanside", localRisk: 1.02, theftRisk: "medium" },
    "92064": { county: "San Diego", area: "Poway", localRisk: 0.78, theftRisk: "low" },
    "92069": { county: "San Diego", area: "San Marcos", localRisk: 0.88, theftRisk: "low" },
    "92071": { county: "San Diego", area: "Santee", localRisk: 0.88, theftRisk: "low" },
    "92075": { county: "San Diego", area: "Solana Beach", localRisk: 0.75, theftRisk: "low" },
    "92078": { county: "San Diego", area: "San Marcos", localRisk: 0.85, theftRisk: "low" },
    "92083": { county: "San Diego", area: "Vista", localRisk: 1.00, theftRisk: "medium" },
    "92084": { county: "San Diego", area: "Vista", localRisk: 0.98, theftRisk: "medium" },

    // --- RIVERSIDE COUNTY ---
    "92201": { county: "Riverside", area: "Indio", localRisk: 1.10, theftRisk: "high" },
    "92203": { county: "Riverside", area: "Indio", localRisk: 1.05, theftRisk: "medium" },
    "92210": { county: "Riverside", area: "Indian Wells", localRisk: 0.72, theftRisk: "low" },
    "92211": { county: "Riverside", area: "Palm Desert", localRisk: 0.82, theftRisk: "low" },
    "92220": { county: "Riverside", area: "Banning", localRisk: 1.05, theftRisk: "medium" },
    "92223": { county: "Riverside", area: "Beaumont", localRisk: 0.92, theftRisk: "medium" },
    "92234": { county: "Riverside", area: "Cathedral City", localRisk: 1.08, theftRisk: "medium" },
    "92236": { county: "Riverside", area: "Coachella", localRisk: 1.15, theftRisk: "high" },
    "92240": { county: "Riverside", area: "Desert Hot Springs", localRisk: 1.12, theftRisk: "high" },
    "92253": { county: "Riverside", area: "La Quinta", localRisk: 0.80, theftRisk: "low" },
    "92260": { county: "Riverside", area: "Palm Desert", localRisk: 0.82, theftRisk: "low" },
    "92262": { county: "Riverside", area: "Palm Springs", localRisk: 0.92, theftRisk: "medium" },
    "92264": { county: "Riverside", area: "Palm Springs", localRisk: 0.88, theftRisk: "low" },
    "92270": { county: "Riverside", area: "Rancho Mirage", localRisk: 0.78, theftRisk: "low" },
    "92276": { county: "Riverside", area: "Thousand Palms", localRisk: 1.00, theftRisk: "medium" },
    "92501": { county: "Riverside", area: "Riverside", localRisk: 1.15, theftRisk: "high" },
    "92503": { county: "Riverside", area: "Riverside (Arlington)", localRisk: 1.08, theftRisk: "medium" },
    "92504": { county: "Riverside", area: "Riverside", localRisk: 1.05, theftRisk: "medium" },
    "92505": { county: "Riverside", area: "Riverside", localRisk: 1.10, theftRisk: "high" },
    "92506": { county: "Riverside", area: "Riverside (Canyon Crest)", localRisk: 0.88, theftRisk: "low" },
    "92507": { county: "Riverside", area: "Riverside", localRisk: 1.08, theftRisk: "medium" },
    "92508": { county: "Riverside", area: "Riverside (Mission Grove)", localRisk: 0.95, theftRisk: "medium" },
    "92530": { county: "Riverside", area: "Lake Elsinore", localRisk: 1.00, theftRisk: "medium" },
    "92532": { county: "Riverside", area: "Lake Elsinore", localRisk: 0.95, theftRisk: "medium" },
    "92536": { county: "Riverside", area: "Aguanga", localRisk: 0.85, theftRisk: "low" },
    "92543": { county: "Riverside", area: "Hemet", localRisk: 1.05, theftRisk: "medium" },
    "92544": { county: "Riverside", area: "Hemet", localRisk: 1.02, theftRisk: "medium" },
    "92545": { county: "Riverside", area: "Hemet", localRisk: 1.00, theftRisk: "medium" },
    "92551": { county: "Riverside", area: "Moreno Valley", localRisk: 1.15, theftRisk: "high" },
    "92553": { county: "Riverside", area: "Moreno Valley", localRisk: 1.12, theftRisk: "high" },
    "92555": { county: "Riverside", area: "Moreno Valley", localRisk: 1.08, theftRisk: "medium" },
    "92557": { county: "Riverside", area: "Moreno Valley", localRisk: 1.10, theftRisk: "high" },
    "92562": { county: "Riverside", area: "Murrieta", localRisk: 0.85, theftRisk: "low" },
    "92563": { county: "Riverside", area: "Murrieta", localRisk: 0.85, theftRisk: "low" },
    "92570": { county: "Riverside", area: "Perris", localRisk: 1.10, theftRisk: "high" },
    "92571": { county: "Riverside", area: "Perris", localRisk: 1.12, theftRisk: "high" },
    "92582": { county: "Riverside", area: "San Jacinto", localRisk: 1.00, theftRisk: "medium" },
    "92583": { county: "Riverside", area: "San Jacinto", localRisk: 1.00, theftRisk: "medium" },
    "92585": { county: "Riverside", area: "Menifee", localRisk: 0.92, theftRisk: "medium" },
    "92586": { county: "Riverside", area: "Menifee", localRisk: 0.92, theftRisk: "medium" },
    "92587": { county: "Riverside", area: "Menifee", localRisk: 0.90, theftRisk: "low" },
    "92590": { county: "Riverside", area: "Temecula", localRisk: 0.82, theftRisk: "low" },
    "92591": { county: "Riverside", area: "Temecula", localRisk: 0.82, theftRisk: "low" },
    "92592": { county: "Riverside", area: "Temecula", localRisk: 0.82, theftRisk: "low" },
    "92596": { county: "Riverside", area: "Winchester", localRisk: 0.88, theftRisk: "low" },

    // --- SAN BERNARDINO COUNTY ---
    "91784": { county: "San Bernardino", area: "Upland", localRisk: 0.90, theftRisk: "medium" },
    "92307": { county: "San Bernardino", area: "Apple Valley", localRisk: 0.98, theftRisk: "medium" },
    "92308": { county: "San Bernardino", area: "Apple Valley", localRisk: 0.98, theftRisk: "medium" },
    "92313": { county: "San Bernardino", area: "Grand Terrace", localRisk: 0.95, theftRisk: "medium" },
    "92316": { county: "San Bernardino", area: "Bloomington", localRisk: 1.12, theftRisk: "high" },
    "92324": { county: "San Bernardino", area: "Colton", localRisk: 1.10, theftRisk: "high" },
    "92335": { county: "San Bernardino", area: "Fontana", localRisk: 1.15, theftRisk: "high" },
    "92336": { county: "San Bernardino", area: "Fontana", localRisk: 1.05, theftRisk: "medium" },
    "92337": { county: "San Bernardino", area: "Fontana", localRisk: 1.08, theftRisk: "medium" },
    "92345": { county: "San Bernardino", area: "Hesperia", localRisk: 1.05, theftRisk: "medium" },
    "92346": { county: "San Bernardino", area: "Highland", localRisk: 1.02, theftRisk: "medium" },
    "92352": { county: "San Bernardino", area: "Lake Arrowhead", localRisk: 0.78, theftRisk: "low" },
    "92354": { county: "San Bernardino", area: "Loma Linda", localRisk: 0.92, theftRisk: "medium" },
    "92371": { county: "San Bernardino", area: "Phelan", localRisk: 0.90, theftRisk: "low" },
    "92373": { county: "San Bernardino", area: "Redlands", localRisk: 0.88, theftRisk: "low" },
    "92374": { county: "San Bernardino", area: "Redlands", localRisk: 0.90, theftRisk: "medium" },
    "92376": { county: "San Bernardino", area: "Rialto", localRisk: 1.15, theftRisk: "high" },
    "92377": { county: "San Bernardino", area: "Rialto", localRisk: 1.10, theftRisk: "high" },
    "92392": { county: "San Bernardino", area: "Victorville", localRisk: 1.12, theftRisk: "high" },
    "92394": { county: "San Bernardino", area: "Victorville", localRisk: 1.10, theftRisk: "high" },
    "92395": { county: "San Bernardino", area: "Victorville", localRisk: 1.08, theftRisk: "medium" },
    "92399": { county: "San Bernardino", area: "Yucaipa", localRisk: 0.88, theftRisk: "low" },
    "92401": { county: "San Bernardino", area: "San Bernardino", localRisk: 1.25, theftRisk: "very high" },
    "92404": { county: "San Bernardino", area: "San Bernardino", localRisk: 1.18, theftRisk: "high" },
    "92405": { county: "San Bernardino", area: "San Bernardino", localRisk: 1.20, theftRisk: "high" },
    "92407": { county: "San Bernardino", area: "San Bernardino", localRisk: 1.10, theftRisk: "high" },
    "92408": { county: "San Bernardino", area: "San Bernardino", localRisk: 1.18, theftRisk: "high" },
    "92410": { county: "San Bernardino", area: "San Bernardino", localRisk: 1.28, theftRisk: "very high" },
    "92411": { county: "San Bernardino", area: "San Bernardino", localRisk: 1.25, theftRisk: "very high" },

    // --- VENTURA COUNTY ---
    "93001": { county: "Ventura", area: "Ventura", localRisk: 0.92, theftRisk: "medium" },
    "93003": { county: "Ventura", area: "Ventura", localRisk: 0.88, theftRisk: "low" },
    "93004": { county: "Ventura", area: "Ventura", localRisk: 0.90, theftRisk: "low" },
    "93010": { county: "Ventura", area: "Camarillo", localRisk: 0.82, theftRisk: "low" },
    "93012": { county: "Ventura", area: "Camarillo", localRisk: 0.80, theftRisk: "low" },
    "93015": { county: "Ventura", area: "Fillmore", localRisk: 0.95, theftRisk: "medium" },
    "93021": { county: "Ventura", area: "Moorpark", localRisk: 0.80, theftRisk: "low" },
    "93030": { county: "Ventura", area: "Oxnard", localRisk: 1.12, theftRisk: "high" },
    "93033": { county: "Ventura", area: "Oxnard", localRisk: 1.15, theftRisk: "high" },
    "93035": { county: "Ventura", area: "Oxnard", localRisk: 1.05, theftRisk: "medium" },
    "93036": { county: "Ventura", area: "Oxnard", localRisk: 1.08, theftRisk: "medium" },
    "93040": { county: "Ventura", area: "Santa Paula", localRisk: 0.95, theftRisk: "medium" },
    "93060": { county: "Ventura", area: "Santa Paula", localRisk: 0.95, theftRisk: "medium" },
    "93063": { county: "Ventura", area: "Simi Valley", localRisk: 0.82, theftRisk: "low" },
    "93065": { county: "Ventura", area: "Simi Valley", localRisk: 0.80, theftRisk: "low" },

    // --- KERN COUNTY (Southern portion) ---
    "93301": { county: "Kern", area: "Bakersfield", localRisk: 1.12, theftRisk: "high" },
    "93304": { county: "Kern", area: "Bakersfield", localRisk: 1.15, theftRisk: "high" },
    "93305": { county: "Kern", area: "Bakersfield", localRisk: 1.20, theftRisk: "high" },
    "93306": { county: "Kern", area: "Bakersfield", localRisk: 1.05, theftRisk: "medium" },
    "93307": { county: "Kern", area: "Bakersfield", localRisk: 1.18, theftRisk: "high" },
    "93309": { county: "Kern", area: "Bakersfield", localRisk: 1.00, theftRisk: "medium" },
    "93311": { county: "Kern", area: "Bakersfield", localRisk: 0.85, theftRisk: "low" },
    "93312": { county: "Kern", area: "Bakersfield", localRisk: 0.82, theftRisk: "low" },
    "93313": { county: "Kern", area: "Bakersfield", localRisk: 0.92, theftRisk: "medium" },
    "93314": { county: "Kern", area: "Bakersfield", localRisk: 0.80, theftRisk: "low" },

    // --- SANTA BARBARA COUNTY ---
    "93101": { county: "Santa Barbara", area: "Santa Barbara (Downtown)", localRisk: 0.98, theftRisk: "medium" },
    "93103": { county: "Santa Barbara", area: "Santa Barbara (East)", localRisk: 0.92, theftRisk: "low" },
    "93105": { county: "Santa Barbara", area: "Santa Barbara (Mission)", localRisk: 0.82, theftRisk: "low" },
    "93108": { county: "Santa Barbara", area: "Montecito", localRisk: 0.72, theftRisk: "low" },
    "93109": { county: "Santa Barbara", area: "Santa Barbara (Mesa)", localRisk: 0.88, theftRisk: "low" },
    "93110": { county: "Santa Barbara", area: "Santa Barbara", localRisk: 0.90, theftRisk: "low" },
    "93111": { county: "Santa Barbara", area: "Santa Barbara", localRisk: 0.88, theftRisk: "low" },
    "93117": { county: "Santa Barbara", area: "Goleta", localRisk: 0.85, theftRisk: "low" },
    "93436": { county: "Santa Barbara", area: "Lompoc", localRisk: 1.05, theftRisk: "medium" },
    "93454": { county: "Santa Barbara", area: "Santa Maria", localRisk: 1.10, theftRisk: "medium" },
    "93455": { county: "Santa Barbara", area: "Santa Maria", localRisk: 1.05, theftRisk: "medium" },
    "93458": { county: "Santa Barbara", area: "Santa Maria", localRisk: 1.12, theftRisk: "medium" },

    // --- SAN LUIS OBISPO COUNTY ---
    "93401": { county: "San Luis Obispo", area: "San Luis Obispo", localRisk: 0.92, theftRisk: "low" },
    "93402": { county: "San Luis Obispo", area: "Los Osos", localRisk: 0.85, theftRisk: "low" },
    "93405": { county: "San Luis Obispo", area: "San Luis Obispo", localRisk: 0.90, theftRisk: "low" },
    "93410": { county: "San Luis Obispo", area: "San Luis Obispo (Cal Poly)", localRisk: 0.95, theftRisk: "low" },
    "93420": { county: "San Luis Obispo", area: "Arroyo Grande", localRisk: 0.85, theftRisk: "low" },
    "93422": { county: "San Luis Obispo", area: "Atascadero", localRisk: 0.90, theftRisk: "low" },
    "93428": { county: "San Luis Obispo", area: "Cambria", localRisk: 0.78, theftRisk: "low" },
    "93433": { county: "San Luis Obispo", area: "Grover Beach", localRisk: 0.92, theftRisk: "low" },
    "93444": { county: "San Luis Obispo", area: "Nipomo", localRisk: 0.88, theftRisk: "low" },
    "93446": { county: "San Luis Obispo", area: "Paso Robles", localRisk: 0.95, theftRisk: "low" },
    "93449": { county: "San Luis Obispo", area: "Pismo Beach", localRisk: 0.85, theftRisk: "low" },
    "93465": { county: "San Luis Obispo", area: "Templeton", localRisk: 0.82, theftRisk: "low" },

    // --- MONTEREY COUNTY ---
    "93901": { county: "Monterey", area: "Salinas", localRisk: 1.15, theftRisk: "high" },
    "93905": { county: "Monterey", area: "Salinas (East)", localRisk: 1.20, theftRisk: "high" },
    "93906": { county: "Monterey", area: "Salinas (North)", localRisk: 1.12, theftRisk: "medium" },
    "93907": { county: "Monterey", area: "Salinas (North)", localRisk: 1.05, theftRisk: "medium" },
    "93908": { county: "Monterey", area: "Salinas", localRisk: 0.95, theftRisk: "medium" },
    "93923": { county: "Monterey", area: "Carmel", localRisk: 0.72, theftRisk: "low" },
    "93933": { county: "Monterey", area: "Marina", localRisk: 0.98, theftRisk: "medium" },
    "93940": { county: "Monterey", area: "Monterey", localRisk: 0.88, theftRisk: "low" },
    "93950": { county: "Monterey", area: "Pacific Grove", localRisk: 0.82, theftRisk: "low" },
    "93955": { county: "Monterey", area: "Seaside", localRisk: 1.05, theftRisk: "medium" },
    "93960": { county: "Monterey", area: "Soledad", localRisk: 1.10, theftRisk: "medium" },
    "95023": { county: "San Benito", area: "Hollister", localRisk: 1.00, theftRisk: "low" },

    // --- SANTA CRUZ COUNTY ---
    "95003": { county: "Santa Cruz", area: "Aptos", localRisk: 0.85, theftRisk: "low" },
    "95010": { county: "Santa Cruz", area: "Capitola", localRisk: 0.90, theftRisk: "low" },
    "95060": { county: "Santa Cruz", area: "Santa Cruz", localRisk: 1.00, theftRisk: "medium" },
    "95062": { county: "Santa Cruz", area: "Santa Cruz", localRisk: 1.02, theftRisk: "medium" },
    "95065": { county: "Santa Cruz", area: "Santa Cruz (Scotts Valley)", localRisk: 0.82, theftRisk: "low" },
    "95066": { county: "Santa Cruz", area: "Scotts Valley", localRisk: 0.80, theftRisk: "low" },
    "95073": { county: "Santa Cruz", area: "Soquel", localRisk: 0.88, theftRisk: "low" },
    "95076": { county: "Santa Cruz", area: "Watsonville", localRisk: 1.15, theftRisk: "medium" },

    // --- SAN FRANCISCO COUNTY ---
    "94102": { county: "San Francisco", area: "Civic Center/Tenderloin", localRisk: 1.30, theftRisk: "very high" },
    "94103": { county: "San Francisco", area: "SoMa", localRisk: 1.25, theftRisk: "very high" },
    "94104": { county: "San Francisco", area: "Financial District", localRisk: 1.10, theftRisk: "very high" },
    "94105": { county: "San Francisco", area: "Rincon Hill", localRisk: 1.12, theftRisk: "very high" },
    "94107": { county: "San Francisco", area: "Potrero Hill", localRisk: 1.08, theftRisk: "high" },
    "94108": { county: "San Francisco", area: "Chinatown/Nob Hill", localRisk: 1.15, theftRisk: "very high" },
    "94109": { county: "San Francisco", area: "Russian Hill/Polk", localRisk: 1.12, theftRisk: "very high" },
    "94110": { county: "San Francisco", area: "Mission District", localRisk: 1.18, theftRisk: "very high" },
    "94112": { county: "San Francisco", area: "Ingleside/Excelsior", localRisk: 1.10, theftRisk: "high" },
    "94114": { county: "San Francisco", area: "Castro", localRisk: 1.00, theftRisk: "high" },
    "94115": { county: "San Francisco", area: "Pacific Heights", localRisk: 0.88, theftRisk: "high" },
    "94116": { county: "San Francisco", area: "Sunset", localRisk: 0.90, theftRisk: "medium" },
    "94117": { county: "San Francisco", area: "Haight-Ashbury", localRisk: 1.08, theftRisk: "high" },
    "94118": { county: "San Francisco", area: "Inner Richmond", localRisk: 0.92, theftRisk: "medium" },
    "94121": { county: "San Francisco", area: "Outer Richmond", localRisk: 0.88, theftRisk: "medium" },
    "94122": { county: "San Francisco", area: "Outer Sunset", localRisk: 0.88, theftRisk: "medium" },
    "94123": { county: "San Francisco", area: "Marina", localRisk: 0.92, theftRisk: "high" },
    "94124": { county: "San Francisco", area: "Bayview/Hunters Point", localRisk: 1.28, theftRisk: "very high" },
    "94127": { county: "San Francisco", area: "West Portal", localRisk: 0.82, theftRisk: "low" },
    "94131": { county: "San Francisco", area: "Twin Peaks/Glen Park", localRisk: 0.88, theftRisk: "medium" },
    "94132": { county: "San Francisco", area: "Lake Merced/SFSU", localRisk: 0.90, theftRisk: "medium" },
    "94133": { county: "San Francisco", area: "North Beach", localRisk: 1.05, theftRisk: "high" },
    "94134": { county: "San Francisco", area: "Visitacion Valley", localRisk: 1.12, theftRisk: "high" },

    // --- ALAMEDA COUNTY ---
    "94501": { county: "Alameda", area: "Alameda", localRisk: 0.88, theftRisk: "medium" },
    "94536": { county: "Alameda", area: "Fremont", localRisk: 0.85, theftRisk: "low" },
    "94538": { county: "Alameda", area: "Fremont", localRisk: 0.88, theftRisk: "medium" },
    "94539": { county: "Alameda", area: "Fremont (Mission San Jose)", localRisk: 0.80, theftRisk: "low" },
    "94541": { county: "Alameda", area: "Hayward", localRisk: 1.10, theftRisk: "high" },
    "94544": { county: "Alameda", area: "Hayward", localRisk: 1.08, theftRisk: "high" },
    "94545": { county: "Alameda", area: "Hayward", localRisk: 1.05, theftRisk: "medium" },
    "94546": { county: "Alameda", area: "Castro Valley", localRisk: 0.88, theftRisk: "low" },
    "94550": { county: "Alameda", area: "Livermore", localRisk: 0.82, theftRisk: "low" },
    "94551": { county: "Alameda", area: "Livermore", localRisk: 0.85, theftRisk: "low" },
    "94555": { county: "Alameda", area: "Fremont (Warm Springs)", localRisk: 0.85, theftRisk: "low" },
    "94560": { county: "Alameda", area: "Newark", localRisk: 0.95, theftRisk: "medium" },
    "94566": { county: "Alameda", area: "Pleasanton", localRisk: 0.75, theftRisk: "low" },
    "94568": { county: "Alameda", area: "Dublin", localRisk: 0.78, theftRisk: "low" },
    "94577": { county: "Alameda", area: "San Leandro", localRisk: 1.05, theftRisk: "high" },
    "94578": { county: "Alameda", area: "San Leandro", localRisk: 1.02, theftRisk: "high" },
    "94579": { county: "Alameda", area: "San Leandro", localRisk: 1.00, theftRisk: "medium" },
    "94580": { county: "Alameda", area: "San Lorenzo", localRisk: 1.00, theftRisk: "medium" },
    "94587": { county: "Alameda", area: "Union City", localRisk: 0.92, theftRisk: "medium" },
    "94588": { county: "Alameda", area: "Pleasanton", localRisk: 0.75, theftRisk: "low" },
    "94601": { county: "Alameda", area: "Oakland (Fruitvale)", localRisk: 1.30, theftRisk: "very high" },
    "94602": { county: "Alameda", area: "Oakland (Dimond)", localRisk: 1.05, theftRisk: "high" },
    "94603": { county: "Alameda", area: "Oakland (East Oakland)", localRisk: 1.35, theftRisk: "very high" },
    "94605": { county: "Alameda", area: "Oakland (Seminary)", localRisk: 1.25, theftRisk: "very high" },
    "94606": { county: "Alameda", area: "Oakland (San Antonio)", localRisk: 1.22, theftRisk: "very high" },
    "94607": { county: "Alameda", area: "Oakland (West Oakland)", localRisk: 1.28, theftRisk: "very high" },
    "94608": { county: "Alameda", area: "Emeryville", localRisk: 1.10, theftRisk: "high" },
    "94609": { county: "Alameda", area: "Oakland (Temescal)", localRisk: 1.05, theftRisk: "high" },
    "94610": { county: "Alameda", area: "Oakland (Grand Lake)", localRisk: 1.00, theftRisk: "high" },
    "94611": { county: "Alameda", area: "Oakland (Montclair)", localRisk: 0.82, theftRisk: "medium" },
    "94612": { county: "Alameda", area: "Oakland (Downtown)", localRisk: 1.25, theftRisk: "very high" },
    "94618": { county: "Alameda", area: "Oakland (Rockridge)", localRisk: 0.88, theftRisk: "high" },
    "94619": { county: "Alameda", area: "Oakland (Redwood Heights)", localRisk: 1.00, theftRisk: "high" },
    "94621": { county: "Alameda", area: "Oakland (East Oakland)", localRisk: 1.32, theftRisk: "very high" },
    "94702": { county: "Alameda", area: "Berkeley", localRisk: 1.02, theftRisk: "high" },
    "94703": { county: "Alameda", area: "Berkeley", localRisk: 1.00, theftRisk: "high" },
    "94704": { county: "Alameda", area: "Berkeley (UC)", localRisk: 1.05, theftRisk: "high" },
    "94705": { county: "Alameda", area: "Berkeley (Elmwood)", localRisk: 0.88, theftRisk: "medium" },
    "94706": { county: "Alameda", area: "Albany", localRisk: 0.90, theftRisk: "medium" },
    "94707": { county: "Alameda", area: "Berkeley (North)", localRisk: 0.85, theftRisk: "medium" },
    "94708": { county: "Alameda", area: "Kensington", localRisk: 0.80, theftRisk: "low" },
    "94710": { county: "Alameda", area: "Berkeley (West)", localRisk: 1.05, theftRisk: "high" },

    // --- SANTA CLARA COUNTY ---
    "94022": { county: "Santa Clara", area: "Los Altos", localRisk: 0.72, theftRisk: "low" },
    "94024": { county: "Santa Clara", area: "Los Altos", localRisk: 0.72, theftRisk: "low" },
    "94040": { county: "Santa Clara", area: "Mountain View", localRisk: 0.85, theftRisk: "medium" },
    "94041": { county: "Santa Clara", area: "Mountain View", localRisk: 0.88, theftRisk: "medium" },
    "94043": { county: "Santa Clara", area: "Mountain View", localRisk: 0.85, theftRisk: "medium" },
    "94085": { county: "Santa Clara", area: "Sunnyvale", localRisk: 0.88, theftRisk: "medium" },
    "94086": { county: "Santa Clara", area: "Sunnyvale", localRisk: 0.85, theftRisk: "medium" },
    "94087": { county: "Santa Clara", area: "Sunnyvale", localRisk: 0.82, theftRisk: "low" },
    "94089": { county: "Santa Clara", area: "Sunnyvale", localRisk: 0.88, theftRisk: "medium" },
    "95002": { county: "Santa Clara", area: "Alviso", localRisk: 0.95, theftRisk: "medium" },
    "95008": { county: "Santa Clara", area: "Campbell", localRisk: 0.88, theftRisk: "medium" },
    "95014": { county: "Santa Clara", area: "Cupertino", localRisk: 0.78, theftRisk: "low" },
    "95020": { county: "Santa Clara", area: "Gilroy", localRisk: 1.05, theftRisk: "medium" },
    "95030": { county: "Santa Clara", area: "Los Gatos", localRisk: 0.75, theftRisk: "low" },
    "95032": { county: "Santa Clara", area: "Los Gatos", localRisk: 0.75, theftRisk: "low" },
    "95035": { county: "Santa Clara", area: "Milpitas", localRisk: 0.92, theftRisk: "medium" },
    "95037": { county: "Santa Clara", area: "Morgan Hill", localRisk: 0.88, theftRisk: "low" },
    "95046": { county: "Santa Clara", area: "San Martin", localRisk: 0.90, theftRisk: "low" },
    "95050": { county: "Santa Clara", area: "Santa Clara", localRisk: 0.92, theftRisk: "medium" },
    "95051": { county: "Santa Clara", area: "Santa Clara", localRisk: 0.90, theftRisk: "medium" },
    "95054": { county: "Santa Clara", area: "Santa Clara", localRisk: 0.90, theftRisk: "medium" },
    "95070": { county: "Santa Clara", area: "Saratoga", localRisk: 0.72, theftRisk: "low" },
    "95110": { county: "Santa Clara", area: "San Jose (Downtown)", localRisk: 1.20, theftRisk: "very high" },
    "95111": { county: "Santa Clara", area: "San Jose (South)", localRisk: 1.15, theftRisk: "high" },
    "95112": { county: "Santa Clara", area: "San Jose (Japantown)", localRisk: 1.12, theftRisk: "high" },
    "95113": { county: "Santa Clara", area: "San Jose (Downtown)", localRisk: 1.18, theftRisk: "very high" },
    "95116": { county: "Santa Clara", area: "San Jose (East)", localRisk: 1.18, theftRisk: "high" },
    "95117": { county: "Santa Clara", area: "San Jose (West)", localRisk: 1.00, theftRisk: "medium" },
    "95118": { county: "Santa Clara", area: "San Jose (Cambrian)", localRisk: 0.88, theftRisk: "medium" },
    "95119": { county: "Santa Clara", area: "San Jose (Blossom Valley)", localRisk: 0.88, theftRisk: "medium" },
    "95120": { county: "Santa Clara", area: "San Jose (Almaden Valley)", localRisk: 0.78, theftRisk: "low" },
    "95121": { county: "Santa Clara", area: "San Jose (East Foothills)", localRisk: 1.02, theftRisk: "medium" },
    "95122": { county: "Santa Clara", area: "San Jose (East)", localRisk: 1.22, theftRisk: "high" },
    "95123": { county: "Santa Clara", area: "San Jose (Blossom Valley)", localRisk: 0.90, theftRisk: "medium" },
    "95124": { county: "Santa Clara", area: "San Jose (Cambrian)", localRisk: 0.82, theftRisk: "low" },
    "95125": { county: "Santa Clara", area: "San Jose (Willow Glen)", localRisk: 0.88, theftRisk: "medium" },
    "95126": { county: "Santa Clara", area: "San Jose (The Alameda)", localRisk: 1.05, theftRisk: "high" },
    "95127": { county: "Santa Clara", area: "San Jose (East Foothills)", localRisk: 1.10, theftRisk: "high" },
    "95128": { county: "Santa Clara", area: "San Jose (West)", localRisk: 0.95, theftRisk: "medium" },
    "95129": { county: "Santa Clara", area: "San Jose (West Valley)", localRisk: 0.80, theftRisk: "low" },
    "95130": { county: "Santa Clara", area: "San Jose (West)", localRisk: 0.82, theftRisk: "low" },
    "95131": { county: "Santa Clara", area: "San Jose (North)", localRisk: 0.98, theftRisk: "medium" },
    "95132": { county: "Santa Clara", area: "San Jose (Berryessa)", localRisk: 0.95, theftRisk: "medium" },
    "95133": { county: "Santa Clara", area: "San Jose (Alum Rock)", localRisk: 1.12, theftRisk: "high" },
    "95134": { county: "Santa Clara", area: "San Jose (North)", localRisk: 0.88, theftRisk: "medium" },
    "95135": { county: "Santa Clara", area: "San Jose (Evergreen)", localRisk: 0.82, theftRisk: "low" },
    "95136": { county: "Santa Clara", area: "San Jose (Snell)", localRisk: 1.00, theftRisk: "medium" },
    "95138": { county: "Santa Clara", area: "San Jose (South)", localRisk: 0.88, theftRisk: "low" },
    "95139": { county: "Santa Clara", area: "San Jose (Bernal)", localRisk: 0.88, theftRisk: "medium" },
    "95140": { county: "Santa Clara", area: "San Jose (Mt Hamilton)", localRisk: 0.78, theftRisk: "low" },
    "95148": { county: "Santa Clara", area: "San Jose (Evergreen)", localRisk: 0.92, theftRisk: "medium" },

    // --- CONTRA COSTA COUNTY ---
    "94506": { county: "Contra Costa", area: "Danville", localRisk: 0.75, theftRisk: "low" },
    "94507": { county: "Contra Costa", area: "Alamo", localRisk: 0.72, theftRisk: "low" },
    "94509": { county: "Contra Costa", area: "Antioch", localRisk: 1.15, theftRisk: "high" },
    "94513": { county: "Contra Costa", area: "Brentwood", localRisk: 0.92, theftRisk: "medium" },
    "94517": { county: "Contra Costa", area: "Clayton", localRisk: 0.78, theftRisk: "low" },
    "94518": { county: "Contra Costa", area: "Concord", localRisk: 1.02, theftRisk: "medium" },
    "94519": { county: "Contra Costa", area: "Concord", localRisk: 1.00, theftRisk: "medium" },
    "94520": { county: "Contra Costa", area: "Concord", localRisk: 1.05, theftRisk: "medium" },
    "94521": { county: "Contra Costa", area: "Concord", localRisk: 1.02, theftRisk: "medium" },
    "94523": { county: "Contra Costa", area: "Pleasant Hill", localRisk: 0.88, theftRisk: "low" },
    "94525": { county: "Contra Costa", area: "Crockett", localRisk: 0.92, theftRisk: "medium" },
    "94526": { county: "Contra Costa", area: "Danville", localRisk: 0.75, theftRisk: "low" },
    "94530": { county: "Contra Costa", area: "El Cerrito", localRisk: 0.95, theftRisk: "medium" },
    "94531": { county: "Contra Costa", area: "Antioch", localRisk: 1.10, theftRisk: "high" },
    "94547": { county: "Contra Costa", area: "Hercules", localRisk: 0.92, theftRisk: "medium" },
    "94549": { county: "Contra Costa", area: "Lafayette", localRisk: 0.75, theftRisk: "low" },
    "94553": { county: "Contra Costa", area: "Martinez", localRisk: 0.92, theftRisk: "medium" },
    "94556": { county: "Contra Costa", area: "Moraga", localRisk: 0.72, theftRisk: "low" },
    "94561": { county: "Contra Costa", area: "Oakley", localRisk: 1.05, theftRisk: "medium" },
    "94563": { county: "Contra Costa", area: "Orinda", localRisk: 0.70, theftRisk: "low" },
    "94564": { county: "Contra Costa", area: "Pinole", localRisk: 0.95, theftRisk: "medium" },
    "94565": { county: "Contra Costa", area: "Pittsburg", localRisk: 1.18, theftRisk: "high" },
    "94572": { county: "Contra Costa", area: "Rodeo", localRisk: 1.02, theftRisk: "medium" },
    "94583": { county: "Contra Costa", area: "San Ramon", localRisk: 0.75, theftRisk: "low" },
    "94595": { county: "Contra Costa", area: "Walnut Creek", localRisk: 0.78, theftRisk: "low" },
    "94596": { county: "Contra Costa", area: "Walnut Creek", localRisk: 0.80, theftRisk: "low" },
    "94597": { county: "Contra Costa", area: "Walnut Creek", localRisk: 0.78, theftRisk: "low" },
    "94598": { county: "Contra Costa", area: "Walnut Creek", localRisk: 0.78, theftRisk: "low" },
    "94801": { county: "Contra Costa", area: "Richmond", localRisk: 1.25, theftRisk: "very high" },
    "94803": { county: "Contra Costa", area: "El Sobrante", localRisk: 1.05, theftRisk: "medium" },
    "94804": { county: "Contra Costa", area: "Richmond", localRisk: 1.22, theftRisk: "very high" },
    "94805": { county: "Contra Costa", area: "Richmond (Point)", localRisk: 1.10, theftRisk: "high" },
    "94806": { county: "Contra Costa", area: "San Pablo", localRisk: 1.20, theftRisk: "high" },
    "94850": { county: "Contra Costa", area: "Richmond (Marina Bay)", localRisk: 1.05, theftRisk: "high" },

    // --- SAN MATEO COUNTY ---
    "94002": { county: "San Mateo", area: "Belmont", localRisk: 0.82, theftRisk: "low" },
    "94010": { county: "San Mateo", area: "Burlingame", localRisk: 0.80, theftRisk: "low" },
    "94014": { county: "San Mateo", area: "Daly City", localRisk: 1.05, theftRisk: "medium" },
    "94015": { county: "San Mateo", area: "Daly City", localRisk: 1.02, theftRisk: "medium" },
    "94019": { county: "San Mateo", area: "Half Moon Bay", localRisk: 0.80, theftRisk: "low" },
    "94025": { county: "San Mateo", area: "Menlo Park", localRisk: 0.82, theftRisk: "low" },
    "94027": { county: "San Mateo", area: "Atherton", localRisk: 0.70, theftRisk: "low" },
    "94028": { county: "San Mateo", area: "Portola Valley", localRisk: 0.70, theftRisk: "low" },
    "94030": { county: "San Mateo", area: "Millbrae", localRisk: 0.85, theftRisk: "low" },
    "94044": { county: "San Mateo", area: "Pacifica", localRisk: 0.88, theftRisk: "low" },
    "94061": { county: "San Mateo", area: "Redwood City", localRisk: 0.95, theftRisk: "medium" },
    "94062": { county: "San Mateo", area: "Redwood City", localRisk: 0.88, theftRisk: "low" },
    "94063": { county: "San Mateo", area: "Redwood City", localRisk: 1.00, theftRisk: "medium" },
    "94065": { county: "San Mateo", area: "Redwood Shores", localRisk: 0.78, theftRisk: "low" },
    "94066": { county: "San Mateo", area: "San Bruno", localRisk: 0.92, theftRisk: "medium" },
    "94070": { county: "San Mateo", area: "San Carlos", localRisk: 0.80, theftRisk: "low" },
    "94080": { county: "San Mateo", area: "South San Francisco", localRisk: 0.98, theftRisk: "medium" },
    "94401": { county: "San Mateo", area: "San Mateo", localRisk: 0.92, theftRisk: "medium" },
    "94402": { county: "San Mateo", area: "San Mateo", localRisk: 0.85, theftRisk: "low" },
    "94403": { county: "San Mateo", area: "San Mateo", localRisk: 0.88, theftRisk: "low" },
    "94404": { county: "San Mateo", area: "Foster City", localRisk: 0.80, theftRisk: "low" },

    // --- MARIN COUNTY ---
    "94901": { county: "Marin", area: "San Rafael", localRisk: 0.98, theftRisk: "medium" },
    "94903": { county: "Marin", area: "San Rafael (Terra Linda)", localRisk: 0.88, theftRisk: "low" },
    "94904": { county: "Marin", area: "Greenbrae", localRisk: 0.78, theftRisk: "low" },
    "94920": { county: "Marin", area: "Tiburon", localRisk: 0.70, theftRisk: "low" },
    "94925": { county: "Marin", area: "Corte Madera", localRisk: 0.80, theftRisk: "low" },
    "94929": { county: "Marin", area: "Dillon Beach", localRisk: 0.75, theftRisk: "low" },
    "94930": { county: "Marin", area: "Fairfax", localRisk: 0.88, theftRisk: "low" },
    "94939": { county: "Marin", area: "Larkspur", localRisk: 0.80, theftRisk: "low" },
    "94941": { county: "Marin", area: "Mill Valley", localRisk: 0.78, theftRisk: "low" },
    "94945": { county: "Marin", area: "Novato", localRisk: 0.88, theftRisk: "low" },
    "94947": { county: "Marin", area: "Novato", localRisk: 0.90, theftRisk: "low" },
    "94949": { county: "Marin", area: "Novato", localRisk: 0.85, theftRisk: "low" },
    "94960": { county: "Marin", area: "San Anselmo", localRisk: 0.82, theftRisk: "low" },
    "94965": { county: "Marin", area: "Sausalito", localRisk: 0.82, theftRisk: "medium" },

    // --- SONOMA COUNTY ---
    "94928": { county: "Sonoma", area: "Rohnert Park", localRisk: 0.92, theftRisk: "low" },
    "94931": { county: "Sonoma", area: "Cotati", localRisk: 0.90, theftRisk: "low" },
    "94951": { county: "Sonoma", area: "Penngrove", localRisk: 0.82, theftRisk: "low" },
    "94952": { county: "Sonoma", area: "Petaluma", localRisk: 0.88, theftRisk: "low" },
    "94954": { county: "Sonoma", area: "Petaluma", localRisk: 0.88, theftRisk: "low" },
    "95401": { county: "Sonoma", area: "Santa Rosa", localRisk: 1.05, theftRisk: "medium" },
    "95403": { county: "Sonoma", area: "Santa Rosa", localRisk: 1.00, theftRisk: "medium" },
    "95404": { county: "Sonoma", area: "Santa Rosa", localRisk: 1.02, theftRisk: "medium" },
    "95405": { county: "Sonoma", area: "Santa Rosa", localRisk: 0.95, theftRisk: "low" },
    "95407": { county: "Sonoma", area: "Santa Rosa", localRisk: 1.08, theftRisk: "medium" },
    "95409": { county: "Sonoma", area: "Santa Rosa (Oakmont)", localRisk: 0.82, theftRisk: "low" },
    "95425": { county: "Sonoma", area: "Cloverdale", localRisk: 0.90, theftRisk: "low" },
    "95436": { county: "Sonoma", area: "Forestville", localRisk: 0.88, theftRisk: "low" },
    "95448": { county: "Sonoma", area: "Healdsburg", localRisk: 0.82, theftRisk: "low" },
    "95452": { county: "Sonoma", area: "Kenwood", localRisk: 0.78, theftRisk: "low" },
    "95472": { county: "Sonoma", area: "Sebastopol", localRisk: 0.85, theftRisk: "low" },
    "95476": { county: "Sonoma", area: "Sonoma", localRisk: 0.82, theftRisk: "low" },
    "95492": { county: "Sonoma", area: "Windsor", localRisk: 0.88, theftRisk: "low" },

    // --- NAPA COUNTY ---
    "94503": { county: "Napa", area: "American Canyon", localRisk: 0.95, theftRisk: "medium" },
    "94558": { county: "Napa", area: "Napa", localRisk: 0.98, theftRisk: "medium" },
    "94559": { county: "Napa", area: "Napa", localRisk: 0.95, theftRisk: "low" },
    "94574": { county: "Napa", area: "St. Helena", localRisk: 0.78, theftRisk: "low" },
    "94515": { county: "Napa", area: "Calistoga", localRisk: 0.82, theftRisk: "low" },

    // --- SOLANO COUNTY ---
    "94510": { county: "Solano", area: "Benicia", localRisk: 0.85, theftRisk: "low" },
    "94533": { county: "Solano", area: "Fairfield", localRisk: 1.05, theftRisk: "medium" },
    "94534": { county: "Solano", area: "Fairfield (Green Valley)", localRisk: 0.85, theftRisk: "low" },
    "94535": { county: "Solano", area: "Travis AFB", localRisk: 0.88, theftRisk: "low" },
    "94585": { county: "Solano", area: "Suisun City", localRisk: 1.02, theftRisk: "medium" },
    "94589": { county: "Solano", area: "Vallejo", localRisk: 1.18, theftRisk: "high" },
    "94590": { county: "Solano", area: "Vallejo", localRisk: 1.20, theftRisk: "high" },
    "94591": { county: "Solano", area: "Vallejo", localRisk: 1.15, theftRisk: "high" },
    "95620": { county: "Solano", area: "Dixon", localRisk: 0.90, theftRisk: "low" },
    "95687": { county: "Solano", area: "Vacaville", localRisk: 0.92, theftRisk: "medium" },
    "95688": { county: "Solano", area: "Vacaville", localRisk: 0.90, theftRisk: "low" },

    // --- SACRAMENTO COUNTY ---
    "95608": { county: "Sacramento", area: "Carmichael", localRisk: 0.95, theftRisk: "medium" },
    "95610": { county: "Sacramento", area: "Citrus Heights", localRisk: 1.05, theftRisk: "medium" },
    "95615": { county: "Sacramento", area: "Courtland", localRisk: 0.85, theftRisk: "low" },
    "95621": { county: "Sacramento", area: "Citrus Heights", localRisk: 1.02, theftRisk: "medium" },
    "95624": { county: "Sacramento", area: "Elk Grove", localRisk: 0.92, theftRisk: "medium" },
    "95626": { county: "Sacramento", area: "Elverta", localRisk: 0.95, theftRisk: "medium" },
    "95628": { county: "Sacramento", area: "Fair Oaks", localRisk: 0.88, theftRisk: "low" },
    "95630": { county: "Sacramento", area: "Folsom", localRisk: 0.78, theftRisk: "low" },
    "95632": { county: "Sacramento", area: "Galt", localRisk: 1.00, theftRisk: "medium" },
    "95638": { county: "Sacramento", area: "Herald", localRisk: 0.92, theftRisk: "low" },
    "95655": { county: "Sacramento", area: "Mather", localRisk: 1.00, theftRisk: "medium" },
    "95660": { county: "Sacramento", area: "North Highlands", localRisk: 1.18, theftRisk: "high" },
    "95662": { county: "Sacramento", area: "Orangevale", localRisk: 0.92, theftRisk: "medium" },
    "95670": { county: "Sacramento", area: "Rancho Cordova", localRisk: 1.10, theftRisk: "high" },
    "95671": { county: "Sacramento", area: "Rancho Cordova", localRisk: 1.05, theftRisk: "medium" },
    "95673": { county: "Sacramento", area: "Rio Linda", localRisk: 1.12, theftRisk: "high" },
    "95683": { county: "Sacramento", area: "Sloughhouse", localRisk: 0.82, theftRisk: "low" },
    "95693": { county: "Sacramento", area: "Wilton", localRisk: 0.80, theftRisk: "low" },
    "95742": { county: "Sacramento", area: "Rancho Cordova", localRisk: 0.92, theftRisk: "medium" },
    "95757": { county: "Sacramento", area: "Elk Grove", localRisk: 0.88, theftRisk: "low" },
    "95758": { county: "Sacramento", area: "Elk Grove", localRisk: 0.90, theftRisk: "medium" },
    "95811": { county: "Sacramento", area: "Sacramento (Midtown)", localRisk: 1.12, theftRisk: "high" },
    "95814": { county: "Sacramento", area: "Sacramento (Downtown)", localRisk: 1.20, theftRisk: "very high" },
    "95815": { county: "Sacramento", area: "Sacramento (North)", localRisk: 1.22, theftRisk: "high" },
    "95816": { county: "Sacramento", area: "Sacramento (East)", localRisk: 1.05, theftRisk: "medium" },
    "95817": { county: "Sacramento", area: "Sacramento (Oak Park)", localRisk: 1.18, theftRisk: "high" },
    "95818": { county: "Sacramento", area: "Sacramento (Land Park)", localRisk: 0.92, theftRisk: "medium" },
    "95819": { county: "Sacramento", area: "Sacramento (East)", localRisk: 0.90, theftRisk: "low" },
    "95820": { county: "Sacramento", area: "Sacramento (South)", localRisk: 1.15, theftRisk: "high" },
    "95821": { county: "Sacramento", area: "Sacramento (Arden)", localRisk: 1.08, theftRisk: "medium" },
    "95822": { county: "Sacramento", area: "Sacramento (South)", localRisk: 1.12, theftRisk: "high" },
    "95823": { county: "Sacramento", area: "Sacramento (South)", localRisk: 1.20, theftRisk: "high" },
    "95824": { county: "Sacramento", area: "Sacramento (South)", localRisk: 1.18, theftRisk: "high" },
    "95825": { county: "Sacramento", area: "Sacramento (Arden)", localRisk: 1.05, theftRisk: "medium" },
    "95826": { county: "Sacramento", area: "Sacramento (College Greens)", localRisk: 1.02, theftRisk: "medium" },
    "95827": { county: "Sacramento", area: "Sacramento (Rosemont)", localRisk: 1.00, theftRisk: "medium" },
    "95828": { county: "Sacramento", area: "Sacramento (Florin)", localRisk: 1.15, theftRisk: "high" },
    "95829": { county: "Sacramento", area: "Sacramento (Vineyard)", localRisk: 0.92, theftRisk: "medium" },
    "95831": { county: "Sacramento", area: "Sacramento (Pocket)", localRisk: 0.85, theftRisk: "low" },
    "95832": { county: "Sacramento", area: "Sacramento (Meadowview)", localRisk: 1.22, theftRisk: "high" },
    "95833": { county: "Sacramento", area: "Sacramento (Natomas)", localRisk: 0.98, theftRisk: "medium" },
    "95834": { county: "Sacramento", area: "Sacramento (Natomas)", localRisk: 0.95, theftRisk: "medium" },
    "95835": { county: "Sacramento", area: "Sacramento (North Natomas)", localRisk: 0.90, theftRisk: "low" },
    "95838": { county: "Sacramento", area: "Sacramento (Del Paso Heights)", localRisk: 1.25, theftRisk: "very high" },
    "95841": { county: "Sacramento", area: "Sacramento (Foothill Farms)", localRisk: 1.08, theftRisk: "medium" },
    "95842": { county: "Sacramento", area: "Sacramento (Foothill Farms)", localRisk: 1.10, theftRisk: "high" },
    "95843": { county: "Sacramento", area: "Antelope", localRisk: 0.95, theftRisk: "medium" },

    // --- PLACER COUNTY ---
    "95603": { county: "Placer", area: "Auburn", localRisk: 0.88, theftRisk: "low" },
    "95648": { county: "Placer", area: "Lincoln", localRisk: 0.85, theftRisk: "low" },
    "95650": { county: "Placer", area: "Loomis", localRisk: 0.80, theftRisk: "low" },
    "95661": { county: "Placer", area: "Roseville", localRisk: 0.90, theftRisk: "medium" },
    "95677": { county: "Placer", area: "Rocklin", localRisk: 0.82, theftRisk: "low" },
    "95678": { county: "Placer", area: "Roseville", localRisk: 0.88, theftRisk: "low" },
    "95746": { county: "Placer", area: "Granite Bay", localRisk: 0.75, theftRisk: "low" },
    "95747": { county: "Placer", area: "Roseville (West)", localRisk: 0.85, theftRisk: "low" },
    "95765": { county: "Placer", area: "Rocklin", localRisk: 0.82, theftRisk: "low" },

    // --- EL DORADO COUNTY ---
    "95614": { county: "El Dorado", area: "Cool", localRisk: 0.82, theftRisk: "low" },
    "95619": { county: "El Dorado", area: "Diamond Springs", localRisk: 0.88, theftRisk: "low" },
    "95623": { county: "El Dorado", area: "El Dorado", localRisk: 0.85, theftRisk: "low" },
    "95667": { county: "El Dorado", area: "Placerville", localRisk: 0.92, theftRisk: "low" },
    "95672": { county: "El Dorado", area: "Rescue", localRisk: 0.80, theftRisk: "low" },
    "95682": { county: "El Dorado", area: "Shingle Springs", localRisk: 0.82, theftRisk: "low" },
    "95726": { county: "El Dorado", area: "Pollock Pines", localRisk: 0.85, theftRisk: "low" },
    "95762": { county: "El Dorado", area: "El Dorado Hills", localRisk: 0.75, theftRisk: "low" },
    "96150": { county: "El Dorado", area: "South Lake Tahoe", localRisk: 0.95, theftRisk: "medium" },

    // --- YOLO COUNTY ---
    "95605": { county: "Yolo", area: "West Sacramento", localRisk: 1.08, theftRisk: "medium" },
    "95616": { county: "Yolo", area: "Davis", localRisk: 0.85, theftRisk: "low" },
    "95618": { county: "Yolo", area: "Davis", localRisk: 0.82, theftRisk: "low" },
    "95691": { county: "Yolo", area: "West Sacramento", localRisk: 1.05, theftRisk: "medium" },
    "95694": { county: "Yolo", area: "Winters", localRisk: 0.90, theftRisk: "low" },
    "95695": { county: "Yolo", area: "Woodland", localRisk: 1.02, theftRisk: "medium" },
    "95776": { county: "Yolo", area: "Woodland", localRisk: 1.00, theftRisk: "medium" },

    // --- FRESNO COUNTY ---
    "93611": { county: "Fresno", area: "Clovis", localRisk: 0.85, theftRisk: "low" },
    "93612": { county: "Fresno", area: "Clovis", localRisk: 0.88, theftRisk: "low" },
    "93619": { county: "Fresno", area: "Clovis", localRisk: 0.82, theftRisk: "low" },
    "93625": { county: "Fresno", area: "Fowler", localRisk: 0.95, theftRisk: "medium" },
    "93630": { county: "Fresno", area: "Kerman", localRisk: 1.05, theftRisk: "medium" },
    "93631": { county: "Fresno", area: "Kingsburg", localRisk: 0.90, theftRisk: "low" },
    "93636": { county: "Fresno", area: "Madera Ranchos", localRisk: 0.92, theftRisk: "medium" },
    "93650": { county: "Fresno", area: "Fresno (North)", localRisk: 0.85, theftRisk: "low" },
    "93657": { county: "Fresno", area: "Reedley", localRisk: 1.00, theftRisk: "medium" },
    "93662": { county: "Fresno", area: "Selma", localRisk: 1.08, theftRisk: "medium" },
    "93668": { county: "Fresno", area: "Tranquillity", localRisk: 1.05, theftRisk: "medium" },
    "93701": { county: "Fresno", area: "Fresno (Downtown)", localRisk: 1.28, theftRisk: "very high" },
    "93702": { county: "Fresno", area: "Fresno (East)", localRisk: 1.22, theftRisk: "high" },
    "93703": { county: "Fresno", area: "Fresno (Tower District)", localRisk: 1.08, theftRisk: "medium" },
    "93704": { county: "Fresno", area: "Fresno (Fig Garden)", localRisk: 0.88, theftRisk: "low" },
    "93705": { county: "Fresno", area: "Fresno (West)", localRisk: 1.15, theftRisk: "high" },
    "93706": { county: "Fresno", area: "Fresno (Southwest)", localRisk: 1.25, theftRisk: "high" },
    "93710": { county: "Fresno", area: "Fresno (North)", localRisk: 0.92, theftRisk: "medium" },
    "93711": { county: "Fresno", area: "Fresno (North)", localRisk: 0.82, theftRisk: "low" },
    "93720": { county: "Fresno", area: "Fresno (Northeast)", localRisk: 0.78, theftRisk: "low" },
    "93721": { county: "Fresno", area: "Fresno (Downtown)", localRisk: 1.25, theftRisk: "very high" },
    "93722": { county: "Fresno", area: "Fresno (West)", localRisk: 1.10, theftRisk: "high" },
    "93723": { county: "Fresno", area: "Fresno (West)", localRisk: 1.02, theftRisk: "medium" },
    "93725": { county: "Fresno", area: "Fresno (South)", localRisk: 1.12, theftRisk: "high" },
    "93726": { county: "Fresno", area: "Fresno", localRisk: 1.00, theftRisk: "medium" },
    "93727": { county: "Fresno", area: "Fresno (East)", localRisk: 1.08, theftRisk: "medium" },
    "93728": { county: "Fresno", area: "Fresno (West)", localRisk: 1.18, theftRisk: "high" },
    "93730": { county: "Fresno", area: "Fresno (Copper River)", localRisk: 0.78, theftRisk: "low" },

    // --- SAN JOAQUIN COUNTY ---
    "95201": { county: "San Joaquin", area: "Stockton (Downtown)", localRisk: 1.30, theftRisk: "very high" },
    "95202": { county: "San Joaquin", area: "Stockton (Downtown)", localRisk: 1.28, theftRisk: "very high" },
    "95203": { county: "San Joaquin", area: "Stockton (South)", localRisk: 1.22, theftRisk: "very high" },
    "95204": { county: "San Joaquin", area: "Stockton (Pacific)", localRisk: 1.10, theftRisk: "high" },
    "95205": { county: "San Joaquin", area: "Stockton (East)", localRisk: 1.28, theftRisk: "very high" },
    "95206": { county: "San Joaquin", area: "Stockton (South)", localRisk: 1.25, theftRisk: "very high" },
    "95207": { county: "San Joaquin", area: "Stockton (North)", localRisk: 1.05, theftRisk: "medium" },
    "95209": { county: "San Joaquin", area: "Stockton (Lincoln Village)", localRisk: 0.95, theftRisk: "medium" },
    "95210": { county: "San Joaquin", area: "Stockton (North)", localRisk: 1.12, theftRisk: "high" },
    "95211": { county: "San Joaquin", area: "Stockton (UOP)", localRisk: 1.00, theftRisk: "medium" },
    "95212": { county: "San Joaquin", area: "Stockton (East)", localRisk: 1.02, theftRisk: "medium" },
    "95219": { county: "San Joaquin", area: "Stockton (Brookside)", localRisk: 0.85, theftRisk: "low" },
    "95220": { county: "San Joaquin", area: "Acampo", localRisk: 0.88, theftRisk: "low" },
    "95227": { county: "San Joaquin", area: "Lockeford", localRisk: 0.85, theftRisk: "low" },
    "95230": { county: "San Joaquin", area: "Linden", localRisk: 0.85, theftRisk: "low" },
    "95231": { county: "San Joaquin", area: "French Camp", localRisk: 1.10, theftRisk: "high" },
    "95234": { county: "San Joaquin", area: "Holt", localRisk: 0.90, theftRisk: "medium" },
    "95236": { county: "San Joaquin", area: "Lathrop", localRisk: 0.95, theftRisk: "medium" },
    "95240": { county: "San Joaquin", area: "Lodi", localRisk: 0.98, theftRisk: "medium" },
    "95242": { county: "San Joaquin", area: "Lodi", localRisk: 0.90, theftRisk: "low" },
    "95304": { county: "San Joaquin", area: "Tracy", localRisk: 0.88, theftRisk: "low" },
    "95330": { county: "San Joaquin", area: "Lathrop", localRisk: 0.92, theftRisk: "medium" },
    "95336": { county: "San Joaquin", area: "Manteca", localRisk: 0.95, theftRisk: "medium" },
    "95337": { county: "San Joaquin", area: "Manteca", localRisk: 0.98, theftRisk: "medium" },
    "95376": { county: "San Joaquin", area: "Tracy", localRisk: 0.88, theftRisk: "low" },
    "95377": { county: "San Joaquin", area: "Tracy", localRisk: 0.85, theftRisk: "low" },
    "95391": { county: "San Joaquin", area: "Tracy (Mountain House)", localRisk: 0.82, theftRisk: "low" },

    // --- STANISLAUS COUNTY ---
    "95307": { county: "Stanislaus", area: "Ceres", localRisk: 1.10, theftRisk: "high" },
    "95313": { county: "Stanislaus", area: "Crows Landing", localRisk: 0.95, theftRisk: "medium" },
    "95316": { county: "Stanislaus", area: "Denair", localRisk: 0.92, theftRisk: "medium" },
    "95319": { county: "Stanislaus", area: "Empire", localRisk: 1.05, theftRisk: "medium" },
    "95326": { county: "Stanislaus", area: "Hughson", localRisk: 0.90, theftRisk: "low" },
    "95350": { county: "Stanislaus", area: "Modesto", localRisk: 1.10, theftRisk: "high" },
    "95351": { county: "Stanislaus", area: "Modesto (South)", localRisk: 1.18, theftRisk: "high" },
    "95354": { county: "Stanislaus", area: "Modesto (Downtown)", localRisk: 1.15, theftRisk: "high" },
    "95355": { county: "Stanislaus", area: "Modesto", localRisk: 1.05, theftRisk: "medium" },
    "95356": { county: "Stanislaus", area: "Modesto (North)", localRisk: 0.95, theftRisk: "medium" },
    "95357": { county: "Stanislaus", area: "Modesto (East)", localRisk: 1.00, theftRisk: "medium" },
    "95358": { county: "Stanislaus", area: "Modesto (West)", localRisk: 1.08, theftRisk: "medium" },
    "95363": { county: "Stanislaus", area: "Patterson", localRisk: 0.95, theftRisk: "medium" },
    "95367": { county: "Stanislaus", area: "Riverbank", localRisk: 1.05, theftRisk: "medium" },
    "95380": { county: "Stanislaus", area: "Turlock", localRisk: 1.00, theftRisk: "medium" },
    "95382": { county: "Stanislaus", area: "Turlock", localRisk: 0.95, theftRisk: "medium" },
    "95386": { county: "Stanislaus", area: "Waterford", localRisk: 0.92, theftRisk: "low" },

    // --- TULARE COUNTY ---
    "93221": { county: "Tulare", area: "Exeter", localRisk: 0.95, theftRisk: "medium" },
    "93247": { county: "Tulare", area: "Lindsay", localRisk: 1.05, theftRisk: "medium" },
    "93257": { county: "Tulare", area: "Porterville", localRisk: 1.10, theftRisk: "medium" },
    "93274": { county: "Tulare", area: "Tulare", localRisk: 1.08, theftRisk: "medium" },
    "93277": { county: "Tulare", area: "Visalia", localRisk: 1.00, theftRisk: "medium" },
    "93291": { county: "Tulare", area: "Visalia", localRisk: 0.95, theftRisk: "medium" },
    "93292": { county: "Tulare", area: "Visalia", localRisk: 0.88, theftRisk: "low" },

    // --- MERCED COUNTY ---
    "95301": { county: "Merced", area: "Atwater", localRisk: 1.05, theftRisk: "medium" },
    "95315": { county: "Merced", area: "Delhi", localRisk: 1.02, theftRisk: "medium" },
    "95340": { county: "Merced", area: "Merced", localRisk: 1.10, theftRisk: "high" },
    "95341": { county: "Merced", area: "Merced", localRisk: 1.05, theftRisk: "medium" },
    "95348": { county: "Merced", area: "Merced", localRisk: 0.95, theftRisk: "medium" },
    "93620": { county: "Merced", area: "Dos Palos", localRisk: 1.02, theftRisk: "medium" },
    "93635": { county: "Merced", area: "Los Banos", localRisk: 1.08, theftRisk: "medium" },

    // --- KINGS COUNTY ---
    "93230": { county: "Kings", area: "Hanford", localRisk: 1.05, theftRisk: "medium" },
    "93232": { county: "Kings", area: "Hanford", localRisk: 1.00, theftRisk: "medium" },
    "93245": { county: "Kings", area: "Lemoore", localRisk: 0.92, theftRisk: "low" },

    // --- MADERA COUNTY ---
    "93637": { county: "Madera", area: "Madera", localRisk: 1.08, theftRisk: "medium" },
    "93638": { county: "Madera", area: "Madera", localRisk: 1.05, theftRisk: "medium" },
    "93644": { county: "Madera", area: "Oakhurst", localRisk: 0.82, theftRisk: "low" },

    // --- BUTTE COUNTY ---
    "95926": { county: "Butte", area: "Chico", localRisk: 1.02, theftRisk: "medium" },
    "95928": { county: "Butte", area: "Chico", localRisk: 1.05, theftRisk: "medium" },
    "95929": { county: "Butte", area: "Chico (CSU)", localRisk: 1.00, theftRisk: "medium" },
    "95965": { county: "Butte", area: "Oroville", localRisk: 1.10, theftRisk: "medium" },
    "95966": { county: "Butte", area: "Oroville", localRisk: 1.08, theftRisk: "medium" },
    "95969": { county: "Butte", area: "Paradise", localRisk: 0.88, theftRisk: "low" },
    "95973": { county: "Butte", area: "Chico", localRisk: 0.92, theftRisk: "low" },

    // --- SHASTA COUNTY ---
    "96001": { county: "Shasta", area: "Redding", localRisk: 1.05, theftRisk: "medium" },
    "96002": { county: "Shasta", area: "Redding", localRisk: 1.02, theftRisk: "medium" },
    "96003": { county: "Shasta", area: "Redding", localRisk: 1.00, theftRisk: "medium" },
    "96007": { county: "Shasta", area: "Anderson", localRisk: 1.08, theftRisk: "medium" },
    "96019": { county: "Shasta", area: "Shasta Lake", localRisk: 1.05, theftRisk: "medium" },

    // --- HUMBOLDT COUNTY ---
    "95501": { county: "Humboldt", area: "Eureka", localRisk: 1.08, theftRisk: "medium" },
    "95503": { county: "Humboldt", area: "Eureka", localRisk: 1.00, theftRisk: "medium" },
    "95519": { county: "Humboldt", area: "McKinleyville", localRisk: 0.92, theftRisk: "low" },
    "95521": { county: "Humboldt", area: "Arcata", localRisk: 0.95, theftRisk: "low" },
    "95540": { county: "Humboldt", area: "Fortuna", localRisk: 0.90, theftRisk: "low" },

    // --- NEVADA COUNTY ---
    "95945": { county: "Nevada", area: "Grass Valley", localRisk: 0.95, theftRisk: "low" },
    "95949": { county: "Nevada", area: "Grass Valley", localRisk: 0.88, theftRisk: "low" },
    "95959": { county: "Nevada", area: "Nevada City", localRisk: 0.85, theftRisk: "low" },
    "96161": { county: "Nevada", area: "Truckee", localRisk: 0.82, theftRisk: "low" },

    // --- SUTTER COUNTY ---
    "95991": { county: "Sutter", area: "Yuba City", localRisk: 1.08, theftRisk: "medium" },
    "95993": { county: "Sutter", area: "Yuba City", localRisk: 1.05, theftRisk: "medium" },

    // --- IMPERIAL COUNTY ---
    "92227": { county: "Imperial", area: "Brawley", localRisk: 1.05, theftRisk: "medium" },
    "92231": { county: "Imperial", area: "Calexico", localRisk: 1.15, theftRisk: "high" },
    "92243": { county: "Imperial", area: "El Centro", localRisk: 1.08, theftRisk: "medium" },
    "92249": { county: "Imperial", area: "Heber", localRisk: 1.02, theftRisk: "medium" },
    "92251": { county: "Imperial", area: "Imperial", localRisk: 0.95, theftRisk: "medium" }
  },

  // Coverage descriptions and educational info
  COVERAGE_INFO: {
    bodilyInjury: {
      name: "Bodily Injury Liability",
      shortName: "BI",
      icon: "🏥",
      description: "Pays for injuries you cause to others in an at-fault accident. Covers medical bills, lost wages, pain and suffering of the injured party.",
      caMinimum: "$30,000/$60,000 (SB 1107)",
      recommended: "$100,000/$300,000",
      whyItMatters: "California's average BI claim is ~$51,635 — more than double the national average of $26,501. A moderate injury settlement in CA ranges $15K-$75K, and severe injuries easily exceed $150K. If your limits are too low, you can be personally sued for the difference.",
      avgClaimCA: "$51,635"
    },
    propertyDamage: {
      name: "Property Damage Liability",
      shortName: "PD",
      icon: "🚗",
      description: "Pays for damage you cause to someone else's property (their vehicle, fence, building, etc.) in an at-fault accident.",
      caMinimum: "$15,000 (SB 1107)",
      recommended: "$50,000-$100,000",
      whyItMatters: "The average new car costs over $48,000. Vehicle repair costs have risen 47% since 2020 (LexisNexis). Repair labor costs are up 31.9% (BLS). Luxury vehicles common in California can exceed $80,000. The 2024 national average total cost of repair is $4,730 per CCC data.",
      avgClaimCA: "$6,551-$7,200"
    },
    medicalPayments: {
      name: "Medical Payments",
      shortName: "MedPay",
      icon: "💊",
      description: "Pays medical expenses for you and your passengers regardless of who caused the accident. Covers ambulance, surgery, X-rays, hospital stays.",
      caMinimum: "Not required",
      recommended: "$5,000-$25,000",
      whyItMatters: "Unlike health insurance, MedPay has no deductible and covers all vehicle occupants. First-party medical bill severity rose 7-8% in 2024 (CCC). MedPay typically costs only $5-8/month extra and can cover co-pays and deductibles your health insurance doesn't.",
      avgClaimCA: "$5,000-$10,000"
    },
    uninsuredMotorist: {
      name: "Uninsured/Underinsured Motorist BI",
      shortName: "UM/UIM",
      icon: "⚠️",
      description: "Protects you if you're hit by a driver with no insurance or insufficient insurance. Also covers hit-and-run accidents.",
      caMinimum: "$30,000/$60,000 (SB 1107)",
      recommended: "Match your BI limits",
      whyItMatters: "About 16-17% of California drivers are uninsured. In LA County, the rate is 20-25%, and LA alone contains 35% of all uninsured vehicles in the state. LA+SD+OC combined account for 50% of all CA uninsured vehicles. UM/UIM coverage at $100K/$300K typically costs only ~$78/year — one of the best values in auto insurance.",
      avgClaimCA: "$22,000-$51,635"
    },
    comprehensive: {
      name: "Comprehensive",
      shortName: "Comp",
      icon: "🛡️",
      description: "Covers damage to YOUR vehicle from non-collision events: theft, vandalism, fire, hail, flood, falling objects, animal strikes, catalytic converter theft.",
      caMinimum: "Not required",
      recommended: "$250-$1,000 deductible",
      whyItMatters: "LA/Orange County is the top market for catalytic converter theft (avg claim ~$2,500 per State Farm). California also has wildfire risk and occasional flooding. About 80% of insured drivers nationwide carry comprehensive coverage. Essential if you have a loan or lease.",
      avgClaimCA: "$2,738-$3,500"
    },
    collision: {
      name: "Collision",
      shortName: "Coll",
      icon: "💥",
      description: "Covers damage to YOUR vehicle when you hit another car or object, regardless of fault. Also covers single-vehicle accidents (rollovers, etc.).",
      caMinimum: "Not required",
      recommended: "$500-$1,000 deductible",
      whyItMatters: "The average collision claim hit a 15-year high of $5,992 nationally in 2022 (NAIC). In California, collision claims average $6,500-$7,200 due to higher repair labor costs (+31.9%). The total loss rate within collision claims is 27%. Vehicle parts costs have risen 21.6% since 2020.",
      avgClaimCA: "$5,992-$7,200"
    },
    rentalCar: {
      name: "Rental Car / Transportation Expense",
      shortName: "Rental",
      icon: "🔑",
      description: "Pays for a rental car while your vehicle is being repaired after a covered claim.",
      caMinimum: "Not required",
      recommended: "$30-$50/day",
      whyItMatters: "Body shop repairs in California average 12-18 days. Average daily rental car costs are $38-$70/day in 2023. Typical policy caps range $900-$1,500 per claim, with some insurers offering up to $3,000.",
      avgClaimCA: "$900-$1,500"
    }
  },

  // Get data for a specific zip code
  getZipData(zip) {
    const zipInfo = this.ZIP_DATA[zip];
    if (!zipInfo) return null;

    const countyData = this.COUNTY_DATA[zipInfo.county];
    if (!countyData) return null;

    const effectiveRisk = countyData.riskFactor * zipInfo.localRisk;

    return {
      zip: zip,
      area: zipInfo.area,
      county: zipInfo.county,
      localRisk: zipInfo.localRisk,
      countyRiskFactor: countyData.riskFactor,
      effectiveRisk: effectiveRisk,
      riskLevel: this._getRiskLevel(effectiveRisk),
      theftRisk: zipInfo.theftRisk,
      uninsuredRate: countyData.uninsuredRate,
      uninsuredPct: (countyData.uninsuredRate * 100).toFixed(1) + "%",
      avgClaims: {
        bodilyInjury: Math.round(countyData.avgBodilyInjuryClaim * zipInfo.localRisk),
        propertyDamage: Math.round(countyData.avgPropertyDamageClaim * zipInfo.localRisk),
        comprehensive: Math.round(countyData.avgCompClaim * zipInfo.localRisk),
        collision: Math.round(countyData.avgCollisionClaim * zipInfo.localRisk),
        medicalPayments: Math.round(countyData.avgMedPayClaim * zipInfo.localRisk)
      },
      accidentRate: (countyData.accidentRate * zipInfo.localRisk).toFixed(1),
      avgAnnualPremium: Math.round(countyData.avgAnnualPremium * zipInfo.localRisk)
    };
  },

  // Get recommended coverage tier for a zip code
  getRecommendation(zip, vehicleValue) {
    const data = this.getZipData(zip);
    if (!data) return null;

    const risk = data.effectiveRisk;
    let recommendedTier;
    let reasons = [];

    if (risk >= 1.5) {
      recommendedTier = "premium";
      reasons.push("Your area has very high accident and claim rates");
    } else if (risk >= 1.3) {
      recommendedTier = "enhanced";
      reasons.push("Your area has elevated accident and claim rates");
    } else if (risk >= 1.1) {
      recommendedTier = "standard";
      reasons.push("Your area has moderate-to-high risk levels");
    } else if (risk >= 0.9) {
      recommendedTier = "basic";
      reasons.push("Your area has average risk levels");
    } else {
      recommendedTier = "basic";
      reasons.push("Your area has below-average risk levels");
    }

    // Adjust for uninsured rate
    if (data.uninsuredRate > 0.18) {
      reasons.push(`High uninsured driver rate (${data.uninsuredPct}) — higher UM/UIM recommended`);
      if (recommendedTier === "basic") recommendedTier = "standard";
    }

    // Adjust for theft risk
    if (data.theftRisk === "very high" || data.theftRisk === "high") {
      reasons.push(`${data.theftRisk.charAt(0).toUpperCase() + data.theftRisk.slice(1)} vehicle theft risk — comprehensive coverage strongly recommended`);
    }

    // Adjust for vehicle value
    if (vehicleValue > 40000) {
      reasons.push("Higher vehicle value justifies lower deductibles");
      if (recommendedTier === "basic") recommendedTier = "standard";
      if (recommendedTier === "standard") recommendedTier = "enhanced";
    } else if (vehicleValue < 5000) {
      reasons.push("Lower vehicle value — consider dropping comp/collision to save on premiums");
    }

    // Average claim vs minimum coverage warnings
    if (data.avgClaims.bodilyInjury > 60000) {
      reasons.push(`Average BI claim ($${data.avgClaims.bodilyInjury.toLocaleString()}) exceeds CA minimum ($30K/$60K) — higher limits strongly recommended`);
    } else if (data.avgClaims.bodilyInjury > 30000) {
      reasons.push(`Average BI claim ($${data.avgClaims.bodilyInjury.toLocaleString()}) may exceed CA per-person minimum ($30K) — higher limits recommended`);
    }

    return {
      tier: recommendedTier,
      tierData: this.COVERAGE_TIERS[recommendedTier],
      reasons: reasons,
      zipData: data
    };
  },

  // Estimate premium for a coverage configuration
  estimatePremium(zip, tier) {
    const data = this.getZipData(zip);
    if (!data) return null;

    const basePremiums = {
      minimum: 1200,
      basic: 2100,
      standard: 2800,
      enhanced: 3800,
      premium: 5200
    };

    const base = basePremiums[tier] || basePremiums.standard;
    return Math.round(base * data.effectiveRisk);
  },

  // Search for nearby zip codes
  searchZipCodes(query) {
    const results = [];
    for (const [zip, data] of Object.entries(this.ZIP_DATA)) {
      if (zip.startsWith(query) || data.area.toLowerCase().includes(query.toLowerCase())) {
        results.push({ zip, ...data });
      }
      if (results.length >= 10) break;
    }
    return results;
  },

  _getRiskLevel(risk) {
    if (risk >= 1.6) return { level: "Very High", color: "#dc2626", stars: 5 };
    if (risk >= 1.3) return { level: "High", color: "#ea580c", stars: 4 };
    if (risk >= 1.05) return { level: "Moderate", color: "#ca8a04", stars: 3 };
    if (risk >= 0.85) return { level: "Low", color: "#16a34a", stars: 2 };
    return { level: "Very Low", color: "#059669", stars: 1 };
  }
};
