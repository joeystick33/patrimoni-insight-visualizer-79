
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
}

// Barèmes des droits de succession selon le lien de parenté (art. 757 B)
const baremesSuccession = {
  "conjoint": { abattement: 80724, taux: [{ seuil: 0, taux: 0 }] }, // Exonération totale
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
  if (!bareme) return montant * 0.60; // Taux maximum par défaut

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
      // Dernière tranche
      impot += montantRestant * tranche.taux;
      break;
    }
  }

  return impot;
}

function calculerImpot990I(montantImposable: number): number {
  if (montantImposable <= 0) return 0;
  if (montantImposable <= 700000) return montantImposable * 0.20;
  return 700000 * 0.20 + (montantImposable - 700000) * 0.3125;
}

export function calculDeces(params: ParametresDeces) {
  const { valeurContrat, primesAvant70, primesApres70, beneficiaires } = params;
  
  // Calcul des produits (plus-values)
  const totalPrimes = primesAvant70 + primesApres70;
  const produits = valeurContrat - totalPrimes;
  const produitAvant70 = (produits * primesAvant70) / totalPrimes;
  const produitApres70 = (produits * primesApres70) / totalPrimes;

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
    let imposableApres70 = partPrimesApres70; // Seules les primes sont imposables
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
      montantNet
    };
  });

  // Calculs globaux
  const totalTransmis = valeurContrat;
  const totalImpots = resultats.reduce((sum, r) => sum + r.impotTotal, 0);
  const totalNet = resultats.reduce((sum, r) => sum + r.montantNet, 0);

  // Génération des conseils d'optimisation
  const optimisations: string[] = [];
  const alertes: string[] = [];

  // Vérification des abattements non utilisés
  const abattementsNonUtilises = resultats.filter(r => r.abattementAvant70 < 152500).length;
  if (abattementsNonUtilises > 0) {
    optimisations.push(`${abattementsNonUtilises} bénéficiaire(s) n'utilisent pas la totalité de leur abattement de 152 500 €. Considérez une répartition plus équilibrée.`);
  }

  // Alerte si forte imposition
  const tauxImpositionMoyen = (totalImpots / totalTransmis) * 100;
  if (tauxImpositionMoyen > 15) {
    alertes.push(`Taux d'imposition élevé (${tauxImpositionMoyen.toFixed(1)}%). Envisagez des stratégies d'optimisation.`);
  }

  // Conseil sur les versements après 70 ans
  if (primesApres70 > abattementGlobal757B) {
    optimisations.push("Les primes versées après 70 ans dépassent l'abattement global. Privilégiez les versements avant 70 ans pour optimiser la fiscalité.");
  }

  // Alerte clause standard potentiellement défavorable
  if (params.clauseType === "standard" && beneficiaires.length === 1 && beneficiaires[0].lienParente === "conjoint") {
    alertes.push("Avec une clause standard, vérifiez que la répartition correspond bien à vos souhaits en cas de famille recomposée.");
  }

  return {
    beneficiaires: resultats,
    totalTransmis,
    totalImpots,
    totalNet,
    optimisations,
    alertes
  };
}
