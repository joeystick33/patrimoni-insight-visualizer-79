
import React from "react";
import { cn } from "@/lib/utils";

interface HeaderSimulateurProps {
  actif: string;
  setActif: (val: string) => void;
}

const tabs = [
  { label: "Simuler les frais", id: "frais" },
  { label: "Simuler un rachat", id: "rachat" },
  { label: "Simuler un décès", id: "deces" },
];

const HeaderSimulateur: React.FC<HeaderSimulateurProps> = ({ actif, setActif }) => (
  <div className="flex justify-center gap-4 mb-8 w-full animate-fade-in">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        className={cn(
          "px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-200 hover-scale relative",
          actif === tab.id
            ? "bg-primary text-primary-foreground shadow-lg after:content-[''] after:absolute after:h-1 after:w-full after:bg-primary after:bottom-0 after:left-0 animate-fade-in"
            : "bg-accent text-accent-foreground hover:bg-secondary"
        )}
        onClick={() => setActif(tab.id)}
        aria-current={actif === tab.id}
        type="button"
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export default HeaderSimulateur;
