#!/usr/bin/env node
/**
 * fallhr-api · HTTP wrapper around @ai-native-solutions/fallhr-sdk
 * MIT · AI-Native Solutions
 */

import express from 'express';
import {
  answerQuestion,
  bradfordFactor, bradfordBand,
  reviewDue,
  statutoryNoticeWeeks, statutoryRedundancy,
  autoEnrolEligible,
  complianceSummary, COMPLIANCE_CHECKS,
  dashboardKpis,
  auditAppend, auditVerify,
  exportState, importState,
  RULES, VERSION, TOOLNAME,
} from '@ai-native-solutions/fallhr-sdk';

const app = express();
app.use(express.json({ limit: '4mb' }));

// CORS (permissive for sovereign self-hosting)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ─── Meta ─────────────────────────────────────────────────────────
app.get('/', (_req, res) => res.json({
  tool: TOOLNAME,
  version: VERSION,
  endpoints: [
    'GET  /health',
    'GET  /rules',
    'GET  /compliance/checks',
    'POST /compliance/summary            {completed:[ids]}',
    'POST /qa                            {question}',
    'POST /bradford                      {absences, employeeId}',
    'POST /review-due                    {employee}',
    'POST /notice                        {startDate}',
    'POST /redundancy                    {ageAtDismissal, yearsService, weeklyPayCapped?}',
    'POST /auto-enrol                    {age, annualEarnings}',
    'POST /dashboard                     {state}',
    'POST /audit/append                  {chain, action, payload?, reasoning?}',
    'POST /audit/verify                  {chain}',
    'POST /export                        {state}',
    'POST /import                        {state, payload}',
  ],
}));

app.get('/health', (_req, res) => res.json({ ok: true, tool: TOOLNAME, version: VERSION, ts: Date.now() }));
app.get('/rules', (_req, res) => res.json(RULES));
app.get('/compliance/checks', (_req, res) => res.json(COMPLIANCE_CHECKS));

// ─── Wrapped SDK endpoints ────────────────────────────────────────
app.post('/compliance/summary', (req, res) => {
  res.json(complianceSummary(req.body.completed || []));
});

app.post('/qa', (req, res) => {
  const answer = answerQuestion(req.body.question);
  res.json({ matched: !!answer, answer, source: 'T0 · UK HR rules' });
});

app.post('/bradford', (req, res) => {
  const { absences = [], employeeId } = req.body;
  const score = bradfordFactor(absences, employeeId);
  res.json({ score, band: bradfordBand(score) });
});

app.post('/review-due', (req, res) => res.json({ due: reviewDue(req.body.employee) }));

app.post('/notice', (req, res) => res.json({ weeks: statutoryNoticeWeeks(req.body.startDate) }));

app.post('/redundancy', (req, res) => {
  const { ageAtDismissal, yearsService, weeklyPayCapped } = req.body;
  res.json({ pay: statutoryRedundancy({ ageAtDismissal, yearsService, weeklyPayCapped }), currency: 'GBP' });
});

app.post('/auto-enrol', (req, res) => res.json({ eligible: autoEnrolEligible(req.body) }));

app.post('/dashboard', (req, res) => res.json(dashboardKpis(req.body.state || {})));

app.post('/audit/append', async (req, res) => {
  const { chain = [], action, payload = {}, reasoning = '' } = req.body;
  const r = await auditAppend(chain, action, { payload, reasoning });
  res.json(r);
});

app.post('/audit/verify', async (req, res) => {
  res.json(await auditVerify(req.body.chain || []));
});

app.post('/export', (req, res) => res.json(exportState(req.body.state || {})));

app.post('/import', (req, res) => {
  const { state = {}, payload = {} } = req.body;
  res.json(importState(state, payload));
});

// ─── Boot ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[${TOOLNAME}-api v${VERSION}] listening on :${PORT}`);
});
