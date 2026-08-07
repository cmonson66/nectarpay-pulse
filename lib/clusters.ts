// Vertical -> story cluster. Copy the emails and the Pulse page share.
export type Cluster = 'control' | 'math' | 'crowd' | 'simple';

const MAP: Record<string, Cluster> = {
  'smoke-vape': 'control',
  'kava-kratom': 'control',
  'firearms': 'control',
  'cigar-hookah': 'control',
  'jewelry-gold': 'math',
  'auto': 'math',
  'powersports': 'math',
  'barber': 'crowd',
  'food-drink': 'crowd',
  'tattoo': 'crowd',
  'sneaker-street': 'crowd',
  'collectibles': 'crowd',
  'phone-repair': 'simple',
  'gym-supps': 'simple',
  'pawn': 'control',
  'adult-retail': 'control',
  'med-spa': 'math',
  'pool-landscape': 'math',
  'liquor': 'math',
  'bike': 'math',
  'nail-beauty': 'crowd',
  'gaming': 'crowd',
  'thrift-vintage': 'crowd',
};

export function clusterFor(vertical: string): Cluster {
  return MAP[vertical] ?? 'math';
}

export const CLUSTER_COPY: Record<Cluster, { sub: string; pain: string }> = {
  control: {
    sub: 'Processors treat your industry like a problem. This terminal can\u2019t fire you, freeze you, or reverse you.',
    pain: 'Money lands in your own wallet the second the customer pays \u2014 nobody sits in the middle.',
  },
  math: {
    sub: 'On your ticket sizes, card fees are real money. Here\u2019s what keeping them looks like.',
    pain: 'A 3% fee on a $4,000 sale is $120 gone \u2014 and a delivered sale can still be reversed weeks later. Not on this lane.',
  },
  crowd: {
    sub: '\u201CDo you take crypto?\u201D is already being asked at counters like yours. Be the first on the block that says yes.',
    pain: 'Your customers skew young \u2014 the exact crowd that holds crypto and picks shops that take it.',
  },
  simple: {
    sub: 'Simpler than your card reader \u2014 live by closing time, no percentage of anything, ever.',
    pain: 'Enter the amount, customer scans, money settles to your wallet in seconds. That\u2019s the whole system.',
  },
};

export const INTENT_LABELS: Record<string, string> = {
  fees: 'Cut my card fees',
  control: 'Nobody controls my money',
  chargebacks: 'Kill chargebacks',
  speed: 'Get paid instantly',
  curious: 'Just curious',
};
