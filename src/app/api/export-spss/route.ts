import { NextResponse } from 'next/server';
import { appendAuditLog, loadStore, saveStore } from '@/lib/store';

export async function GET() {
  const state = loadStore();

  appendAuditLog(state, {
    actorRole: 'ADMIN',
    actorId: 'RESEARCHER-ADMIN',
    actionType: 'EXPORT_ANONYMIZED_SPSS_CSV',
    targetEntity: 'questionnaire_responses',
    metadata: { exportedCohortSize: state.participants.length },
  });
  saveStore(state);

  const headers = [
    'Token_Pseudonim',
    'Cluster_Code',
    'Group_Allocation_X',
    'Consent_Given',
    'Age',
    'Gender',
    'Grade',
    'Prior_HIV_Info',
    'Shared_Device',
    'Pre_PT_Total',
    'Pre_SE_Total',
    'Pre_INT_Total',
    'Pre_HS_Total',
    'Post_PT_Total',
    'Post_SE_Total',
    'Post_INT_Total',
    'Post_HS_Total',
    'Delta_PT',
    'Delta_SE',
    'Delta_INT',
    'Delta_HS',
    'DP1_Rule',
    'DP2_Rule',
    'DP3_Rule',
    'Completed_DP_Count',
    'Fidelity_Min_2of3_DP',
    'Active_Linkage_Requested',
  ];

  const rows = state.participants.map((p) => {
    const pre = state.questionnaires.find(
      (q) =>
        q.participantToken === p.token && q.phase === 'PRETEST' && !q.isDraft
    );
    const post = state.questionnaires.find(
      (q) =>
        q.participantToken === p.token && q.phase === 'POSTTEST' && !q.isDraft
    );
    const pCheckins = state.checkins.filter(
      (c) => c.participantToken === p.token
    );
    const dp1 = pCheckins.find((c) => c.decisionPoint === 'DP1');
    const dp2 = pCheckins.find((c) => c.decisionPoint === 'DP2');
    const dp3 = pCheckins.find((c) => c.decisionPoint === 'DP3');
    const dpCount = pCheckins.length;
    const fidelity = dpCount >= 2 ? 1 : 0;
    const hasLinkage = state.linkageRequests.some(
      (l) => l.participantToken === p.token
    )
      ? 1
      : 0;

    return [
      p.token,
      p.clusterCode,
      p.groupAllocation === 'INTERVENTION' ? 1 : 0,
      p.consentGiven ? 1 : 0,
      p.covariates?.age || '',
      p.covariates?.gender || '',
      p.covariates?.grade || '',
      p.covariates?.priorHivInfo || '',
      p.covariates?.sharedDevice || '',
      pre ? pre.ptTotal : '',
      pre ? pre.seTotal : '',
      pre ? pre.intTotal : '',
      pre ? pre.hsTotal : '',
      post ? post.ptTotal : '',
      post ? post.seTotal : '',
      post ? post.intTotal : '',
      post ? post.hsTotal : '',
      pre && post ? post.ptTotal - pre.ptTotal : '',
      pre && post ? post.seTotal - pre.seTotal : '',
      pre && post ? post.intTotal - pre.intTotal : '',
      pre && post ? post.hsTotal - pre.hsTotal : '',
      dp1 ? dp1.ruleMatched : '',
      dp2 ? dp2.ruleMatched : '',
      dp3 ? dp3.ruleMatched : '',
      dpCount,
      fidelity,
      hasLinkage,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition':
        'attachment; filename="SENYAP_Anonymized_SPSS_Export_N130.csv"',
    },
  });
}
