
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
  typeClause?: "pleine-propriete" | "usufruit" | "nue-propriete";
  usufruitier?: {
    nom: string;
    age: string;
    lienParente: "conjoint" | "enfant" | "petit-enfant" | "frere-soeur" | "neveu-niece" | "autre";
  };
}

interface DecesInputsProps {
  values: {
    valeurContrat: string;
    primesAvant70: string;
    primesApres70: string;
    clauseType: "standard" | "personnalisee" | "demembree";
    beneficiaires: Beneficiaire[];
  };
  onChange: (name: string, value: any) => void;
}

const liensParente = [
  { value: "conjoint", label: "Conjoint marié ou partenaire PACS (Exonération Tepa)", subtitle: "Totalement exonéré de droits de succession" },
  { value: "enfant", label: "Enfant", subtitle: "Abattement 100 000 € en droits de succession" },
  { value: "petit-enfant", label: "Petit-enfant", subtitle: "Abattement 1 594 € en droits de succession" },
  { value: "frere-soeur", label: "Frère/Sœur", subtitle: "Abattement 15 932 € en droits de succession" },
  { value: "neveu-niece", label: "Neveu/Nièce", subtitle: "Abattement 7 967 € en droits de succession" },
  { value: "autre", label: "Concubin/Autre (sans lien)", subtitle: "Abattement minimal 1 594 € - Taux maximal 60%" },
];

const DecesInputs: React.FC<DecesInputsProps> = ({ values, onChange }) => {
  const handleBeneficiaireChange = (index: number, field: string, value: string) => {
    const newBeneficiaires = [...values.beneficiaires];
    newBeneficiaires[index] = { ...newBeneficiaires[index], [field]: value };
    onChange("beneficiaires", newBeneficiaires);
  };

  const handleUsufruitierChange = (index: number, field: string, value: string) => {
    const newBeneficiaires = [...values.beneficiaires];
    newBeneficiaires[index] = {
      ...newBeneficiaires[index],
      usufruitier: {
        ...newBeneficiaires[index].usufruitier,
        [field]: value
      }
    };
    onChange("beneficiaires", newBeneficiaires);
  };

  const addBeneficiaire = () => {
    const newBeneficiaires = [...values.beneficiaires, {
      nom: "",
      lienParente: "enfant" as const,
      age: "",
      quotite: "0",
      typeClause: "pleine-propriete" as const
    }];
    onChange("beneficiaires", newBeneficiaires);
  };

  const addClauseDemembree = () => {
    const newBeneficiaires = [
      ...values.beneficiaires,
      {
        nom: "",
        lienParente: "enfant" as const,
        age: "",
        quotite: "0",
        typeClause: "usufruit" as const,
        usufruitier: {
          nom: "",
          age: "",
          lienParente: "conjoint" as const
        }
      },
      {
        nom: "",
        lienParente: "enfant" as const,
        age: "",
        quotite: "0",
        typeClause: "nue-propriete" as const,
        usufruitier: {
          nom: "",
          age: "",
          lienParente: "conjoint" as const
        }
      }
    ];
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
          <div className="flex flex-col gap-3">
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
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="clauseType"
                value="demembree"
                checked={values.clauseType === "demembree"}
                onChange={(e) => onChange("clauseType", e.target.value)}
              />
              <span>Démembrée (usufruit/nue-propriété)</span>
            </label>
          </div>

          {(values.clauseType === "personnalisee" || values.clauseType === "demembree") && (
            <div className="space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h4 className="font-semibold">Bénéficiaires</h4>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={addBeneficiaire}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un bénéficiaire
                  </Button>
                  {values.clauseType === "demembree" && (
                    <Button type="button" variant="outline" size="sm" onClick={addClauseDemembree}>
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter clause démembrée
                    </Button>
                  )}
                </div>
              </div>
              
              {values.beneficiaires.map((beneficiaire, index) => (
                <Card key={index} className="p-4">
                  {/* Type de clause pour les clauses personnalisées */}
                  {values.clauseType === "demembree" && (
                    <div className="mb-4">
                      <Label>Type de clause</Label>
                      <select
                        value={beneficiaire.typeClause || "pleine-propriete"}
                        onChange={(e) => handleBeneficiaireChange(index, "typeClause", e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="pleine-propriete">Pleine propriété</option>
                        <option value="usufruit">Usufruit</option>
                        <option value="nue-propriete">Nue-propriété</option>
                      </select>
                    </div>
                  )}

                  {/* Informations de l'usufruitier pour les clauses démembrées */}
                  {(beneficiaire.typeClause === "usufruit" || beneficiaire.typeClause === "nue-propriete") && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <h5 className="font-medium mb-2 text-blue-700">👤 Usufruitier (détermine la répartition)</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <Label htmlFor={`usufruitier-nom-${index}`}>Nom usufruitier</Label>
                          <Input
                            id={`usufruitier-nom-${index}`}
                            value={beneficiaire.usufruitier?.nom || ""}
                            onChange={(e) => handleUsufruitierChange(index, "nom", e.target.value)}
                            placeholder="Ex: Jean Dupont"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`usufruitier-age-${index}`}>Âge usufruitier</Label>
                          <Input
                            id={`usufruitier-age-${index}`}
                            type="number"
                            value={beneficiaire.usufruitier?.age || ""}
                            onChange={(e) => handleUsufruitierChange(index, "age", e.target.value)}
                            placeholder="Ex: 65"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`usufruitier-lien-${index}`}>Lien usufruitier</Label>
                          <select
                            id={`usufruitier-lien-${index}`}
                            value={beneficiaire.usufruitier?.lienParente || "conjoint"}
                            onChange={(e) => handleUsufruitierChange(index, "lienParente", e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            {liensParente.map(lien => (
                              <option key={lien.value} value={lien.value}>
                                {lien.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor={`nom-${index}`}>
                        {beneficiaire.typeClause === "usufruit" ? "Nom usufruitier" : 
                         beneficiaire.typeClause === "nue-propriete" ? "Nom nu-propriétaire" : "Nom/Prénom"}
                      </Label>
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

              {values.clauseType === "demembree" && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h5 className="font-medium text-amber-800 mb-2">ℹ️ Fonctionnement du démembrement</h5>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• L'âge de l'usufruitier détermine la répartition usufruit/nue-propriété selon le barème fiscal</li>
                    <li>• Les abattements fiscaux sont répartis au prorata entre usufruitier et nu-propriétaire</li>
                    <li>• Exemple : usufruitier 65 ans → 40% usufruit, 60% nue-propriété</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DecesInputs;
