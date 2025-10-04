import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

interface ModeToggleProps {
  className?: string;
}

export function ModeToggle({ className }: ModeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = (resolvedTheme ?? "dark") === "dark";
  const nextTheme = isDark ? "light" : "dark";
  const Icon = isDark ? Sun : Moon;

  if (!mounted) {
    return (
      <div
        className={cn(
          "h-11 w-11 rounded-full border border-border/60 bg-card/70 backdrop-blur-md shadow-professional-sm",
          className
        )}
      />
    );
  }

  return (
    <button
      type="button"
      aria-label={`Switch to ${nextTheme} mode`}
      onClick={() => setTheme(nextTheme)}
      className={cn(
        "inline-flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-card/80 text-foreground shadow-[0_18px_45px_-28px_rgba(24,130,164,0.65)] transition",
        "hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2",
        "dark:bg-background/70 dark:text-muted-foreground",
        "sm:h-12 sm:w-12 h-11 w-11",
        className
      )}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

