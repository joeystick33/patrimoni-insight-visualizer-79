
interface Beneficiaire {
  nom: string;
  lienParente: "conjoint" | "enfant" | "petit-enfant" | "frere-soeur" | "neveu-niece" | "autre";
  age: number;
  quotite: number;
}

interface ParametresDeces {
  valeurContrat: number;
  primesAvant70: number;
  primesApres70: number;
  clauseType: "standard" | "personnalisee";
  beneficiaires: Beneficiaire[];
}

interface ResultatBeneficiaire {
  nom: string;
  lienParente: string;
  montantBrut: number;
  partAvant70: number;
  partApres70: number;
  abattementAvant70: number;
  abattementApres70: number;
  imposableAvant70: number;
  imposableApres70: number;
  impotAvant70: number;
  impotApres70: number;
  impotTotal: number;
  montantNet: number;
  tauxImposition: number;
}

// Barèmes des droits de succession selon le lien de parenté - CORRECTION : Barèmes 2024
const baremesSuccession = {
  "conjoint": { 
    abattement: 80724, 
    taux: [{ seuil: 0, taux: 0 }] // Exonération totale pour conjoints/partenaires PACS
  }, 
  "enfant": { 
    abattement: 100000, 
    taux: [
      { seuil: 0, taux: 0.05 },
      { seuil: 8072, taux: 0.10 },
      { seuil: 12109, taux: 0.15 },
      { seuil: 15932, taux: 0.20 },
      { seuil: 552324, taux: 0.30 },
      { seuil: 902838, taux: 0.40 },
      { seuil: 1805677, taux: 0.45 }
    ]
  },
  "petit-enfant": { 
    abattement: 1594, 
    taux: [
      { seuil: 0, taux: 0.05 },
      { seuil: 8072, taux: 0.10 },
      { seuil: 12109, taux: 0.15 },
      { seuil: 15932, taux: 0.20 },
      { seuil: 552324, taux: 0.30 },
      { seuil: 902838, taux: 0.40 },
      { seuil: 1805677, taux: 0.45 }
    ]
  },
  "frere-soeur": { 
    abattement: 15932, 
    taux: [
      { seuil: 0, taux: 0.35 },
      { seuil: 24430, taux: 0.45 }
    ]
  },
  "neveu-niece": { 
    abattement: 7967, 
    taux: [{ seuil: 0, taux: 0.55 }]
  },
  "autre": { 
    abattement: 1594, 
    taux: [{ seuil: 0, taux: 0.60 }]
  }
};

function calculerImpotSuccession(montant: number, lienParente: string): number {
  const bareme = baremesSuccession[lienParente as keyof typeof baremesSuccession];
  if (!bareme) return montant * 0.60;

  let impot = 0;
  let montantRestant = Math.max(0, montant - bareme.abattement);

  for (let i = 0; i < bareme.taux.length; i++) {
    const tranche = bareme.taux[i];
    const trancheSuivante = bareme.taux[i + 1];
    
    if (trancheSuivante) {
      const montantTranche = Math.min(montantRestant, trancheSuivante.seuil - tranche.seuil);
      impot += montantTranche * tranche.taux;
      montantRestant -= montantTranche;
      
      if (montantRestant <= 0) break;
    } else {
      impot += montantRestant * tranche.taux;
      break;
    }
  }

  return impot;
}

// CORRECTION : Calcul impôt 990 I avec les bons taux 2024
function calculerImpot990I(montantImposable: number): number {
  if (montantImposable <= 0) return 0;
  if (montantImposable <= 700000) return montantImposable * 0.20;
  return 700000 * 0.20 + (montantImposable - 700000) * 0.3125;
}

export function calculDeces(params: ParametresDeces) {
  const { valeurContrat, primesAvant70, primesApres70, beneficiaires } = params;
  
  // Validation des données
  if (valeurContrat <= 0 || primesAvant70 < 0 || primesApres70 < 0) {
    throw new Error("Les montants doivent être positifs");
  }
  
  const totalPrimes = primesAvant70 + primesApres70;
  if (totalPrimes > valeurContrat) {
    throw new Error("Le total des primes ne peut pas dépasser la valeur du contrat");
  }
  
  // Calcul des produits (plus-values)
  const produits = valeurContrat - totalPrimes;
  const produitAvant70 = totalPrimes > 0 ? (produits * primesAvant70) / totalPrimes : 0;
  const produitApres70 = totalPrimes > 0 ? (produits * primesApres70) / totalPrimes : 0;

  // Abattement global article 757 B (30 500 €)
  const abattementGlobal757B = 30500;
  let abattementRestant757B = abattementGlobal757B;

  const resultats: ResultatBeneficiaire[] = beneficiaires.map(beneficiaire => {
    const quotiteDecimale = beneficiaire.quotite / 100;
    
    // Répartition du montant brut
    const montantBrut = valeurContrat * quotiteDecimale;
    const partPrimesAvant70 = primesAvant70 * quotiteDecimale;
    const partPrimesApres70 = primesApres70 * quotiteDecimale;
    const partProduitAvant70 = produitAvant70 * quotiteDecimale;
    const partProduitApres70 = produitApres70 * quotiteDecimale;
    
    const partAvant70 = partPrimesAvant70 + partProduitAvant70;
    const partApres70 = partPrimesApres70 + partProduitApres70;

    // Article 990 I (primes avant 70 ans + produits)
    const abattementAvant70 = Math.min(152500, partAvant70);
    const imposableAvant70 = Math.max(0, partAvant70 - abattementAvant70);
    const impotAvant70 = calculerImpot990I(imposableAvant70);

    // Article 757 B (primes après 70 ans seulement)
    let abattementApres70 = 0;
    let imposableApres70 = partPrimesApres70;
    let impotApres70 = 0;

    if (abattementRestant757B > 0 && partPrimesApres70 > 0) {
      abattementApres70 = Math.min(abattementRestant757B, partPrimesApres70);
      abattementRestant757B -= abattementApres70;
      imposableApres70 = Math.max(0, partPrimesApres70 - abattementApres70);
    }

    if (imposableApres70 > 0) {
      impotApres70 = calculerImpotSuccession(imposableApres70, beneficiaire.lienParente);
    }

    const impotTotal = impotAvant70 + impotApres70;
    const montantNet = montantBrut - impotTotal;
    const tauxImposition = montantBrut > 0 ? (impotTotal / montantBrut) * 100 : 0;

    return {
      nom: beneficiaire.nom,
      lienParente: beneficiaire.lienParente,
      montantBrut,
      partAvant70,
      partApres70,
      abattementAvant70,
      abattementApres70,
      imposableAvant70,
      imposableApres70,
      impotAvant70,
      impotApres70,
      impotTotal,
      montantNet,
      tauxImposition
    };
  });

  // Calculs globaux
  const totalTransmis = valeurContrat;
  const totalImpots = resultats.reduce((sum, r) => sum + r.impotTotal, 0);
  const totalNet = resultats.reduce((sum, r) => sum + r.montantNet, 0);
  const tauxImpositionGlobal = totalTransmis > 0 ? (totalImpots / totalTransmis) * 100 : 0;

  // AMÉLIORATION : Conseils d'optimisation plus précis
  const optimisations: string[] = [];
  const alertes: string[] = [];

  // Vérification des abattements non utilisés
  const beneficiairesAbattementNonUtilise = resultats.filter(r => r.abattementAvant70 < 152500);
  if (beneficiairesAbattementNonUtilise.length > 0) {
    optimisations.push(`${beneficiairesAbattementNonUtilise.length} bénéficiaire(s) n'utilisent pas la totalité de leur abattement 990 I (152 500 €). Considérez une répartition plus équitable.`);
  }

  // Optimisation versements après 70 ans
  if (primesApres70 > abattementGlobal757B) {
    const exces = primesApres70 - abattementGlobal757B;
    optimisations.push(`Les primes après 70 ans (${primesApres70.toLocaleString()} €) dépassent l'abattement global de ${abattementGlobal757B.toLocaleString()} € de ${exces.toLocaleString()} €. Privilégiez les versements avant 70 ans.`);
  }

  // Alerte taux d'imposition élevé
  if (tauxImpositionGlobal > 20) {
    alertes.push(`Taux d'imposition global élevé (${tauxImpositionGlobal.toFixed(1)}%). Envisagez des stratégies d'optimisation : démembrement, assurances croisées, donations, etc.`);
  }

  // Alerte bénéficiaire unique avec forte imposition
  if (beneficiaires.length === 1 && resultats[0].tauxImposition > 15) {
    optimisations.push("Avec un seul bénéficiaire, considérez la nomination de bénéficiaires multiples pour diluer l'imposition et utiliser plusieurs abattements.");
  }

  // Conseil clause standard
  if (params.clauseType === "standard") {
    if (beneficiaires.some(b => b.lienParente === "conjoint")) {
      alertes.push("Avec une clause standard et un conjoint, vérifiez la situation en cas de famille recomposée (enfants d'un premier lit).");
    }
    optimisations.push("La clause standard peut être insuffisante dans certaines situations familiales. Considérez une clause personnalisée pour plus de précision.");
  }

  return {
    beneficiaires: resultats,
    totalTransmis,
    totalImpots,
    totalNet,
    tauxImpositionGlobal,
    optimisations,
    alertes
  };
}
