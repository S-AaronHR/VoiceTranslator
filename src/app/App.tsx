import { ThemeProvider } from "./components/theme-provider";
import { Header } from "./components/header";
import { Translator } from "./components/translator";

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="voice-translator-theme">
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          <Translator />
        </main>
      </div>
    </ThemeProvider>
  );
}