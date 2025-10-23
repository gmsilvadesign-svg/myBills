// Importa React.memo para otimização de performance
import { memo } from 'react'

// Definição dos tons disponíveis para o componente
type PillTone = 'slate' | 'green' | 'red' | 'amber' | 'blue';

// Interface para as props do componente
interface PillProps {
  children?: React.ReactNode;
  tone?: PillTone;
}

// Componente tipo "Pill" (rótulo) com cores variáveis - otimizado com React.memo
const Pill = memo(function Pill({ children, tone = "slate" }: PillProps) {

  // Mapeamento de tons para classes de cor (modo claro e dark)
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-700",
    blue: "bg-blue-100 text-blue-700",
  };

  // JSX do rótulo: aplica padding, borda arredondada e tom conforme a prop
  // Largura fixa para 12 caracteres para garantir que todos os pills tenham o mesmo tamanho
  return (
    <span className={`px-3 py-1 rounded-full text-xs text-center inline-block w-24 truncate ${tones[tone]}`}>
      {children}
    </span>
  );
})

export default Pill

