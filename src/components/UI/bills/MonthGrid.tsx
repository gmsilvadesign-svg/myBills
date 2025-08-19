// Importa utilitários para manipulação de datas, valores e ocorrências de contas
import { fmtMoney, ymd, parseDate, isBefore, daysInMonth, occurrencesForBillInMonth } from '../../../utils/utils.ts'

// Componente MonthGrid: renderiza a grade do calendário mensal com contas
export default function MonthGrid({ date, bills, locale, currency }) {

  // Extrai ano e mês da data fornecida
  const y = date.getFullYear();
  const m = date.getMonth();

  // Primeiro dia do mês
  const first = new Date(y, m, 1);

  // Calcula deslocamento inicial (começa semana na segunda-feira)
  const startOffset = (first.getDay() + 6) % 7;

  // Total de dias no mês
  const total = daysInMonth(y, m);

  // Array que representará as células da grade do calendário
  const cells = [];

  // Preenche células vazias antes do primeiro dia do mês
  for (let i = 0; i < startOffset; i++) cells.push(null);

  // Preenche células com datas do mês
  for (let d = 1; d <= total; d++) cells.push(new Date(y, m, d));

  // Completa a grade até múltiplo de 7 (para completar semanas)
  while (cells.length % 7 !== 0) cells.push(null);

  // Mapas para armazenar totais e itens por dia
  const totalsByDay = new Map();
  const itemsByDay = new Map();

  // Itera sobre todas as contas
  bills.forEach((b) => {
    if (b.paid) return; // Ignora contas pagas

    // Obtém todas as ocorrências da conta no mês
    const occs = occurrencesForBillInMonth(b, y, m);

    // Processa cada ocorrência
    occs.forEach((iso) => {
      const d = parseDate(iso).getDate();

      // Soma o valor da conta para o dia
      totalsByDay.set(d, (totalsByDay.get(d) || 0) + (Number(b.amount) || 0));

      // Armazena informações detalhadas da conta por dia
      const arr = itemsByDay.get(d) || [];
      arr.push({ 
        id: b.id, 
        title: b.title, 
        amount: Number(b.amount) || 0, 
        overdue: isBefore(iso, ymd(new Date())) // verifica se está vencida
      });
      itemsByDay.set(d, arr);
    });
  });

  // JSX da grade do mês
  return (
    // Grid de 7 colunas representando os dias da semana
    <div className="grid grid-cols-7 gap-2 text-sm">

      {/* Cabeçalhos dos dias da semana */}
      {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((w) => (
        <div key={w} className="text-center text-slate-500">{w}</div>
      ))}

      {/* Células do calendário */}
      {cells.map((d, i) => (
        <div
          key={i}
          className={`h-28 rounded-xl border border-slate-200 dark:border-slate-800 p-2 flex flex-col ${d ? "bg-white dark:bg-slate-900" : "bg-white dark:bg-slate-800/40"}`}
        >
          {/* Renderiza conteúdo somente para dias válidos */}
          {d && (
            <>
              {/* Cabeçalho da célula: número do dia e total do dia */}
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs text-slate-500">{d.getDate()}</div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {totalsByDay.get(d.getDate()) ? fmtMoney(totalsByDay.get(d.getDate()), currency, locale) : ""}
                </div>
              </div>

              {/* Lista de contas do dia */}
              <div className="space-y-1 overflow-auto">
                {(itemsByDay.get(d.getDate()) || []).slice(0, 3).map((it) => (
                  <div 
                    key={it.id} 
                    className={`rounded-lg px-2 py-1 text-xs flex items-center justify-between ${it.overdue ? "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"}`}
                  >
                    <span className="truncate max-w-[60%]" title={it.title}>{it.title}</span>
                    <span className="font-medium">{fmtMoney(it.amount, currency, locale)}</span>
                  </div>
                ))}

                {/* Indica se há mais de 3 contas no dia */}
                {itemsByDay.get(d.getDate()) && itemsByDay.get(d.getDate()).length > 3 && (
                  <div className="text-[11px] text-slate-500">+{itemsByDay.get(d.getDate()).length - 3} mais…</div>
                )}
              </div>
            </>
          )}
        </div>
      ))}

    </div>
  );
}
