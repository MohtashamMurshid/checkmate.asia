/**
 * Khazanah Sector Mapping
 * 
 * Defines the sectors Khazanah invests in and keywords for matching.
 * Also includes national priorities and portfolio exposure mapping.
 */

import type { NationalPriority, RiskType } from './types';

/**
 * Khazanah investment sectors
 */
export const KHAZANAH_SECTORS = [
  'energy',
  'utilities',
  'infrastructure',
  'healthcare',
  'telecommunications',
  'financial_services',
  'technology',
  'real_estate',
  'aviation',
  'media',
] as const;

export type KhazanahSector = (typeof KHAZANAH_SECTORS)[number];

/**
 * Keywords for sector detection in narratives
 */
export const SECTOR_KEYWORDS: Record<KhazanahSector, string[]> = {
  energy: [
    'energy',
    'oil',
    'gas',
    'petroleum',
    'fuel',
    'power generation',
    'Petronas',
    'renewable',
    'solar',
    'wind power',
  ],
  utilities: [
    'electricity',
    'water',
    'tariff',
    'utility',
    'TNB',
    'Tenaga',
    'power supply',
    'grid',
    'sewerage',
  ],
  infrastructure: [
    'highway',
    'rail',
    'port',
    'airport',
    'construction',
    'MRT',
    'LRT',
    'toll',
    'PLUS',
    'road',
  ],
  healthcare: [
    'hospital',
    'healthcare',
    'medical',
    'pharmaceutical',
    'IHH',
    'clinic',
    'health insurance',
    'medicine',
  ],
  telecommunications: [
    'telco',
    '5G',
    'broadband',
    'mobile',
    'Celcom',
    'Maxis',
    'TM',
    'Telekom',
    'spectrum',
    'network',
  ],
  financial_services: [
    'bank',
    'insurance',
    'fintech',
    'lending',
    'CIMB',
    'Maybank',
    'credit',
    'loan',
    'digital banking',
  ],
  technology: [
    'tech',
    'digital',
    'AI',
    'data center',
    'semiconductor',
    'software',
    'startup',
    'cloud',
    'cybersecurity',
  ],
  real_estate: [
    'property',
    'housing',
    'development',
    'REIT',
    'commercial',
    'residential',
    'land',
    'building',
  ],
  aviation: [
    'airline',
    'airport',
    'aviation',
    'MAS',
    'AirAsia',
    'KLIA',
    'flight',
    'aircraft',
    'cargo',
  ],
  media: [
    'media',
    'broadcast',
    'news',
    'content',
    'Astro',
    'television',
    'streaming',
    'publishing',
  ],
};

/**
 * National priorities mapping
 */
export const NATIONAL_PRIORITIES: Record<NationalPriority, string[]> = {
  food_security: [
    'food security',
    'agriculture',
    'rice',
    'palm oil',
    'fisheries',
    'food supply',
    'import dependency',
  ],
  energy_security: [
    'energy security',
    'fuel subsidy',
    'power supply',
    'electricity tariff',
    'energy independence',
  ],
  digital_sovereignty: [
    'digital sovereignty',
    'data localization',
    'cybersecurity',
    'tech independence',
    '5G ownership',
  ],
  economic_growth: [
    'GDP',
    'economic growth',
    'investment',
    'FDI',
    'employment',
    'productivity',
  ],
  social_welfare: [
    'B40',
    'poverty',
    'subsidy',
    'cost of living',
    'affordable housing',
    'minimum wage',
  ],
  environmental_sustainability: [
    'climate',
    'carbon',
    'ESG',
    'sustainability',
    'green',
    'renewable',
    'emissions',
  ],
  national_security: [
    'national security',
    'defense',
    'strategic',
    'sovereignty',
    'border',
  ],
};

/**
 * Sector to national priority mapping
 */
export const SECTOR_PRIORITY_MAP: Record<KhazanahSector, NationalPriority[]> = {
  energy: ['energy_security', 'environmental_sustainability', 'economic_growth'],
  utilities: ['energy_security', 'social_welfare', 'economic_growth'],
  infrastructure: ['economic_growth', 'social_welfare'],
  healthcare: ['social_welfare'],
  telecommunications: ['digital_sovereignty', 'economic_growth', 'national_security'],
  financial_services: ['economic_growth', 'social_welfare'],
  technology: ['digital_sovereignty', 'economic_growth', 'national_security'],
  real_estate: ['social_welfare', 'economic_growth'],
  aviation: ['economic_growth'],
  media: ['digital_sovereignty'],
};

/**
 * Risk type indicators by keyword
 */
export const RISK_TYPE_KEYWORDS: Record<RiskType, string[]> = {
  regulatory: [
    'regulation',
    'policy',
    'law',
    'legislation',
    'mandate',
    'compliance',
    'license',
    'permit',
    'enforcement',
    'ruling',
  ],
  reputational: [
    'public outcry',
    'criticism',
    'backlash',
    'scandal',
    'controversy',
    'protest',
    'boycott',
    'trust',
  ],
  strategic: [
    'market share',
    'competition',
    'disruption',
    'transformation',
    'restructuring',
    'divestment',
  ],
  operational: [
    'supply chain',
    'operations',
    'workforce',
    'strike',
    'shortage',
    'disruption',
  ],
};

/**
 * Sample Khazanah holdings for exposure mapping
 * In production, this would come from a portfolio database
 */
export const SAMPLE_HOLDINGS: Record<KhazanahSector, string[]> = {
  energy: ['Petronas Gas', 'Tenaga Nasional'],
  utilities: ['Tenaga Nasional', 'IWK'],
  infrastructure: ['PLUS Malaysia', 'Prasarana'],
  healthcare: ['IHH Healthcare'],
  telecommunications: ['Axiata', 'TIME dotCom'],
  financial_services: ['CIMB Group'],
  technology: ['MDEC', 'Cradle Fund'],
  real_estate: ['UEM Sunrise', 'Iskandar Investment'],
  aviation: ['Malaysia Airports', 'Malaysia Aviation Group'],
  media: ['Astro Malaysia'],
};

/**
 * Detect sectors from text
 */
export function detectSectors(text: string): KhazanahSector[] {
  const lowerText = text.toLowerCase();
  const detected: KhazanahSector[] = [];

  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        detected.push(sector as KhazanahSector);
        break;
      }
    }
  }

  return [...new Set(detected)];
}

/**
 * Detect national priorities from text
 */
export function detectNationalPriorities(text: string): NationalPriority[] {
  const lowerText = text.toLowerCase();
  const detected: NationalPriority[] = [];

  for (const [priority, keywords] of Object.entries(NATIONAL_PRIORITIES)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        detected.push(priority as NationalPriority);
        break;
      }
    }
  }

  return [...new Set(detected)];
}

/**
 * Detect risk types from text
 */
export function detectRiskTypes(text: string): RiskType[] {
  const lowerText = text.toLowerCase();
  const detected: RiskType[] = [];

  for (const [riskType, keywords] of Object.entries(RISK_TYPE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        detected.push(riskType as RiskType);
        break;
      }
    }
  }

  return [...new Set(detected)];
}

/**
 * Get holdings affected by sectors
 */
export function getAffectedHoldings(sectors: KhazanahSector[]): string[] {
  const holdings: string[] = [];

  for (const sector of sectors) {
    const sectorHoldings = SAMPLE_HOLDINGS[sector] || [];
    holdings.push(...sectorHoldings);
  }

  return [...new Set(holdings)];
}

/**
 * Get priorities from sectors
 */
export function getPrioritiesFromSectors(sectors: KhazanahSector[]): NationalPriority[] {
  const priorities: NationalPriority[] = [];

  for (const sector of sectors) {
    const sectorPriorities = SECTOR_PRIORITY_MAP[sector] || [];
    priorities.push(...sectorPriorities);
  }

  return [...new Set(priorities)];
}
