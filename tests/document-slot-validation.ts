import assert from 'node:assert/strict';
import { evaluateIdentitySlotCompatibility } from '../shared/documentSlotValidation.ts';

const bankStatement = evaluateIdentitySlotCompatibility({
  documentCategory: 'bank_statement',
  identityDocumentStructure: false,
  issuingAuthorityPresent: false,
  holderIdentityPresent: true,
  transactionActivityPresent: true,
  accountStatementStructurePresent: true,
  financialAccountPresent: true,
});
assert.equal(bankStatement.decision, 'reject');

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

const identity = evaluateIdentitySlotCompatibility({
  documentCategory: 'identity',
  identityDocumentStructure: true,
  issuingAuthorityPresent: true,
  holderIdentityPresent: true,
  transactionActivityPresent: false,
  accountStatementStructurePresent: false,
  financialAccountPresent: false,
});
assert.equal(identity.decision, 'accept');

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

console.log('Identity slot validation: PASSED (4/4)');
