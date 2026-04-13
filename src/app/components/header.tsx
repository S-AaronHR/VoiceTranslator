import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Sun2Bold, MoonBold } from "solar-icon-set";

export function Header() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("system");
    } else {
      setTheme("dark");
    }
  };

  const getThemeIcon = () => {
    if (theme === "dark") {
      return <MoonBold size={20} />;
    } else if (theme === "light") {
      return <Sun2Bold size={20} />;
    } else {
      // System theme
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? (
        <MoonBold size={20} />
      ) : (
        <Sun2Bold size={20} />
      );
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-primary bg-background">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5 text-primary"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                fill="currentColor"
                opacity="0.3"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="hidden sm:block">
            <h1 className="font-semibold tracking-tight">Voice Translator</h1>
            <p className="text-xs text-muted-foreground">
              Traducción instantánea
            </p>
          </div>
          <h1 className="block font-semibold tracking-tight sm:hidden">
            Voice Translator
          </h1>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full"
              >
                {getThemeIcon()}
                <span className="sr-only">Cambiar tema</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Tema:{" "}
                {theme === "dark"
                  ? "Oscuro"
                  : theme === "light"
                  ? "Claro"
                  : "Sistema"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
}
