import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center transition-all hover:border-primary/30 hover:shadow-md">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary/20 bg-primary/5 text-primary transition-all group-hover:scale-110 group-hover:border-primary/40 group-hover:bg-primary/10">
        {icon}
      </div>
      <h3 className="font-medium text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
