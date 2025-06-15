
import React, { useState } from "react";
import RachatInputs from "./RachatInputs";
import RachatResultats from "./RachatResultats";
import { calculRachat } from "./simulateurRachatUtils";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

const initialValues = {
  valeurContrat: "",
  versements: "",
  montantRachat: "",
  anciennete: "moins8" as "moins8" | "plus8",
  modeTMI: "manuel" as "manuel" | "automatique",
  tmi: "",
  revenuNetImposable: "",
  foyer: "", // *ne sera plus directement affiché, mais déduit
  statut: "celibataire" as "celibataire" | "couple",
  enfants: "",
};

function calculerNombreParts(statut: "celibataire" | "couple", nbEnfants: number): number {
  if (!nbEnfants || nbEnfants < 0) nbEnfants = 0;
  let nbParts = statut === "couple" ? 2 : 1;
  if (nbEnfants <= 2) {
    nbParts += 0.5 * nbEnfants;
  } else {
    nbParts += 1 * (nbEnfants - 2) + 1;
  }
  return nbParts;
}

const SimulateurRachat: React.FC = () => {
  const [values, setValues] = useState(initialValues);
  const [showResults, setShowResults] = useState(false);

  // Gestion des modifications (inputs)
  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    setShowResults(false);
  };

  // Reset
  const handleReset = () => {
    setValues(initialValues);
    setShowResults(false);
  };

  // Calcul automatique de la TMI basé sur le revenu net imposable et le nombre de parts
  const calculateTMI = (revenuNetImposable: number, nbParts: number): number => {
    const quotientFamilial = revenuNetImposable / nbParts;
    if (quotientFamilial <= 11294) return 0;
    if (quotientFamilial <= 28797) return 11;
    if (quotientFamilial <= 82341) return 30;
    if (quotientFamilial <= 177106) return 41;
    return 45;
  };

  // Détermination automatique du nombre de parts fiscales
  const nbParts =
    values.modeTMI === "automatique"
      ? calculerNombreParts(values.statut, parseInt(values.enfants || "0"))
      : (values.foyer ? parseFloat(values.foyer) : values.statut === "couple" ? 2 : 1);

  // Abattement selon situation pour barème IR et PFU : important d'afficher le bon montant pour la situation utilisateur
  const abattement = values.statut === "couple" ? 9200 : 4600;
  const abattementTxt = `${values.statut === "couple" ? "9 200 € (marié/Pacsé)" : "4 600 € (célibataire)"}`;

  // TMI : soit manuelle, soit calculée automatiquement
  const tmiValue =
    values.modeTMI === "manuel"
      ? parseFloat(values.tmi || "0")
      : calculateTMI(
          parseFloat(values.revenuNetImposable || "0"),
          nbParts
        );

  // Prêt à calculer si champs requis remplis
  const ready =
    !!values.valeurContrat &&
    !!values.versements &&
    !!values.montantRachat &&
    (values.modeTMI === "manuel"
      ? !!values.tmi
      : !!values.revenuNetImposable) &&
    !!values.statut &&
    (values.modeTMI === "manuel" || values.enfants !== undefined);

  let resultats;
  if (showResults && ready) {
    resultats = calculRachat({
      valeurContrat: parseFloat(values.valeurContrat),
      versements: parseFloat(values.versements),
      montantRachat: parseFloat(values.montantRachat),
      anciennete: values.anciennete,
      modeTMI: values.modeTMI,
      tmi: tmiValue,
      foyer: nbParts,
      abattement: abattement,
    });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-card rounded-xl shadow-xl p-8 animate-fade-in">
      <h2 className="text-2xl font-bold mb-4 text-primary">Simulation de rachat</h2>
      <form className="space-y-6" autoComplete="off" onSubmit={handleSubmit}>
        <RachatInputs values={values} onChange={handleChange} />
        <div className="flex gap-4 mt-6 flex-wrap">
          <Button
            type="submit"
            disabled={!ready}
            className=""
            variant="default"
          >
            Calculer
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleReset}
          >
            Réinitialiser
          </Button>
        </div>
      </form>
      <p className="text-xs text-muted-foreground mt-4">
        Renseignez toutes les valeurs pour visualiser la fiscalité du rachat partiel ou total.<br />
        Abattement applicable : <span className="font-semibold">{abattementTxt}</span>
        <br />
        {values.modeTMI === "automatique" &&
          <>
            Nombre de parts fiscales automatiquement calculé : <span className="font-semibold">{nbParts}</span>
          </>
        }
      </p>
      {showResults && ready && resultats && (
        <RachatResultats montantRachat={parseFloat(values.montantRachat)} resultats={resultats} parts={nbParts} statut={values.statut} />
      )}
    </div>
  );
};

export default SimulateurRachat;

