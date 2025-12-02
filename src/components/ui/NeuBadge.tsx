import { cn } from "@/lib/utils";

interface NeuBadgeProps {
  position?: string;
  variant?: "standard" | "soft" | "ribbon" | "corner" | "pill" | "police";
  className?: string;
  children?: React.ReactNode;
}

export default function NeuBadge({
  position = "absolute top-0 right-0",
  variant = "standard",
  className,
  children = "NEU",
}: NeuBadgeProps) {
  if (variant === "ribbon") {
    return (
      <output
        className={cn(
          "absolute -right-10 top-3 w-36 rotate-45 bg-blue-600 dark:bg-blue-500 text-white",
          "font-semibold uppercase tracking-wide text-center py-1.5 shadow-md shadow-blue-900/30 dark:shadow-blue-800/40 z-50",
          "text-[0.8rem] leading-tight",
          className
        )}
        aria-label="Neu veröffentlicht"
      >
        {children}
      </output>
    );
  }

  if (variant === "corner") {
    return (
      <div className={cn("absolute top-0 right-0 overflow-hidden", className)}>
        <div className="relative">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 text-white text-xs font-semibold uppercase tracking-wide px-3 pt-1 pb-2 rounded-bl-xl shadow-[0_4px_16px_rgba(37,99,235,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] dark:shadow-[0_4px_16px_rgba(59,130,246,0.4),inset_0_1px_0_rgba(255,255,255,0.25)]">
            {children}
          </div>
          <div className="absolute -bottom-2 right-0 w-0 h-0 border-t-[8px] border-t-blue-800 dark:border-t-blue-500 border-l-[8px] border-l-transparent"></div>
        </div>
      </div>
    );
  }

  if (variant === "pill") {
    return (
      <output
        className={cn(
          position,
          "inline-flex items-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600",
          "text-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide",
          "shadow-[0_8px_24px_rgba(37,99,235,0.35),inset_0_1px_2px_rgba(255,255,255,0.3),inset_0_-1px_2px_rgba(0,0,0,0.2)]",
          "dark:shadow-[0_8px_24px_rgba(59,130,246,0.4),inset_0_1px_2px_rgba(255,255,255,0.35),inset_0_-1px_2px_rgba(0,0,0,0.15)]",
          "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-b before:from-white/25 before:via-transparent before:to-transparent",
          "relative overflow-hidden",
          className
        )}
        aria-label="Neu"
      >
        <span className="relative z-10">{children}</span>
      </output>
    );
  }

  if (variant === "police") {
    return (
      <output
        className={cn("absolute -top-1 right-0 z-10 m-0 p-0", className)}
        style={{ top: "-4px", right: 0, margin: 0, padding: 0 }}
        aria-label="Neu veröffentlicht"
        title="Neu veröffentlicht"
      >
        <span className="inline-flex items-center justify-center rounded-bl-[10px] px-2 py-1 text-xs font-bold bg-gray-600 dark:bg-gray-600 text-white leading-none shadow-[0_1px_3px_rgba(0,0,0,0.2),inset_0_0_0_1px_rgba(0,0,0,0.1)]">
          {children}
        </span>
      </output>
    );
  }

  const variants = {
    standard: cn(
      "bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 rounded-bl-xl",
      "shadow-[0_4px_16px_rgba(37,99,235,0.3),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.1)]",
      "dark:shadow-[0_4px_16px_rgba(59,130,246,0.4),inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(0,0,0,0.08)]",
      "before:absolute before:inset-0 before:rounded-bl-xl before:bg-gradient-to-b before:from-white/20 before:to-transparent before:opacity-60 dark:before:opacity-70"
    ),
    soft: cn(
      "bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-xl border border-white/20 dark:border-white/10",
      "shadow-[0_8px_32px_rgba(37,99,235,0.2),inset_0_1px_0_rgba(255,255,255,0.3)]",
      "dark:shadow-[0_8px_32px_rgba(59,130,246,0.25),inset_0_1px_0_rgba(255,255,255,0.2)]",
      "text-blue-600 dark:text-blue-400 font-bold"
    ),
  };

  return (
    <output
      className={cn(
        position,
        "relative px-2 py-1.5 text-sm font-semibold uppercase tracking-wide text-white overflow-hidden z-10 m-0 p-0 leading-none",
        variants[variant],
        className
      )}
      style={{ top: 0, right: 0, margin: 0, padding: 0 }}
      aria-label="Neu"
    >
      <span className="relative z-10 leading-none">{children}</span>
    </output>
  );
}
