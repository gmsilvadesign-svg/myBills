// Componente Footer: exibe o rodapé da aplicação
export default function Footer({ t }) {

  // JSX do rodapé
  return (
    // Elemento <footer> com margem superior e texto pequeno, estilizado com Tailwind
    <footer className="mt-10 text-xs text-slate-500">

      {/* Texto do rodapé, utilizando tradução (i18n) */}
      <div>{t.footer}</div>
    </footer>
  )
}