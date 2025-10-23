import { ReactNode } from "react";

import { NotificationProvider } from "@/contexts/NotificationContext";
import { TranslationProvider } from "@/contexts/TranslationContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { PreviewProvider } from "@/contexts/PreviewContext";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <NotificationProvider>
      <TranslationProvider>
        <AuthProvider>
          <PreviewProvider>{children}</PreviewProvider>
        </AuthProvider>
      </TranslationProvider>
    </NotificationProvider>
  );
}

