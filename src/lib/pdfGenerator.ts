import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DashboardData } from '../types';
import { providerFacingConcerns, normalizeProviderNarrative } from './providerFacing';

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => void;
}

const purposeLabel: Record<string, string> = {
  apartment_rental: 'Apartment / Housing Rental',
  personal_loan: 'Personal Loan',
  auto_financing: 'Auto Financing',
  credit_card: 'Credit Card',
  mortgage: 'Mortgage',
  business_account: 'Business / Bank Account',
  other: 'General Financial Verification',
};

const employmentLabel: Record<string, string> = {
  employed_full_time: 'Full-Time Employee',
  self_employed: 'Self-Employed / Freelance',
  business_owner: 'Business Owner',
  contractor: 'Independent Contractor',
  remote_for_foreign: 'Remote Worker (Foreign Employer)',
};

const fmt = (n: number | null | undefined, currency?: string) => {
  if (n === null || n === undefined || n === 0) return 'N/A';
  const s = n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  return currency ? `${currency} ${s}` : s;
};

export const generateDossierPDF = async (data: DashboardData) => {
  const doc = new jsPDF() as jsPDFWithAutoTable;

  // v34.1 — SCRIPT-SAFE TEXT. jsPDF standard fonts only render Latin-1: Cyrillic, Arabic,
  // Chinese, Devanagari etc. become garbage ("20= !02G5=:>"). Since v34 deterministic
  // document fields put native-script payer names into the PDF, sanitize EVERY string:
  // Cyrillic is transliterated (common case: UA/RU documents); any other non-Latin-1 run
  // is replaced with a compact [*] marker (full text remains in the web report).
  const CYR: Record<string, string> = {
    'а':'a','б':'b','в':'v','г':'h','ґ':'g','д':'d','е':'e','є':'ie','ж':'zh','з':'z','и':'y',
    'і':'i','ї':'i','й':'i','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s',
    'т':'t','у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'shch','ь':'','ю':'iu',
    'я':'ia','ё':'e','ъ':'','ы':'y','э':'e',
  };
  const translitChar = (ch: string): string => {
    const lower = ch.toLowerCase();
    const t = CYR[lower];
    if (t === undefined) return ch;
    return ch === lower ? t : (t.charAt(0).toUpperCase() + t.slice(1));
  };
  const PUNCT: Record<string, string> = {
    '\u2014': ' - ', '\u2013': '-', '\u2018': "'", '\u2019': "'", '\u201C': '"', '\u201D': '"',
    '\u2022': '-', '\u2026': '...', '\u2248': '~', '\u2122': '(TM)', '\u2192': '->', '\u2190': '<-',
    '\u20B9': 'INR ', '\u20AC': 'EUR ', '\u00A0': ' ',
  };
  // v34.12: Vietnamese (and Polish/Czech/Turkish…) names are LATIN with diacritics —
  // 'NGUYỄN' was falling into the non-Latin-1 catch-all and printing 'NGUY[*]N'.
  // Strip to the ASCII base letter instead (Nguyễn → Nguyen). đ/Đ decompose specially.
  const stripLatinDiacritic = (ch: string): string => {
    // Stroke/dotless letters do not NFD-decompose — map explicitly.
    const STROKE: Record<string, string> = { '\u0111': 'd', '\u0110': 'D', '\u0141': 'L', '\u0142': 'l', '\u0131': 'i' };
    if (STROKE[ch]) return STROKE[ch];
    const base = ch.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return /^[\x00-\x7F]+$/.test(base) ? base : ch;
  };
  const sanitizePdfText = (s: string): string =>
    s
      .replace(/[\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u2026\u2248\u2122\u2192\u2190\u20B9\u20AC\u00A0]/g, (ch) => PUNCT[ch] ?? ch) // common typography → ASCII
      .replace(/[\u0400-\u04FF]/g, translitChar)                 // Cyrillic → Latin transliteration
      .replace(/[\u0100-\u024F\u1E00-\u1EFF]/g, stripLatinDiacritic) // Latin extended (vi/pl/cz/tr…) → ASCII base
      .replace(/[\u0100-\uFFFF]+/g, '[*]');                      // any other non-Latin-1 run (CJK etc.) → marker
  const rawText = doc.text.bind(doc);
  (doc as any).text = (text: any, ...rest: any[]) => {
    const clean = Array.isArray(text) ? text.map((t: any) => typeof t === 'string' ? sanitizePdfText(t) : t)
      : typeof text === 'string' ? sanitizePdfText(text) : text;
    return rawText(clean, ...(rest as [number, number]));
  };
  const rawSplit = doc.splitTextToSize.bind(doc);
  (doc as any).splitTextToSize = (text: any, ...rest: any[]) =>
    rawSplit(typeof text === 'string' ? sanitizePdfText(text) : text, ...(rest as [number]));
  // autoTable renders its own text (bypasses doc.text) — sanitize table cells too.
  const sanitizeCell = (c: any): any => typeof c === 'string' ? sanitizePdfText(c) : c;
  const sanitizeRows = (rows: any): any => Array.isArray(rows) ? rows.map((r: any) => Array.isArray(r) ? r.map(sanitizeCell) : sanitizeCell(r)) : rows;
  const safeAutoTable = (docRef: any, options: any) => autoTable(docRef, {
    ...options,
    head: sanitizeRows(options?.head),
    body: sanitizeRows(options?.body),
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  const C = {
    dark:    [15, 41, 47]   as [number,number,number],
    teal:    [0, 155, 135]  as [number,number,number],
    slate:   [71, 85, 105]  as [number,number,number],
    light:   [241, 245, 249]as [number,number,number],
    white:   [255, 255, 255]as [number,number,number],
    green:   [16, 185, 129] as [number,number,number],
    amber:   [245, 158, 11] as [number,number,number],
    red:     [239, 68, 68]  as [number,number,number],
    border:  [226, 232, 240]as [number,number,number],
  };

  const formattedDate = data.generatedAt
    ? new Date(data.generatedAt).toLocaleDateString('en-US', { dateStyle: 'long' })
    : new Date().toLocaleDateString('en-US', { dateStyle: 'long' });

  const expiryDate = data.generatedAt
    ? new Date(data.generatedAt + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { dateStyle: 'long' })
    : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { dateStyle: 'long' });

  const fv = data.financial_verified || {};
  const ca = data.country_analysis || {};
  const allDocs = (data.document_extractions || []);
  const usableDocs = allDocs.filter((d: any) => d.is_usable);
  const partialDocs = allDocs.filter((d: any) => d.extraction_completeness === 'partial');
  const unreadableDocs = allDocs.filter((d: any) => d.extraction_completeness === 'unreadable' || d.processing_failed === true);
  const purpose = purposeLabel[data.verification_purpose || ''] || 'Financial Verification';
  const empType = employmentLabel[data.employment_type || ''] || data.employment_type || '—';
  const shareId = data.shareId || 'PC-' + Math.random().toString(36).substring(2, 10).toUpperCase();

  let y = 0;

  // ── HEADER ────────────────────────────────────────────────────────────────
  doc.setFillColor(...C.dark);
  doc.rect(0, 0, pageWidth, 48, 'F');

  doc.setTextColor(...C.white);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('PERSONA.CREDIT', margin, 20);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 220, 220);
  doc.text('Cross-Border Financial Verification Report', margin, 30);
  doc.text(`For: ${purpose.toUpperCase()}`, margin, 38);

  doc.setTextColor(...C.white);
  doc.setFontSize(7);
  doc.text(`Report ID: ${shareId}`, pageWidth - margin, 18, { align: 'right' });
  doc.text(`Issued: ${formattedDate}`, pageWidth - margin, 26, { align: 'right' });
  doc.text(`Valid Until: ${expiryDate}`, pageWidth - margin, 34, { align: 'right' });

  y = 58;

  // ── SECTION HEADER HELPER ────────────────────────────────────────────────
  const sectionHeader = (title: string) => {
    doc.setFillColor(...C.light);
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setTextColor(...C.slate);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), margin + 3, y + 5.5);
    y += 12;
  };

  const infoTable = (rows: [string, string][]) => {
    safeAutoTable(doc, {
      startY: y,
      body: rows,
      theme: 'plain',
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 2.5, textColor: C.dark },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60, textColor: C.slate },
        1: { fontStyle: 'normal' },
      },
    });
    y = ((doc as any).lastAutoTable?.finalY ?? y) + 8;
  };

  const drawLine = () => {
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.1);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
  };

  // ── I. APPLICANT PROFILE ──────────────────────────────────────────────────
  sectionHeader('I. Applicant Profile');
  infoTable([
    ['Full Legal Name', (data.fullName || '—').toUpperCase()],
    ['Origin Country', data.origin_country || '—'],
    ['Destination Country', data.destination_country || '—'],
    ['Purpose of Application', purpose],
    ['Employment Type', empType],
    ['Analysis Confidence', `${((data.confidence || 0) * 100).toFixed(0)}%`],
    ['TransferScore™', `${data.score || 0} / 1000 — ${data.level || 'Assessed'}`],
    ...((data as any).economic_score != null ? [['Economic Evidence Score', `${(data as any).economic_score} / 1000 — identity status shown separately`]] : []),
    ['Identity Verification', (data as any).identity_verification_status || 'Identity verification pending'],
    ...((data as any).is_qa_fixture_assessment ? [['Assessment Mode', 'SYNTHETIC QA FIXTURE — NOT FOR REAL-WORLD USE']] : []),
  ]);

  // ── II. EXECUTIVE SUMMARY ─────────────────────────────────────────────────
  sectionHeader('II. Executive Summary');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.dark);
  const summaryLines = doc.splitTextToSize(
    data.summaryStatement || 'Financial profile generated from cross-border documentation.',
    contentWidth
  );
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 5 + 10;

  // ── III. INCOME & FINANCIAL VERIFICATION ─────────────────────────────────
  sectionHeader('III. Income & Financial Verification');

  if (usableDocs.length > 0) {
    const rec: any = data.reconciliation || {};
    const recStatus = rec.income_status || 'unverified';
    const docUsd = Number(rec.verified_monthly_usd) || 0;
    const incomeLabel =
      recStatus === 'verified' ? 'Verified Monthly Income (USD)'
      : recStatus === 'partial' ? 'Documented Monthly Income (partial vs declared)'
      : recStatus === 'contradicted' ? 'Documented Monthly Income (declared figure contradicted)'
      : 'Documented Monthly Income (USD)';

    const incomeRows: [string, string][] = [
      [incomeLabel, docUsd > 0 ? `$${fmt(docUsd)}/month` : (fv.verified_monthly_income_local ? fmt(fv.verified_monthly_income_local, fv.verified_currency || '') : '—')],
    ];
    // On a contradiction, show the declared claim and the gap plainly — never present it as verified.
    if (recStatus === 'contradicted' && Number(rec.declared_monthly_usd) > 0) {
      incomeRows.push(['Declared (unverified claim)', `$${fmt(rec.declared_monthly_usd)}/month — ${rec.discrepancy_pct}% vs documented`]);
    }
    incomeRows.push(
      ['Origin Income Benchmark', ca.raw_data_table?.income_percentile_label || 'Not independently benchmarked'],
      ['Documents Analysed', `${usableDocs.length} document(s)`],
      ['Coverage Period', fv.document_coverage_months ? `~${fv.document_coverage_months} months` : '—'],
      ['Sector Demand (Destination)', ca.sector_demand_in_destination || '—'],
    );
    infoTable(incomeRows);

    // Income context in origin
    if (ca.origin_income_context) {
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...C.slate);
      doc.text('Income in Origin Country Context:', margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...C.dark);
      const ctxLines = doc.splitTextToSize(ca.origin_income_context, contentWidth);
      doc.text(ctxLines, margin, y);
      y += ctxLines.length * 4.5 + 6;
    }

    // Income transfer narrative — key paragraph for lender
    if (ca.income_transfer_narrative) {
      doc.setFillColor(...C.dark);
      doc.roundedRect(margin, y, contentWidth, 3, 0, 0, 'F');
      y += 7;
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...C.teal);
      doc.text('What This Means for the Lender:', margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...C.dark);
      const narrativeLines = doc.splitTextToSize(ca.income_transfer_narrative, contentWidth);
      doc.text(narrativeLines, margin, y);
      y += narrativeLines.length * 4.5 + 10;
    }
  } else {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...C.slate);
    doc.text(
      allDocs.length > 0
        ? 'Submitted financial documents could not be read; they are not included in the figures below.'
        : 'No documents were uploaded. Income figures below are self-declared by the applicant.',
      margin, y
    );
    y += 10;
  }

  // v35.3.5 — extraction provenance belongs next to the financial figures, not hidden
  // at the end of the report. Partial documents are lower bounds; unreadable submitted
  // documents remain visible so a recipient can distinguish "not submitted" from "not read".
  if (partialDocs.length > 0 || unreadableDocs.length > 0) {
    if (y > 242) { doc.addPage(); y = 20; }
    doc.setFillColor(255, 251, 235);
    const coverageLines: string[] = [];
    partialDocs.forEach((d: any) => {
      const label = d.source_file_name || d.issuing_institution || d.document_type || 'Submitted statement';
      const ops = Number(d.extraction_diagnostics?.extracted_operations || 0);
      coverageLines.push(`Extraction coverage — ${label}: ${ops} transactions read from the submitted statement. Where extraction is marked partial, figures derived from this document are observed minimums.`);
    });
    unreadableDocs.forEach((d: any) => {
      const label = d.source_file_name || d.issuing_institution || d.document_type || 'Submitted document';
      coverageLines.push(`${label}: Submitted; could not be read — not included in the figures.`);
    });
    const wrapped = coverageLines.flatMap((line) => doc.splitTextToSize(line, contentWidth - 8));
    const boxHeight = Math.max(18, wrapped.length * 4.2 + 10);
    doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.amber);
    doc.text('Extraction Coverage', margin + 4, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.dark);
    doc.text(wrapped, margin + 4, y + 11);
    y += boxHeight + 8;
  }

  // ── Original Document Raw Data table ──────────────────────────────────────
  const rdt = (ca as any).raw_data_table;
  if (rdt) {
    if (y > 230) { doc.addPage(); y = 20; }
    y += 2;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.slate);
    doc.text('Original Document Data — Translated & Contextualised:', margin, y);
    y += 5;

    const rawRows: [string, string][] = [];
    if (rdt.monthly_income_original) rawRows.push([rdt.monthly_income_original, rdt.monthly_income_usd || '—']);
    if (!data.pppContextOnly && rdt.ppp_equivalent_usd) rawRows.push(['PPP Equivalent', rdt.ppp_equivalent_usd]);
    if (rdt.income_percentile_label) rawRows.push([rdt.income_percentile_label, rdt.income_vs_national_median || '—']);
    if (rdt.income_vs_sector_median) rawRows.push(['vs Sector Median', rdt.income_vs_sector_median]);
    if (rdt.sector_benchmark_note) rawRows.push(['Profession Note', rdt.sector_benchmark_note]);
    if (rdt.document_institution) rawRows.push(['Source Institution', rdt.document_institution]);
    if (rdt.document_period) rawRows.push(['Document Period', rdt.document_period]);
    if (rdt.income_pattern) rawRows.push(['Income Pattern', rdt.income_pattern]);

    if (rawRows.length > 0) {
      safeAutoTable(doc, {
        startY: y,
        head: [['Original Figure / Metric', 'Translation & Context']],
        body: rawRows,
        theme: 'striped',
        margin: { left: margin, right: margin },
        headStyles: { fillColor: C.dark, textColor: [255, 255, 255], fontSize: 7, fontStyle: 'bold' },
        bodyStyles: { fontSize: 7.5, textColor: C.dark },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 65, textColor: C.slate } },
      });
      y = ((doc as any).lastAutoTable?.finalY ?? y) + 8;
    }
  }

  // ── Financial Culture Context ─────────────────────────────────────────────
  const fcc = (ca as any).financial_culture_context;
  if (fcc) {
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.slate);
    doc.text('Financial Culture Context — how money is managed in the origin country:', margin, y);
    y += 5;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.dark);
    const fccLines = doc.splitTextToSize(fcc, 175);
    doc.text(fccLines, margin, y);
    y += fccLines.length * 4 + 3;

    const guidance = (ca as any).lender_cultural_guidance;
    if (guidance) {
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(...C.slate);
      const gLines = doc.splitTextToSize('Lender guidance: ' + guidance, 175);
      doc.text(gLines, margin, y);
      y += gLines.length * 4 + 4;
    }
  }

  drawLine();

  // ── IV. DOCUMENT EVIDENCE ─────────────────────────────────────────────────
  sectionHeader('IV. Document Evidence');

  if (usableDocs.length > 0) {
    for (const docItem of usableDocs) {
      // Check for page break
      if (y > 240) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...C.dark);
      doc.text(`${docItem.document_type} — ${docItem.issuing_institution}`, margin, y);
      y += 5;

      const docRows: [string, string][] = [
        ['Issuing Country', docItem.issuing_country || '—'],
        ['Period Covered', docItem.period_covered || '—'],
        ['Language', docItem.detected_language || '—'],
      ];

      if (docItem.average_monthly_inflow > 0)
        docRows.push(['Avg Monthly Inflow', fmt(docItem.average_monthly_inflow, docItem.currency_code)]);
      if (docItem.ending_balance > 0)
        docRows.push(['Ending Balance', fmt(docItem.ending_balance, docItem.currency_code)]);
      if (docItem.income_regularity && !/identity/i.test(String(docItem.document_type || '')))
        docRows.push(['Income Pattern', docItem.income_regularity]);
      if (docItem.salary_deposits_detected)
        docRows.push(['Salary Deposits', `Detected — ${docItem.salary_deposit_count} deposit(s)`]);
      if (docItem.estimated_monthly_obligations > 0)
        docRows.push(['Est. Monthly Obligations', fmt(docItem.estimated_monthly_obligations, docItem.currency_code)]);
      if (docItem.asset_type && docItem.asset_type !== 'N/A')
        docRows.push(['Asset Type', docItem.asset_type]);
      if (docItem.asset_estimated_value_local > 0)
        docRows.push(['Asset Value (Local)', fmt(docItem.asset_estimated_value_local, docItem.currency_code)]);

      docRows.push(['Name Match', docItem.account_holder_name_match || '—']);

      safeAutoTable(doc, {
        startY: y,
        body: docRows,
        theme: 'plain',
        margin: { left: margin + 4, right: margin },
        styles: { fontSize: 7.5, cellPadding: 2, textColor: C.dark },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 55, textColor: C.slate },
        },
      });
      y = ((doc as any).lastAutoTable?.finalY ?? y) + 4;

      if (docItem.analyst_note) {
        doc.setFontSize(7);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(...C.slate);
        const noteLines = doc.splitTextToSize(`Note: ${docItem.analyst_note}`, contentWidth - 6);
        doc.text(noteLines, margin + 4, y);
        y += noteLines.length * 4 + 4;
      }

      // v34.4 — deterministic income audit: which credits counted, which were excluded and why.
      const audit = docItem.income_audit;
      if (audit && audit.engine === 'deterministic' && (audit.counted?.length || audit.excluded?.length || audit.review_required?.length)) {
        if (y > 230) { doc.addPage(); y = 20; }
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...C.dark);
        doc.text('Income Audit — credits counted toward verified income (deterministic engine):', margin + 4, y);
        y += 4;

        const REASON_LABEL: Record<string, string> = {
          self_transfer_marker: 'Excluded: self-transfer (own accounts)',
          sender_is_applicant: 'Excluded: sender matches applicant',
          own_company: "Excluded: applicant's own company",
          bank_interest: 'Excluded: bank interest (not income)',
        };
        const MAX_ROWS = 20;
        const displayParty = (v: any) => /\[\*\]/.test(String(v || '')) ? 'Masked Counterparty' : (String(v || '-') || '-');
        const countedRows = (audit.counted || []).slice(0, MAX_ROWS).map((t: any) =>
          [t.date || '-', displayParty(t.counterparty), fmt(t.amount, docItem.currency_code), 'Counted']);
        const excludedRows = (audit.excluded || []).slice(0, 10).map((t: any) =>
          [t.date || '-', displayParty(t.counterparty), fmt(t.amount, docItem.currency_code), REASON_LABEL[t.reason] || (t.reason === 'refund_or_reversal' ? 'Excluded: refund / reversal' : 'Excluded')]);
        const reviewRows = (audit.review_required || []).slice(0, 10).map((t: any) =>
          [t.date || '-', displayParty(t.counterparty), fmt(t.amount, docItem.currency_code), 'Review required: ambiguous credit']);
        const overflow = Math.max(0, (audit.counted?.length || 0) - MAX_ROWS);

        safeAutoTable(doc, {
          startY: y,
          head: [['Date', 'Payer', 'Amount', 'Status']],
          body: [...countedRows, ...excludedRows, ...reviewRows],
          theme: 'striped',
          margin: { left: margin + 4, right: margin },
          styles: { fontSize: 6.5, cellPadding: 1.5, textColor: C.dark },
          headStyles: { fontSize: 6.5, fontStyle: 'bold', fillColor: [241, 245, 249], textColor: C.slate },
          columnStyles: { 0: { cellWidth: 22 }, 2: { cellWidth: 30, halign: 'right' } },
        });
        y = ((doc as any).lastAutoTable?.finalY ?? y) + 3;

        doc.setFontSize(7);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(...C.slate);
        const totalLine = `Counted ${audit.counted_count} credit(s), ${fmt(audit.counted_total, docItem.currency_code)} over ${audit.period_months_used} month(s); excluded ${audit.excluded_count} non-income credit(s); ${audit.review_required_count || 0} credit(s) require manual review${overflow > 0 ? `; +${overflow} counted row(s) not shown` : ''}.`;
        const tLines = doc.splitTextToSize(totalLine, contentWidth - 6);
        doc.text(tLines, margin + 4, y);
        y += tLines.length * 4 + 4;
      }

      // v34.10 — deterministic obligations audit: which debits counted as recurring
      // obligations, which were excluded and why.
      const oblAudit = docItem.obligations_audit;
      if (oblAudit && oblAudit.engine === 'deterministic' && (oblAudit.counted?.length || oblAudit.excluded?.length)) {
        if (y > 230) { doc.addPage(); y = 20; }
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...C.dark);
        doc.text('Obligations Audit — debits counted toward monthly obligations (deterministic engine):', margin + 4, y);
        y += 4;

        const OBL_REASON_LABEL: Record<string, string> = {
          rent_housing: 'Counted: rent / housing',
          utilities: 'Counted: utilities',
          loan_or_credit: 'Counted: loan / credit card',
          insurance: 'Counted: insurance',
          tuition: 'Counted: tuition',
          recurring_payment: 'Counted: recurring contractual payment',
          ordinary_merchant_purchase: 'Excluded: ordinary merchant purchase',
          own_transfer: 'Excluded: own-account transfer',
          one_off_or_discretionary: 'Excluded: one-off / discretionary',
        };
        const OBL_MAX_ROWS = 20;
        const oblCountedRows = (oblAudit.counted || []).slice(0, OBL_MAX_ROWS).map((t: any) =>
          [t.date || '-', t.counterparty || '-', fmt(t.amount, docItem.currency_code), OBL_REASON_LABEL[t.reason] || 'Counted']);
        const oblExcludedRows = (oblAudit.excluded || []).slice(0, 10).map((t: any) =>
          [t.date || '-', t.counterparty || '-', fmt(t.amount, docItem.currency_code), OBL_REASON_LABEL[t.reason] || 'Excluded']);
        const oblOverflow = Math.max(0, (oblAudit.counted?.length || 0) - OBL_MAX_ROWS);

        safeAutoTable(doc, {
          startY: y,
          head: [['Date', 'Payee', 'Amount', 'Status']],
          body: [...oblCountedRows, ...oblExcludedRows],
          theme: 'striped',
          margin: { left: margin + 4, right: margin },
          styles: { fontSize: 6.5, cellPadding: 1.5, textColor: C.dark },
          headStyles: { fontSize: 6.5, fontStyle: 'bold', fillColor: [241, 245, 249], textColor: C.slate },
          columnStyles: { 0: { cellWidth: 22 }, 2: { cellWidth: 30, halign: 'right' } },
        });
        y = ((doc as any).lastAutoTable?.finalY ?? y) + 3;

        doc.setFontSize(7);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(...C.slate);
        const oblTotalLine = `Counted ${oblAudit.counted_count} debit(s), ${fmt(oblAudit.counted_total, docItem.currency_code)} over ${oblAudit.period_months_used} month(s); excluded ${oblAudit.excluded_count} debit(s) as non-obligations${oblOverflow > 0 ? `; +${oblOverflow} counted row(s) not shown` : ''}.`;
        const oblTLines = doc.splitTextToSize(oblTotalLine, contentWidth - 6);
        doc.text(oblTLines, margin + 4, y);
        y += oblTLines.length * 4 + 4;
      }

      const visibleConcerns = providerFacingConcerns(docItem.authenticity_concerns);
      if (visibleConcerns.length > 0) {
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...C.amber);
        const concernLines = doc.splitTextToSize(`Evidence Review Notes: ${visibleConcerns.map(normalizeProviderNarrative).join('; ')}`, contentWidth - 6);
        doc.text(concernLines, margin + 4, y);
        y += concernLines.length * 4 + 2;
      }

      y += 4;
    }
  } else {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...C.slate);
    doc.text('No documents provided. Analysis is based on self-declared information only.', margin, y);
    y += 10;
  }

  // ── V. SCORE BREAKDOWN ────────────────────────────────────────────────────
  if (y > 220) { doc.addPage(); y = 20; }
  sectionHeader('V. Score Breakdown');

  const bd = data.breakdown;
  if (bd) {
    safeAutoTable(doc, {
      startY: y,
      head: [['Factor', 'Score (0–100)', 'Weight']],
      body: [
        ['Identity Reliability',          `${bd.identityScore?.toFixed(0) ?? '—'}/100`,   '22%'],
        ['Financial Stability',           `${bd.incomeScore?.toFixed(0) ?? '—'}/100`,      '26%'],
        ['Cross-Border Transferability',  `${bd.crossBorderScore?.toFixed(0) ?? '—'}/100`, '16%'],
        ['Migration Resilience',          `${bd.housingScore?.toFixed(0) ?? '—'}/100`,     '14%'],
        ['Behavioral Consistency',        `${bd.paymentScore?.toFixed(0) ?? '—'}/100`,     '10%'],
        ['Fraud & Document Integrity',     bd.fraudIntegrityScore == null ? 'N/A — identity not production-verified' : `${Number(bd.fraudIntegrityScore).toFixed(0)}/100`, '12%'],
      ],
      theme: 'grid',
      margin: { left: margin, right: margin },
      headStyles: { fillColor: C.dark, textColor: C.white, fontSize: 7.5, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 3, textColor: C.dark },
      columnStyles: {
        1: { halign: 'center' as const },
        2: { halign: 'center' as const, textColor: C.slate },
      },
    });
    y = ((doc as any).lastAutoTable?.finalY ?? y) + 10;
  }

  // ── VI. STRENGTHS & CONSIDERATIONS ───────────────────────────────────────
  if (y > 220) { doc.addPage(); y = 20; }
  sectionHeader('VI. Strengths & Considerations');

  const strengths: string[] = (data.strengths || data.analysis?.strengths || []).map(normalizeProviderNarrative).filter(Boolean);
  const risks: string[] = (data.risks || data.analysis?.risks || []).map(normalizeProviderNarrative).filter(Boolean).filter((r: string) => providerFacingConcerns([r]).length > 0);

  if (strengths.length > 0) {
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.green);
    doc.text(`Strengths${data.confidence !== undefined ? ` (analysis confidence ~${Math.round((Number(data.confidence) || 0) * 100)}%)` : ''}:`, margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.dark);
    strengths.slice(0, 5).forEach(s => {
      const lines = doc.splitTextToSize(`• ${s}`, contentWidth - 4);
      doc.text(lines, margin + 3, y);
      y += lines.length * 4.5;
    });
    y += 4;
  }

  if (risks.length > 0) {
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.amber);
    doc.text('Considerations:', margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.dark);
    risks.slice(0, 5).forEach(r => {
      const lines = doc.splitTextToSize(`• ${r}`, contentWidth - 4);
      doc.text(lines, margin + 3, y);
      y += lines.length * 4.5;
    });
  }
  y += 6;

  // ═══ v34.6 DASHBOARD PARITY — the lender-facing PDF must carry the full picture, ═══
  // ═══ not a poor man's excerpt of what the applicant sees in the dashboard.       ═══
  const ensureRoom = (needed = 40) => { if (y > 285 - needed) { doc.addPage(); y = 20; } };
  const bullets = (items: any[], max = 5, color: [number, number, number] = C.dark) => {
    doc.setFontSize(7.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...color);
    (items || []).filter(Boolean).slice(0, max).forEach((s: any) => {
      ensureRoom(12);
      const lines = doc.splitTextToSize(`• ${String(s)}`, contentWidth - 4);
      doc.text(lines, margin + 3, y);
      y += lines.length * 4.5;
    });
    y += 2;
  };
  const subLabel = (t: string, color: [number, number, number] = C.slate) => {
    ensureRoom(14); doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...color);
    doc.text(t, margin, y); y += 5;
  };

  // ── VII. INCOME RECONCILIATION, GEOGRAPHY & PPP ───────────────────────────
  ensureRoom(70);
  sectionHeader('VII. Income Reconciliation, Geography & PPP Context');
  const rec: any = data.reconciliation || {};
  const recRows: [string, string][] = [];
  if (rec.income_status) recRows.push(['Reconciliation Status', String(rec.income_status).toUpperCase() + (rec.docs_only ? ' (docs-only)' : '')]);
  if (rec.declared_monthly_usd) recRows.push(['Declared by Applicant', `$${fmt(rec.declared_monthly_usd)}/month`]);
  else if (rec.docs_only) recRows.push(['Declared by Applicant', 'Not provided — documents are the sole source']);
  if (rec.verified_monthly_usd) recRows.push(['Verified by Documents', `$${fmt(rec.verified_monthly_usd)}/month`]);
  if (rec.discrepancy_pct !== null && rec.discrepancy_pct !== undefined) recRows.push(['Gap (verified vs declared)', `${rec.discrepancy_pct > 0 ? '+' : ''}${rec.discrepancy_pct}%`]);
  // v34.12 — savings provenance: docs-first fallback or unverified cash claim.
  if (rec.savings_source === 'statement_balance') recRows.push(['Savings Basis', `Statement ending balance${rec.liquid_reserves_effective_usd ? ` (~$${fmt(rec.liquid_reserves_effective_usd)})` : ''} — no declared figure; docs-first.`]);
  else if (rec.savings_source === 'self_declared_unverified') recRows.push(['Savings Basis', `Self-declared${rec.liquid_reserves_effective_usd ? ` (~$${fmt(rec.liquid_reserves_effective_usd)})` : ''} — UNVERIFIED, no supporting statement.`]);
  const geo: any = (data as any).geo || null;
  if (geo) {
    recRows.push(['Geography Framing', geo.already_in_destination
      ? `Already resident in ${geo.destination_country || data.destination_country || 'destination'} — assessed as a current resident, not a prospective mover.`
      : `Prospective mover to ${geo.destination_country || data.destination_country || 'destination'}.`]);
    if (Array.isArray(geo.signals) && geo.signals.length) recRows.push(['Geography Signals', geo.signals.slice(0, 3).join('; ')]);
  }
  if ((data as any).countryBenchmarkAvailable === false) {
    recRows.push(['Country Benchmark', 'Unavailable — no default PPP or inflation values were used']);
  } else if ((data as any).livePPPMultiplier) {
    recRows.push(['PPP Multiplier', `x${(data as any).livePPPMultiplier} — origin purchasing-power context only${(data as any).pppContextOnly ? '; underwriting uses documented USD income, not PPP' : ''}`]);
  }
  if (recRows.length) {
    safeAutoTable(doc, {
      startY: y, body: recRows, theme: 'plain',
      margin: { left: margin + 2, right: margin },
      styles: { fontSize: 7.5, cellPadding: 2, textColor: C.dark },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 55, textColor: C.slate } },
    });
    y = ((doc as any).lastAutoTable?.finalY ?? y) + 4;
  }
  if (rec.explanation) {
    ensureRoom(16);
    doc.setFontSize(7.5); doc.setFont('helvetica', 'italic'); doc.setTextColor(...C.slate);
    const exLines = doc.splitTextToSize(rec.explanation, contentWidth - 4);
    doc.text(exLines, margin + 2, y); y += exLines.length * 4 + 6;
  }

  // ── VIII. SCORE DECOMPOSITION & DRIVERS ───────────────────────────────────
  ensureRoom(70);
  sectionHeader('VIII. Score Decomposition & Drivers');
  const sb: any = (data as any).score_breakdown || null;
  if (sb) {
    const sbRows: [string, string][] = [
      ['Base Score (0-100)', `${sb.base_score ?? '—'}`],
      ['Contradiction Penalty', `${sb.contradiction_penalty ? '-' + sb.contradiction_penalty : '0'}`],
      ['Confidence Adjustment', `-${sb.confidence_adjustment ?? 0}`], // stored positive; applied as a subtraction (mirrors dashboard)
      ['Evidence Adjustment', `${sb.evidence_adjustment ?? 0}`],
      ['Final Adjusted (0-100)', `${sb.final_adjusted_score ?? '—'}`],
    ];
    safeAutoTable(doc, {
      startY: y, body: sbRows, theme: 'plain',
      margin: { left: margin + 2, right: margin },
      styles: { fontSize: 7.5, cellPadding: 2, textColor: C.dark },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 55, textColor: C.slate } },
    });
    y = ((doc as any).lastAutoTable?.finalY ?? y) + 4;
  }
  const score = Number(data.score) || 0;
  ensureRoom(12);
  doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...C.dark);
  doc.text(`TransferScore: ${score} / 1000 — ${data.level || 'Assessed'}`, margin, y); y += 4;
  doc.setFont('helvetica', 'normal'); doc.setTextColor(...C.slate);
  doc.text('Proprietary cross-border financial evidence score. Not equivalent to FICO or a credit bureau score.', margin, y); y += 7;

  const se: any = (data as any).dossier_analysis?.score_explanation || null;
  if (se) {
    if (Array.isArray(se.score_increase_factors) && se.score_increase_factors.length) {
      subLabel('Positive Catalysts:', C.green); bullets(se.score_increase_factors, 4);
    }
    if (Array.isArray(se.score_decrease_factors) && se.score_decrease_factors.length) {
      subLabel('Pressure Factors:', C.amber); bullets(se.score_decrease_factors, 4);
    }
    if (Array.isArray(se.most_influential_factors) && se.most_influential_factors.length) {
      subLabel('Primary Underwriting Weights:'); bullets(se.most_influential_factors, 3);
    }
  }
  const humanizeMachineText = (value: unknown): string => String(value || '')
    .replace(/^['"]|['"]$/g, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (c) => c.toUpperCase())
    .replace(/\.$/, '') + (String(value || '').trim() ? '.' : '');
  const behSummaryRaw: any = (data as any).dossier_analysis?.behavioral_summary;
  const rawBehSummary: any = typeof behSummaryRaw === 'string' ? behSummaryRaw : (behSummaryRaw?.overall_stability || null);
  const behSummary: any = rawBehSummary ? humanizeMachineText(rawBehSummary) : null;
  const behConsistency: any = (data as any).behavioral_analysis?.behavioral_consistency;
  if (behSummary || behConsistency !== undefined) {
    subLabel('Behavioral Observation:');
    doc.setFontSize(7.5); doc.setFont('helvetica', 'italic'); doc.setTextColor(...C.dark);
    const behText = `${behSummary ? `"${behSummary}"` : ''}${behConsistency !== undefined ? ` (interaction stability: ${behConsistency}%)` : ''}`.trim();
    const behLines = doc.splitTextToSize(behText, contentWidth - 4);
    ensureRoom(behLines.length * 4 + 6);
    doc.text(behLines, margin + 2, y); y += behLines.length * 4 + 6;
  }

  // ── IX. PROFILE METRICS, EVIDENCE QUALITY & MARKET READINESS (v34.7) ──────
  {
    ensureRoom(80);
    sectionHeader('IX. Profile Metrics, Evidence Quality & Market Readiness');
    const up: any = (data as any).underwritingPillars || {};
    const beh: any = (data as any).behavioral_analysis || {};
    const isContested = String(rec.income_status || '') === 'contradicted';
    const infOffset = (data as any).realTimeInflationOffset;
    const fitSignal = isContested ? 'Contested' : score < 500 ? 'Pending Evidence' : ((data as any).destinationCountryFit || 'Assessed');
    // Same normalization the dashboard uses for the Fidelity circle.
    const eqRaw = Number((data as any).dossier_analysis?.evidence_summary?.evidence_quality);
    const evidenceQualityPct = Number.isFinite(eqRaw) ? Math.round(Math.max(0, Math.min(100, eqRaw > 0 && eqRaw <= 1 ? eqRaw * 100 : eqRaw))) : null;

    const pmRows: [string, string][] = [];
    if (up.stabilityScore !== undefined) pmRows.push(['Stability Index', `${up.stabilityScore}% fidelity`]);
    if (up.transferabilityIndex !== undefined) pmRows.push(['Transferability', `${up.transferabilityIndex}% mobility`]);
    if (up.inflationDefenseFactor) pmRows.push(['Inflation Defense', `${up.inflationDefenseFactor}`]);
    if ((data as any).countryBenchmarkAvailable !== false && infOffset !== undefined && infOffset !== null) pmRows.push(['Inflation Offset', `${Number(infOffset) > 0 ? '+' : ''}${infOffset}%`]);
    pmRows.push(['Interaction Stability', `${beh.behavioral_consistency || 85}%`]);
    if (evidenceQualityPct !== null) pmRows.push(['Evidence Quality (Fidelity)', `${evidenceQualityPct}%`]);
    pmRows.push(['Market Readiness — Target Territory', `${data.destination_country || '—'} (fit signal: ${fitSignal})`]);
    safeAutoTable(doc, {
      startY: y, body: pmRows, theme: 'plain',
      margin: { left: margin + 2, right: margin },
      styles: { fontSize: 7.5, cellPadding: 2, textColor: C.dark },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 62, textColor: C.slate } },
    });
    y = ((doc as any).lastAutoTable?.finalY ?? y) + 4;

    const sharedConsistencyConcerns: string[] = Array.isArray((data as any).uncertaintyAnalysis?.high_uncertainty_areas)
      ? (data as any).uncertaintyAnalysis.high_uncertainty_areas
      : [];
    const consistencyPatterns: string[] = sharedConsistencyConcerns.length
      ? sharedConsistencyConcerns
      : (Array.isArray(beh.consistency_patterns) && beh.consistency_patterns.length
          ? beh.consistency_patterns
          : [isContested ? 'Income consistency contested — declared figure not supported by documents' : ((data as any).review_required_count > 0 ? 'Ambiguous transaction evidence requires manual review' : 'No material financial reconciliation contradiction detected')]);
    subLabel('Consistency Patterns:'); bullets(consistencyPatterns, 3);

    let strongestEvidence: string[] = (data as any).dossier_analysis?.evidence_summary?.strongest_evidence || [];
    if ((data as any).is_qa_fixture_assessment) {
      strongestEvidence = strongestEvidence.map((e: string) => /identity|government-issued|security bureau|NIMC/i.test(e) ? 'Synthetic QA Identity Fixture — pipeline accepted; not authenticity-verified' : e);
    }
    if (strongestEvidence.length) { subLabel('Evidence Nodes:', C.green); bullets(strongestEvidence, 4); }

    // Verification note — same 3-branch logic as the dashboard.
    const verificationNote = isContested
      ? 'This profile has an unresolved contradiction between declared and documented income. Verification is incomplete pending reconciliation.'
      : (Number(data.confidence) || 0) < 0.6
        ? 'CAUTION: This analysis contains significant reasoning limitations due to evidence gaps. Complete certainty cannot be established at this stage.'
        : (Number((data as any).uncertaintyAnalysis?.overall_uncertainty ?? 100) <= 25
          ? 'Documented evidence supports this profile with moderate-to-high analysis confidence.'
          : 'Documented evidence supports parts of this profile, but material uncertainty remains and should be reviewed before a decision.');
    subLabel('Verification Note:');
    doc.setFontSize(7.5); doc.setFont('helvetica', 'italic'); doc.setTextColor(...C.dark);
    let vnLines = doc.splitTextToSize(verificationNote, contentWidth - 4);
    ensureRoom(vnLines.length * 4 + 6);
    doc.text(vnLines, margin + 2, y); y += vnLines.length * 4 + 4;

    const internalAssessment = score < 500
      ? 'Current score reflects limited evidence. Additional independently verifiable documentation may improve assessment completeness.'
      : `Persona.Credit provides cross-border financial-evidence contextualisation. The TransferScore of ${score} / 1000 summarizes the submitted evidence and identified uncertainty; it is not a credit decision.`;
    subLabel('Internal Assessment:');
    doc.setFontSize(7.5); doc.setFont('helvetica', 'italic'); doc.setTextColor(...C.dark);
    vnLines = doc.splitTextToSize(`"${internalAssessment}"`, contentWidth - 4);
    ensureRoom(vnLines.length * 4 + 6);
    doc.text(vnLines, margin + 2, y); y += vnLines.length * 4 + 6;
  }

  // ── X. UNCERTAINTY & EVIDENCE QUALITY ────────────────────────────────────
  const ua: any = (data as any).uncertaintyAnalysis || null;
  if (ua || data.confidence !== undefined) {
    ensureRoom(50);
    sectionHeader('X. Uncertainty & Evidence Gaps');
    const uaRows: [string, string][] = [];
    if (data.confidence !== undefined) uaRows.push(['Analysis Confidence', `${Math.round((Number(data.confidence) || 0) * 100)}%`]);
    if (ua?.overall_uncertainty !== undefined) uaRows.push(['Overall Uncertainty', `${ua.overall_uncertainty}%`]);
    if (uaRows.length) {
      safeAutoTable(doc, {
        startY: y, body: uaRows, theme: 'plain',
        margin: { left: margin + 2, right: margin },
        styles: { fontSize: 7.5, cellPadding: 2, textColor: C.dark },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 55, textColor: C.slate } },
      });
      y = ((doc as any).lastAutoTable?.finalY ?? y) + 4;
    }
    if (Array.isArray(ua?.missing_critical_information) && ua.missing_critical_information.length) {
      subLabel('Missing Critical Information:', C.amber); bullets(ua.missing_critical_information, 4);
    }
    const clientHighUncertainty = Array.isArray(ua?.high_uncertainty_areas)
      ? ua.high_uncertainty_areas.filter((x: string) => !/confidence\/uncertainty mismatch requires review/i.test(String(x)))
      : [];
    if (clientHighUncertainty.length) {
      subLabel('High-Uncertainty Areas:', C.amber); bullets(clientHighUncertainty, 4);
    }
  }

  // ── XI. RECOMMENDED NEXT STEPS ────────────────────────────────────────────
  // Fallback chain: improvements → recommendations → deterministic mapping of the
  // missing-critical-information list, so this section can never silently vanish.
  let nextSteps: string[] = (Array.isArray((data as any).improvements) && (data as any).improvements.length
    ? (data as any).improvements
    : (data.recommendations || []).map((r: any) => r?.text)).filter(Boolean);
  if (!nextSteps.length && Array.isArray(ua?.missing_critical_information)) {
    nextSteps = ua.missing_critical_information.slice(0, 4).map((m: any) => `Provide: ${m}`);
  }
  if (nextSteps.length) {
    ensureRoom(40);
    sectionHeader('XI. Recommended Next Steps (Path to Potential)');
    bullets(nextSteps, 4);
  }

  // ── FOOTER ────────────────────────────────────────────────────────────────
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.slate);
    doc.text(
      `PERSONA.CREDIT | Cross-Border Financial Verification | Report ID: ${shareId} | Page ${p} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
    doc.text(
      'This report is for informational purposes only and does not constitute a credit bureau record.',
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 4,
      { align: 'center' }
    );
  }

  doc.save(`persona-credit-${(data.fullName || 'report').toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
};
