type Row = Record<string, any> & { id?: string };

const KEY = (col: string) => `local:${col}`;

function read(col: string): Row[] {
  try {
    const raw = localStorage.getItem(KEY(col));
    return raw ? (JSON.parse(raw) as Row[]) : [];
  } catch { return []; }
}

function write(col: string, rows: Row[]) {
  localStorage.setItem(KEY(col), JSON.stringify(rows));
}

function genId() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export function list(col: string, userId?: string) {
  const rows = read(col);
  return userId ? rows.filter(r => r.userId === userId) : rows;
}

export function add(col: string, data: Row) {
  const rows = read(col);
  const id = genId();
  rows.push({ ...data, id });
  write(col, rows);
  return id;
}

export function update(col: string, id: string, patch: Row) {
  const rows = read(col);
  const i = rows.findIndex(r => r.id === id);
  if (i >= 0) { rows[i] = { ...rows[i], ...patch }; write(col, rows); }
}

export function remove(col: string, id: string) {
  const rows = read(col).filter(r => r.id !== id);
  write(col, rows);
}

export function removeWhere(col: string, pred: (r: Row)=>boolean) {
  const rows = read(col).filter(r => !pred(r));
  write(col, rows);
}

export function upsertMany(col: string, rowsToAdd: Row[]) {
  const rows = read(col);
  for (const r of rowsToAdd) rows.push({ ...r, id: genId() });
  write(col, rows);
}

