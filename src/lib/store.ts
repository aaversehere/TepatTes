import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { decryptAES256, encryptAES256, hashToken } from './crypto';
import {
  CheckinInput,
  DecisionPointId,
  evaluateJitaiRule,
  RuleCategoryCode,
} from './jitai-engine';

export type GroupAllocation = 'INTERVENTION' | 'CONTROL';

export interface ParticipantRecord {
  id: string;
  username: string;
  passwordHash: string;
  token: string;
  tokenHash: string;
  clusterCode: string;
  groupAllocation: GroupAllocation;
  consentGiven: boolean;
  consentAgeCategory: 'ASSENT_15_17' | 'ADULT_18_19' | null;
  parentalConsentWaiver: boolean;
  consentTimestamp: string | null;
  withdrawnAt: string | null;
  eligible: boolean;
  currentDay: number;
  waitlistCrossoverUnlocked: boolean;
  covariates: {
    age?: string;
    gender?: string;
    grade?: string;
    priorHivInfo?: string;
    sharedDevice?: string;
  } | null;
  activeCategory: RuleCategoryCode;
  completedVideos: string[];
  createdAt: string;
}

export interface QuestionnaireSubmission {
  id: string;
  participantToken: string;
  phase: 'PRETEST' | 'POSTTEST';
  isDraft: boolean;
  ptTotal: number;
  seTotal: number;
  intTotal: number;
  hsTotal: number;
  itemAnswers: Record<string, number>;
  randomizedOrder: string[];
  submittedAt: string;
}

export interface CheckinSubmission {
  id: string;
  participantToken: string;
  decisionPoint: DecisionPointId;
  dayIndex: number;
  prScore: number;
  pcScore: number;
  stScore: number;
  seScore: number;
  deltaSe: number | null;
  preTestAnxiety: number | null;
  windowPeriodUnderstanding: number | null;
  readinessScore: number | null;
  doubtReadingResult: boolean;
  crisisOrReactiveFlag: boolean;
  ruleMatched: RuleCategoryCode;
  interventionCategory: string;
  llmBypassed: boolean;
  createdAt: string;
}

export interface StoredChatMessage {
  id: string;
  participantToken: string;
  senderRole: 'USER' | 'ASSISTANT' | 'SYSTEM_BYPASS';
  encryptedContent: string;
  piiRedactedCount: number;
  safetyFlagTriggered: boolean;
  safetyClassification: string;
  safetyBypassMs: number;
  modelName: string;
  systemPromptVersion: string;
  promptHash: string;
  screenCleared: boolean;
  createdAt: string;
}

export interface DecryptedChatMessage extends Omit<StoredChatMessage, 'encryptedContent'> {
  content: string;
}

export interface LinkageRequestRecord {
  id: string;
  participantToken: string;
  pathway: 'REACTIVE' | 'NONREACTIVE' | 'INVALID';
  requestType: 'COUNSELOR_CHAT' | 'CALLBACK_REQUEST' | 'KIT_REPLACEMENT';
  highAnxietyPriority: boolean;
  slaTargetHours: number;
  preferredTimeSlot: string;
  anonymousKitCode: string | null;
  retestReminderDate: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  counselorNotes: string;
  createdAt: string;
  respondedAt: string | null;
}

export interface KitStatusRecord {
  participantToken: string;
  kitCode: string;
  receivedConfirmed: boolean;
  receivedAt: string | null;
  storageChecked: boolean;
  simulationCompleted: boolean;
  selfReportedLineReading: 'UNREAD' | 'NONREACTIVE' | 'REACTIVE' | 'INVALID';
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorRole: 'PARTICIPANT' | 'ADMIN' | 'COUNSELOR' | 'SYSTEM';
  actorId: string;
  actionType: string;
  targetEntity: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface AppDatabaseState {
  llmKillSwitch: boolean;
  supabaseConnected: boolean;
  participants: ParticipantRecord[];
  questionnaires: QuestionnaireSubmission[];
  checkins: CheckinSubmission[];
  chatMessages: StoredChatMessage[];
  linkageRequests: LinkageRequestRecord[];
  kitStatuses: KitStatusRecord[];
  auditLogs: AuditLogEntry[];
}

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'senyap-store.json');

export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key && url.startsWith('http')) {
    return createClient(url, key);
  }
  return null;
}

function createInitialSeedState(): AppDatabaseState {
  const now = new Date().toISOString();
  const participants: ParticipantRecord[] = [];
  const kitStatuses: KitStatusRecord[] = [];

  // Bangkitkan N=130 token pseudonim (65 Intervensi X=1, 65 Kontrol X=0) dengan alokasi klaster kelas
  for (let i = 1; i <= 130; i++) {
    const padded = String(i).padStart(3, '0');
    const token = `ID-REMAJA-${padded}`;
    const isIntervention = i <= 65;
    const clusterNum = isIntervention
      ? Math.ceil(i / 22)
      : Math.ceil((i - 65) / 22);
    const clusterCode = isIntervention
      ? `CLUSTER-INT-0${clusterNum}`
      : `CLUSTER-CTL-0${clusterNum}`;

    // Buat 2 akun demo pertama sudah terisi contoh progres agar peneliti bisa langsung menguji
    const isDemoReady = i === 1 || i === 66;
    const defaultUsername =
      i === 1
        ? 'siswa_intervensi'
        : i === 66
        ? 'siswa_kontrol'
        : `remaja_${padded}`;

    participants.push({
      id: `p-${padded}`,
      username: defaultUsername,
      passwordHash: hashToken('123456'),
      token,
      tokenHash: hashToken(token),
      clusterCode,
      groupAllocation: isIntervention ? 'INTERVENTION' : 'CONTROL',
      consentGiven: isDemoReady,
      consentAgeCategory: isDemoReady ? 'ASSENT_15_17' : null,
      parentalConsentWaiver: isDemoReady,
      consentTimestamp: isDemoReady ? now : null,
      withdrawnAt: null,
      eligible: true,
      currentDay: i === 1 ? 4 : i === 66 ? 4 : 0,
      waitlistCrossoverUnlocked: false,
      covariates: isDemoReady
        ? {
            age: '16',
            gender: i === 1 ? 'Perempuan' : 'Laki-laki',
            grade: 'Kelas XI',
            priorHivInfo: 'Pernah',
            sharedDevice: 'Tidak, milik pribadi',
          }
        : null,
      activeCategory: '1A',
      completedVideos: i === 1 ? ['VID-01', 'VID-02'] : [],
      createdAt: now,
    });

    kitStatuses.push({
      participantToken: token,
      kitCode: `OQ-ANON-${padded}`,
      receivedConfirmed: i === 1,
      receivedAt: i === 1 ? now : null,
      storageChecked: i === 1,
      simulationCompleted: i === 1,
      selfReportedLineReading: 'UNREAD',
      updatedAt: now,
    });
  }

  // Contoh data Pretest & Check-in DP1 pada ID-REMAJA-001 agar dasbor & progres langsung hidup
  const demoPretestAnswers: Record<string, number> = {};
  for (let k = 1; k <= 8; k++) {
    demoPretestAnswers[`PT${k}`] = 3;
    demoPretestAnswers[`SE${k}`] = 3;
    demoPretestAnswers[`HS${k}`] = 3;
  }
  for (let k = 1; k <= 6; k++) {
    demoPretestAnswers[`INT${k}`] = 3;
  }

  const questionnaires: QuestionnaireSubmission[] = [
    {
      id: 'q-demo-001',
      participantToken: 'ID-REMAJA-001',
      phase: 'PRETEST',
      isDraft: false,
      ptTotal: 24,
      seTotal: 24,
      intTotal: 18,
      hsTotal: 24,
      itemAnswers: demoPretestAnswers,
      randomizedOrder: Object.keys(demoPretestAnswers),
      submittedAt: now,
    },
    {
      id: 'q-demo-066',
      participantToken: 'ID-REMAJA-066',
      phase: 'PRETEST',
      isDraft: false,
      ptTotal: 25,
      seTotal: 23,
      intTotal: 18,
      hsTotal: 24,
      itemAnswers: demoPretestAnswers,
      randomizedOrder: Object.keys(demoPretestAnswers),
      submittedAt: now,
    },
  ];

  const checkins: CheckinSubmission[] = [
    {
      id: 'chk-demo-dp1',
      participantToken: 'ID-REMAJA-001',
      decisionPoint: 'DP1',
      dayIndex: 1,
      prScore: 2.5,
      pcScore: 4.0,
      stScore: 3.8,
      seScore: 3.0,
      deltaSe: null,
      preTestAnxiety: null,
      windowPeriodUnderstanding: null,
      readinessScore: null,
      doubtReadingResult: false,
      crisisOrReactiveFlag: false,
      ruleMatched: '1A',
      interventionCategory: 'Privacy & Stigma Reassurance',
      llmBypassed: false,
      createdAt: now,
    },
  ];

  const chatMessages: StoredChatMessage[] = [
    {
      id: 'msg-demo-01',
      participantToken: 'ID-REMAJA-001',
      senderRole: 'ASSISTANT',
      encryptedContent: encryptAES256(
        'Halo! Selamat datang di ruang aman & rahasia TepatTes. Identitasmu terlindungi dengan Token Pseudonim. Berdasarkan check-in pertamamu (Kategori 1A: Privacy & Stigma Reassurance), kamu bebas bertanya apa pun seputar HIV, cara kerja kit usap gusi OraQuick®, maupun perlindungan privasi di sini. Ingat bahwa HIVST adalah tes skrining awal dengan masa jendela (window period) 12 minggu.'
      ),
      piiRedactedCount: 0,
      safetyFlagTriggered: false,
      safetyClassification: 'SAFE',
      safetyBypassMs: 0.2,
      modelName: 'SYSTEM-WELCOME-1A',
      systemPromptVersion: 'v1.0.0-TEPATTES-WHO2024-PMK2026',
      promptHash: 'seed-hash',
      screenCleared: false,
      createdAt: now,
    },
  ];

  const linkageRequests: LinkageRequestRecord[] = [
    {
      id: 'lnk-demo-01',
      participantToken: 'ID-REMAJA-002',
      pathway: 'REACTIVE',
      requestType: 'CALLBACK_REQUEST',
      highAnxietyPriority: true,
      slaTargetHours: 2,
      preferredTimeSlot: 'Sore (15.00 - 17.00 WIB) via Chat/Telepon Privat',
      anonymousKitCode: 'OQ-ANON-002',
      retestReminderDate: null,
      status: 'PENDING',
      counselorNotes: '',
      createdAt: now,
      respondedAt: null,
    },
  ];

  const auditLogs: AuditLogEntry[] = [
    {
      id: 'aud-init-001',
      actorRole: 'SYSTEM',
      actorId: 'SYSTEM-BOOT',
      actionType: 'INITIALIZE_COHORT_N130',
      targetEntity: 'participants',
      metadata: {
        totalParticipants: 130,
        interventionCount: 65,
        controlCount: 65,
        privacyByDesign: 'UU_PDP_27_2022_AES256',
      },
      createdAt: now,
    },
  ];

  return {
    llmKillSwitch: false,
    supabaseConnected: Boolean(getSupabaseClient()),
    participants,
    questionnaires,
    checkins,
    chatMessages,
    linkageRequests,
    kitStatuses,
    auditLogs,
  };
}

export function loadStore(): AppDatabaseState {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const raw = fs.readFileSync(DATA_FILE_PATH, 'utf8');
      const parsed = JSON.parse(raw) as AppDatabaseState;
      parsed.supabaseConnected = Boolean(getSupabaseClient());
      // Backfill username & passwordHash bila file lama belum memilikinya
      parsed.participants.forEach((p, idx) => {
        if (!p.username) {
          const num = idx + 1;
          p.username =
            num === 1
              ? 'siswa_intervensi'
              : num === 66
              ? 'siswa_kontrol'
              : `remaja_${String(num).padStart(3, '0')}`;
        }
        if (!p.passwordHash) {
          p.passwordHash = hashToken('123456');
        }
      });
      return parsed;
    }
  } catch {
    // Fallback to seed state
  }
  const initial = createInitialSeedState();
  saveStore(initial);
  return initial;
}

export function saveStore(state: AppDatabaseState): void {
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(state, null, 2), 'utf8');
  } catch {
    // Ignore write error in read-only edge environments
  }
}

export function appendAuditLog(
  state: AppDatabaseState,
  entry: Omit<AuditLogEntry, 'id' | 'createdAt'>
): AuditLogEntry {
  const newLog: AuditLogEntry = {
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    ...entry,
  };
  state.auditLogs.unshift(newLog);

  // Jika Supabase dikonfigurasi, sinkronkan ke tabel audit_log secara asinkron
  const supabase = getSupabaseClient();
  if (supabase) {
    supabase
      .from('audit_log')
      .insert({
        actor_role: newLog.actorRole,
        actor_id: newLog.actorId,
        action_type: newLog.actionType,
        target_entity: newLog.targetEntity,
        metadata: newLog.metadata,
      })
      .then(() => {});
  }

  return newLog;
}

export function getDecryptedChatForParticipant(
  state: AppDatabaseState,
  token: string
): DecryptedChatMessage[] {
  return state.chatMessages
    .filter((m) => m.participantToken === token && !m.screenCleared)
    .map((m) => {
      const { encryptedContent, ...rest } = m;
      return {
        ...rest,
        content: decryptAES256(encryptedContent),
      };
    });
}

export function recordCheckinAndTriggerJitai(
  state: AppDatabaseState,
  token: string,
  input: CheckinInput,
  dayIndex: number
) {
  const participant = state.participants.find((p) => p.token === token);
  if (!participant) {
    throw new Error('Participant token not found');
  }

  // Ambil skor SE sebelumnya untuk DP2 (menghitung ΔSE = SE2 - SE1)
  const prevCheckins = state.checkins.filter(
    (c) => c.participantToken === token
  );
  const previousSeScore =
    prevCheckins.length > 0
      ? prevCheckins[prevCheckins.length - 1].seScore
      : null;

  const decision = evaluateJitaiRule({
    ...input,
    previousSeScore,
  });

  const checkinRecord: CheckinSubmission = {
    id: `chk-${Date.now()}`,
    participantToken: token,
    decisionPoint: input.decisionPoint,
    dayIndex,
    prScore: input.prScore,
    pcScore: input.pcScore,
    stScore: input.stScore,
    seScore: input.seScore,
    deltaSe: decision.deltaSe,
    preTestAnxiety: input.preTestAnxiety ?? null,
    windowPeriodUnderstanding: input.windowPeriodUnderstanding ?? null,
    readinessScore: input.readinessScore ?? null,
    doubtReadingResult: Boolean(input.doubtReadingResult),
    crisisOrReactiveFlag: Boolean(input.crisisOrReactiveFlag),
    ruleMatched: decision.ruleMatched,
    interventionCategory: decision.interventionCategory,
    llmBypassed: decision.llmBypassed,
    createdAt: new Date().toISOString(),
  };

  // Ganti check-in pada DP yang sama bila sudah ada, atau tambahkan baru
  const existingIdx = state.checkins.findIndex(
    (c) =>
      c.participantToken === token && c.decisionPoint === input.decisionPoint
  );
  if (existingIdx >= 0) {
    state.checkins[existingIdx] = checkinRecord;
  } else {
    state.checkins.push(checkinRecord);
  }

  participant.activeCategory = decision.ruleMatched;
  if (participant.currentDay < dayIndex) {
    participant.currentDay = dayIndex;
  }

  // Tambahkan pesan intervensi otomatis ke ruang chat
  state.chatMessages.push({
    id: `msg-dp-${Date.now()}`,
    participantToken: token,
    senderRole: decision.llmBypassed ? 'SYSTEM_BYPASS' : 'ASSISTANT',
    encryptedContent: encryptAES256(decision.staticTemplateMessage),
    piiRedactedCount: 0,
    safetyFlagTriggered: decision.llmBypassed,
    safetyClassification: decision.llmBypassed
      ? 'REACTIVE_TEST_RESULT'
      : 'SAFE',
    safetyBypassMs: 0.15,
    modelName: decision.llmBypassed
      ? 'HARD-RULE-3B-BYPASS'
      : `JITAI-LAYER1-${decision.ruleMatched}`,
    systemPromptVersion: 'v1.0.0-TEPATTES-WHO2024-PMK2026',
    promptHash: 'layer1-deterministic-trigger',
    screenCleared: false,
    createdAt: new Date().toISOString(),
  });

  appendAuditLog(state, {
    actorRole: 'PARTICIPANT',
    actorId: token,
    actionType: `JITAI_${input.decisionPoint}_EVALUATED`,
    targetEntity: 'decision_events',
    metadata: {
      decisionPoint: input.decisionPoint,
      ruleMatched: decision.ruleMatched,
      interventionCategory: decision.interventionCategory,
      llmBypassed: decision.llmBypassed,
      deltaSe: decision.deltaSe,
      auditRationale: decision.auditRationale,
    },
  });

  saveStore(state);
  return { checkinRecord, decision };
}
