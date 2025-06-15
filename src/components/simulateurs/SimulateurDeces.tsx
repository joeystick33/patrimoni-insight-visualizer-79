
import React, { useState } from "react";
import DecesInputs from "./DecesInputs";
import DecesResultats from "./DecesResultats";
import { calculDeces } from "./simulateurDecesUtils";
import { Button } from "../ui/button";

const initialValues = {
  valeurContrat: "",
  primesAvant70: "",
  primesApres70: "",
  clauseType: "standard" as "standard" | "personnalisee",
  beneficiaires: [
    {
      nom: "",
      lienParente: "conjoint" as "conjoint" | "enfant" | "petit-enfant" | "frere-soeur" | "neveu-niece" | "autre",
      age: "",
      quotite: "100"
    }
  ]
};

const SimulateurDeces: React.FC = () => {
  const [values, setValues] = useState(initialValues);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string>("");

  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    setShowResults(false);
    setError("");
  };

  const handleReset = () => {
    setValues(initialValues);
    setShowResults(false);
    setError("");
  };

  // Vérification si tous les champs requis sont remplis
  const ready = 
    !!values.valeurContrat &&
    !!values.primesAvant70 &&
    !!values.primesApres70 &&
    values.beneficiaires.every(b => 
      b.nom && b.lienParente && b.age && b.quotite
    ) &&
    values.beneficiaires.reduce((sum, b) => sum + parseFloat(b.quotite || "0"), 0) === 100;

  let resultats;
  if (showResults && ready) {
    try {
      resultats = calculDeces({
        valeurContrat: parseFloat(values.valeurContrat),
        primesAvant70: parseFloat(values.primesAvant70),
        primesApres70: parseFloat(values.primesApres70),
        clauseType: values.clauseType,
        beneficiaires: values.beneficiaires.map(b => ({
          ...b,
          age: parseFloat(b.age),
          quotite: parseFloat(b.quotite)
        }))
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de calcul");
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-card rounded-xl shadow-xl p-8 animate-fade-in">
      <h2 className="text-2xl font-bold mb-4 text-primary">🎯 Simulation de décès</h2>
      <p className="text-muted-foreground mb-6">
        Calculez la fiscalité de la transmission et optimisez la répartition entre bénéficiaires selon les articles 990 I et 757 B du CGI.
      </p>
      
      <form className="space-y-6" autoComplete="off" onSubmit={handleSubmit}>
        <DecesInputs values={values} onChange={handleChange} />
        <div className="flex gap-4 mt-6 flex-wrap">
          <Button
            type="submit"
            disabled={!ready}
            variant="default"
          >
            🧮 Calculer
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleReset}
          >
            🔄 Réinitialiser
          </Button>
        </div>
      </form>
      
      {!ready && (
        <p className="text-xs text-muted-foreground mt-4">
          Renseignez toutes les valeurs et assurez-vous que la répartition totale des quotités soit égale à 100% pour visualiser les résultats.
        </p>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          ⚠️ Erreur : {error}
        </div>
      )}
      
      {showResults && ready && resultats && !error && (
        <DecesResultats resultats={resultats} />
      )}
    </div>
  );
};

export default SimulateurDeces;
