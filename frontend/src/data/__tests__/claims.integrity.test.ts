// Cross-file integrity for the verifiable claims model.
//
// Every claim/evidence relationship is the load-bearing trust mechanism of
// the directory. A single broken reference (subject_id → players, evidence_ids
// → evidence, value_entity_id → players) silently degrades the UI to a
// fallback rendering or a dangling pointer. This test enforces referential
// integrity so a missing-id slip fails fast in CI.
//
// Regression: PR-time discovery that claims.ts referenced
// `value_entity_id: 'dha'` while no `dha` entry existed in players.ts.

import { describe, it, expect } from 'vitest';

import { claims } from '../claims';
import { evidence } from '../evidence';
import { players } from '../players';

const playerIds = new Set(players.map((p) => p.id));
const claimIds = new Set(claims.map((c) => c.claim_id));
const evidenceIds = new Set(evidence.map((e) => e.evidence_id));

describe('claims ↔ players integrity', () => {
  it('every claim.subject_id resolves to a players entry', () => {
    const missing = claims
      .filter((c) => !playerIds.has(c.subject_id))
      .map((c) => `${c.claim_id} → ${c.subject_id}`);
    expect(missing, `Unresolved subject_id references: ${missing.join(', ')}`).toEqual([]);
  });

  it('every claim.value_entity_id (when present) resolves to a players entry', () => {
    const missing = claims
      .filter((c) => c.value_entity_id && !playerIds.has(c.value_entity_id))
      .map((c) => `${c.claim_id} → ${c.value_entity_id}`);
    expect(missing, `Unresolved value_entity_id references: ${missing.join(', ')}`).toEqual([]);
  });
});

describe('claims ↔ evidence integrity', () => {
  it('every claim.evidence_ids[] entry resolves to an evidence entry', () => {
    const missing: string[] = [];
    for (const c of claims) {
      for (const eid of c.evidence_ids ?? []) {
        if (!evidenceIds.has(eid)) missing.push(`${c.claim_id} → ${eid}`);
      }
    }
    expect(missing, `Unresolved evidence_ids references: ${missing.join(', ')}`).toEqual([]);
  });
});

describe('players ↔ claims integrity', () => {
  it('every player.claim_ids[] entry resolves to a claims entry', () => {
    const missing: string[] = [];
    for (const p of players) {
      for (const cid of p.claim_ids ?? []) {
        if (!claimIds.has(cid)) missing.push(`${p.id} → ${cid}`);
      }
    }
    expect(missing, `Unresolved player.claim_ids references: ${missing.join(', ')}`).toEqual([]);
  });
});

describe('uniqueness invariants', () => {
  it('player ids are unique', () => {
    expect(players.length).toBe(playerIds.size);
  });

  it('claim_ids are unique', () => {
    expect(claims.length).toBe(claimIds.size);
  });

  it('evidence_ids are unique', () => {
    expect(evidence.length).toBe(evidenceIds.size);
  });
});
