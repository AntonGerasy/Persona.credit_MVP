# Persona.credit v34.28 Release Candidate

- Session token moved from localStorage to sessionStorage to prevent automatic cross-window session inheritance.
- Deterministic obligations engine now excludes grocery, supermarket, restaurant, retail and ordinary merchant purchases from recurring obligations.
- Added deterministic bilingual/parenthetical Latin-name reconciliation.
- Added sixth score factor (Fraud & Document Integrity, 12%) so displayed weights total 100%.
- Humanized machine-token behavioral text in PDF output.
- Aligned displayed uncertainty with analysis confidence.
- Strengthened country-agent rules against sector contradictions and unsupported US social-class claims.
- Added safe PPP fallback text when multiplier data is unavailable.
- Updated verification language to reflect residual uncertainty.
