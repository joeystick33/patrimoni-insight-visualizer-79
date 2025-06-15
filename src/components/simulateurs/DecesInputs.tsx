
import React from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Trash2, Plus } from "lucide-react";

interface Beneficiaire {
  nom: string;
  lienParente: "conjoint" | "enfant" | "petit-enfant" | "frere-soeur" | "neveu-niece" | "autre";
  age: string;
  quotite: string;
}

interface DecesInputsProps {
  values: {
    valeurContrat: string;
    primesAvant70: string;
    primesApres70: string;
    clauseType: "standard" | "personnalisee";
    beneficiaires: Beneficiaire[];
  };
  onChange: (name: string, value: any) => void;
}

const liensParente = [
  { value: "conjoint", label: "Conjoint marié ou partenaire PACS (Exonération Tepa)", subtitle: "Totalement exonéré de droits de succession" },
  { value: "enfant", label: "Enfant", subtitle: "Abattement 100 000 € en droits de succession" },
  { value: "petit-enfant", label: "Petit-enfant", subtitle: "Abattement 1 594 € en droits de succession" },
  { value: "frere-soeur", label = "Frère/Sœur", subtitle: "Abattement 15 932 € en droits de succession" },
  { value: "neveu-niece", label: "Neveu/Nièce", subtitle: "Abattement 7 967 € en droits de succession" },
  { value: "autre", label: "Concubin/Autre (sans lien)", subtitle: "Abattement minimal 1 594 € - Taux maximal 60%" },
];

const DecesInputs: React.FC<DecesInputsProps> = ({ values, onChange }) => {
  const handleBeneficiaireChange = (index: number, field: string, value: string) => {
    const newBeneficiaires = [...values.beneficiaires];
    newBeneficiaires[index] = { ...newBeneficiaires[index], [field]: value };
    onChange("beneficiaires", newBeneficiaires);
  };

  const addBeneficiaire = () => {
    const newBeneficiaires = [...values.beneficiaires, {
      nom: "",
      lienParente: "enfant" as const,
      age: "",
      quotite: "0"
    }];
    onChange("beneficiaires", newBeneficiaires);
  };

  const removeBeneficiaire = (index: number) => {
    if (values.beneficiaires.length > 1) {
      const newBeneficiaires = values.beneficiaires.filter((_, i) => i !== index);
      onChange("beneficiaires", newBeneficiaires);
    }
  };

  const totalQuotite = values.beneficiaires.reduce((sum, b) => sum + parseFloat(b.quotite || "0"), 0);

  // Gestion automatique des valeurs par défaut
  const handlePrimesApres70Change = (value: string) => {
    // Si vide, on met automatiquement 0
    const finalValue = value === "" ? "0" : value;
    onChange("primesApres70", finalValue);
  };

  return (
    <div className="space-y-6">
      {/* Valorisation du contrat */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💰 Valorisation du contrat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="valeurContrat">Montant total au décès (€)</Label>
            <Input
              id="valeurContrat"
              type="number"
              value={values.valeurContrat}
              onChange={(e) => onChange("valeurContrat", e.target.value)}
              placeholder="Ex: 500000"
            />
          </div>
        </CardContent>
      </Card>

      {/* Primes versées */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📊 Primes versées</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="primesAvant70">Total des primes versées avant 70 ans (€)</Label>
            <Input
              id="primesAvant70"
              type="number"
              value={values.primesAvant70}
              onChange={(e) => onChange("primesAvant70", e.target.value)}
              placeholder="Ex: 200000"
            />
          </div>
          <div>
            <Label htmlFor="primesApres70">
              Total des primes versées après 70 ans (€)
              <span className="text-sm text-muted-foreground ml-2">(Laissez vide = 0€)</span>
            </Label>
            <Input
              id="primesApres70"
              type="number"
              value={values.primesApres70}
              onChange={(e) => handlePrimesApres70Change(e.target.value)}
              placeholder="Ex: 50000 (ou laissez vide pour 0€)"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clause bénéficiaire */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">👥 Clause bénéficiaire</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="clauseType"
                value="standard"
                checked={values.clauseType === "standard"}
                onChange={(e) => onChange("clauseType", e.target.value)}
              />
              <span>Standard : "mon conjoint, à défaut mes enfants vivants ou représentés"</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="clauseType"
                value="personnalisee"
                checked={values.clauseType === "personnalisee"}
                onChange={(e) => onChange("clauseType", e.target.value)}
              />
              <span>Personnalisée</span>
            </label>
          </div>

          {values.clauseType === "personnalisee" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">Bénéficiaires</h4>
                <Button type="button" variant="outline" size="sm" onClick={addBeneficiaire}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un bénéficiaire
                </Button>
              </div>
              
              {values.beneficiaires.map((beneficiaire, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor={`nom-${index}`}>Nom/Prénom</Label>
                      <Input
                        id={`nom-${index}`}
                        value={beneficiaire.nom}
                        onChange={(e) => handleBeneficiaireChange(index, "nom", e.target.value)}
                        placeholder="Ex: Marie Dupont"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`lien-${index}`}>Lien de parenté / Statut fiscal</Label>
                      <select
                        id={`lien-${index}`}
                        value={beneficiaire.lienParente}
                        onChange={(e) => handleBeneficiaireChange(index, "lienParente", e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {liensParente.map(lien => (
                          <option key={lien.value} value={lien.value} title={lien.subtitle}>
                            {lien.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-muted-foreground mt-1">
                        {liensParente.find(l => l.value === beneficiaire.lienParente)?.subtitle}
                      </p>
                    </div>
                    <div>
                      <Label htmlFor={`age-${index}`}>Âge</Label>
                      <Input
                        id={`age-${index}`}
                        type="number"
                        value={beneficiaire.age}
                        onChange={(e) => handleBeneficiaireChange(index, "age", e.target.value)}
                        placeholder="Ex: 45"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label htmlFor={`quotite-${index}`}>Quotité (%)</Label>
                        <Input
                          id={`quotite-${index}`}
                          type="number"
                          value={beneficiaire.quotite}
                          onChange={(e) => handleBeneficiaireChange(index, "quotite", e.target.value)}
                          placeholder="Ex: 50"
                        />
                      </div>
                      {values.beneficiaires.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeBeneficiaire(index)}
                          className="mt-6"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              
              <div className={`text-sm ${totalQuotite === 100 ? 'text-green-600' : 'text-red-600'}`}>
                Total des quotités : {totalQuotite}% {totalQuotite !== 100 && '(doit être égal à 100%)'}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DecesInputs;
