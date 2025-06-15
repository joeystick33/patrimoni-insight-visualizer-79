import React from "react";
import {
  ChartContainer,
  ChartLegendContent,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  XAxis,
  YAxis,
  Bar,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type Props = {
  montantRachat: number;
  resultats: {
    partInterets: number;
    impotPFU: number;
    pso: number;
    impotIR: number;
    abattement: number;
    netPFU: number;
    netIR: number;
    message?: string;
  };
};

const colors = {
  net: "#22c55e",
  impot: "#eab308",
  pso: "#334155",
};

const RachatResultats: React.FC<Props> = ({ montantRachat, resultats }) => {
  /**
   * Préparation des données graphiques : deux barres séparées
   */
  const data = [
    {
      name: "PFU",
      "Montant net": Math.round(resultats.netPFU),
      "Impôt": Math.round(resultats.impotPFU),
      "Prélèv. sociaux": Math.round(resultats.pso),
    },
    {
      name: "Barème IR",
      "Montant net": Math.round(resultats.netIR),
      "Impôt": Math.round(resultats.impotIR),
      "Prélèv. sociaux": Math.round(resultats.pso),
    },
  ];

  return (
    <div className="mt-8 flex flex-col items-center gap-8 w-full">
      {/* Détail pédagogique du calcul PFU */}
      <div className="w-full max-w-xl p-4 rounded-lg bg-card shadow border border-border animate-fade-in">
        <h3 className="font-semibold text-lg text-primary pb-2">Calcul mode PFU</h3>
        <ul className="space-y-1 text-sm">
          <li>
            <span className="font-medium">Part d’intérêts imposable :</span> {resultats.partInterets.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €
          </li>
          <li>
            <span className="font-medium">Abattement (si &gt; 8 ans) :</span> {resultats.abattement ? `${resultats.abattement.toLocaleString("fr-FR")} €` : "—"}
          </li>
          <li>
            <span className="font-medium">Impôt sur 12,8% :</span> {resultats.impotPFU.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €
          </li>
          <li>
            <span className="font-medium">Prélèvements sociaux (17,2%) :</span> {resultats.pso.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €
          </li>
          <li>
            <span className="font-medium">Net après impôts :</span> <span className="text-green-700 dark:text-green-400 font-semibold">{resultats.netPFU.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €</span>
          </li>
        </ul>
      </div>

      {/* Détail pédagogique du calcul Barème IR */}
      <div className="w-full max-w-xl p-4 rounded-lg bg-card shadow border border-border animate-fade-in">
        <h3 className="font-semibold text-lg text-primary pb-2">Calcul mode Barème IR</h3>
        <ul className="space-y-1 text-sm">
          <li>
            <span className="font-medium">Part d’intérêts imposable :</span> {resultats.partInterets.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €
          </li>
          <li>
            <span className="font-medium">Abattement (si &gt; 8 ans) :</span> {resultats.abattement ? `${resultats.abattement.toLocaleString("fr-FR")} €` : "—"}
          </li>
          <li>
            <span className="font-medium">Base imposable après abattement :</span> {Math.max(0, resultats.partInterets - resultats.abattement).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €
          </li>
          <li>
            <span className="font-medium">Impôt (au taux marginal indiqué) :</span> {resultats.impotIR.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €
          </li>
          <li>
            <span className="font-medium">Prélèvements sociaux (17,2%) :</span> {resultats.pso.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €
          </li>
          <li>
            <span className="font-medium">Net après impôts :</span> <span className="text-green-700 dark:text-green-400 font-semibold">{resultats.netIR.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €</span>
          </li>
        </ul>
      </div>

      {/* Graphique comparatif */}
      <div className="w-full max-w-xl">
        <ChartContainer
          config={{
            "Montant net": { color: colors.net, label: "Montant net" },
            "Impôt": { color: colors.impot, label: "Impôt" },
            "Prélèv. sociaux": { color: colors.pso, label: "Prélèv. sociaux" },
          }}
          className="bg-white dark:bg-slate-900 rounded-xl p-3"
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 0, bottom: 30 }}
              barGap={10}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend content={<ChartLegendContent />} />
              <Bar dataKey="Montant net" stackId="a" radius={[6, 6, 0, 0]} fill={colors.net} />
              <Bar dataKey="Impôt" stackId="a" fill={colors.impot} />
              <Bar dataKey="Prélèv. sociaux" stackId="a" fill={colors.pso} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Résumé et suggestion finale */}
      <div className="w-full max-w-xl text-center mt-2">
        <div className="text-xl font-bold text-primary">
          Net après impôts :
          <br />
          PFU : {resultats.netPFU.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €
          <br />
          Barème IR : {resultats.netIR.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €
        </div>
        {resultats.message && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 rounded shadow text-yellow-700 dark:text-yellow-300 mt-4 text-center font-medium">
            {resultats.message}
          </div>
        )}
      </div>

      {/* Explication pédagogique ajoutée */}
      <div className="w-full max-w-xl mt-6">
        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg shadow p-4 text-blue-800 dark:text-blue-200 text-sm">
          <strong>À savoir sur le rachat en assurance vie&nbsp;:</strong>
          <br />
          Le rachat consiste à retirer une partie (ou la totalité) de l’épargne de votre contrat d’assurance vie.<br />
          <br />
          <strong>Fiscalité des rachats :</strong> selon votre choix (PFU ou barème IR), l’impôt sur les intérêts est prélevé différemment. Après 8 ans, un abattement fiscal s’applique sur une partie des intérêts perçus.<br />
          <br />
          <strong>Impact sur le RFR&nbsp;:</strong> 
          <ul className="list-disc pl-6 mt-1">
            <li>
              Quel que soit le mode d’imposition choisi (PFU ou barème IR), la part d’intérêts imposable majorera votre <span className="font-semibold">revenu fiscal de référence (RFR)</span>.
            </li>
            <li>
              ⚠️ Un RFR plus élevé peut rendre inéligible à certaines aides (bourses, aides sociales, réductions tarifaires...) ou impacter la taxe d’habitation. 
            </li>
            <li>
              <span className="font-semibold">Le choix du barème IR</span> permet parfois, en cas de base imposable nulle (après abattement), de ne pas payer d’impôt sur le revenu… mais la part d’intérêts s’ajoute tout de même au RFR !
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RachatResultats;
