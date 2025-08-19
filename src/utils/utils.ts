// Gera um identificador único (UID) combinando número aleatório e timestamp.
export function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Formata um valor numérico como moeda.
// v = valor numérico
// currency = código da moeda (padrão: "BRL")
// locale = localidade para formatação (padrão: "pt-BR")
export function fmtMoney(v: number, currency = "BRL", locale = "pt-BR"): string {
  const n = Number(v || 0);
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(n);
  } catch {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
  }
}

// Converte uma data para o formato ISO "YYYY-MM-DD".
export function ymd(d: Date | string): string {
  const dd = new Date(d);
  const y = dd.getFullYear();
  const m = String(dd.getMonth() + 1).padStart(2, "0");
  const day = String(dd.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Converte uma string ISO "YYYY-MM-DD" para objeto Date.
export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Formata uma data ISO para string legível no formato local (ex: "dd/mm/yyyy").
export function formatDate(iso: string, locale = "pt-BR"): string {
  if (!iso) return "";
  const d = parseDate(iso);
  try {
    return d.toLocaleDateString(locale, { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  }
}

// Verifica se a data 'a' é anterior à data 'b'.
export function isBefore(a: string, b: string): boolean {
  return parseDate(a).getTime() < parseDate(b).getTime();
}

// Verifica se duas datas ISO representam o mesmo dia.
export function isSameDayISO(a: string, b: string): boolean {
  return ymd(a) === ymd(b);
}

// Adiciona um número de dias a uma data ISO e retorna a nova data no formato ISO.
export function addDays(iso: string, days: number): string {
  const d = parseDate(iso);
  d.setDate(d.getDate() + days);
  return ymd(d);
}

// Retorna a quantidade de dias em um determinado mês.
// year = ano
// monthIndex = índice do mês (0=Janeiro, 11=Dezembro)
export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

// Garante que o dia informado não ultrapasse o último dia do mês.
export function clampDay(year: number, monthIndex: number, day: number): number {
  return Math.min(day, daysInMonth(year, monthIndex));
}

// Retorna o nome do mês e o ano de uma data (ex: "agosto de 2025").
export function monthLabel(date: Date, locale = "pt-BR"): string {
  try {
    return date.toLocaleDateString(locale, { month: "long", year: "numeric" });
  } catch {
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  }
}

// Tipo básico de conta utilizado nas funções utilitárias
interface Bill {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  recurrence?: string;
  paid?: boolean;
}

// Gera todas as ocorrências de uma conta recorrente em um mês específico.
export function occurrencesForBillInMonth(bill: Bill, year: number, monthIndex: number): string[] {
  const occ: string[] = [];
  const base = parseDate(bill.dueDate);

  if (bill.recurrence === "NONE" || !bill.recurrence) {
    if (base.getFullYear() === year && base.getMonth() === monthIndex) occ.push(ymd(base));
    return occ;
  }

  if (bill.recurrence === "MONTHLY") {
    const day = base.getDate();
    occ.push(ymd(new Date(year, monthIndex, clampDay(year, monthIndex, day))));
    return occ;
  }

  if (bill.recurrence === "YEARLY") {
    if (base.getMonth() === monthIndex) {
      occ.push(ymd(new Date(year, monthIndex, clampDay(year, monthIndex, base.getDate()))));
    }
    return occ;
  }

  if (bill.recurrence === "WEEKLY") {
    const dow = base.getDay();
    const totalDays = daysInMonth(year, monthIndex);
    for (let d = 1; d <= totalDays; d++) {
      const dt = new Date(year, monthIndex, d);
      if (dt.getDay() === dow) occ.push(ymd(dt));
    }
    return occ;
  }

  return occ;
}

// Calcula a próxima ocorrência de uma data com base na recorrência.
export function nextOccurrenceISO(iso: string, recurrence: string): string {
  const d = parseDate(iso);
  const r = recurrence || "NONE";

  if (r === "MONTHLY") {
    const m = d.getMonth() + 1;
    const y = d.getFullYear() + (m > 11 ? 1 : 0);
    const nm = m % 12;
    return ymd(new Date(y, nm, clampDay(y, nm, d.getDate())));
  }

  if (r === "WEEKLY") return addDays(iso, 7);

  if (r === "YEARLY") return ymd(new Date(d.getFullYear() + 1, d.getMonth(), d.getDate()));

  return iso;
}

// Gera um arquivo ICS (iCalendar) para um mês específico com base nas contas.
export function buildICSForMonth(bills: Bill[], monthDate: Date, locale: string, currency: string): string {
  const y = monthDate.getFullYear();
  const m = monthDate.getMonth();
  const dtstamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "Z");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "PRODID:-//Contas a Pagar v0.2//PT-BR"
  ];

  bills.forEach((b) => {
    if (b.paid) return;
    occurrencesForBillInMonth(b, y, m).forEach((iso) => {
      const d = iso.replace(/-/g, "");
      const uidStr = `${b.id}-${d}@contas-local`;
      const summary = `${b.title} — ${fmtMoney(b.amount, currency, locale)}`;

      lines.push(
        "BEGIN:VEVENT",
        `UID:${uidStr}`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART;VALUE=DATE:${d}`,
        `SUMMARY:${summary}`,
        "BEGIN:VALARM",
        "ACTION:DISPLAY",
        `DESCRIPTION:Reminder / Lembrete: ${b.title}`,
        "TRIGGER:-P1D",
        "END:VALARM",
        "BEGIN:VALARM",
        "ACTION:DISPLAY",
        `DESCRIPTION:Due today / Vence hoje: ${b.title}`,
        "TRIGGER:-PT0S",
        "END:VALARM",
        "END:VEVENT"
      );
    });
  });

  lines.push("END:VCALENDAR");
  return lines.join("\n");
}

// Escapa caracteres especiais em ICS (simplificada).
export function escapeICS(text = ""): string {
  return String(text);
}

// Baixa um arquivo no navegador.
export function download(filename: string, text: string): void {
  const blob = new Blob([text], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}