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

// Formata um valor numérico como moeda com truncamento para valores muito longos
// v = valor numérico
// currency = código da moeda (padrão: "BRL")
// locale = localidade para formatação (padrão: "pt-BR")
export function fmtMoneyTruncated(v: number, currency = "BRL", locale = "pt-BR"): string {
  const formatted = fmtMoney(v, currency, locale);
  
  // Conta apenas os dígitos (sem símbolos, espaços, pontos ou vírgulas)
  const digitsOnly = formatted.replace(/[^\d]/g, '');
  
  // Se tiver mais de 20 dígitos, trunca a string formatada
  if (digitsOnly.length > 20) {
    // Encontra a posição dos centavos (,XX no final)
    const decimalMatch = formatted.match(/,\d{2}$/);
    if (decimalMatch) {
      // Posição onde começam os centavos
      const decimalStart = decimalMatch.index!;
      const beforeDecimal = formatted.substring(0, decimalStart);
      const afterDecimal = formatted.substring(decimalStart);
      
      // Extrai apenas os dígitos da parte antes dos centavos
      const digitsBeforeDecimal = beforeDecimal.replace(/[^\d]/g, '');
      
      // Se a parte antes dos centavos tem mais de 18 dígitos (20 total - 2 dos centavos)
      if (digitsBeforeDecimal.length > 18) {
        // Pega os primeiros 9 dígitos
        const firstNineDigits = digitsBeforeDecimal.substring(0, 9);
        
        // Reconstrói com o símbolo da moeda
        const currencyMatch = formatted.match(/^([R$€£¥\s]+)/);
        const symbol = currencyMatch ? currencyMatch[1] : 'R$ ';
        
        // Formata os 9 dígitos com pontos
        const formattedNine = firstNineDigits.replace(/(\d{3})(?=\d)/g, '$1.');
        
        return symbol + formattedNine + "..." + afterDecimal;
      }
    }
  }
  
  return formatted;
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

// Gera todas as ocorrências de uma conta recorrente em um mês específico.
import * as Types from '@/types';

export function occurrencesForBillInMonth(bill: Types.Bill, year: number, monthIndex: number): string[] {
  const occ: string[] = [];
  const base = parseDate(bill.dueDate);
  const today = new Date();
  const requestedMonth = new Date(year, monthIndex, 1);

  if (bill.recurrence === "NONE" || !bill.recurrence) {
    if (base.getFullYear() === year && base.getMonth() === monthIndex) occ.push(ymd(base));
    return occ;
  }

  if (bill.recurrence === "MONTHLY") {
    const day = base.getDate();
    const occurrenceDate = new Date(year, monthIndex, clampDay(year, monthIndex, day));
    
    // Para contas mensais, gera ocorrências se:
    // 1. A data base é anterior ou igual ao mês solicitado
    // 2. A ocorrência é no mês atual ou futuro (incluindo o mês de criação)
    const baseMonth = new Date(base.getFullYear(), base.getMonth(), 1);
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    if (base <= requestedMonth && requestedMonth >= baseMonth && requestedMonth >= currentMonth) {
      occ.push(ymd(occurrenceDate));
    }
    return occ;
  }

  if (bill.recurrence === "YEARLY") {
    if (base.getMonth() === monthIndex) {
      const occurrenceDate = new Date(year, monthIndex, clampDay(year, monthIndex, base.getDate()));
      // Para contas anuais, só gera se a data base é anterior ou igual ao ano solicitado
      if (base.getFullYear() <= year) {
        occ.push(ymd(occurrenceDate));
      }
    }
    return occ;
  }

  if (bill.recurrence === "WEEKLY") {
    const dow = base.getDay();
    const totalDays = daysInMonth(year, monthIndex);
    for (let d = 1; d <= totalDays; d++) {
      const dt = new Date(year, monthIndex, d);
      if (dt.getDay() === dow && dt >= base) occ.push(ymd(dt));
    }
    return occ;
  }

  if (bill.recurrence === "DAILY") {
    const totalDays = daysInMonth(year, monthIndex);
    for (let d = 1; d <= totalDays; d++) {
      const dt = new Date(year, monthIndex, d);
      if (dt >= base) occ.push(ymd(dt));
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
export function buildICSForMonth(bills: Types.Bill[], monthDate: Date, locale: string, currency: string): string {
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

export function daysDifference(fromISO: string, toISO: string): number {
  const from = parseDate(fromISO);
  const to = parseDate(toISO);
  const diffTime = to.getTime() - from.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Retrocede para a ocorrência anterior com base na recorrência
export function prevOccurrenceISO(iso: string, recurrence: string): string {
  const d = parseDate(iso);
  const r = recurrence || "NONE";
  if (r === "MONTHLY") {
    const m = d.getMonth() - 1;
    const y = d.getFullYear() + (m < 0 ? -1 : 0);
    const pm = m < 0 ? 11 : m;
    return ymd(new Date(y, pm, clampDay(y, pm, d.getDate())));
  }
  if (r === "WEEKLY") return addDays(iso, -7);
  if (r === "YEARLY") return ymd(new Date(d.getFullYear() - 1, d.getMonth(), d.getDate()));
  if (r === "DAILY") return addDays(iso, -1);
  return iso;
}
