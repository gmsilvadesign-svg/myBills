// Importa React.memo para otimização de performance
import { memo } from 'react'

// Definição dos tons disponíveis para o componente
type PillTone = 'slate' | 'green' | 'red' | 'amber' | 'blue';

// Interface para as props do componente
interface PillProps {
  children: React.ReactNode;
  tone?: PillTone;
}

// Componente tipo "Pill" (rótulo) com cores variáveis - otimizado com React.memo
const Pill = memo(function Pill({ children, tone = "slate" }: PillProps) {

  // Mapeamento de tons para classes de cor (modo claro e dark)
  const tones = {
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    green: "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200",
    red: "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-200",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200",
  };

  // JSX do rótulo: aplica padding, borda arredondada e tom conforme a prop
  return (
    <span className={`px-2 py-1 rounded-full text-xs min-w-[80px] text-center inline-block ${tones[tone]}`}>
      {children}
    </span>
  );
})

export default Pill