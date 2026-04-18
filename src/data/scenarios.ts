/**
 * FEDGE 2.O — Real-Life Credit Scenarios
 * Each scenario puts the player in an actual credit situation,
 * asks what they'd do, and shows the REAL score consequence.
 *
 * These are the situations real people face every day.
 * Understanding them is the difference between a 580 and an 800.
 */

export interface ScenarioChoice {
  id: string;
  label: string;
  sublabel: string;
  emoji: string;
  scoreChange: number;       // Points added or subtracted
  isCorrect: boolean;
  consequence: string;       // Short impact description
  explanation: string;       // Why this happened
  xpReward: number;
}

export interface Scenario {
  id: string;
  chapter: string;           // Which mission this belongs to
  title: string;
  situation: string;         // The real-life event
  situationEmoji: string;
  context: string;           // More detail / backstory
  startingScore: number;
  creditCard?: {             // Optional credit card visual
    name: string;
    balance: number;
    limit: number;
    color: string;
  };
  document?: {               // Optional document visual (bill, report)
    title: string;
    lines: string[];
  };
  question: string;          // What should you do?
  choices: ScenarioChoice[];
  lesson: string;            // The principle reinforced
  lessonIcon: string;
}

export const SCENARIOS: Scenario[] = [
  // ─── PAYMENT HISTORY ─────────────────────────────────────
  {
    id: 'missed_payment',
    chapter: 'mission_1_five_factors',
    title: 'The Missed Payment',
    situation: 'Your Chase Sapphire minimum payment was due January 15th.',
    situationEmoji: '📬',
    context:
      'You were busy moving into a new apartment and totally forgot. It\'s now February 20th — 36 days past due. Chase just reported it to the bureaus.',
    startingScore: 724,
    document: {
      title: 'CHASE SAPPHIRE PREFERRED',
      lines: [
        'Payment Due Date:  Jan 15, 2025',
        'Minimum Payment:   $35.00',
        'Days Past Due:     36 days',
        'Status:            ⚠️  LATE — REPORTED',
      ],
    },
    question: 'The damage is done. What do you do RIGHT NOW?',
    choices: [
      {
        id: 'pay_now',
        label: 'Pay the full balance immediately',
        sublabel: 'And call Chase to request goodwill removal',
        emoji: '💳',
        scoreChange: 0,
        isCorrect: true,
        consequence: 'Score stays at 724 — no additional damage',
        explanation:
          'The 30-day late mark is already on your report and will stay 7 years. But paying immediately stops further damage. Calling Chase for a goodwill adjustment sometimes gets it removed — especially if you have a perfect history otherwise.',
        xpReward: 150,
      },
      {
        id: 'ignore',
        label: 'Wait — it\'s only been 36 days',
        sublabel: 'I\'ll pay next month',
        emoji: '😅',
        scoreChange: -42,
        isCorrect: false,
        consequence: '−42 points when it hits 60 days late',
        explanation:
          'Every 30-day milestone (30, 60, 90 days) adds another derogatory mark. Going from 30-day to 60-day late dropped an additional 42 points. At 90 days it gets even worse, and at 120 days Chase may charge off the account entirely.',
        xpReward: 50,
      },
      {
        id: 'dispute',
        label: 'Dispute it as an error with the bureaus',
        sublabel: 'Say it was never late',
        emoji: '⚖️',
        scoreChange: -15,
        isCorrect: false,
        consequence: '−15 points when dispute is rejected + flag on file',
        explanation:
          'Disputing accurate information is fraud. The bureaus investigate and Chase confirms the late payment. Your dispute gets rejected, and filing frivolous disputes can trigger fraud alerts on your file — making it harder to get credit.',
        xpReward: 30,
      },
    ],
    lesson: 'A single 30-day late payment can drop your score 60–110 points. Pay on time, every time — set autopay.',
    lessonIcon: '📅',
  },

  // ─── CREDIT UTILIZATION ─────────────────────────────────
  {
    id: 'maxed_card',
    chapter: 'mission_1_five_factors',
    title: 'The Holiday Maxout',
    situation: 'You just finished Christmas shopping.',
    situationEmoji: '🎄',
    context:
      'Your Capital One card has a $3,000 limit. After buying gifts, your balance is $2,760. Your statement closes in 3 days — that balance will be reported to the bureaus.',
    startingScore: 711,
    creditCard: {
      name: 'CAPITAL ONE QUICKSILVER',
      balance: 2760,
      limit: 3000,
      color: '#CC0000',
    },
    question: 'What do you do before the statement closes?',
    choices: [
      {
        id: 'pay_full',
        label: 'Pay the full $2,760 before statement closes',
        sublabel: 'Zero balance reports to bureaus',
        emoji: '💸',
        scoreChange: +48,
        isCorrect: true,
        consequence: '+48 points — utilization drops from 92% to 0%',
        explanation:
          'Credit utilization is calculated at statement close date, not payment due date. By paying before the statement closes, $0 balance gets reported. Dropping from 92% to 0% utilization on this card added 48 points almost immediately.',
        xpReward: 150,
      },
      {
        id: 'pay_minimum',
        label: 'Pay the $35 minimum when it\'s due',
        sublabel: 'I\'ll pay more next month',
        emoji: '😬',
        scoreChange: -19,
        isCorrect: false,
        consequence: '−19 points — 92% utilization gets reported',
        explanation:
          'The statement closed with $2,760 reported to bureaus — 92% utilization. High utilization is the #2 factor in your score. Even though you\'re current on payments, carrying near-max balances signals financial stress to lenders.',
        xpReward: 50,
      },
      {
        id: 'pay_half',
        label: 'Pay $1,380 — get it to 50% utilization',
        sublabel: 'Better than nothing',
        emoji: '🤔',
        scoreChange: +11,
        isCorrect: false,
        consequence: '+11 points — 50% is better, but not optimal',
        explanation:
          'Getting to 50% helped — any reduction improves your score. But the scoring model rewards under 30% much more significantly, and under 10% is the real sweet spot. You got 11 points instead of 48 by not going all the way.',
        xpReward: 75,
      },
    ],
    lesson: 'Pay your card BEFORE the statement closes, not just before the due date. That\'s when balances get reported.',
    lessonIcon: '💳',
  },

  // ─── CREDIT AGE ─────────────────────────────────────────
  {
    id: 'close_old_card',
    chapter: 'mission_1_five_factors',
    title: 'The Old Card Decision',
    situation: 'You got a call from your bank about your Macy\'s store card.',
    situationEmoji: '🏪',
    context:
      'You opened this Macy\'s card 9 years ago during college. You haven\'t used it in 4 years. The bank is threatening to close it due to inactivity — OR you could close it yourself first. Annual fee: $0.',
    startingScore: 756,
    document: {
      title: 'MACY\'S STORE CARD',
      lines: [
        'Opened:            March 2016  (9 years ago)',
        'Credit Limit:      $1,200',
        'Current Balance:   $0',
        'Last Used:         April 2021',
        'Annual Fee:        $0',
      ],
    },
    question: 'What do you do with this card?',
    choices: [
      {
        id: 'keep_use',
        label: 'Keep it — charge $5 every 6 months',
        sublabel: 'Prevents inactivity closure',
        emoji: '🛍️',
        scoreChange: +12,
        isCorrect: true,
        consequence: '+12 points — age preserved + utilization stays low',
        explanation:
          'Perfect move. A $5 purchase every 6 months keeps the card active, preserving its 9-year history and the $1,200 credit limit (which helps your overall utilization). The bank won\'t close an active account, and you\'re protecting your oldest tradeline.',
        xpReward: 150,
      },
      {
        id: 'close_it',
        label: 'Close it — I never use it anyway',
        sublabel: 'Simplify my finances',
        emoji: '✂️',
        scoreChange: -34,
        isCorrect: false,
        consequence: '−34 points — average age drops + utilization spikes',
        explanation:
          'Closing this account did two things: 1) Removed a 9-year-old account, dropping your average credit age from 6.2 years to 4.1 years. 2) Removed $1,200 of available credit, pushing your overall utilization from 18% to 24%. Both hurt your score.',
        xpReward: 30,
      },
      {
        id: 'let_close',
        label: 'Let the bank close it due to inactivity',
        sublabel: 'Less work for me',
        emoji: '🤷',
        scoreChange: -28,
        isCorrect: false,
        consequence: '−28 points — same damage as closing it yourself',
        explanation:
          'Whether you close it or the bank closes it, the result on your credit report is the same. The 9-year account gets marked closed, your average age drops, and your overall utilization increases. Always use old cards occasionally to prevent this.',
        xpReward: 40,
      },
    ],
    lesson: 'Never close your oldest credit card, even if you never use it. Use it for small purchases to keep it alive.',
    lessonIcon: '⏳',
  },

  // ─── NEW CREDIT / INQUIRIES ──────────────────────────────
  {
    id: 'rate_shopping',
    chapter: 'mission_1_five_factors',
    title: 'Car Loan Shopping',
    situation: 'You\'re buying a used car and shopping for the best rate.',
    situationEmoji: '🚗',
    context:
      'You found a $22,000 Toyota Camry and you\'re rate shopping. You want to apply at multiple lenders to find the lowest interest rate. You have 5 lenders you want to try.',
    startingScore: 688,
    question: 'How do you approach applying to 5 lenders?',
    choices: [
      {
        id: 'all_in_window',
        label: 'Apply to all 5 within the same 2-week window',
        sublabel: 'Rate shopping protection period',
        emoji: '⚡',
        scoreChange: -5,
        isCorrect: true,
        consequence: '−5 points — all 5 applications count as ONE inquiry',
        explanation:
          'FICO knows you\'re shopping for the best rate, not recklessly applying for credit. Multiple auto loan inquiries within a 14–45 day window are deduplicated into a single inquiry. You only lose 5 points instead of 25–50 points. Smart shopping!',
        xpReward: 150,
      },
      {
        id: 'one_per_month',
        label: 'Apply to one lender per month over 5 months',
        sublabel: 'Seems less aggressive',
        emoji: '📅',
        scoreChange: -41,
        isCorrect: false,
        consequence: '−41 points — each application is a separate hard inquiry',
        explanation:
          'Spreading applications over 5 months means 5 separate hard inquiries, each dropping your score 5–10 points. They don\'t cluster together because they\'re outside the rate shopping window. You lost 41 points unnecessarily.',
        xpReward: 30,
      },
      {
        id: 'prequalify',
        label: 'Use soft-pull pre-qualification at each lender first',
        sublabel: 'Then apply formally to the winner',
        emoji: '🔍',
        scoreChange: -5,
        isCorrect: true,
        consequence: '−5 points — only 1 hard inquiry (the winner)',
        explanation:
          'Most lenders offer soft-pull pre-qualification that doesn\'t affect your score. You compare offers, choose the best one, then apply formally with just 1 hard inquiry. This is actually the optimal strategy — same result as option A but with even more control.',
        xpReward: 150,
      },
    ],
    lesson: 'Rate shop for mortgages, auto loans, and student loans within 14–45 days — they count as a single inquiry.',
    lessonIcon: '🔍',
  },

  // ─── CREDIT MIX ─────────────────────────────────────────
  {
    id: 'authorized_user',
    chapter: 'mission_1_five_factors',
    title: 'The Authorized User Play',
    situation: 'Your aunt offers to add you to her credit card as an authorized user.',
    situationEmoji: '👩‍👧',
    context:
      'Your Aunt Rosa has had her Chase Freedom card for 11 years. $8,500 limit, $400 balance, perfect payment history, never missed a payment. She\'s willing to add you if you won\'t charge anything on it.',
    startingScore: 642,
    document: {
      title: 'AUNT ROSA\'S CHASE FREEDOM',
      lines: [
        'Account Age:       11 years, 3 months',
        'Credit Limit:      $8,500',
        'Current Balance:   $400  (4.7% utilization)',
        'Payment History:   ✅ 135/135 on-time payments',
        'Status:            Excellent standing',
      ],
    },
    question: 'Do you accept the offer?',
    choices: [
      {
        id: 'accept',
        label: 'Accept — promise not to use the card',
        sublabel: 'You just want the history benefit',
        emoji: '✅',
        scoreChange: +67,
        isCorrect: true,
        consequence: '+67 points — 11-year history and $8,500 limit added to your file',
        explanation:
          'The moment you\'re added as an authorized user, this account\'s ENTIRE history appears on your credit report. You instantly gain 11 years of perfect payment history and $8,500 of available credit (lowering your overall utilization). This is one of the fastest legal score boosts available.',
        xpReward: 150,
      },
      {
        id: 'decline',
        label: 'Decline — seems like cheating',
        sublabel: 'I\'ll build credit on my own',
        emoji: '🙅',
        scoreChange: 0,
        isCorrect: false,
        consequence: 'No change — but you missed a huge opportunity',
        explanation:
          'Authorized user status is a completely legal and recognized credit-building strategy. Credit card companies, FICO, and the bureaus all recognize it. Lenders use it to help family members build credit. There\'s nothing wrong with it — you just left 67 free points on the table.',
        xpReward: 30,
      },
      {
        id: 'accept_use',
        label: 'Accept — and use it for some purchases',
        sublabel: 'She gave me a card, might as well use it',
        emoji: '💳',
        scoreChange: +31,
        isCorrect: false,
        consequence: '+31 points — but you raised her utilization and strained the relationship',
        explanation:
          'You got some benefit from the age, but by using the card you raised her utilization from 4.7% to 22% — which hurt HER score and violated her trust. Now the relationship is strained and she may remove you as an authorized user, reversing your gains.',
        xpReward: 50,
      },
    ],
    lesson: 'The authorized user strategy is legal and powerful. Getting added to an old account with perfect history is instant credit.',
    lessonIcon: '🎨',
  },

  // ─── REBUILDING ──────────────────────────────────────────
  {
    id: 'secured_card',
    chapter: 'mission_1_five_factors',
    title: 'Building From Zero',
    situation: 'You just turned 18 and have no credit history at all.',
    situationEmoji: '🌱',
    context:
      'You got rejected for a regular credit card — "insufficient credit history." You have $500 saved up. A credit union is offering you a secured card where your deposit becomes your credit limit.',
    startingScore: 0, // No score yet
    question: 'What\'s your first move to build credit?',
    choices: [
      {
        id: 'secured_card',
        label: 'Open the $500 secured card + set up autopay',
        sublabel: 'Use it for gas only — pay in full monthly',
        emoji: '🏦',
        scoreChange: 580,
        isCorrect: true,
        consequence: 'Starting score of ~580 generated after 6 months',
        explanation:
          'A secured card with autopay and low usage is the perfect starting point. After 6 months of on-time payments and low utilization, you\'ll have a real credit score around 580–620. From there, you can upgrade to an unsecured card and your score will grow faster.',
        xpReward: 150,
      },
      {
        id: 'buy_now_pay_later',
        label: 'Use buy-now-pay-later apps (Klarna, Afterpay)',
        sublabel: 'They don\'t need a credit check',
        emoji: '📱',
        scoreChange: 0,
        isCorrect: false,
        consequence: 'No score — most BNPL doesn\'t report to bureaus',
        explanation:
          'Most buy-now-pay-later services don\'t report to the major bureaus, so they don\'t help build credit. You could use them perfectly for years and still have no credit score. Always prioritize products that report to Equifax, Experian, and TransUnion.',
        xpReward: 40,
      },
      {
        id: 'credit_builder_loan',
        label: 'Apply for a credit-builder loan at a credit union',
        sublabel: 'Monthly payments build history AND savings',
        emoji: '💪',
        scoreChange: 565,
        isCorrect: true,
        consequence: 'Starting score of ~565 + you save money in the process',
        explanation:
          'A credit-builder loan is genius: you make monthly payments into a savings account that you receive at the end. Each payment is reported as an installment loan payment, building both your credit history and credit mix. Combine this with the secured card for maximum effect.',
        xpReward: 125,
      },
    ],
    lesson: 'Secured cards and credit-builder loans are the fastest legal ways to build credit from zero.',
    lessonIcon: '🏗️',
  },
];

// Helper: get scenarios for a specific chapter
export function getScenariosForChapter(chapterId: string): Scenario[] {
  return SCENARIOS.filter((s) => s.chapter === chapterId);
}
