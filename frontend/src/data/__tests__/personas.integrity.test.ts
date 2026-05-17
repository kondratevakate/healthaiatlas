// Persona references into players and domains must stay in sync. The
// PersonaPage renders example actors and entry-point hubs from these arrays;
// a stale id silently degrades the page to filtering them out. Mirrors the
// claims and hubs integrity tests so the same class of slip fails fast.

import { describe, it, expect } from 'vitest';

import { personas } from '../personas';
import { players } from '../players';
import { domains } from '../domains';
import { HUB_DOMAIN_IDS } from '../constants';
import { UserPersona } from '@/types';

const EXPECTED_PERSONA_IDS: UserPersona[] = ['patient', 'doctor', 'business', 'startup', 'leader'];

const playerIds = new Set(players.map((p) => p.id));
const domainIds = new Set(domains.map((d) => d.id));

describe('persona id coverage', () => {
  it('exposes a persona for every UserPersona literal', () => {
    const present = new Set(personas.map((p) => p.id));
    const missing = EXPECTED_PERSONA_IDS.filter((id) => !present.has(id));
    expect(missing, `personas.ts is missing entries for: ${missing.join(', ')}`).toEqual([]);
  });

  it('persona ids are unique', () => {
    expect(personas.length).toBe(new Set(personas.map((p) => p.id)).size);
  });
});

describe('persona ↔ players integrity', () => {
  it('every persona.relevantPlayerIds entry resolves to a players entry', () => {
    const missing: string[] = [];
    for (const p of personas) {
      for (const pid of p.relevantPlayerIds) {
        if (!playerIds.has(pid)) missing.push(`${p.id} → ${pid}`);
      }
    }
    expect(missing, `Unresolved relevantPlayerIds: ${missing.join(', ')}`).toEqual([]);
  });
});

describe('persona ↔ domains integrity', () => {
  it('every persona.relevantDomainIds entry resolves to a domains entry', () => {
    const missing: string[] = [];
    for (const p of personas) {
      for (const did of p.relevantDomainIds) {
        if (!domainIds.has(did)) missing.push(`${p.id} → ${did}`);
      }
    }
    expect(missing, `Unresolved relevantDomainIds: ${missing.join(', ')}`).toEqual([]);
  });

  it('relevantDomainIds prefer hub domains (HUB_DOMAIN_IDS)', () => {
    // Soft check: warn if a persona points at a non-hub domain. Non-hubs
    // render only the placeholder diagram, which is rarely useful as a
    // landing target. Failing the test forces a conscious choice.
    const hubSet = new Set<string>(HUB_DOMAIN_IDS);
    const offenders: string[] = [];
    for (const p of personas) {
      for (const did of p.relevantDomainIds) {
        if (!hubSet.has(did)) offenders.push(`${p.id} → ${did}`);
      }
    }
    expect(offenders, `Persona points at non-hub domain: ${offenders.join(', ')}`).toEqual([]);
  });
});

describe('persona localization integrity', () => {
  it('every persona has non-empty en and ar for every required field', () => {
    const missing: string[] = [];
    for (const p of personas) {
      const checks: [string, { en: string; ar: string }][] = [
        ['title', p.title],
        ['cardDescription', p.cardDescription],
        ['archetype', p.archetype],
        ['context', p.context],
        ['basis', p.basis],
      ];
      for (const [field, value] of checks) {
        if (!value.en?.trim()) missing.push(`${p.id}.${field}.en`);
        if (!value.ar?.trim()) missing.push(`${p.id}.${field}.ar`);
      }
      if (p.pains.en.length === 0 || p.pains.ar.length === 0) missing.push(`${p.id}.pains`);
      if (p.goals.en.length === 0 || p.goals.ar.length === 0) missing.push(`${p.id}.goals`);
      if (p.journey.en.length === 0 || p.journey.ar.length === 0) missing.push(`${p.id}.journey`);
      if (p.pains.en.length !== p.pains.ar.length) missing.push(`${p.id}.pains length mismatch`);
      if (p.goals.en.length !== p.goals.ar.length) missing.push(`${p.id}.goals length mismatch`);
      if (p.journey.en.length !== p.journey.ar.length) missing.push(`${p.id}.journey length mismatch`);
    }
    expect(missing, `Localization gaps: ${missing.join(', ')}`).toEqual([]);
  });
});
