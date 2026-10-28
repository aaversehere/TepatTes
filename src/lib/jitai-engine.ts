import staticTemplates from '../config/static-templates.json';

export type DecisionPointId = 'DP1' | 'DP2' | 'DP3';
export type RuleCategoryCode =
  | '1A'
  | '1B'
  | '1C'
  | '2A'
  | '2B'
  | '2A+2B'
  | '2C'
  | '3A'
  | '3B'
  | '3C';

export interface CheckinInput {
  decisionPoint: DecisionPointId;
  /** Perceived HIV Risk (1.0 - 5.0) */
  prScore: number;
  /** Privacy Concern (1.0 - 5.0) */
  pcScore: number;
  /** HIV-related Stigma (1.0 - 5.0) */
  stScore: number;
  /** HIVST Self-Efficacy (1.0 - 5.0) */
  seScore: number;
  /** Skor SE sebelumnya (diperlukan pada DP2 untuk menghitung ΔSE = SE2 - SE1) */
  previousSeScore?: number | null;
  /** Tambahan khusus DP3: Kecemasan pra-tes (1.0 - 5.0) */
  preTestAnxiety?: number | null;
  /** Tambahan khusus DP3: Pemahaman window period (1.0 - 5.0) */
  windowPeriodUnderstanding?: number | null;
  /** Tambahan khusus DP3: Kesiapan melakukan tes & membaca hasil (1.0 - 5.0) */
  readinessScore?: number | null;
  /** Tambahan khusus DP3: Apakah ragu membaca hasil? */
  doubtReadingResult?: boolean;
  /** Tambahan khusus DP3: Indikasi hasil reaktif / invalid / krisis */
  crisisOrReactiveFlag?: boolean;
}

export interface JitaiDecisionOutput {
  decisionPoint: DecisionPointId;
  ruleMatched: RuleCategoryCode;
  interventionCategory: string;
  title: string;
  summary: string;
  staticTemplateMessage: string;
  actionTips: string[];
  llmBypassed: boolean;
  requiresHumanEscalation: boolean;
  deltaSe: number | null;
  thresholdUsed: number;
  auditRationale: string;
}

export const JITAI_THRESHOLD = 3.5;

/**
 * Lapisan 1: Rule-Based Trigger Engine (Deterministik & Dapat Diaudit)
 *
 * Aturan sesuai Master Prompt Bagian 7:
 * - Ambang skor: 3.5 (inklusif >= 3.5 vs < 3.5)
 * - DP1 (Hari 1, setelah asesmen profil awal):
 *   • 1A: PC >= 3.5 ATAU ST >= 3.5 -> "Privacy & Stigma Reassurance"
 *   • 1B: PC < 3.5 DAN SE < 3.5 -> "Foundational Mastery & Education"
 *   • 1C: PC < 3.5 DAN SE >= 3.5 -> "Action Preparation"
 *
 * - DP2 (Hari 4, setelah modul simulasi/panduan visual kit + check-in ke-2):
 *   • 2A: ΔSE <= 0 ATAU SE2 < 3.5 -> "Targeted Mastery & Vicarious Modeling"
 *   • 2B: PC2 >= 3.5 -> "Device Privacy Protection Guide"
 *   • 2C: SE2 >= 3.5 DAN PC2 < 3.5 (serta ΔSE > 0) -> "Window Period & Kit Readiness"
 *   • Konflik 2A & 2B terpenuhi sekaligus: kategori utama 2A, tambahkan tips privasi 2B ("2A+2B").
 *
 * - DP3 (Hari 8, setelah konfirmasi kit diterima + check-in ke-3):
 *   Prioritas evaluasi: 3B lebih dulu -> 3A -> 3C:
 *   • 3B: indikasi hasil reaktif / invalid / krisis -> BYPASS LLM, Hard Rule Escalation (human-in-the-loop)
 *   • 3A: cemas tinggi (preTestAnxiety >= 3.5) ATAU ragu membaca hasil (doubtReadingResult === true atau SE < 3.5) -> "Affective Regulation & Assisted Option"
 *   • 3C: siap penuh -> "TACT Action Plan & Active Linkage Readiness"
 */
export function evaluateJitaiRule(input: CheckinInput): JitaiDecisionOutput {
  const {
    decisionPoint,
    pcScore,
    stScore,
    seScore,
    previousSeScore,
    preTestAnxiety = 1,
    doubtReadingResult = false,
    crisisOrReactiveFlag = false,
  } = input;

  let ruleMatched: RuleCategoryCode = '1C';
  let llmBypassed = false;
  let requiresHumanEscalation = false;
  let deltaSe: number | null = null;
  let auditRationale = '';

  if (decisionPoint === 'DP1') {
    if (pcScore >= JITAI_THRESHOLD || stScore >= JITAI_THRESHOLD) {
      ruleMatched = '1A';
      auditRationale = `DP1 Rule 1A triggered: PC (${pcScore}) >= 3.5 or ST (${stScore}) >= 3.5.`;
    } else if (pcScore < JITAI_THRESHOLD && seScore < JITAI_THRESHOLD) {
      ruleMatched = '1B';
      auditRationale = `DP1 Rule 1B triggered: PC (${pcScore}) < 3.5, ST (${stScore}) < 3.5, and SE (${seScore}) < 3.5.`;
    } else {
      ruleMatched = '1C';
      auditRationale = `DP1 Rule 1C triggered: PC (${pcScore}) < 3.5, ST (${stScore}) < 3.5, and SE (${seScore}) >= 3.5.`;
    }
  } else if (decisionPoint === 'DP2') {
    const baselineSe =
      typeof previousSeScore === 'number' ? previousSeScore : seScore;
    deltaSe = Number((seScore - baselineSe).toFixed(2));

    const cond2A =
      (typeof previousSeScore === 'number' && deltaSe <= 0) ||
      seScore < JITAI_THRESHOLD;
    const cond2B = pcScore >= JITAI_THRESHOLD;

    if (cond2A && cond2B) {
      ruleMatched = '2A+2B';
      auditRationale = `DP2 Conflict Rule 2A+2B triggered: (deltaSE=${deltaSe} <= 0 or SE2=${seScore} < 3.5) AND PC2 (${pcScore}) >= 3.5. Primary 2A with 2B privacy tips appended.`;
    } else if (cond2A) {
      ruleMatched = '2A';
      auditRationale = `DP2 Rule 2A triggered: deltaSE (${deltaSe}) <= 0 or SE2 (${seScore}) < 3.5, while PC2 (${pcScore}) < 3.5.`;
    } else if (cond2B) {
      ruleMatched = '2B';
      auditRationale = `DP2 Rule 2B triggered: PC2 (${pcScore}) >= 3.5 while SE2 (${seScore}) >= 3.5 and deltaSE (${deltaSe}) > 0.`;
    } else {
      ruleMatched = '2C';
      auditRationale = `DP2 Rule 2C triggered: SE2 (${seScore}) >= 3.5, deltaSE (${deltaSe}) > 0, and PC2 (${pcScore}) < 3.5.`;
    }
  } else if (decisionPoint === 'DP3') {
    // Prioritas evaluasi ketat: 3B lebih dulu, lalu 3A, lalu 3C
    const highAnxiety =
      typeof preTestAnxiety === 'number' && preTestAnxiety >= JITAI_THRESHOLD;
    const lowConfidenceOrDoubt =
      doubtReadingResult === true || seScore < JITAI_THRESHOLD;

    if (crisisOrReactiveFlag) {
      ruleMatched = '3B';
      llmBypassed = true;
      requiresHumanEscalation = true;
      auditRationale = `DP3 Priority 1 Rule 3B triggered: Crisis / Reactive / Invalid indicator flagged. Deterministic LLM Bypass activated.`;
    } else if (highAnxiety || lowConfidenceOrDoubt) {
      ruleMatched = '3A';
      auditRationale = `DP3 Priority 2 Rule 3A triggered: preTestAnxiety (${preTestAnxiety}) >= 3.5 or doubtReadingResult (${doubtReadingResult}) / SE3 (${seScore}) < 3.5.`;
    } else {
      ruleMatched = '3C';
      auditRationale = `DP3 Priority 3 Rule 3C triggered: No crisis/reactive flag, preTestAnxiety (${preTestAnxiety}) < 3.5, and participant ready (SE3=${seScore} >= 3.5).`;
    }
  }

  const tpl = staticTemplates.categories[ruleMatched];

  return {
    decisionPoint,
    ruleMatched,
    interventionCategory: tpl.name,
    title: tpl.title,
    summary: tpl.summary,
    staticTemplateMessage: tpl.message,
    actionTips: tpl.actionTips,
    llmBypassed,
    requiresHumanEscalation,
    deltaSe,
    thresholdUsed: JITAI_THRESHOLD,
    auditRationale,
  };
}
