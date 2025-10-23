import "@/styles/index.css";
import "@/styles/App.css";

import { AppProviders } from "@/app/providers";
import { AppRoutes } from "@/app/routes";

export default function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}
