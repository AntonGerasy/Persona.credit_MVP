import assert from 'node:assert/strict';
import { evaluateIdentitySlotCompatibility, resolveIdentityValidation } from '../shared/documentSlotValidation.ts';

const bankSignals = {
  documentCategory: 'bank_statement',
  identityDocumentStructure: false,
  issuingAuthorityPresent: false,
  holderIdentityPresent: true,
  transactionActivityPresent: true,
  accountStatementStructurePresent: true,
  financialAccountPresent: true,
};
assert.equal(evaluateIdentitySlotCompatibility(bankSignals).decision, 'reject');

const payslip = evaluateIdentitySlotCompatibility({
  documentCategory: 'payslip',
  identityDocumentStructure: false,
  issuingAuthorityPresent: false,
  holderIdentityPresent: true,
  transactionActivityPresent: false,
  accountStatementStructurePresent: false,
  financialAccountPresent: true,
});
assert.equal(payslip.decision, 'reject');

const identitySignals = {
  documentCategory: 'identity',
  identityDocumentStructure: true,
  issuingAuthorityPresent: true,
  holderIdentityPresent: true,
  transactionActivityPresent: false,
  accountStatementStructurePresent: false,
  financialAccountPresent: false,
};
assert.equal(evaluateIdentitySlotCompatibility(identitySignals).decision, 'accept');

const ambiguous = evaluateIdentitySlotCompatibility({
  documentCategory: 'unknown',
  identityDocumentStructure: true,
  issuingAuthorityPresent: false,
  holderIdentityPresent: true,
  transactionActivityPresent: false,
  accountStatementStructurePresent: false,
  financialAccountPresent: false,
});
assert.equal(ambiguous.decision, 'review');

// C012 composition guards: production acceptance requires BOTH slot compatibility
// and a positive document-validity verdict.
const specimen = resolveIdentityValidation({ ...identitySignals, isValid: false, reason: 'SPECIMEN — synthetic identity document' });
assert.equal(specimen.isValid, false);
assert.equal(specimen.decision, 'review');

const invalidIdentity = resolveIdentityValidation({ ...identitySignals, isValid: false, reason: 'Document expired / illegible / tampered' });
assert.equal(invalidIdentity.isValid, false);
assert.equal(invalidIdentity.decision, 'review');

const validIdentity = resolveIdentityValidation({ ...identitySignals, isValid: true, reason: 'Valid government identity document.' });
assert.equal(validIdentity.isValid, true);
assert.equal(validIdentity.decision, 'accept');

const modelMistakenlyLikesBank = resolveIdentityValidation({ ...bankSignals, isValid: true, reason: 'Looks valid.' });
assert.equal(modelMistakenlyLikesBank.isValid, false);
assert.equal(modelMistakenlyLikesBank.decision, 'reject');

console.log('Identity slot validation: PASSED (8/8)');
