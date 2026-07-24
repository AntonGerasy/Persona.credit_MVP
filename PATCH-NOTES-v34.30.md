# Persona.Credit v34.30 Public RC

- Added deterministic transaction-calendar period guard. LLM/OCR period values can no longer override dated transaction coverage when they materially disagree.
- Corrected period propagation into income and obligations engines and report period labels.
- Added deterministic sector post-processing; known sector/profession can no longer render as “sector not stated”.
- Removed unsourced US median-income and salary-range claims from lender-facing output.
- Fraud & Document Integrity now renders N/A when identity evidence is missing or rejected instead of defaulting to 100/100.
- Identity statuses distinguish passed, failed/rejected, and pending evidence.
- Removed raw confidence/uncertainty diagnostic text from lender-facing UI/PDF.
- Fixed light-theme risk decomposition bars and values.
- Hid empty Evidence Recommendations, all-TBD use-case blocks, and empty pathway blocks.
- Renamed “Path to Potential +100” to “Recommended Next Steps”.
