// Componente Section: exibe uma seção com título e conteúdo estilizado
export default function Section({ title, children }) {

  // JSX do componente Section
  return (
    // Container principal da seção com margem inferior
    <div className="mb-6">

      {/* Título da seção, com estilo pequeno, letras maiúsculas, espaçamento e cor */}
      <div className="text-sm uppercase tracking-wide text-slate-500 mb-2">
        {title}
      </div>

      {/* Conteúdo da seção, com fundo branco (ou dark mode), bordas arredondadas, sombra e padding */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-4">
        {children}
      </div>

    </div>
  );
}
