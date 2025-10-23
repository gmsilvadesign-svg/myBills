import { memo } from "react";
import { CSS_CLASSES } from "@/styles/constants";
import { TranslationDictionary } from "@/constants/translation";

interface FooterProps {
  t: TranslationDictionary;
}

const Footer = memo(function Footer({ t }: FooterProps) {
  const footerText =
    typeof t.footer === "string" ? t.footer : "Feito para uso pessoal.";

  return (
    <footer
      className={`mt-10 text-xs ${CSS_CLASSES.text.muted}`}
      role="contentinfo"
      aria-label={footerText}
    >
      <div>{footerText}</div>
    </footer>
  );
});

export default Footer;

