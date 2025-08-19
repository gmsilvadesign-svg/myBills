// Componente tipo "Pill" (rótulo) com cores variáveis
export default function Pill({ children, tone = "slate" }) {

  // Mapeamento de tons para classes de cor
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-700",
    blue: "bg-blue-100 text-blue-700",
  };

  // JSX do rótulo: aplica padding, borda arredondada e tom conforme a prop
  return (
    <span className={`px-2 py-1 rounded-full text-xs ${tones[tone]}`}>
      {children}
    </span>
  );
}