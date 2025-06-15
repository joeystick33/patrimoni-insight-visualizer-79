
export type RachatInputs = {
  valeurContrat: number;
  versements: number;
  montantRachat: number;
  anciennete: "moins8" | "plus8";
  modeTMI: "manuel" | "automatique";
  tmi: number; // En % (ex: 30)
  foyer: number; // Nombre de parts fiscales
};

export type RachatResultats = {
  partInterets: number;
  impotPFU: number;
  pso: number;
  impotIR: number;
  abattement: number;
  netPFU: number;
  netIR: number;
  message?: string;
};

/**
 * Calcule la fiscalité du rachat d'assurance vie selon les règles françaises :
 * 
 * PFU (Prélèvement Forfaitaire Unique) :
 * - 12,8% d'impôt + 17,2% de prélèvements sociaux
 * - Pas d'abattement, même après 8 ans
 * - S'applique sur la totalité de la part d'intérêts
 * 
 * Barème IR (Impôt sur le Revenu) :
 * - Taux marginal d'imposition + 17,2% de prélèvements sociaux
 * - Après 8 ans : abattement de 4600€ (célibataire) ou 9200€ (couple)
 * - L'abattement ne s'applique QUE sur la part soumise à l'IR, pas aux prélèvements sociaux
 * 
 * Impact RFR :
 * - La part d'intérêts imposable s'ajoute au RFR dans tous les cas
 * - Cela peut impacter l'éligibilité aux aides sociales, bourses, etc.
 */
export function calculRachat(inputs: RachatInputs): RachatResultats {
  const {
    valeurContrat,
    versements,
    montantRachat,
    anciennete,
    tmi,
    foyer,
  } = inputs;

  // 1. Calcul de la part d'intérêts imposable
  const partInterets = Math.max(
    0,
    (valeurContrat - versements) * (montantRachat / valeurContrat)
  );

  // 2. Prélèvements sociaux (17,2%) - toujours sur la totalité des intérêts
  const pso = partInterets * 0.172;

  // 3. OPTION PFU : 12,8% sur la totalité des intérêts (pas d'abattement)
  const impotPFU = partInterets * 0.128;
  const netPFU = montantRachat - (impotPFU + pso);

  // 4. OPTION BARÈME IR : abattement uniquement si contrat > 8 ans
  let abattement = 0;
  if (anciennete === "plus8") {
    abattement = foyer >= 2 ? 9200 : 4600;
  }

  // Base imposable IR après abattement (mais PSO reste sur la totalité)
  const baseImposableIR = Math.max(0, partInterets - abattement);
  const impotIR = baseImposableIR * (tmi / 100);
  const netIR = montantRachat - (impotIR + pso);

  // 5. Recommandation fiscale
  let message = undefined;
  if (baseImposableIR === 0) {
    message = "Le barème IR est le plus avantageux : aucun impôt sur le revenu à payer grâce à l'abattement (seuls les prélèvements sociaux restent dus).";
  } else if (netPFU > netIR) {
    message = "Le PFU (prélèvement forfaitaire unique) est plus avantageux dans votre situation.";
  } else if (netIR > netPFU) {
    message = "Le barème IR est plus avantageux dans votre situation.";
  } else {
    message = "Les deux options donnent le même résultat net.";
  }

  return {
    partInterets,
    impotPFU,
    pso,
    impotIR,
    abattement,
    netPFU,
    netIR,
    message,
  };
}
