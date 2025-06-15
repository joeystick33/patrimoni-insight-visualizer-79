
interface Beneficiaire {
  nom: string;
  lienParente: "conjoint" | "enfant" | "petit-enfant" | "frere-soeur" | "neveu-niece" | "autre";
  age: number;
  quotite: number;
  typeClause?: "pleine-propriete" | "usufruit" | "nue-propriete";
  usufruitier?: {
    nom: string;
    age: number;
    lienParente: "conjoint" | "enfant" | "petit-enfant" | "frere-soeur" | "neveu-niece" | "autre";
  };
}

interface ParametresDeces {
  valeurContrat: number;
  primesAvant70: number;
  primesApres70: number;
  clauseType: "standard" | "personnalisee" | "demembree";
  beneficiaires: Beneficiaire[];
}

interface ResultatBeneficiaire {
  nom: string;
  lienParente: string;
  montantBrut: number;
  partAvant70: number;
  partApres70: number;
  base990I: number;
  base757B: number;
  abattementAvant70: number;
  abattementApres70: number;
  imposableAvant70: number;
  imposableApres70: number;
  impotAvant70: number;
  impotApres70: number;
  impotTotal: number;
  montantNet: number;
  tauxImposition: number;
  isExonereTepa: boolean;
  typeClause?: "pleine-propriete" | "usufruit" | "nue-propriete";
  pourcentageUsufruit?: number;
  pourcentageNuePropriete?: number;
  usufruitier?: string;
  partUsufruit?: number;
  partNuePropriete?: number;
}

// Barèmes des droits de succession selon le lien de parenté - Barèmes 2024
const baremesSuccession = {
  "conjoint": { 
    abattement: 80724, 
    taux: [{ seuil: 0, taux: 0 }],
    exonerationTepa: true
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
    ],
    exonerationTepa: false
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
    ],
    exonerationTepa: false
  },
  "frere-soeur": { 
    abattement: 15932, 
    taux: [
      { seuil: 0, taux: 0.35 },
      { seuil: 24430, taux: 0.45 }
    ],
    exonerationTepa: false
  },
  "neveu-niece": { 
    abattement: 7967, 
    taux: [{ seuil: 0, taux: 0.55 }],
    exonerationTepa: false
  },
  "autre": { 
    abattement: 1594, 
    taux: [{ seuil: 0, taux: 0.60 }],
    exonerationTepa: false
  }
};

// Barème de l'usufruit selon l'âge (article 669 du CGI)
const baremeUsufruit: { [key: string]: number } = {
  "moins-21": 90,
  "21-30": 80,
  "31-40": 70,
  "41-50": 60,
  "51-60": 50,
  "61-70": 40,
  "71-80": 30,
  "81-90": 20,
  "91-plus": 10
};

function getPourcentageUsufruit(age: number): number {
  if (age < 21) return 90;
  if (age <= 30) return 80;
  if (age <= 40) return 70;
  if (age <= 50) return 60;
  if (age <= 60) return 50;
  if (age <= 70) return 40;
  if (age <= 80) return 30;
  if (age <= 90) return 20;
  return 10;
}

function calculerImpotSuccession(montant: number, lienParente: string): number {
  const bareme = baremesSuccession[lienParente as keyof typeof baremesSuccession];
  if (!bareme) return montant * 0.60;

  // Exonération totale pour conjoint/PACS (Loi Tepa)
  if (bareme.exonerationTepa) return 0;

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

function calculerImpot990I(montantImposable: number): number {
  if (montantImposable <= 0) return 0;
  if (montantImposable <= 700000) return montantImposable * 0.20;
  return 700000 * 0.20 + (montantImposable - 700000) * 0.3125;
}

function calculDroits757B(primesApres70: number, quotite: number, lienParente: string): number {
  const abattementGlobal = 30500;
  const baseIndiv = primesApres70 * quotite;
  const abattementIndiv = abattementGlobal * quotite;
  const baseTaxable = Math.max(0, baseIndiv - abattementIndiv);
  let taux = 0;

  switch (lienParente) {
    case "conjoint":
      taux = 0; 
      break;
    case "enfant":
      taux = 0.20; 
      break;
    case "frere-soeur":
      taux = baseTaxable <= 24430 ? 0.35 : 0.45; 
      break;
    default:
      taux = 0.60; 
      break;
  }

  return baseTaxable * taux;
}

function calculerFiscaliteBeneficiaire(
  lienParente: string,
  nom: string,
  quotiteDecimale: number,
  valeurContrat: number,
  base990I: number,
  base757B: number,
  primesApres70: number,
  abattementGlobal757B: number,
  partUsufruit?: number,
  partNuePropriete?: number
): ResultatBeneficiaire {
  const bareme = baremesSuccession[lienParente as keyof typeof baremesSuccession];
  const isExonereTepa = bareme?.exonerationTepa || false;
  
  // 4. Pour chaque bénéficiaire, appliquer la quotité
  const montantBrut = valeurContrat * quotiteDecimale;
  const partBenef990I = quotiteDecimale * base990I;
  const partBenef757B = quotiteDecimale * base757B;
  
  // 🔹 Régime 990 I (primes versées avant 70 ans + intérêts correspondants)
  let abattementAvant70 = 0;
  let imposableAvant70 = 0;
  let impotAvant70 = 0;

  if (isExonereTepa) {
    // Conjoint/PACS : exonération totale
    abattementAvant70 = 0;
    imposableAvant70 = 0;
    impotAvant70 = 0;
  } else {
    // Pour les clauses démembrées : abattement proportionnel à la part reçue
    const abattementBase = 152500;
    const partEffective = partUsufruit !== undefined ? partUsufruit : (partNuePropriete !== undefined ? partNuePropriete : 1);
    abattementAvant70 = Math.min(abattementBase * partEffective, partBenef990I);
    imposableAvant70 = Math.max(0, partBenef990I - abattementAvant70);
    impotAvant70 = calculerImpot990I(imposableAvant70);
  }

  // 🔹 Régime 757 B (primes versées après 70 ans SEULEMENT - intérêts exonérés)
  let abattementApres70 = 0;
  let imposableApres70 = 0;
  let impotApres70 = 0;

  if (isExonereTepa) {
    // Conjoint/PACS : exonération totale même sur primes après 70 ans
    abattementApres70 = 0;
    imposableApres70 = 0;
    impotApres70 = 0;
  } else if (primesApres70 > 0) {
    // Pour les clauses démembrées : abattement 757B proportionnel à la part reçue
    const partEffective = partUsufruit !== undefined ? partUsufruit : (partNuePropriete !== undefined ? partNuePropriete : 1);
    impotApres70 = calculDroits757B(primesApres70, quotiteDecimale * partEffective, lienParente);
    
    // Calcul des montants pour l'affichage
    const baseIndiv = primesApres70 * quotiteDecimale * partEffective;
    abattementApres70 = Math.min(abattementGlobal757B * quotiteDecimale * partEffective, baseIndiv);
    imposableApres70 = Math.max(0, baseIndiv - abattementApres70);
  }

  const impotTotal = impotAvant70 + impotApres70;
  const montantNet = montantBrut - impotTotal;
  const tauxImposition = montantBrut > 0 ? (impotTotal / montantBrut) * 100 : 0;

  return {
    nom,
    lienParente,
    montantBrut,
    partAvant70: partBenef990I,
    partApres70: partBenef757B,
    base990I: partBenef990I,
    base757B: partBenef757B,
    abattementAvant70,
    abattementApres70,
    imposableAvant70,
    imposableApres70,
    impotAvant70,
    impotApres70,
    impotTotal,
    montantNet,
    tauxImposition,
    isExonereTepa,
    partUsufruit,
    partNuePropriete
  };
}

export function calculDeces(params: ParametresDeces) {
  const { valeurContrat, primesAvant70, clauseType, beneficiaires } = params;
  
  // Gestion automatique des primes après 70 ans (0 par défaut)
  const primesApres70 = params.primesApres70 || 0;
  
  // Validation des données
  if (valeurContrat <= 0 || primesAvant70 < 0 || primesApres70 < 0) {
    throw new Error("Les montants doivent être positifs");
  }
  
  const totalPrimes = primesAvant70 + primesApres70;
  if (totalPrimes > valeurContrat) {
    throw new Error("Le total des primes ne peut pas dépasser la valeur du contrat");
  }

  // 🧠 LOGIQUE DE CALCUL SELON VOTRE MÉTHODE PROPORTIONNELLE :
  
  // 1. Calculer le ratio des primes après 70 ans
  const ratioApres70 = totalPrimes > 0 ? primesApres70 / totalPrimes : 0;
  
  // 2. Estimer la part du capital taxable selon le régime 757 B (méthode proportionnelle)
  const base757B = ratioApres70 * valeurContrat;
  
  // 3. Estimer la part du capital taxable selon le régime 990 I
  const base990I = valeurContrat - base757B;

  // Abattement global article 757 B (30 500 €) - COMMUN à tous les bénéficiaires
  const abattementGlobal757B = 30500;

  const resultats: ResultatBeneficiaire[] = [];

  beneficiaires.forEach(beneficiaire => {
    const quotiteDecimale = beneficiaire.quotite / 100;
    
    // Gestion du démembrement
    if (beneficiaire.typeClause === "usufruit" || beneficiaire.typeClause === "nue-propriete") {
      if (!beneficiaire.usufruitier) {
        throw new Error("L'usufruitier doit être défini pour une clause démembrée");
      }
      
      const pourcentageUsufruit = getPourcentageUsufruit(beneficiaire.usufruitier.age);
      const pourcentageNuePropriete = 100 - pourcentageUsufruit;
      
      // Conversion en parts décimales
      const partUsufruit = pourcentageUsufruit / 100;
      const partNuePropriete = pourcentageNuePropriete / 100;
      
      if (beneficiaire.typeClause === "usufruit") {
        // Calcul pour l'usufruitier - il reçoit sa part d'usufruit
        const quotiteUsufruitEffective = quotiteDecimale * partUsufruit;
        const resultatUsufruit = calculerFiscaliteBeneficiaire(
          beneficiaire.usufruitier.lienParente,
          beneficiaire.usufruitier.nom,
          quotiteUsufruitEffective,
          valeurContrat,
          base990I,
          base757B,
          primesApres70,
          abattementGlobal757B,
          partUsufruit,
          undefined
        );
        
        resultats.push({
          ...resultatUsufruit,
          nom: `${beneficiaire.usufruitier.nom} (Usufruitier)`,
          typeClause: "usufruit",
          pourcentageUsufruit,
          pourcentageNuePropriete,
          usufruitier: beneficiaire.usufruitier.nom,
          partUsufruit,
          partNuePropriete
        });
      } else {
        // Calcul pour le nu-propriétaire - il reçoit sa part de nue-propriété
        const quotiteNueProprietEffective = quotiteDecimale * partNuePropriete;
        const resultatNuePropriete = calculerFiscaliteBeneficiaire(
          beneficiaire.lienParente,
          beneficiaire.nom,
          quotiteNueProprietEffective,
          valeurContrat,
          base990I,
          base757B,
          primesApres70,
          abattementGlobal757B,
          undefined,
          partNuePropriete
        );
        
        resultats.push({
          ...resultatNuePropriete,
          nom: `${beneficiaire.nom} (Nu-propriétaire)`,
          typeClause: "nue-propriete",
          pourcentageUsufruit,
          pourcentageNuePropriete,
          usufruitier: beneficiaire.usufruitier.nom,
          partUsufruit,
          partNuePropriete
        });
      }
    } else {
      // Clause en pleine propriété (existant)
      const resultat = calculerFiscaliteBeneficiaire(
        beneficiaire.lienParente,
        beneficiaire.nom,
        quotiteDecimale,
        valeurContrat,
        base990I,
        base757B,
        primesApres70,
        abattementGlobal757B
      );
      
      resultats.push({
        ...resultat,
        typeClause: "pleine-propriete"
      });
    }
  });

  // Calculs globaux
  const totalTransmis = valeurContrat;
  const totalImpots = resultats.reduce((sum, r) => sum + r.impotTotal, 0);
  const totalNet = resultats.reduce((sum, r) => sum + r.montantNet, 0);
  const tauxImpositionGlobal = totalTransmis > 0 ? (totalImpots / totalTransmis) * 100 : 0;

  // Conseils d'optimisation
  const optimisations: string[] = [];
  const alertes: string[] = [];

  const beneficiairesExoneres = resultats.filter(r => r.isExonereTepa);
  const beneficiairesImposables = resultats.filter(r => !r.isExonereTepa);

  if (beneficiairesExoneres.length > 0) {
    optimisations.push(`${beneficiairesExoneres.length} bénéficiaire(s) totalement exonéré(s) grâce à la loi Tepa (conjoint/PACS).`);
  }

  // Conseil spécifique au démembrement
  const clausesDemembrees = resultats.filter(r => r.typeClause === "usufruit" || r.typeClause === "nue-propriete");
  if (clausesDemembrees.length > 0) {
    optimisations.push(`Clause démembrée appliquée : abattements proportionnels aux parts d'usufruit/nue-propriété selon le barème fiscal.`);
  }

  // Vérification des abattements 990 I pour les clauses démembrées
  const beneficiairesAbattementProportionnel = resultats.filter(r => 
    (r.typeClause === "usufruit" || r.typeClause === "nue-propriete") && 
    r.base990I > 0
  );
  if (beneficiairesAbattementProportionnel.length > 0) {
    optimisations.push(`Clauses démembrées : abattements 990I appliqués proportionnellement aux parts reçues (${beneficiairesAbattementProportionnel.length} bénéficiaire(s) concerné(s)).`);
  }

  // Optimisation versements après 70 ans
  if (primesApres70 > abattementGlobal757B) {
    const exces = primesApres70 - abattementGlobal757B;
    alertes.push(`Les primes après 70 ans (${primesApres70.toLocaleString()} €) dépassent l'abattement global de ${abattementGlobal757B.toLocaleString()} € de ${exces.toLocaleString()} €. Privilégiez les versements avant 70 ans.`);
  }

  // Alerte sur les concubins
  const concubins = resultats.filter(r => r.lienParente === "autre");
  if (concubins.length > 0) {
    alertes.push(`⚠️ ATTENTION : Les concubins (sans lien juridique) subissent un taux d'imposition de 60% sans exonération Tepa. Considérez le PACS ou le mariage.`);
  }

  // Alerte taux d'imposition élevé
  if (tauxImpositionGlobal > 20) {
    alertes.push(`Taux d'imposition global élevé (${tauxImpositionGlobal.toFixed(1)}%). Envisagez des stratégies d'optimisation.`);
  }

  return {
    beneficiaires: resultats,
    totalTransmis,
    totalImpots,
    totalNet,
    tauxImpositionGlobal,
    ratioApres70: ratioApres70 * 100,
    base990I,
    base757B,
    optimisations,
    alertes
  };
}
