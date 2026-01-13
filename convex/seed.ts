import { mutation } from "./_generated/server";

/**
 * Seed the database with demo portfolio companies and signals
 * for the agriculture investment company demo.
 * 
 * Run this once to populate the demo data:
 * npx convex run seed:seedDemoData
 */

export const seedDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existingCompanies = await ctx.db.query("portfolioCompanies").collect();
    if (existingCompanies.length > 0) {
      return { message: "Database already seeded", companiesCount: existingCompanies.length };
    }

    const now = Date.now();

    // ============================================
    // PORTFOLIO COMPANIES
    // ============================================

    const agriTechId = await ctx.db.insert("portfolioCompanies", {
      name: "AgriTech Germany GmbH",
      region: "Germany",
      sector: "Agricultural Equipment",
      description: "Leading manufacturer of precision farming equipment and smart irrigation systems. Supplies to 200+ farms across EU.",
      riskLevel: "medium",
      activeSignalCount: 0,
      createdAt: now,
    });

    const freshChainId = await ctx.db.insert("portfolioCompanies", {
      name: "FreshChain Singapore Pte Ltd",
      region: "Singapore",
      sector: "Cold Chain Logistics",
      description: "Southeast Asia's premier cold storage and transport network. Handles 40% of regional perishable goods distribution.",
      riskLevel: "medium",
      activeSignalCount: 0,
      createdAt: now,
    });

    const bioSeedsId = await ctx.db.insert("portfolioCompanies", {
      name: "BioSeeds Germany AG",
      region: "Germany",
      sector: "Specialty Seeds",
      description: "Develops proprietary drought-resistant seed varieties. Critical supplier for climate-adaptive agriculture. Single-source for several key crop strains.",
      riskLevel: "high",
      activeSignalCount: 0,
      createdAt: now,
    });

    // ============================================
    // SIGNALS - Geopolitical
    // ============================================

    await ctx.db.insert("signals", {
      title: "EU-China Trade Tensions Escalate Over Agricultural Tech",
      summary: "European Commission announces review of Chinese investments in EU agricultural technology sector. Potential restrictions on tech transfers could affect supply chains.",
      category: "geopolitical",
      severity: "high",
      companyIds: [agriTechId, bioSeedsId],
      relevanceReason: "AgriTech Germany sources 30% of electronic components from China. BioSeeds has R&D partnerships under review.",
      source: "Financial Times",
      sourceUrl: "https://ft.com",
      isBookmarked: false,
      status: "new",
      createdAt: now - 2 * 60 * 60 * 1000, // 2 hours ago
      updatedAt: now - 2 * 60 * 60 * 1000,
    });

    await ctx.db.insert("signals", {
      title: "Singapore-Malaysia Water Dispute Resurfaces",
      summary: "Diplomatic tensions over water supply agreements could impact bilateral trade. Historical sensitivity around resource dependencies.",
      category: "geopolitical",
      severity: "medium",
      companyIds: [freshChainId],
      relevanceReason: "FreshChain's logistics network crosses Malaysia-Singapore border daily. Potential for customs delays or restrictions.",
      source: "Straits Times",
      sourceUrl: "https://straitstimes.com",
      isBookmarked: true,
      status: "tracking",
      createdAt: now - 24 * 60 * 60 * 1000, // 1 day ago
      updatedAt: now - 12 * 60 * 60 * 1000,
    });

    // ============================================
    // SIGNALS - Economic
    // ============================================

    await ctx.db.insert("signals", {
      title: "German Energy Costs Surge 40% YoY",
      summary: "Industrial electricity prices in Germany reach record highs. Manufacturing sector warns of competitiveness erosion.",
      category: "economic",
      severity: "critical",
      companyIds: [agriTechId, bioSeedsId],
      relevanceReason: "Both companies operate energy-intensive facilities in Germany. Direct impact on production costs and margins.",
      source: "Handelsblatt",
      sourceUrl: "https://handelsblatt.com",
      isBookmarked: true,
      status: "tracking",
      createdAt: now - 6 * 60 * 60 * 1000, // 6 hours ago
      updatedAt: now - 3 * 60 * 60 * 1000,
    });

    await ctx.db.insert("signals", {
      title: "Singapore Dollar Strengthens Against Regional Currencies",
      summary: "SGD appreciates 8% against MYR and THB over past quarter. Export competitiveness concerns for Singapore-based logistics.",
      category: "economic",
      severity: "medium",
      companyIds: [freshChainId],
      relevanceReason: "FreshChain earns 60% of revenue in regional currencies. Currency mismatch affects profitability.",
      source: "Bloomberg",
      sourceUrl: "https://bloomberg.com",
      isBookmarked: false,
      status: "new",
      createdAt: now - 48 * 60 * 60 * 1000, // 2 days ago
      updatedAt: now - 48 * 60 * 60 * 1000,
    });

    await ctx.db.insert("signals", {
      title: "Global Fertilizer Prices Hit 3-Year Low",
      summary: "Oversupply and reduced demand push fertilizer prices down 25%. Mixed implications for agricultural sector.",
      category: "economic",
      severity: "low",
      companyIds: [agriTechId],
      relevanceReason: "Lower input costs could boost farm equipment purchases. Positive demand signal for AgriTech.",
      source: "Reuters",
      sourceUrl: "https://reuters.com",
      isBookmarked: false,
      status: "new",
      createdAt: now - 72 * 60 * 60 * 1000, // 3 days ago
      updatedAt: now - 72 * 60 * 60 * 1000,
    });

    // ============================================
    // SIGNALS - Regulatory
    // ============================================

    await ctx.db.insert("signals", {
      title: "EU Common Agricultural Policy Reform Advances",
      summary: "European Parliament approves stricter sustainability requirements for CAP subsidies. Precision farming adoption incentivized.",
      category: "regulatory",
      severity: "medium",
      companyIds: [agriTechId, bioSeedsId],
      relevanceReason: "New requirements boost demand for AgriTech's precision equipment. BioSeeds' drought-resistant varieties align with sustainability goals.",
      source: "Politico EU",
      sourceUrl: "https://politico.eu",
      isBookmarked: false,
      status: "new",
      createdAt: now - 12 * 60 * 60 * 1000, // 12 hours ago
      updatedAt: now - 12 * 60 * 60 * 1000,
    });

    await ctx.db.insert("signals", {
      title: "Singapore Tightens Cold Chain Compliance Standards",
      summary: "New food safety regulations require enhanced temperature monitoring and documentation for perishable goods transport.",
      category: "regulatory",
      severity: "medium",
      companyIds: [freshChainId],
      relevanceReason: "FreshChain needs to upgrade monitoring systems. Compliance costs estimated at $2-3M but creates competitive moat.",
      source: "Singapore Food Agency",
      sourceUrl: "https://sfa.gov.sg",
      isBookmarked: false,
      status: "tracking",
      createdAt: now - 36 * 60 * 60 * 1000, // 1.5 days ago
      updatedAt: now - 24 * 60 * 60 * 1000,
    });

    await ctx.db.insert("signals", {
      title: "Germany Strengthens IP Protection for Seed Patents",
      summary: "New legislation extends patent protection periods for plant varieties. Industry applauds move to protect innovation.",
      category: "regulatory",
      severity: "low",
      companyIds: [bioSeedsId],
      relevanceReason: "BioSeeds' proprietary varieties receive stronger legal protection. Reduces risk of IP leakage to competitors.",
      source: "German Federal Ministry",
      sourceUrl: "https://bmel.de",
      isBookmarked: false,
      status: "new",
      createdAt: now - 96 * 60 * 60 * 1000, // 4 days ago
      updatedAt: now - 96 * 60 * 60 * 1000,
    });

    // ============================================
    // SIGNALS - Supply Chain
    // ============================================

    await ctx.db.insert("signals", {
      title: "Red Sea Shipping Disruptions Continue",
      summary: "Houthi attacks force major carriers to reroute via Cape of Good Hope. Asia-Europe transit times increase by 2 weeks.",
      category: "supply_chain",
      severity: "high",
      companyIds: [agriTechId, freshChainId],
      relevanceReason: "AgriTech's component shipments delayed. FreshChain faces perishable goods spoilage risk on extended routes.",
      source: "Lloyd's List",
      sourceUrl: "https://lloydslist.com",
      isBookmarked: true,
      status: "tracking",
      createdAt: now - 4 * 60 * 60 * 1000, // 4 hours ago
      updatedAt: now - 2 * 60 * 60 * 1000,
    });

    await ctx.db.insert("signals", {
      title: "BioSeeds' Key Supplier Faces Financial Distress",
      summary: "Specialty chemicals supplier announces restructuring. Potential disruption to critical input materials for seed treatment.",
      category: "supply_chain",
      severity: "critical",
      companyIds: [bioSeedsId],
      relevanceReason: "Single-source dependency for key seed coating chemicals. No qualified alternative suppliers identified.",
      source: "Industry Intelligence",
      sourceUrl: "",
      isBookmarked: true,
      status: "tracking",
      createdAt: now - 8 * 60 * 60 * 1000, // 8 hours ago
      updatedAt: now - 4 * 60 * 60 * 1000,
    });

    await ctx.db.insert("signals", {
      title: "Port of Singapore Congestion Eases",
      summary: "Container dwell times return to normal after Q4 peak. Logistics operators report improved scheduling reliability.",
      category: "supply_chain",
      severity: "low",
      companyIds: [freshChainId],
      relevanceReason: "Positive development for FreshChain operations. Reduced delays improve cold chain integrity.",
      source: "Port of Singapore Authority",
      sourceUrl: "https://psa.gov.sg",
      isBookmarked: false,
      status: "resolved",
      createdAt: now - 120 * 60 * 60 * 1000, // 5 days ago
      updatedAt: now - 72 * 60 * 60 * 1000,
    });

    // ============================================
    // SIGNALS - Climate
    // ============================================

    await ctx.db.insert("signals", {
      title: "Severe Drought Warning for Central Europe",
      summary: "Meteorological agencies forecast below-average rainfall for growing season. Agricultural yields at risk across Germany, Poland, Czech Republic.",
      category: "climate",
      severity: "high",
      companyIds: [agriTechId, bioSeedsId],
      relevanceReason: "Drought accelerates demand for BioSeeds' drought-resistant varieties. AgriTech's irrigation systems see surge in inquiries.",
      source: "European Climate Assessment",
      sourceUrl: "https://ecad.eu",
      isBookmarked: false,
      status: "new",
      createdAt: now - 18 * 60 * 60 * 1000, // 18 hours ago
      updatedAt: now - 18 * 60 * 60 * 1000,
    });

    await ctx.db.insert("signals", {
      title: "Southeast Asia Monsoon Season Arrives Early",
      summary: "Unusual weather patterns bring heavy rainfall 3 weeks ahead of schedule. Flooding risk elevated for low-lying agricultural areas.",
      category: "climate",
      severity: "medium",
      companyIds: [freshChainId],
      relevanceReason: "Road transport disruptions possible in Malaysia, Thailand. FreshChain activating contingency routes.",
      source: "ASEAN Meteorological Centre",
      sourceUrl: "",
      isBookmarked: false,
      status: "new",
      createdAt: now - 30 * 60 * 60 * 1000, // 30 hours ago
      updatedAt: now - 30 * 60 * 60 * 1000,
    });

    // ============================================
    // SIGNALS - Market
    // ============================================

    await ctx.db.insert("signals", {
      title: "Competitor Announces Major Expansion in SE Asia",
      summary: "DHL Cold Chain invests $500M in new facilities across ASEAN. Direct competition to FreshChain's market position.",
      category: "market",
      severity: "high",
      companyIds: [freshChainId],
      relevanceReason: "Market share risk as well-capitalized competitor scales up. May trigger pricing pressure.",
      source: "Supply Chain Dive",
      sourceUrl: "https://supplychaindive.com",
      isBookmarked: true,
      status: "tracking",
      createdAt: now - 54 * 60 * 60 * 1000, // 2.25 days ago
      updatedAt: now - 36 * 60 * 60 * 1000,
    });

    // Update company signal counts
    const signals = await ctx.db.query("signals").collect();
    
    const agriTechSignals = signals.filter((s) => 
      s.companyIds.includes(agriTechId) && s.status !== "resolved"
    ).length;
    const freshChainSignals = signals.filter((s) => 
      s.companyIds.includes(freshChainId) && s.status !== "resolved"
    ).length;
    const bioSeedsSignals = signals.filter((s) => 
      s.companyIds.includes(bioSeedsId) && s.status !== "resolved"
    ).length;

    await ctx.db.patch(agriTechId, { activeSignalCount: agriTechSignals });
    await ctx.db.patch(freshChainId, { activeSignalCount: freshChainSignals });
    await ctx.db.patch(bioSeedsId, { activeSignalCount: bioSeedsSignals });

    return {
      message: "Demo data seeded successfully",
      companies: 3,
      signals: signals.length,
    };
  },
});

/**
 * Clear all demo data (use with caution)
 */
export const clearDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    const companies = await ctx.db.query("portfolioCompanies").collect();
    const signals = await ctx.db.query("signals").collect();

    for (const company of companies) {
      await ctx.db.delete(company._id);
    }
    for (const signal of signals) {
      await ctx.db.delete(signal._id);
    }

    return {
      message: "Demo data cleared",
      companiesDeleted: companies.length,
      signalsDeleted: signals.length,
    };
  },
});
