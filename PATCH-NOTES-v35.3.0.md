# v35.3.0 — Read, Don't Block

- Restores the core product contract: readable evidence always produces a report.
- Replaces COMPLETE-or-RETRY with complete / partial / unreadable document states.
- Partial bank statements remain usable; observed income is presented as a lower bound and cannot create a declared-vs-verified contradiction.
- One unreadable document does not block analysis of the other readable documents. Retry is reserved for the case where no submitted financial document can be read.
- C022 remains invariant: processing failures never become authenticity concerns.
- C025: PDFs are physically split in the browser with pdf-lib before each extraction request.
- Statement control totals now classify completeness with a 1% tolerance; they no longer suppress the report.
- Adds per-chunk extraction diagnostics to the result and a visible report notice when evidence was partially read or unreadable.
- Transaction description payload reduced to 40 characters per record.
- Financial engine rules are otherwise frozen.
