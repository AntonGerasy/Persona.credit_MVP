"""
P8 QA FIXTURE — long multilingual statement for C024 regression.
15 pages, 350+ transactions, Cyrillic, exact duplicate rows, document-level
control totals that reconcile arithmetically. Synthetic, fictional issuer,
QA_FIXTURE marker in page text and PDF metadata.
"""
import os, random
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

pdfmetrics.registerFont(TTFont("DJ", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("DJB", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))

W, H = A4
random.seed(20260812)

CLIENT = "HERASYMENKO ANTON"
OPENING = 12_480.35

MERCH = [
    ("Продукти та супермаркети", 5411, -180, -3200),
    ("Кафе та ресторани", 5814, -90, -1400),
    ("Комунальні послуги", 4900, -25, -1650),
    ("Мобільний зв'язок", 4814, -100, -300),
    ("Аптека", 5912, -120, -900),
    ("Транспорт", 4111, -30, -250),
    ("Одяг та взуття", 5651, -400, -2600),
    ("Розваги", 7832, -150, -800),
    ("Автозаправка", 5541, -500, -2200),
    ("Онлайн-сервіси", 5816, -99, -450),
]

tx = []          # (day, month, year, hh:mm:ss, desc, mcc, amount)
def T(d, m, y, t, desc, mcc, amt):
    tx.append((y, m, d, t, desc, mcc, round(amt, 2)))

# --- regular income: one payer, twice a month, 6 months
for (y, m) in [(2025, 12), (2026, 1), (2026, 2), (2026, 3), (2026, 4), (2026, 5)]:
    T(5, m, y, "09:14:22", "Зарахування. ТОВ «СТЕЛЛАР СОФТ»", 6012, 96_400.00)
    T(20, m, y, "09:07:41", "Аванс. ТОВ «СТЕЛЛАР СОФТ»", 6012, 41_300.00)
    T(6, m, y, "11:20:03", "Переказ. Оренда житла", 4829, -28_000.00)
    # --- LOOKALIKE BLOCK: six identical credits, same day, same payer, same amount
    if m == 3:
        for i, t in enumerate(["14:02:11", "14:02:38", "14:03:04", "14:03:29", "14:04:02", "14:04:37"]):
            T(12, m, y, t, "Поповнення картки", 6012, 25_000.00)
    # --- TWIN BLOCK: two rows identical down to the timestamp
    if m == 4:
        T(18, m, y, "02:01:25", "Primo Water Corporatio, Vista, US", 5814, -137.08)
        T(18, m, y, "02:01:25", "Primo Water Corporatio, Vista, US", 5814, -137.08)
    # --- filler
    for _ in range(112):
        name, mcc, lo, hi = random.choice(MERCH)
        day = random.randint(1, 28)
        t = f"{random.randint(0,23):02d}:{random.randint(0,59):02d}:{random.randint(0,59):02d}"
        T(day, m, y, t, name, mcc, random.uniform(lo, hi))

tx.sort(key=lambda r: (r[0], r[1], r[2], r[3]))

rows, bal = [], OPENING
credits = debits = 0.0
for y, m, d, t, desc, mcc, amt in tx:
    bal += amt
    if amt > 0: credits += amt
    else: debits += -amt
    rows.append(dict(dt=f"{d:02d}.{m:02d}.{y}", tm=t, desc=desc, mcc=mcc, amt=amt, bal=bal))
CLOSING = bal
rows.reverse()

def num(v):
    return f"{abs(v):,.2f}".replace(",", "\u00a0").replace(".", ",") if v >= 0 \
        else "-" + f"{abs(v):,.2f}".replace(",", "\u00a0").replace(".", ",")

PATH = "/mnt/user-data/outputs/qa-personas/P8-QA-FIXTURE-long-cyrillic-2026.pdf"
os.makedirs(os.path.dirname(PATH), exist_ok=True)
c = canvas.Canvas(PATH, pagesize=A4)
c.setTitle("QA_FIXTURE — synthetic long statement (P8)")
c.setSubject("QA_FIXTURE · SYNTHETIC · not a genuine bank document")
c.setKeywords("QA_FIXTURE SYNTHETIC long statement chunking regression")

GREY = colors.HexColor("#666666")

def watermark():
    c.saveState(); c.setFont("DJB", 40); c.setFillColor(colors.HexColor("#d94040"))
    c.setFillAlpha(0.12); c.translate(W/2, H/2); c.rotate(38)
    c.drawCentredString(0, 30, "SYNTHETIC \u00b7 QA FIXTURE")
    c.drawCentredString(0, -25, "NOT A BANK DOCUMENT"); c.restoreState()

def banner(y):
    c.setFillColor(colors.HexColor("#fdecec")); c.setStrokeColor(colors.HexColor("#d94040"))
    c.rect(15*mm, y, W-30*mm, 9*mm, stroke=1, fill=1)
    c.setFillColor(colors.HexColor("#a02020")); c.setFont("DJB", 7)
    c.drawString(18*mm, y+5*mm, "QA_FIXTURE \u00b7 SYNTHETIC TEST DOCUMENT \u2014 Persona.credit C024 regression asset.")
    c.setFont("DJ", 6.2)
    c.drawString(18*mm, y+1.8*mm, "Fictional issuer. Fictional account numbers. Not issued by any bank. Not evidence of any real account, income or identity.")

def foot(p):
    c.setFont("DJ", 6); c.setFillColor(GREY)
    c.drawString(15*mm, 10*mm, "QA_FIXTURE \u00b7 SYNTHETIC \u00b7 QA SANDBOX BANK (fictional) \u00b7 Persona.credit test corpus")
    c.drawRightString(W-15*mm, 10*mm, f"Сторінка {p}")

HDR = [("Дата i час", 15), ("Деталі операції", 40), ("MCC", 100),
       ("Сума (UAH)", 130), ("Залишок", 172)]

def head(y):
    c.setFont("DJB", 6.2); c.setFillColor(colors.black)
    c.setStrokeColor(colors.HexColor("#cccccc"))
    c.line(15*mm, y+5*mm, W-15*mm, y+5*mm); c.line(15*mm, y-1.5*mm, W-15*mm, y-1.5*mm)
    for label, x in HDR:
        if label in ("Сума (UAH)", "Залишок"): c.drawRightString((x+25)*mm, y+1*mm, label)
        else: c.drawString(x*mm, y+1*mm, label)
    return y - 5*mm

page = 1
watermark(); banner(H-22*mm)
c.setFillColor(colors.black); c.setFont("DJB", 14)
c.drawString(15*mm, H-36*mm, "QA SANDBOX BANK")
c.setFont("DJ", 7); c.setFillColor(GREY)
c.drawString(15*mm, H-41*mm, "Fictional issuer used for automated testing. No licence, no legal entity, no banking services.")
c.setFillColor(colors.black)

y = H - 52*mm
c.setFont("DJB", 10); c.drawString(15*mm, y, "Рух коштів по картці від 05.06.2026 р."); y -= 7*mm

def kv(k, v, y):
    c.setFont("DJB", 8); c.drawString(15*mm, y, k)
    c.setFont("DJ", 8); c.drawString(85*mm, y, v); return y - 4.4*mm

y = kv("Клієнт:", CLIENT, y)
y = kv("Дата народження:", "17.01.1985", y)
y = kv("ІПН (фіктивний):", "QA-0000-000000", y)
y = kv("Рахунок (фіктивний):", "QA00 0000 0000 0000 0000 0000 000", y)
y = kv("Період:", "01.12.2025 - 31.05.2026", y)
y -= 3*mm
c.setFont("DJB", 8); c.setFillColor(colors.HexColor("#a02020"))
c.drawString(15*mm, y, "КОНТРОЛЬНІ ВЕЛИЧИНИ ДОКУМЕНТА (для reconciliation)"); y -= 5*mm
c.setFillColor(colors.black)
y = kv("Баланс на початок періоду:", f"{num(OPENING)} UAH", y)
y = kv("Сума зарахувань за період:", f"{num(credits)} UAH", y)
y = kv("Сума витрат за період:", f"{num(debits)} UAH", y)
y = kv("Баланс на кінець періоду:", f"{num(CLOSING)} UAH", y)
y -= 4*mm
y = head(y)

c.setFont("DJ", 6)
for r in rows:
    if y < 20*mm:
        foot(page); c.showPage(); page += 1
        watermark(); banner(H-18*mm); y = head(H-28*mm); c.setFont("DJ", 6)
    c.setFillColor(colors.black)
    c.drawString(15*mm, y, r["dt"]); c.drawString(31*mm, y, r["tm"])
    c.drawString(40*mm, y, r["desc"][:38])
    c.drawString(100*mm, y, str(r["mcc"]))
    c.drawRightString(155*mm, y, num(r["amt"]))
    c.drawRightString(197*mm, y, num(r["bal"]))
    y -= 3.9*mm

y -= 6*mm
if y < 30*mm:
    foot(page); c.showPage(); page += 1; watermark(); banner(H-18*mm); y = H-35*mm
c.setFont("DJB", 8); c.setFillColor(colors.HexColor("#a02020"))
c.drawString(15*mm, y, "Документ НЕ підписано електронним цифровим підписом. QA_FIXTURE")
c.setFont("DJ", 7); c.setFillColor(GREY)
c.drawString(15*mm, y-4.5*mm, "Синтетична фікстура для регресійного тестування. Прийняття на production — це дефект.")
foot(page); c.save()

check = abs(OPENING + credits - debits - CLOSING)
print(f"страниц: {page}")
print(f"транзакций: {len(rows)}")
print(f"начальный баланс: {OPENING:,.2f}")
print(f"кредиты: {credits:,.2f}   дебеты: {debits:,.2f}")
print(f"конечный баланс: {CLOSING:,.2f}")
print(f"сходимость |нач + кред - деб - кон| = {check:.6f}")
print(f"путь: {PATH}")
