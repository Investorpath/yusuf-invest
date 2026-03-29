import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { Languages } from "lucide-react";

export function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
  };

  useEffect(() => {
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleLanguage}
      className="rounded-full w-10 h-10 hover:bg-secondary/80 transition-colors"
      title={i18n.language === "en" ? "Switch to Arabic" : "Switch to English"}
    >
      <Languages className="h-5 w-5" />
      <span className="sr-only">Toggle Language</span>
    </Button>
  );
}