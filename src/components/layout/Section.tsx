// Importa React.memo para otimização de performance
import { memo } from 'react'
import { CSS_CLASSES } from '@/styles/constants';

// Interface para as props do componente
interface SectionProps {
  title?: string;
  children: React.ReactNode;
}

// Componente Section: exibe uma seção com título e conteúdo estilizado - otimizado com React.memo
const Section = memo(function Section({ title, children }: SectionProps) {

  // JSX do componente Section
  return (
    // Container principal da seção com margem inferior
    <div className={CSS_CLASSES.container.section}>

      {/* Título da seção, com estilo pequeno, letras maiúsculas, espaçamento e cor */}
      {title && (
        <div className={`text-sm uppercase tracking-wide ${CSS_CLASSES.text.muted} ${CSS_CLASSES.spacing.mb2}`}>
          {title}
        </div>
      )}

      {/* Conteúdo da seção, com fundo branco (ou dark mode), bordas arredondadas, sombra e padding */}
      <div className={CSS_CLASSES.container.card}>
        {children}
      </div>

    </div>
  );
})

export default Section
