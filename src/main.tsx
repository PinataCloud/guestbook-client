import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ConfigProvider } from "./components/ConfigProvider.tsx";
import { ThemeProvider } from "./components/ThemeProvider.tsx"
import { Toaster } from "@/components/ui/sonner"



createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <App />
        <Toaster />
      </ThemeProvider>
    </ConfigProvider>
  </StrictMode>
);
