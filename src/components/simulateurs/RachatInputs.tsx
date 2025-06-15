
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type Props = {
  values: {
    valeurContrat: string;
    versements: string;
    montantRachat: string;
    anciennete: "moins8" | "plus8";
    modeTMI: "manuel" | "automatique";
    tmi: string;
    revenuNetImposable: string;
    foyer: string;
  };
  onChange: (name: string, value: string) => void;
};

const RachatInputs: React.FC<Props> = ({ values, onChange }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <div>
        <Label htmlFor="valeurContrat">Valeur actuelle du contrat (€)</Label>
        <Input
          type="number"
          id="valeurContrat"
          min={0}
          placeholder="Ex : 50 000"
          value={values.valeurContrat}
          inputMode="decimal"
          onChange={(e) => onChange("valeurContrat", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="versements">Total des versements effectués (€)</Label>
        <Input
          type="number"
          id="versements"
          min={0}
          placeholder="Ex : 35 000"
          value={values.versements}
          inputMode="decimal"
          onChange={(e) => onChange("versements", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="montantRachat">Montant du rachat envisagé (€)</Label>
        <Input
          type="number"
          id="montantRachat"
          min={0}
          placeholder="Ex : 10 000"
          value={values.montantRachat}
          inputMode="decimal"
          onChange={(e) => onChange("montantRachat", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="anciennete">Ancienneté du contrat</Label>
        <select
          id="anciennete"
          className="mt-1 block w-full rounded border px-3 py-2 bg-background ring-1 ring-border focus:outline-none"
          value={values.anciennete}
          onChange={(e) => onChange("anciennete", e.target.value)}
        >
          <option value="moins8">Moins de 8 ans</option>
          <option value="plus8">8 ans et plus</option>
        </select>
      </div>
      <div className="col-span-2">
        <Label>Mode de calcul de la TMI</Label>
        <div className="flex gap-3 mt-1">
          <button
            type="button"
            className={`px-3 py-2 rounded border ${
              values.modeTMI === "manuel"
                ? "bg-primary text-primary-foreground"
                : "bg-accent"
            }`}
            onClick={() => onChange("modeTMI", "manuel")}
          >
            Saisie manuelle (%)
          </button>
          <button
            type="button"
            className={`px-3 py-2 rounded border ${
              values.modeTMI === "automatique"
                ? "bg-primary text-primary-foreground"
                : "bg-accent"
            }`}
            onClick={() => onChange("modeTMI", "automatique")}
          >
            Revenu net imposable
          </button>
        </div>
      </div>
      {values.modeTMI === "manuel" ? (
        <div>
          <Label htmlFor="tmi">TMI (Tranche marginale, en %)</Label>
          <Input
            type="number"
            id="tmi"
            min={0}
            max={100}
            step={1}
            placeholder="Ex : 30"
            value={values.tmi}
            inputMode="decimal"
            onChange={(e) => onChange("tmi", e.target.value)}
          />
        </div>
      ) : (
        <>
          <div>
            <Label htmlFor="revenuNetImposable">Revenu net imposable (€)</Label>
            <Input
              type="number"
              id="revenuNetImposable"
              min={0}
              placeholder="Ex : 38 000"
              value={values.revenuNetImposable}
              inputMode="decimal"
              onChange={(e) => onChange("revenuNetImposable", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="foyer">Nombre de parts (foyer fiscal)</Label>
            <Input
              type="number"
              id="foyer"
              min={1}
              placeholder="Ex : 2"
              value={values.foyer}
              inputMode="decimal"
              onChange={(e) => onChange("foyer", e.target.value)}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default RachatInputs;

