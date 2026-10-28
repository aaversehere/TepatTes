import { NextRequest, NextResponse } from 'next/server';
import { hashToken } from '@/lib/crypto';
import {
  appendAuditLog,
  getDecryptedChatForParticipant,
  loadStore,
  recordCheckinAndTriggerJitai,
  saveStore,
} from '@/lib/store';
import { DecisionPointId } from '@/lib/jitai-engine';

export async function GET(req: NextRequest) {
  const token =
    req.nextUrl.searchParams.get('token')?.trim().toUpperCase() ||
    'ID-REMAJA-001';
  const state = loadStore();

  const participant =
    state.participants.find((p) => p.token === token) || state.participants[0];

  const participantQuestionnaires = state.questionnaires.filter(
    (q) => q.participantToken === participant.token
  );
  const participantCheckins = state.checkins.filter(
    (c) => c.participantToken === participant.token
  );
  const participantChat = getDecryptedChatForParticipant(
    state,
    participant.token
  );
  const participantLinkage = state.linkageRequests.filter(
    (l) => l.participantToken === participant.token
  );
  const participantKit = state.kitStatuses.find(
    (k) => k.participantToken === participant.token
  );

  // Ringkasan metrik untuk Dasbor Admin Peneliti & Konselor
  const interventionCount = state.participants.filter(
    (p) => p.groupAllocation === 'INTERVENTION'
  ).length;
  const controlCount = state.participants.filter(
    (p) => p.groupAllocation === 'CONTROL'
  ).length;
  const consentedCount = state.participants.filter(
    (p) => p.consentGiven && !p.withdrawnAt
  ).length;
  const pretestCompletedCount = new Set(
    state.questionnaires
      .filter((q) => q.phase === 'PRETEST' && !q.isDraft)
      .map((q) => q.participantToken)
  ).size;
  const posttestCompletedCount = new Set(
    state.questionnaires
      .filter((q) => q.phase === 'POSTTEST' && !q.isDraft)
      .map((q) => q.participantToken)
  ).size;

  const nextAutoToken = `ID-REMAJA-${String(
    state.participants.length + 1
  ).padStart(3, '0')}`;

  return NextResponse.json({
    llmKillSwitch: state.llmKillSwitch,
    supabaseConnected: state.supabaseConnected,
    nextAutoToken,
    participant,
    participantQuestionnaires,
    participantCheckins,
    participantChat,
    participantLinkage,
    participantKit,
    adminSummary: {
      totalCohort: state.participants.length,
      interventionCount,
      controlCount,
      consentedCount,
      pretestCompletedCount,
      posttestCompletedCount,
      totalCheckins: state.checkins.length,
      totalLinkageRequests: state.linkageRequests.length,
      pendingLinkageCount: state.linkageRequests.filter(
        (l) => l.status === 'PENDING'
      ).length,
      participantsPreview: state.participants.slice(0, 30),
      allLinkageRequests: state.linkageRequests,
      recentAuditLogs: state.auditLogs.slice(0, 40),
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, token = 'ID-REMAJA-001' } = body;
  const cleanToken = String(token).trim().toUpperCase();
  const state = loadStore();

  // 0A. SIGN UP (Otomatis Membuatkan Kode Token Tanpa Mengetik Username + Buat Password)
  if (action === 'SIGN_UP') {
    const rawPassword = String(body.password || '').trim();
    const groupChoice =
      body.groupAllocation === 'CONTROL' ? 'CONTROL' : 'INTERVENTION';

    if (!rawPassword || rawPassword.length < 4) {
      return NextResponse.json(
        { error: 'Password minimal 4 karakter.' },
        { status: 400 }
      );
    }

    const nextIndex = state.participants.length + 1;
    const padded = String(nextIndex).padStart(3, '0');
    const generatedToken = `ID-REMAJA-${padded}`;
    const now = new Date().toISOString();

    const newParticipant = {
      id: `p-${padded}`,
      username: generatedToken.toLowerCase(),
      passwordHash: hashToken(rawPassword),
      token: generatedToken,
      tokenHash: hashToken(generatedToken),
      clusterCode:
        groupChoice === 'INTERVENTION'
          ? 'CLUSTER-INT-NEW'
          : 'CLUSTER-CTL-NEW',
      groupAllocation: groupChoice as 'INTERVENTION' | 'CONTROL',
      consentGiven: false,
      consentAgeCategory: null,
      parentalConsentWaiver: false,
      consentTimestamp: null,
      withdrawnAt: null,
      eligible: true,
      currentDay: 0,
      waitlistCrossoverUnlocked: false,
      covariates: null,
      activeCategory: '1A' as const,
      completedVideos: [],
      createdAt: now,
    };

    state.participants.push(newParticipant);
    state.kitStatuses.push({
      participantToken: generatedToken,
      kitCode: `OQ-ANON-${padded}`,
      receivedConfirmed: false,
      receivedAt: null,
      storageChecked: false,
      simulationCompleted: false,
      selfReportedLineReading: 'UNREAD',
      updatedAt: now,
    });

    appendAuditLog(state, {
      actorRole: 'PARTICIPANT',
      actorId: generatedToken,
      actionType: 'PARTICIPANT_SIGN_UP_AUTO_TOKEN',
      targetEntity: 'participants',
      metadata: {
        generatedToken,
        groupAllocation: groupChoice,
      },
    });
    saveStore(state);

    return NextResponse.json({
      ok: true,
      role: 'PARTICIPANT',
      participant: newParticipant,
    });
  }

  // 0B. LOG IN (Masuk dengan Username Samaran / Token + Password, termasuk akun Konselor & Admin)
  if (action === 'LOG_IN') {
    const identifier = String(body.username || '')
      .trim()
      .toLowerCase();
    const rawPassword = String(body.password || '').trim();

    // Cek login khusus Admin Peneliti
    if (
      (identifier === 'admin' || identifier === 'peneliti') &&
      (rawPassword === 'admin123' || rawPassword === '123456')
    ) {
      appendAuditLog(state, {
        actorRole: 'ADMIN',
        actorId: 'RESEARCHER-ADMIN',
        actionType: 'ADMIN_LOGIN_SUCCESS',
        targetEntity: 'auth',
        metadata: { identifier },
      });
      saveStore(state);
      return NextResponse.json({
        ok: true,
        role: 'ADMIN',
        participant: state.participants[0],
      });
    }

    // Cek login khusus Konselor PKPR
    if (
      (identifier === 'konselor' || identifier === 'pkpr') &&
      (rawPassword === 'pkpr123' || rawPassword === '123456')
    ) {
      appendAuditLog(state, {
        actorRole: 'COUNSELOR',
        actorId: 'COUNSELOR-PKPR-01',
        actionType: 'COUNSELOR_LOGIN_SUCCESS',
        targetEntity: 'auth',
        metadata: { identifier },
      });
      saveStore(state);
      return NextResponse.json({
        ok: true,
        role: 'COUNSELOR',
        participant: state.participants[0],
      });
    }

    // Cek login Peserta berdasarkan Username Samaran ATAU Kode Token
    const matchedParticipant = state.participants.find(
      (p) =>
        p.username.toLowerCase() === identifier ||
        p.token.toLowerCase() === identifier
    );

    if (!matchedParticipant) {
      return NextResponse.json(
        {
          error:
            'Username samaran atau kode token tidak ditemukan. Silakan daftar di tab Sign Up terlebih dahulu.',
        },
        { status: 404 }
      );
    }

    if (matchedParticipant.passwordHash !== hashToken(rawPassword)) {
      return NextResponse.json(
        { error: 'Password yang dimasukkan belum sesuai.' },
        { status: 401 }
      );
    }

    appendAuditLog(state, {
      actorRole: 'PARTICIPANT',
      actorId: matchedParticipant.token,
      actionType: 'PARTICIPANT_LOGIN_SUCCESS',
      targetEntity: 'auth',
      metadata: {
        usernamePseudonym: matchedParticipant.username,
        token: matchedParticipant.token,
      },
    });
    saveStore(state);

    return NextResponse.json({
      ok: true,
      role: 'PARTICIPANT',
      participant: matchedParticipant,
    });
  }

  const participant = state.participants.find((p) => p.token === cleanToken);
  if (!participant && action !== 'TOGGLE_KILL_SWITCH' && action !== 'UPDATE_LINKAGE_STATUS') {
    return NextResponse.json(
      { error: 'Token peserta tidak ditemukan dalam kohort N=130.' },
      { status: 404 }
    );
  }

  // 1. Explicit Digital Consent (Assent 15-17 vs Adult 18-19)
  if (action === 'SUBMIT_CONSENT' && participant) {
    participant.consentGiven = true;
    participant.consentAgeCategory =
      body.ageCategory === 'ADULT_18_19' ? 'ADULT_18_19' : 'ASSENT_15_17';
    participant.parentalConsentWaiver = Boolean(body.parentalConsentWaiver);
    participant.consentTimestamp = new Date().toISOString();
    participant.withdrawnAt = null;
    participant.eligible = true;
    if (participant.currentDay < 0) participant.currentDay = 0;

    appendAuditLog(state, {
      actorRole: 'PARTICIPANT',
      actorId: participant.token,
      actionType: 'EXPLICIT_DIGITAL_CONSENT_GRANTED',
      targetEntity: 'participants',
      metadata: {
        ageCategory: participant.consentAgeCategory,
        parentalConsentWaiver: participant.parentalConsentWaiver,
        clinicalConsentSeparated: true,
      },
    });
    saveStore(state);
    return NextResponse.json({ ok: true, participant });
  }

  // 2. Tarik Persetujuan & Hapus Data (Hak Subjek Data UU PDP No. 27/2022)
  if (action === 'WITHDRAW_CONSENT' && participant) {
    participant.consentGiven = false;
    participant.withdrawnAt = new Date().toISOString();
    state.chatMessages = state.chatMessages.filter(
      (m) => m.participantToken !== participant.token
    );
    appendAuditLog(state, {
      actorRole: 'PARTICIPANT',
      actorId: participant.token,
      actionType: 'CONSENT_WITHDRAWN_AND_DATA_ERASED',
      targetEntity: 'participants',
      metadata: { reason: body.reason || 'User initiated withdrawal' },
    });
    saveStore(state);
    return NextResponse.json({ ok: true, participant });
  }

  // 3. Hapus Cepat Riwayat Layar (Quick Screen History Wipe)
  if (action === 'CLEAR_SCREEN_HISTORY' && participant) {
    let cleared = 0;
    for (const msg of state.chatMessages) {
      if (msg.participantToken === participant.token && !msg.screenCleared) {
        msg.screenCleared = true;
        cleared += 1;
      }
    }
    appendAuditLog(state, {
      actorRole: 'PARTICIPANT',
      actorId: participant.token,
      actionType: 'QUICK_SCREEN_HISTORY_CLEARED',
      targetEntity: 'chat_messages',
      metadata: { clearedCount: cleared },
    });
    saveStore(state);
    return NextResponse.json({ ok: true, clearedCount: cleared });
  }

  // 4. Simpan Kuesioner Pretest / Posttest (atau Draf)
  if (action === 'SUBMIT_QUESTIONNAIRE' && participant) {
    const phase: 'PRETEST' | 'POSTTEST' =
      body.phase === 'POSTTEST' ? 'POSTTEST' : 'PRETEST';
    const isDraft = Boolean(body.isDraft);
    const itemAnswers: Record<string, number> = body.itemAnswers || {};

    if (body.covariates) {
      participant.covariates = body.covariates;
    }

    const sumConstruct = (prefix: string, count: number) => {
      let total = 0;
      for (let i = 1; i <= count; i++) {
        total += Number(itemAnswers[`${prefix}${i}`] || 3);
      }
      return total;
    };

    const submission = {
      id: `q-${Date.now()}`,
      participantToken: participant.token,
      phase,
      isDraft,
      ptTotal: sumConstruct('PT', 8),
      seTotal: sumConstruct('SE', 8),
      intTotal: sumConstruct('INT', 6),
      hsTotal: sumConstruct('HS', 8),
      itemAnswers,
      randomizedOrder: body.randomizedOrder || Object.keys(itemAnswers),
      submittedAt: new Date().toISOString(),
    };

    const existingIdx = state.questionnaires.findIndex(
      (q) => q.participantToken === participant.token && q.phase === phase
    );
    if (existingIdx >= 0) {
      state.questionnaires[existingIdx] = submission;
    } else {
      state.questionnaires.push(submission);
    }

    if (!isDraft) {
      if (phase === 'PRETEST' && participant.currentDay < 1) {
        participant.currentDay = 1;
      }
      if (phase === 'POSTTEST') {
        participant.currentDay = 10;
        // Waitlist Crossover: Kelompok Kontrol (X=0) otomatis mendapat akses penuh fitur adaptif setelah Posttest!
        if (participant.groupAllocation === 'CONTROL') {
          participant.waitlistCrossoverUnlocked = true;
        }
      }
    }

    appendAuditLog(state, {
      actorRole: 'PARTICIPANT',
      actorId: participant.token,
      actionType: isDraft
        ? `QUESTIONNAIRE_${phase}_DRAFT_SAVED`
        : `QUESTIONNAIRE_${phase}_SUBMITTED`,
      targetEntity: 'questionnaire_responses',
      metadata: {
        phase,
        ptTotal: submission.ptTotal,
        seTotal: submission.seTotal,
        intTotal: submission.intTotal,
        hsTotal: submission.hsTotal,
        waitlistCrossoverUnlocked: participant.waitlistCrossoverUnlocked,
      },
    });
    saveStore(state);
    return NextResponse.json({ ok: true, submission, participant });
  }

  // 5. Micro-Check-In & Evaluasi Mesin Aturan JITAI (DP1, DP2, DP3)
  if (action === 'SUBMIT_CHECKIN' && participant) {
    const dp: DecisionPointId = body.decisionPoint || 'DP1';
    const dayIndex = dp === 'DP1' ? 1 : dp === 'DP2' ? 4 : 8;
    const result = recordCheckinAndTriggerJitai(
      state,
      participant.token,
      {
        decisionPoint: dp,
        prScore: Number(body.prScore ?? 3),
        pcScore: Number(body.pcScore ?? 3),
        stScore: Number(body.stScore ?? 3),
        seScore: Number(body.seScore ?? 3),
        preTestAnxiety:
          body.preTestAnxiety !== undefined
            ? Number(body.preTestAnxiety)
            : null,
        windowPeriodUnderstanding:
          body.windowPeriodUnderstanding !== undefined
            ? Number(body.windowPeriodUnderstanding)
            : null,
        readinessScore:
          body.readinessScore !== undefined
            ? Number(body.readinessScore)
            : null,
        doubtReadingResult: Boolean(body.doubtReadingResult),
        crisisOrReactiveFlag: Boolean(body.crisisOrReactiveFlag),
      },
      dayIndex
    );
    return NextResponse.json({ ok: true, ...result, participant });
  }

  // 6. Konfirmasi Penerimaan Kit & Simulasi HIVST
  if (action === 'UPDATE_KIT_STATUS' && participant) {
    let kit = state.kitStatuses.find(
      (k) => k.participantToken === participant.token
    );
    if (!kit) {
      kit = {
        participantToken: participant.token,
        kitCode: `OQ-ANON-${participant.token.slice(-3)}`,
        receivedConfirmed: false,
        receivedAt: null,
        storageChecked: false,
        simulationCompleted: false,
        selfReportedLineReading: 'UNREAD',
        updatedAt: new Date().toISOString(),
      };
      state.kitStatuses.push(kit);
    }

    if (body.receivedConfirmed !== undefined) {
      kit.receivedConfirmed = Boolean(body.receivedConfirmed);
      kit.receivedAt = kit.receivedConfirmed ? new Date().toISOString() : null;
      if (kit.receivedConfirmed && participant.currentDay < 8) {
        participant.currentDay = 8;
      }
    }
    if (body.storageChecked !== undefined) {
      kit.storageChecked = Boolean(body.storageChecked);
    }
    if (body.simulationCompleted !== undefined) {
      kit.simulationCompleted = Boolean(body.simulationCompleted);
      if (kit.simulationCompleted && participant.currentDay < 4) {
        participant.currentDay = 4;
      }
    }
    if (body.selfReportedLineReading) {
      kit.selfReportedLineReading = body.selfReportedLineReading;
    }
    kit.updatedAt = new Date().toISOString();

    appendAuditLog(state, {
      actorRole: 'PARTICIPANT',
      actorId: participant.token,
      actionType: 'KIT_STATUS_UPDATED',
      targetEntity: 'kit_status',
      metadata: { ...kit },
    });
    saveStore(state);
    return NextResponse.json({ ok: true, kit, participant });
  }

  // 7. Tandai Video Edukasi Selesai Ditonton
  if (action === 'COMPLETE_VIDEO' && participant) {
    const videoId = String(body.videoId || '');
    if (videoId && !participant.completedVideos.includes(videoId)) {
      participant.completedVideos.push(videoId);
    }
    appendAuditLog(state, {
      actorRole: 'PARTICIPANT',
      actorId: participant.token,
      actionType: 'VIDEO_MODULE_COMPLETED',
      targetEntity: 'participants',
      metadata: { videoId },
    });
    saveStore(state);
    return NextResponse.json({ ok: true, participant });
  }

  // 8. Permintaan Active Linkage (Reaktif / Nonreaktif / Invalid)
  if (action === 'CREATE_LINKAGE_REQUEST' && participant) {
    const pathway: 'REACTIVE' | 'NONREACTIVE' | 'INVALID' =
      body.pathway || 'REACTIVE';
    const highAnxietyPriority =
      pathway === 'REACTIVE' || Boolean(body.highAnxietyPriority);

    const retestDate = new Date();
    retestDate.setDate(retestDate.getDate() + 84); // +12 minggu (84 hari)

    const reqRecord = {
      id: `lnk-${Date.now()}`,
      participantToken: participant.token,
      pathway,
      requestType: body.requestType || 'COUNSELOR_CHAT',
      highAnxietyPriority,
      slaTargetHours: highAnxietyPriority ? 2 : 24,
      preferredTimeSlot:
        body.preferredTimeSlot || 'Jam Kerja (08.00 - 16.00 WIB)',
      anonymousKitCode:
        pathway === 'INVALID'
          ? `REPL-OQ-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
          : null,
      retestReminderDate:
        pathway === 'NONREACTIVE'
          ? retestDate.toISOString().split('T')[0]
          : null,
      status: 'PENDING' as const,
      counselorNotes: '',
      createdAt: new Date().toISOString(),
      respondedAt: null,
    };

    state.linkageRequests.unshift(reqRecord);

    appendAuditLog(state, {
      actorRole: 'PARTICIPANT',
      actorId: participant.token,
      actionType: `ACTIVE_LINKAGE_${pathway}_REQUESTED`,
      targetEntity: 'linkage_requests',
      metadata: {
        pathway,
        requestType: reqRecord.requestType,
        slaTargetHours: reqRecord.slaTargetHours,
        anonymousKitCode: reqRecord.anonymousKitCode,
      },
    });
    saveStore(state);
    return NextResponse.json({ ok: true, linkageRequest: reqRecord });
  }

  // 9. Konselor PKPR Merespons Active Linkage
  if (action === 'UPDATE_LINKAGE_STATUS') {
    const target = state.linkageRequests.find((l) => l.id === body.linkageId);
    if (target) {
      target.status = body.status || 'IN_PROGRESS';
      target.counselorNotes = body.counselorNotes || target.counselorNotes;
      target.respondedAt = new Date().toISOString();

      appendAuditLog(state, {
        actorRole: 'COUNSELOR',
        actorId: 'COUNSELOR-PKPR-01',
        actionType: 'LINKAGE_REQUEST_RESPONDED',
        targetEntity: 'linkage_requests',
        metadata: {
          linkageId: target.id,
          participantToken: target.participantToken,
          newStatus: target.status,
        },
      });
      saveStore(state);
    }
    return NextResponse.json({ ok: true, target });
  }

  // 10. Admin Peneliti: Kill-Switch Modul LLM
  if (action === 'TOGGLE_KILL_SWITCH') {
    state.llmKillSwitch = Boolean(body.enabled);
    appendAuditLog(state, {
      actorRole: 'ADMIN',
      actorId: 'RESEARCHER-ADMIN',
      actionType: state.llmKillSwitch
        ? 'LLM_KILL_SWITCH_ACTIVATED'
        : 'LLM_KILL_SWITCH_DEACTIVATED',
      targetEntity: 'system_config',
      metadata: { llmKillSwitch: state.llmKillSwitch },
    });
    saveStore(state);
    return NextResponse.json({
      ok: true,
      llmKillSwitch: state.llmKillSwitch,
    });
  }

  // 11. Simulasi Hari (Memudahkan Pengujian Alur 10 Hari)
  if (action === 'SET_CURRENT_DAY' && participant) {
    participant.currentDay = Math.max(0, Math.min(10, Number(body.day ?? 1)));
    saveStore(state);
    return NextResponse.json({ ok: true, participant });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
