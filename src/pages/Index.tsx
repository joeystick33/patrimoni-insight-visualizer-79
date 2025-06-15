
import React, { useState } from "react";
import HeaderSimulateur from "@/components/simulateurs/HeaderSimulateur";
import SimulateurFrais from "@/components/simulateurs/SimulateurFrais";
import SimulateurRachat from "@/components/simulateurs/SimulateurRachat";
import SimulateurDeces from "@/components/simulateurs/SimulateurDeces";

const Index = () => {
  const [actif, setActif] = useState<"frais" | "rachat" | "deces">("frais");

  return (
    <main className="min-h-screen bg-background py-10 px-2 flex flex-col items-center">
      <div className="w-full max-w-5xl mx-auto">
        <HeaderSimulateur actif={actif} setActif={setActif} />
        <div className="mt-2">
          {actif === "frais" && <SimulateurFrais />}
          {actif === "rachat" && <SimulateurRachat />}
          {actif === "deces" && <SimulateurDeces />}
        </div>
        <footer className="pt-12 text-center text-muted-foreground text-xs opacity-70">
          © {new Date().getFullYear()} – Simulateur pédagogique assurance vie | Créé avec Lovable
        </footer>
      </div>
    </main>
  );
};

export default Index;
