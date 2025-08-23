import { memo } from 'react';
import { CSS_CLASSES } from '@/styles/constants';

interface FooterProps {
  t: Record<string, string>;
}

const Footer = memo(function Footer({ t }: FooterProps) {
  return (
    <footer 
      className={`mt-10 text-xs ${CSS_CLASSES.text.muted}`}
      role="contentinfo"
      aria-label={t.footer_info || "Informações do rodapé"}
    >
      {/* Texto do rodapé, utilizando tradução (i18n) */}
      <div>{t.footer}</div>
    </footer>
  );
});

export default Footer;