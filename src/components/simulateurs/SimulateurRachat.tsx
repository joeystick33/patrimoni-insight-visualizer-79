
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Placeholder ui, à compléter étape par étape
const SimulateurRachat: React.FC = () => {
  const [montant, setMontant] = useState("");
  const [anciennete, setAnciennete] = useState("moins8");
  const [interets, setInterets] = useState("");
  const [fiscalite, setFiscalite] = useState("PFU");

  return (
    <div className="w-full max-w-2xl mx-auto bg-card rounded-xl shadow-xl p-8 animate-fade-in">
      <h2 className="text-2xl font-bold mb-4 text-primary">Simulateur de rachat</h2>
      <form className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="montant">Montant à racheter (€)</Label>
          <Input
            type="number"
            id="montant"
            min={0}
            inputMode="decimal"
            placeholder="Ex : 15 000"
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="interets">Part d’intérêts dans le rachat (€)</Label>
          <Input
            type="number"
            id="interets"
            min={0}
            inputMode="decimal"
            placeholder="Ex : 1 300"
            value={interets}
            onChange={(e) => setInterets(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="anciennete">Ancienneté du contrat</Label>
          <select
            id="anciennete"
            className="mt-1 block w-full rounded border px-3 py-2 bg-background ring-1 ring-border focus:outline-none"
            value={anciennete}
            onChange={(e) => setAnciennete(e.target.value)}
          >
            <option value="moins8">Moins de 8 ans</option>
            <option value="plus8">8 ans et plus</option>
          </select>
        </div>
        <div>
          <Label htmlFor="fiscalite">Mécanisme d’imposition</Label>
          <select
            id="fiscalite"
            className="mt-1 block w-full rounded border px-3 py-2 bg-background ring-1 ring-border focus:outline-none"
            value={fiscalite}
            onChange={(e) => setFiscalite(e.target.value)}
          >
            <option value="PFU">PFU (30%)</option>
            <option value="IR">Barème IR (après abattement)</option>
          </select>
        </div>
      </form>
      <div className="mt-8">
        <button
          type="button"
          className={cn(
            "bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold shadow hover:bg-primary/90 transition"
          )}
          // TODO: Ajouter la logique de simulation
          onClick={() => null}
        >
          Simuler le rachat
        </button>
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        Saisissez les paramètres du rachat pour simuler le montant net et la fiscalité applicable.
      </p>
    </div>
  );
};

export default SimulateurRachat;
