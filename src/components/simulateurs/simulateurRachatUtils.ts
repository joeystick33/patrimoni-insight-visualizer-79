
export type RachatInputs = {
  valeurContrat: number;
  versements: number;
  montantRachat: number;
  anciennete: "moins8" | "plus8";
  modeTMI: "manuel" | "automatique";
  tmi: number; // En % (ex: 30)
  foyer: number; // Nombre de parts fiscales
  abattement?: number; // Ajout du champ abattement
};

export type RachatResultats = {
  partInterets: number;
  impotPFU: number;
  pso: number;
  impotIR: number;
  abattement: number;
  netPFU: number;
  netIR: number;
  tauxImpositionPFU: number;
  tauxImpositionIR: number;
  economiePFU: number;
  economieIR: number;
  message?: string;
  alertes?: string[];
  conseils?: string[];
};

/**
 * Calcule la fiscalité du rachat d'assurance vie selon les règles françaises 2024
 */
export function calculRachat(inputs: RachatInputs): RachatResultats {
  const {
    valeurContrat,
    versements,
    montantRachat,
    anciennete,
    tmi,
    foyer,
    abattement: abattementExterne,
  } = inputs;

  if (montantRachat > valeurContrat) {
    throw new Error("Le montant du rachat ne peut pas dépasser la valeur du contrat");
  }

  if (versements > valeurContrat) {
    throw new Error("Le montant des versements ne peut pas dépasser la valeur du contrat");
  }

  // 1. Calcul de la part d'intérêts imposable (prorata du rachat)
  const totalInteret = Math.max(0, valeurContrat - versements);
  const partInterets = totalInteret * (montantRachat / valeurContrat);

  // 2. Prélèvements sociaux (17,2%) - toujours sur la totalité des intérêts
  const pso = partInterets * 0.172;

  // 3. OPTION PFU : 12,8% sur la totalité des intérêts (pas d'abattement)
  const impotPFU = partInterets * 0.128;
  const netPFU = montantRachat - (impotPFU + pso);
  const tauxImpositionPFU = montantRachat > 0 ? ((impotPFU + pso) / montantRachat) * 100 : 0;

  // 4. OPTION BARÈME IR : abattement uniquement si contrat > 8 ans ET prendre en compte abattement transmis
  let abattement = 0;
  if (anciennete === "plus8") {
    abattement = abattementExterne || (foyer >= 2 ? 9200 : 4600);
    abattement = Math.min(abattement, partInterets); // L'abattement ne peut pas dépasser les intérêts
  }

  // Base imposable IR après abattement
  const baseImposableIR = Math.max(0, partInterets - abattement);
  const impotIR = baseImposableIR * (tmi / 100);
  const netIR = montantRachat - (impotIR + pso);
  const tauxImpositionIR = montantRachat > 0 ? ((impotIR + pso) / montantRachat) * 100 : 0;

  // 5. Calcul des économies par rapport à l'option la moins favorable
  const coutTotalPFU = impotPFU + pso;
  const coutTotalIR = impotIR + pso;
  const economiePFU = Math.max(0, coutTotalIR - coutTotalPFU);
  const economieIR = Math.max(0, coutTotalPFU - coutTotalIR);

  // 6. Messages et conseils
  const alertes: string[] = [];
  const conseils: string[] = [];
  let message = "";

  if (partInterets === 0) {
    message = "Aucun intérêt à déclarer : le montant des versements est égal ou supérieur à la valeur du contrat.";
  } else if (baseImposableIR === 0 && anciennete === "plus8") {
    message = "Le barème IR est optimal : aucun impôt sur le revenu grâce à l'abattement (seuls les prélèvements sociaux de 17,2% sont dus).";
    conseils.push(`Économie de ${economiePFU.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} € par rapport au PFU.`);
  } else if (netPFU > netIR) {
    message = `Le PFU est plus avantageux : +${(netPFU - netIR).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} € net.`;
  } else if (netIR > netPFU) {
    message = `Le barème IR est plus avantageux : +${(netIR - netPFU).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} € net.`;
  } else {
    message = "Les deux options donnent le même résultat net.";
  }

  // Alertes et conseils supplémentaires
  if (anciennete === "moins8" && partInterets > 4600) {
    alertes.push("Contrat de moins de 8 ans : aucun abattement applicable. Considérez attendre l'ancienneté de 8 ans.");
  }

  if (partInterets > abattement && anciennete === "plus8") {
    conseils.push(`Avec ${partInterets.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} € d'intérêts et un abattement de ${abattement.toLocaleString("fr-FR")} €, une partie reste imposable.`);
  }

  if (tmi >= 30 && anciennete === "plus8") {
    conseils.push("TMI élevée : le barème IR sera souvent plus favorable que le PFU grâce à l'abattement après 8 ans.");
  }

  // Impact sur le RFR
  if (partInterets > 0) {
    conseils.push(`Impact RFR : les ${partInterets.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} € d'intérêts s'ajouteront à votre revenu fiscal de référence, quel que soit le mode d'imposition choisi.`);
  }

  return {
    partInterets,
    impotPFU,
    pso,
    impotIR,
    abattement,
    netPFU,
    netIR,
    tauxImpositionPFU,
    tauxImpositionIR,
    economiePFU,
    economieIR,
    message,
    alertes,
    conseils,
  };
}
