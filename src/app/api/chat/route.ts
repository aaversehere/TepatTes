import { NextRequest, NextResponse } from 'next/server';
import { encryptAES256 } from '@/lib/crypto';
import { generateSafeChatTurn } from '@/lib/llm-service';
import {
  appendAuditLog,
  getDecryptedChatForParticipant,
  loadStore,
  saveStore,
} from '@/lib/store';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const token = String(body.token || 'ID-REMAJA-001')
    .trim()
    .toUpperCase();
  const rawMessage = String(body.message || '').trim();

  if (!rawMessage) {
    return NextResponse.json(
      { error: 'Pesan tidak boleh kosong.' },
      { status: 400 }
    );
  }

  const state = loadStore();
  const participant =
    state.participants.find((p) => p.token === token) || state.participants[0];

  const existingMessages = getDecryptedChatForParticipant(
    state,
    participant.token
  );
  const conversationHistory = existingMessages.map((m) => ({
    role: (m.senderRole === 'USER' ? 'user' : 'assistant') as
      | 'user'
      | 'assistant',
    content: m.content,
  }));

  const turn = await generateSafeChatTurn({
    rawUserMessage: rawMessage,
    activeCategory: participant.activeCategory || '1A',
    killSwitchActive: state.llmKillSwitch,
    conversationHistory,
  });

  const now = new Date().toISOString();

  // Simpan pesan pengguna (setelah PII di-scrub & dienkripsi AES-256)
  state.chatMessages.push({
    id: `msg-u-${Date.now()}`,
    participantToken: participant.token,
    senderRole: 'USER',
    encryptedContent: encryptAES256(turn.scrubbedUserMessage),
    piiRedactedCount: turn.piiRedactedCount,
    safetyFlagTriggered: turn.safetyTriggered,
    safetyClassification: turn.safetyClassification,
    safetyBypassMs: turn.safetyExecutionTimeMs,
    modelName: 'USER-INPUT-SCRUBBED',
    systemPromptVersion: turn.systemPromptVersion,
    promptHash: turn.promptHash,
    screenCleared: false,
    createdAt: now,
  });

  // Simpan balasan asisten / safety bypass (dienkripsi AES-256)
  state.chatMessages.push({
    id: `msg-a-${Date.now() + 1}`,
    participantToken: participant.token,
    senderRole: turn.safetyTriggered ? 'SYSTEM_BYPASS' : 'ASSISTANT',
    encryptedContent: encryptAES256(turn.reply),
    piiRedactedCount: 0,
    safetyFlagTriggered: turn.safetyTriggered,
    safetyClassification: turn.safetyClassification,
    safetyBypassMs: turn.safetyExecutionTimeMs,
    modelName: turn.modelName,
    systemPromptVersion: turn.systemPromptVersion,
    promptHash: turn.promptHash,
    screenCleared: false,
    createdAt: new Date(Date.now() + 10).toISOString(),
  });

  // Jika eskalasi manusia dipicu (Krisis / 2 Garis Reaktif), otomatis catat di audit log dengan prioritas tinggi
  appendAuditLog(state, {
    actorRole: 'SYSTEM',
    actorId: participant.token,
    actionType: turn.safetyTriggered
      ? `SAFETY_BYPASS_${turn.safetyClassification}`
      : 'LLM_CHAT_TURN_COMPLETED',
    targetEntity: 'chat_messages',
    metadata: {
      activeCategory: participant.activeCategory,
      piiRedactedCount: turn.piiRedactedCount,
      piiRedactedTypes: turn.piiRedactedTypes,
      safetyTriggered: turn.safetyTriggered,
      safetyClassification: turn.safetyClassification,
      safetyExecutionTimeMs: turn.safetyExecutionTimeMs,
      usedFallbackTemplate: turn.usedFallbackTemplate,
      modelName: turn.modelName,
      systemPromptVersion: turn.systemPromptVersion,
      promptHash: turn.promptHash.slice(0, 16),
    },
  });

  saveStore(state);

  return NextResponse.json({
    ok: true,
    reply: turn.reply,
    turn,
    messages: getDecryptedChatForParticipant(state, participant.token),
  });
}
