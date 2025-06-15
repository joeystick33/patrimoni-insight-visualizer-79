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

  const handleUsufruitierChange = (field: string, value: string) => {
    // Pour les clauses démembrées, l'usufruitier est commun à tous les bénéficiaires
    const newBeneficiaires = values.beneficiaires.map(b => ({
      ...b,
      usufruitier: {
        ...b.usufruitier,
        [field]: value
      }
    }));
    onChange("beneficiaires", newBeneficiaires);
  };

  const createBeneficiaireTemplate = (typeClause: "pleine-propriete" | "usufruit" | "nue-propriete") => {
    const baseBeneficiaire = {
      nom: "",
      lienParente: typeClause === "usufruit" ? "conjoint" as const : "enfant" as const,
      age: "",
      quotite: "0",
      typeClause
    };

    // Pour les clauses démembrées, on ajoute toujours l'usufruitier de référence
    if (values.clauseType === "demembree") {
      return {
        ...baseBeneficiaire,
        usufruitier: values.beneficiaires[0]?.usufruitier || {
          nom: "",
          age: "",
          lienParente: "conjoint" as const
        }
      };
    }

    return baseBeneficiaire;
  };

  const addUsufruitier = () => {
    const newUsufruitier = createBeneficiaireTemplate("usufruit");
    onChange("beneficiaires", [...values.beneficiaires, newUsufruitier]);
  };

  // Ajuste la création d'un nu-propriétaire pour les clauses démembrées
  const addNuProprietaire = () => {
    const baseBeneficiaire = {
      nom: "",
      lienParente: "enfant" as const,
      age: "",
      quotite: "0",
      typeClause: "nue-propriete" as const,
    };
    onChange("beneficiaires", [...values.beneficiaires, baseBeneficiaire]);
  };

  const addBeneficiaire = () => {
    const newBeneficiaire = createBeneficiaireTemplate("pleine-propriete");
    onChange("beneficiaires", [...values.beneficiaires, newBeneficiaire]);
  };

  const removeBeneficiaire = (index: number) => {
    if (values.beneficiaires.length > 1) {
      const newBeneficiaires = values.beneficiaires.filter((_, i) => i !== index);
      onChange("beneficiaires", newBeneficiaires);
    }
  };

  const totalQuotite = values.beneficiaires.reduce((sum, b) => sum + parseFloat(b.quotite || "0"), 0);

  const handlePrimesApres70Change = (value: string) => {
    const finalValue = value === "" ? "0" : value;
    onChange("primesApres70", finalValue);
  };

  const handleClauseTypeChange = (newClauseType: string) => {
    let newBeneficiaires;
    
    if (newClauseType === "standard") {
      newBeneficiaires = [{
        nom: "Clause standard",
        lienParente: "conjoint" as const,
        age: "",
        quotite: "100",
        typeClause: "pleine-propriete" as const
      }];
    } else if (newClauseType === "demembree") {
      // Créer l'usufruitier par défaut
      const usufruitierDefaut = {
        nom: "",
        age: "",
        lienParente: "conjoint" as const
      };
      
      newBeneficiaires = [{
        nom: "",
        lienParente: "conjoint" as const,
        age: "",
        quotite: "100",
        typeClause: "usufruit" as const,
        usufruitier: usufruitierDefaut
      }];
    } else {
      newBeneficiaires = [createBeneficiaireTemplate("pleine-propriete")];
      newBeneficiaires[0].quotite = "100";
    }
    
    onChange("clauseType", newClauseType);
    onChange("beneficiaires", newBeneficiaires);
  };

  // Vérifier s'il y a au moins un usufruitier pour les clauses démembrées
  const hasUsufruitier = values.beneficiaires.some(b => b.typeClause === "usufruit");

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
                onChange={(e) => handleClauseTypeChange(e.target.value)}
              />
              <span>Standard : "mon conjoint, à défaut mes enfants vivants ou représentés"</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="clauseType"
                value="personnalisee"
                checked={values.clauseType === "personnalisee"}
                onChange={(e) => handleClauseTypeChange(e.target.value)}
              />
              <span>Personnalisée</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="clauseType"
                value="demembree"
                checked={values.clauseType === "demembree"}
                onChange={(e) => handleClauseTypeChange(e.target.value)}
              />
              <span>Démembrée (usufruit/nue-propriété)</span>
            </label>
          </div>

          {values.clauseType === "demembree" && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="font-medium text-blue-800 mb-2">ℹ️ Clause démembrée</h5>
              <p className="text-sm text-blue-700 mb-2">
                Dans une clause démembrée, l'âge de l'usufruitier détermine automatiquement la répartition entre usufruit et nue-propriété selon le barème fiscal.
              </p>
              <p className="text-sm text-blue-600">
                Les abattements fiscaux seront répartis au prorata entre usufruitier et nu-propriétaires.
              </p>
            </div>
          )}

          {/* Informations de l'usufruitier de référence - uniquement pour les clauses démembrées */}
          {values.clauseType === "demembree" && (
            <Card className="bg-amber-50 border-amber-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-amber-800">
                  📊 Usufruitier de référence (détermine la répartition)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label>Nom de l'usufruitier</Label>
                    <Input
                      value={values.beneficiaires[0]?.usufruitier?.nom || ""}
                      onChange={(e) => handleUsufruitierChange("nom", e.target.value)}
                      placeholder="Ex: Jean Dupont"
                    />
                  </div>
                  <div>
                    <Label>Âge de l'usufruitier</Label>
                    <Input
                      type="number"
                      value={values.beneficiaires[0]?.usufruitier?.age || ""}
                      onChange={(e) => handleUsufruitierChange("age", e.target.value)}
                      placeholder="Ex: 65"
                    />
                  </div>
                  <div>
                    <Label>Lien de parenté usufruitier</Label>
                    <select
                      value={values.beneficiaires[0]?.usufruitier?.lienParente || "conjoint"}
                      onChange={(e) => handleUsufruitierChange("lienParente", e.target.value)}
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
              </CardContent>
            </Card>
          )}

          {/* Liste des bénéficiaires */}
          {(values.clauseType === "personnalisee" || values.clauseType === "demembree") && (
            <div className="space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h4 className="font-semibold">
                  {values.clauseType === "demembree" ? "Nu-propriétaires" : "Bénéficiaires"}
                </h4>
                <div className="flex gap-2">
                  {values.clauseType === "demembree" ? (
                    <Button type="button" variant="outline" size="sm" onClick={addNuProprietaire}>
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un nu-propriétaire
                    </Button>
                  ) : (
                    <Button type="button" variant="outline" size="sm" onClick={addBeneficiaire}>
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un bénéficiaire
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Pour démembrée : uniquement des nu-propriétaires */}
              {values.beneficiaires
                .filter(b => values.clauseType !== "demembree" || b.typeClause === "nue-propriete")
                .map((beneficiaire, index) => (
                <Card key={index} className="p-4">
                  {/* Pour démembrée, plus d'encart "Usufruitier" */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>
                        {values.clauseType === "demembree"
                          ? "Nom nu-propriétaire" 
                          : "Nom/Prénom"}
                      </Label>
                      <Input
                        value={beneficiaire.nom}
                        onChange={(e) => handleBeneficiaireChange(index, "nom", e.target.value)}
                        placeholder="Ex: Marie Dupont"
                      />
                    </div>
                    <div>
                      <Label>Lien de parenté / Statut fiscal</Label>
                      <select
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
                      <Label>Âge</Label>
                      <Input
                        type="number"
                        value={beneficiaire.age}
                        onChange={(e) => handleBeneficiaireChange(index, "age", e.target.value)}
                        placeholder="Ex: 45"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label>Quotité (%)</Label>
                        <Input
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
