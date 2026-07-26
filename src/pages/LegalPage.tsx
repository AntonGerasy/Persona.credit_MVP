import React from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

type LegalKind = 'privacy' | 'terms';

interface LegalPageProps {
  kind: LegalKind;
  onBack: () => void;
}

const effectiveDate = 'July 26, 2026';
const entity = 'Codective LLC';
const address = '5830 E 2nd St, Ste 7000 #7927, Casper, Wyoming 82609, United States';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="space-y-3">
    <h2 className="text-lg font-black text-brand-dark">{title}</h2>
    <div className="text-sm leading-7 text-slate-600 space-y-3">{children}</div>
  </section>
);

const Privacy = () => (
  <div className="space-y-9">
    <Section title="1. Scope and controller">
      <p>{entity} operates Persona.credit, a service that analyses user-submitted identity and financial documents to create a cross-border financial-evidence summary. Controller contact: <a className="underline" href="mailto:compliance@persona.credit">compliance@persona.credit</a>.</p>
    </Section>
    <Section title="2. Data we process">
      <p>We process account details, uploaded identity and financial documents, extracted fields, calculated income and obligations, report content, technical logs, and support communications. Do not upload documents you are not authorised to submit.</p>
    </Section>
    <Section title="3. Purposes and legal bases">
      <p>We process data to provide the requested report, secure the service, prevent fraud, meet legal obligations, and improve the product using aggregated or de-identified information. Document processing requires explicit consent at intake and consent may be withdrawn.</p>
    </Section>
    <Section title="4. Automated analysis">
      <p>Automated tools, including third-party AI services, may extract information from documents. Persona.credit does not itself approve or deny credit, housing, employment, insurance, or any other application. A report is informational decision-support evidence and may require human review.</p>
    </Section>
    <Section title="5. Sharing and processors">
      <p>Data may be processed by hosting, storage, authentication, analytics, and AI providers needed to operate the service. We do not sell personal data. Reports are shared only when the account holder publishes or sends them.</p>
    </Section>
    <Section title="6. Retention and deletion">
      <p>Account records and reports remain available until the user deletes them or until an applicable retention period expires. Account deletion removes the account record, saved reports, history, and active share links, except information we must retain by law.</p>
    </Section>
    <Section title="7. Security and report links">
      <p>We use access controls, encrypted transport, isolated account records, non-indexed report links, and no-store caching controls. No security method can eliminate all risk. Users should revoke a report link when it is no longer needed.</p>
    </Section>
    <Section title="8. Your rights">
      <p>Depending on location, users may request access, correction, deletion, restriction, portability, objection, consent withdrawal, or human review. Contact <a className="underline" href="mailto:compliance@persona.credit">compliance@persona.credit</a>. Product support: <a className="underline" href="mailto:support@persona.credit">support@persona.credit</a>.</p>
    </Section>
    <Section title="9. Age and changes">
      <p>The service is for adults aged 18 or older. Material changes will be posted with an updated effective date.</p>
    </Section>
  </div>
);

const Terms = () => (
  <div className="space-y-9">
    <Section title="1. Service">
      <p>Persona.credit produces a cross-border financial-evidence summary from documents submitted by a user. It is not a credit bureau, consumer reporting agency determination, FICO score, lending decision, tenancy decision, employment decision, or financial, legal, or immigration advice.</p>
    </Section>
    <Section title="2. Eligibility and authority">
      <p>Users must be at least 18 and able to enter a binding agreement. Users represent that submitted documents concern them or a person who expressly authorised submission.</p>
    </Section>
    <Section title="3. Acceptable use">
      <p>Users may not upload forged or unauthorised documents, violate law, bypass security controls, overload the service, reverse-engineer protected systems, or use reports to support unlawful discrimination.</p>
    </Section>
    <Section title="4. Accuracy and review">
      <p>Outputs depend on document quality, authenticity, extraction quality, and available evidence. Reports may contain errors or items requiring manual review. Users and recipients must independently review material information before relying on it.</p>
    </Section>
    <Section title="5. Sharing">
      <p>The account holder controls report sharing and is responsible for recipients. A recipient must not use a report as the sole basis for credit, housing, employment, or another consequential decision.</p>
    </Section>
    <Section title="6. Intellectual property">
      <p>Users retain ownership of their documents and grant {entity} a limited licence to process them solely to provide the service. The software, analysis methods, interface, and report templates remain the property of {entity} and its licensors.</p>
    </Section>
    <Section title="7. Warranty and liability">
      <p>The service is provided on an “as is” and “as available” basis to the extent permitted by law. {entity} does not guarantee eligibility, approval, pricing, or acceptance by any recipient. Mandatory consumer rights are not excluded.</p>
    </Section>
    <Section title="8. Account termination and contact">
      <p>Users may delete their account from account settings. We may suspend access for misuse or security risk. Support: <a className="underline" href="mailto:support@persona.credit">support@persona.credit</a>. Compliance and privacy: <a className="underline" href="mailto:compliance@persona.credit">compliance@persona.credit</a>.</p>
    </Section>
    <Section title="9. Governing information">
      <p>Provider: {entity}, {address}. These terms should be reviewed by qualified counsel before unrestricted commercial launch.</p>
    </Section>
  </div>
);

const LegalPage: React.FC<LegalPageProps> = ({ kind, onBack }) => {
  const title = kind === 'privacy' ? 'Privacy Policy' : 'Terms of Service';
  return (
    <main className="min-h-screen bg-[#F8F7F4] px-5 py-10 sm:py-16">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gray hover:text-brand-dark">
          <ArrowLeft size={15} /> Back
        </button>
        <div className="mt-7 bg-white border border-brand-border rounded-[2rem] shadow-sm p-7 sm:p-12">
          <div className="flex items-start gap-4 border-b border-brand-border pb-8 mb-9">
            <div className="w-12 h-12 rounded-2xl bg-brand-dark text-white flex items-center justify-center shrink-0"><ShieldCheck size={22} /></div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-blue">Persona.credit legal</p>
              <h1 className="font-display text-4xl sm:text-5xl font-semibold text-brand-dark mt-1">{title}</h1>
              <p className="text-xs text-slate-400 mt-3">Effective {effectiveDate} · {entity}</p>
            </div>
          </div>
          {kind === 'privacy' ? <Privacy /> : <Terms />}
          <div className="mt-12 rounded-2xl bg-slate-50 border border-slate-200 p-5 text-xs leading-6 text-slate-500">
            Persona.credit provides an informational cross-border financial-evidence summary. It is not a credit bureau report, not a FICO score, and not a lending, tenancy, or employment decision.
          </div>
        </div>
      </div>
    </main>
  );
};

export default LegalPage;
