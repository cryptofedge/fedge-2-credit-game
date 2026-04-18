/**
 * FEDGE 2.O — Credit Bureau Service
 * Handles OAuth2 connections to Equifax, Experian, and TransUnion
 *
 * SETUP INSTRUCTIONS:
 * 1. Equifax Developer:   https://developer.equifax.com
 * 2. Experian Developer:  https://developer.experian.com
 * 3. TransUnion:          Contact TransUnion developer relations
 *
 * Each bureau requires:
 *  - Client ID + Client Secret (stored in .env, NEVER committed)
 *  - OAuth2 authorization code flow
 *  - Consumer consent (user must log in to their bureau account)
 *
 * For sandbox/testing, use MOCK_MODE = true below.
 */

// Set to true during development — uses mock data
const MOCK_MODE = true;

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type BureauId = 'equifax' | 'experian' | 'transunion';

export interface BureauScore {
  bureau: BureauId;
  score: number;
  scoreDate: string;
  scoreModel: string;       // e.g. "FICO Score 8", "VantageScore 3.0"
  factors: ScoreFactor[];
  accounts: AccountSummary;
  inquiries: number;
  connected: boolean;
  connectedAt?: string;
}

export interface ScoreFactor {
  code: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  type: 'negative' | 'positive';
}

export interface AccountSummary {
  total: number;
  open: number;
  delinquent: number;
  totalBalance: number;
  totalCreditLimit: number;
  utilizationRate: number;
  oldestAccountAge: number;   // months
}

export interface BureauAuthToken {
  bureau: BureauId;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scope: string;
}

// ─────────────────────────────────────────────
// API Configuration (read from environment)
// ─────────────────────────────────────────────

const BUREAU_CONFIG = {
  equifax: {
    clientId: process.env.EQUIFAX_CLIENT_ID ?? '',
    authUrl: 'https://api.equifax.com/business/consumer-credit/oauth/v1/token',
    reportUrl: 'https://api.equifax.com/business/consumer-credit/v1/report',
    scopes: 'credit-profile:read',
  },
  experian: {
    clientId: process.env.EXPERIAN_CLIENT_ID ?? '',
    authUrl: 'https://api.experian.com/oauth2/v1/token',
    reportUrl: 'https://api.experian.com/consumerservices/credit-profile/v2/credit-report',
    scopes: 'credit_report',
  },
  transunion: {
    clientId: process.env.TRANSUNION_CLIENT_ID ?? '',
    authUrl: 'https://api.transunion.com/oauth/token',
    reportUrl: 'https://api.transunion.com/credit/v1/report',
    scopes: 'credit_report:read',
  },
};

// ─────────────────────────────────────────────
// Mock Data (for development / sandbox)
// ─────────────────────────────────────────────

const MOCK_SCORES: Record<BureauId, BureauScore> = {
  equifax: {
    bureau: 'equifax',
    score: 687,
    scoreDate: new Date().toISOString().split('T')[0],
    scoreModel: 'Equifax Credit Score',
    connected: true,
    connectedAt: new Date().toISOString(),
    factors: [
      { code: 'UTIL_HIGH', description: 'High credit card utilization', impact: 'high', type: 'negative' },
      { code: 'PAY_HIST', description: 'No missed payments in 24 months', impact: 'high', type: 'positive' },
      { code: 'ACCT_AGE', description: 'Average account age is 3 years', impact: 'medium', type: 'positive' },
    ],
    accounts: {
      total: 6,
      open: 5,
      delinquent: 0,
      totalBalance: 4200,
      totalCreditLimit: 14000,
      utilizationRate: 30,
      oldestAccountAge: 48,
    },
    inquiries: 2,
  },
  experian: {
    bureau: 'experian',
    score: 694,
    scoreDate: new Date().toISOString().split('T')[0],
    scoreModel: 'FICO Score 8',
    connected: true,
    connectedAt: new Date().toISOString(),
    factors: [
      { code: 'UTIL_HIGH', description: 'Credit utilization above 30%', impact: 'high', type: 'negative' },
      { code: 'PAY_HIST', description: 'Strong payment history', impact: 'high', type: 'positive' },
      { code: 'NEW_CREDIT', description: 'Recent credit inquiry', impact: 'medium', type: 'negative' },
    ],
    accounts: {
      total: 7,
      open: 6,
      delinquent: 0,
      totalBalance: 4850,
      totalCreditLimit: 15500,
      utilizationRate: 31,
      oldestAccountAge: 48,
    },
    inquiries: 3,
  },
  transunion: {
    bureau: 'transunion',
    score: 701,
    scoreDate: new Date().toISOString().split('T')[0],
    scoreModel: 'VantageScore 3.0',
    connected: true,
    connectedAt: new Date().toISOString(),
    factors: [
      { code: 'UTIL_HIGH', description: 'Revolving utilization is elevated', impact: 'high', type: 'negative' },
      { code: 'PAY_HIST', description: '100% on-time payment rate', impact: 'high', type: 'positive' },
      { code: 'MIX', description: 'Good mix of credit types', impact: 'low', type: 'positive' },
    ],
    accounts: {
      total: 7,
      open: 6,
      delinquent: 0,
      totalBalance: 4600,
      totalCreditLimit: 15000,
      utilizationRate: 30.7,
      oldestAccountAge: 48,
    },
    inquiries: 2,
  },
};

// ─────────────────────────────────────────────
// Service Functions
// ─────────────────────────────────────────────

/**
 * Initiate OAuth flow for a bureau.
 * Returns the URL to open in a WebView for user authorization.
 */
export function getBureauAuthUrl(bureau: BureauId): string {
  if (MOCK_MODE) return `https://mock.fedge.app/auth/${bureau}`;
  const config = BUREAU_CONFIG[bureau];
  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: 'code',
    scope: config.scopes,
    redirect_uri: 'fedge2://oauth/callback',
    state: bureau,
  });
  return `${config.authUrl}?${params.toString()}`;
}

/**
 * Exchange OAuth code for access token.
 * Call this after WebView returns the authorization code.
 */
export async function exchangeCodeForToken(
  bureau: BureauId,
  code: string
): Promise<BureauAuthToken> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 1500)); // Simulate network delay
    return {
      bureau,
      accessToken: `mock_access_${bureau}_${Date.now()}`,
      refreshToken: `mock_refresh_${bureau}`,
      expiresAt: Date.now() + 3600 * 1000,
      scope: BUREAU_CONFIG[bureau].scopes,
    };
  }

  const config = BUREAU_CONFIG[bureau];
  const response = await fetch(config.authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: 'fedge2://oauth/callback',
      client_id: config.clientId,
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(`Failed to get token for ${bureau}: ${response.status}`);
  }

  const data = await response.json();
  return {
    bureau,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    scope: data.scope,
  };
}

/**
 * Fetch credit report from a bureau using an access token.
 */
export async function fetchCreditReport(
  bureau: BureauId,
  accessToken: string
): Promise<BureauScore> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 2000)); // Simulate network delay
    return MOCK_SCORES[bureau];
  }

  const config = BUREAU_CONFIG[bureau];
  const response = await fetch(config.reportUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${bureau} report: ${response.status}`);
  }

  const data = await response.json();
  return parseBureauResponse(bureau, data);
}

/**
 * Parse raw bureau API response into a normalized BureauScore.
 * Each bureau has a different response shape — we normalize here.
 */
function parseBureauResponse(bureau: BureauId, data: Record<string, unknown>): BureauScore {
  // Each bureau has different JSON shapes — adapt as needed
  // This is a placeholder that returns mock data until real API is wired
  console.warn(`parseBureauResponse: implement real parser for ${bureau}`);
  return MOCK_SCORES[bureau];
}

/**
 * Calculate the average (FEDGE) score across all connected bureaus.
 */
export function calculateFedgeScore(scores: Partial<Record<BureauId, BureauScore>>): number {
  const connected = Object.values(scores).filter((s) => s?.connected);
  if (connected.length === 0) return 0;
  const avg = connected.reduce((sum, s) => sum + (s?.score ?? 0), 0) / connected.length;
  return Math.round(avg);
}
