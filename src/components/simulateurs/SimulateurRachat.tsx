
import React, { useState } from "react";
import RachatInputs from "./RachatInputs";
import RachatResultats from "./RachatResultats";
import { calculRachat } from "./simulateurRachatUtils";
import { cn } from "@/lib/utils";

const initialValues = {
  valeurContrat: "",
  versements: "",
  montantRachat: "",
  anciennete: "moins8" as "moins8" | "plus8",
  modeTMI: "manuel" as "manuel" | "automatique",
  tmi: "",
  rfr: "",
  foyer: "1",
};

const SimulateurRachat: React.FC = () => {
  const [values, setValues] = useState(initialValues);

  // Gestion des modifications (inputs)
  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset
  const handleReset = () => setValues(initialValues);

  // Conversion et fallback automatique pour la TMI si mode auto (ici: démo, hardcodé à 30% si auto; à remplacer par vrai calcul si besoin)
  const tmiValue =
    values.modeTMI === "manuel"
      ? parseFloat(values.tmi || "0")
      : 30; // TODO: Mettre calcul TMI par RFR si demandé

  // Calculs seulement si tous les champs obligatoires sont remplis
  const ready =
    !!values.valeurContrat &&
    !!values.versements &&
    !!values.montantRachat &&
    tmiValue > 0;

  let resultats;
  if (ready) {
    resultats = calculRachat({
      valeurContrat: parseFloat(values.valeurContrat),
      versements: parseFloat(values.versements),
      montantRachat: parseFloat(values.montantRachat),
      anciennete: values.anciennete,
      modeTMI: values.modeTMI,
      tmi: tmiValue,
    });
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-card rounded-xl shadow-xl p-8 animate-fade-in">
      <h2 className="text-2xl font-bold mb-4 text-primary">Simulation de rachat</h2>
      <form className="space-y-6" autoComplete="off" onSubmit={e => e.preventDefault()}>
        <RachatInputs values={values} onChange={handleChange} />
      </form>
      <div className="flex gap-4 mt-8 flex-wrap">
        <button
          type="button"
          className={cn(
            "bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold shadow hover:bg-primary/90 transition"
          )}
          onClick={handleReset}
        >
          Recommencer une simulation
        </button>
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        Renseignez toutes les valeurs pour visualiser la fiscalité du rachat partiel ou total.
      </p>
      {ready && resultats && (
        <RachatResultats montantRachat={parseFloat(values.montantRachat)} resultats={resultats} />
      )}
    </div>
  );
};

export default SimulateurRachat;
