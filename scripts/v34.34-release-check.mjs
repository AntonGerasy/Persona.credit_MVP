import fs from 'node:fs';

const norm = (v='') => String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const has = (text, marker) => new RegExp(`(^|[^\\p{L}\\p{N}])${marker.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}([^\\p{L}\\p{N}]|$)`,'u').test(text);
const earned = ['salary','payroll','wage','salario','consulting invoice','client project payment'].map(norm);
const strongRefund = ['tax refund','purchase reversal','card purchase reversal','estorno compra','refund processed'].map(norm);
const generic = ['refund','rebate','reversal','cashback','estorno'].map(norm);
function classify({description,counterparty,recurring=false,similar=false,employer=false}){
  const d=norm(description), c=norm(counterparty);
  const tokens=c.split(' ').filter(t=>t.length>=3 && !['ltda','llc','inc','ltd','company','corp'].includes(t));
  let cleaned=` ${d} `; for(const t of tokens) cleaned=cleaned.replace(new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\b`,'g'),' '); cleaned=cleaned.replace(/\s+/g,' ').trim();
  const income=earned.some(m=>has(d,m))||recurring||similar||employer;
  if(strongRefund.some(m=>has(cleaned,m))) return income?'review':'exclude';
  if(generic.some(m=>has(cleaned,m))) return income?'review':'exclude';
  return 'count';
}
const cases=[
  ['Joao payroll 1', classify({description:'REBATE TECNOLOGIA BRASIL LTDA — Salário mensal (payroll)',counterparty:'REBATE TECNOLOGIA BRASIL LTDA',recurring:true,similar:true,employer:true}), 'count'],
  ['Joao payroll 2', classify({description:'REBATE TECNOLOGIA BRASIL LTDA — Salário mensal (payroll)',counterparty:'REBATE TECNOLOGIA BRASIL LTDA',recurring:true,similar:true,employer:true}), 'count'],
  ['genuine estorno', classify({description:'ESTORNO COMPRA CARTÃO — Card purchase reversal',counterparty:'ESTORNO COMPRA CARTÃO'}), 'exclude'],
  ['tax refund', classify({description:'TAX REFUND',counterparty:'IRS'}), 'exclude'],
  ['ambiguous refund with payroll signal', classify({description:'Refund Solutions LLC payroll',counterparty:'Refund Solutions LLC',employer:true}), 'count'],
];
let failed=0; for(const [name,got,want] of cases){const ok=got===want; console.log(`${ok?'PASS':'FAIL'} ${name}: ${got}`); if(!ok)failed++;}
for(const f of ['/mnt/data/P1_amara_okafor__ID.pdf','/mnt/data/P2_joao_almeida__ID.pdf']){
  const raw=fs.readFileSync(f).toString('latin1'); const marked=/QA[_\s-]*FIXTURE|SYNTHETIC[ _-]*QA[ _-]*FIXTURE|TEST[ _-]*FIXTURE/i.test(raw); console.log(`${marked?'PASS':'FAIL'} QA marker ${f}`); if(!marked)failed++;
}
process.exit(failed?1:0);
