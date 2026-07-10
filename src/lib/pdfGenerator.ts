import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DashboardData } from '../types';

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
  const sanitizePdfText = (s: string): string =>
    s
      .replace(/[\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u2026\u2248\u2122\u2192\u2190\u20B9\u20AC\u00A0]/g, (ch) => PUNCT[ch] ?? ch) // common typography → ASCII
      .replace(/[\u0400-\u04FF]/g, translitChar)                 // Cyrillic → Latin transliteration
      .replace(/[\u0100-\uFFFF]+/g, '[*]');                      // any other non-Latin-1 run → marker
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
  const usableDocs = (data.document_extractions || []).filter((d: any) => d.is_usable);
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
    ['TransferScore™', `${data.score || 0} / 850 — ${data.level || 'Assessed'}`],
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
      ['Income Percentile in Origin', (ca.raw_data_table?.income_percentile_label) || (ca.origin_income_percentile ? `${ca.origin_income_percentile}th percentile in ${data.origin_country}` : '—')],
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
    doc.text('No documents were uploaded. Income figures below are self-declared by the applicant.', margin, y);
    y += 10;
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
      if (docItem.income_regularity)
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

      if (docItem.authenticity_concerns && docItem.authenticity_concerns.length > 0) {
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...C.amber);
        doc.text(`⚠ Document Notes: ${docItem.authenticity_concerns.join('; ')}`, margin + 4, y);
        y += 6;
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

  const strengths: string[] = data.strengths || data.analysis?.strengths || [];
  const risks: string[] = data.risks || data.analysis?.risks || [];

  if (strengths.length > 0) {
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.green);
    doc.text('Strengths:', margin, y);
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
