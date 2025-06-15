
export type RachatInputs = {
  valeurContrat: number;
  versements: number;
  montantRachat: number;
  anciennete: "moins8" | "plus8";
  modeTMI: "manuel" | "automatique";
  tmi: number; // En % (ex: 30)
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
 * Calcule toutes les valeurs utiles selon la fiscalité française de l'assurance vie.
 * - PFU : jamais d'abattement, toujours sur la totalité de la part d'intérêts.
 * - Barème IR : abattement de 4600 € (ou 9200 si couple), uniquement si +8 ans.
 */
export function calculRachat(inputs: RachatInputs): RachatResultats {
  const {
    valeurContrat,
    versements,
    montantRachat,
    anciennete,
    tmi,
  } = inputs;

  // Part d’intérêts imposable
  const partInterets = Math.max(
    0,
    (valeurContrat - versements) * (montantRachat / valeurContrat)
  );

  // Prélèvements sociaux (toujours 17,2 % sur part intérêts)
  const pso = partInterets * 0.172;

  // PFU (12,8%) - jamais d'abattement
  const impotPFU = partInterets * 0.128;

  // Abattement barème IR si +8 ans
  let abattement = 0;
  if (anciennete === "plus8") {
    abattement = 4600;
    // Pour couple : 9200, à rendre dynamique selon le foyer
  }

  // Barème IR : TMI × part après abattement seulement
  let baseIR = Math.max(0, partInterets - abattement);
  const impotIR = baseIR * (tmi / 100);

  // Net après impôt
  const netPFU = montantRachat - (impotPFU + pso);
  const netIR = montantRachat - (impotIR + pso);

  let message = undefined;
  // Suggestion : si baseIR == 0, le barème IR est forcément le plus avantageux fiscalement (zéro impôt)
  if (baseIR === 0) {
    message =
      "Le barème IR est le plus avantageux dans votre cas, car la base imposable (après abattement) est nulle : seuls les prélèvements sociaux sont dus.";
  } else if (netIR > netPFU) {
    message =
      "Le PFU (prélèvement forfaitaire unique, flat tax) est plus avantageux dans votre cas.";
  } else if (netIR < netPFU) {
    message =
      "Le barème IR est plus avantageux dans votre cas (hors prélèvements sociaux).";
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

