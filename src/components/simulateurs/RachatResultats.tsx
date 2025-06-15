
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatMontant, formatPourcentage } from "@/lib/utils";

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
    tauxImpositionPFU: number;
    tauxImpositionIR: number;
    economiePFU: number;
    economieIR: number;
    message?: string;
    alertes?: string[];
    conseils?: string[];
  };
};

const colors = {
  net: "#22c55e",
  impot: "#eab308",
  pso: "#334155",
  capital: "#94a3b8",
  interets: "#3b82f6",
};

const RachatResultats: React.FC<Props> = ({ montantRachat, resultats }) => {
  // Données pour le graphique en barres comparatif
  const dataComparaison = [
    {
      name: "PFU (30%)",
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

  // Données pour le camembert de répartition du rachat
  const capitalInitial = montantRachat - resultats.partInterets;
  const dataCamembert = [
    { name: "Capital initial", value: capitalInitial, color: colors.capital },
    { name: "Plus-values", value: resultats.partInterets, color: colors.interets },
  ];

  return (
    <div className="mt-8 space-y-8 animate-fade-in">
      {/* Résumé principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{formatMontant(montantRachat)}</div>
          <div className="text-sm text-blue-600">Montant du rachat</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg text-center border border-orange-200">
          <div className="text-2xl font-bold text-orange-600">{formatMontant(resultats.partInterets)}</div>
          <div className="text-sm text-orange-600">Part d'intérêts imposable</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
          <div className="text-2xl font-bold text-green-600">
            {resultats.netPFU > resultats.netIR ? formatMontant(resultats.netPFU) : formatMontant(resultats.netIR)}
          </div>
          <div className="text-sm text-green-600">Meilleur montant net</div>
        </div>
      </div>

      {/* Message principal */}
      {resultats.message && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-lg font-semibold text-blue-800">
            💡 {resultats.message}
          </div>
        </div>
      )}

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition du rachat */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-lg mb-4 text-center">Composition du rachat</h3>
          <ChartContainer
            config={{
              "Capital initial": { color: colors.capital },
              "Plus-values": { color: colors.interets },
            }}
            className="h-[250px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataCamembert}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${formatMontant(value)} (${(percent * 100).toFixed(1)}%)`}
                  ou terRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dataCamembert.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Comparaison fiscale */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-lg mb-4 text-center">Comparaison fiscale</h3>
          <ChartContainer
            config={{
              "Montant net": { color: colors.net, label: "Montant net" },
              "Impôt": { color: colors.impot, label: "Impôt" },
              "Prélèv. sociaux": { color: colors.pso, label: "Prélèv. sociaux" },
            }}
            className="h-[250px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataComparaison} margin={{ top: 20, right: 30, left: 0, bottom: 30 }}>
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => formatMontant(value)} />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend content={<ChartLegendContent />} />
                <Bar dataKey="Montant net" stackId="a" radius={[6, 6, 0, 0]} fill={colors.net} />
                <Bar dataKey="Impôt" stackId="a" fill={colors.impot} />
                <Bar dataKey="Prélèv. sociaux" stackId="a" fill={colors.pso} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>

      {/* Détails des calculs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calcul PFU */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-lg text-primary mb-4">📊 Calcul PFU (30%)</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Part d'intérêts imposable :</span>
              <span className="font-medium">{formatMontant(resultats.partInterets)}</span>
            </div>
            <div className="flex justify-between">
              <span>Impôt (12,8%) :</span>
              <span className="font-medium text-red-600">{formatMontant(resultats.impotPFU)}</span>
            </div>
            <div className="flex justify-between">
              <span>Prélèvements sociaux (17,2%) :</span>
              <span className="font-medium text-red-600">{formatMontant(resultats.pso)}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Total prélèvements :</span>
              <span className="text-red-600">{formatMontant(resultats.impotPFU + resultats.pso)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg">
              <span>Net après impôts :</span>
              <span className="text-green-600">{formatMontant(resultats.netPFU)}</span>
            </div>
            <div className="text-xs text-gray-500">
              Taux d'imposition : {formatPourcentage(resultats.tauxImpositionPFU)}
            </div>
          </div>
        </div>

        {/* Calcul Barème IR */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-lg text-primary mb-4">📈 Calcul Barème IR</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Part d'intérêts imposable :</span>
              <span className="font-medium">{formatMontant(resultats.partInterets)}</span>
            </div>
            <div className="flex justify-between">
              <span>Abattement (si ≥ 8 ans) :</span>
              <span className="font-medium text-green-600">{formatMontant(resultats.abattement)}</span>
            </div>
            <div className="flex justify-between">
              <span>Base imposable après abattement :</span>
              <span className="font-medium">{formatMontant(Math.max(0, resultats.partInterets - resultats.abattement))}</span>
            </div>
            <div className="flex justify-between">
              <span>Impôt (au TMI) :</span>
              <span className="font-medium text-red-600">{formatMontant(resultats.impotIR)}</span>
            </div>
            <div className="flex justify-between">
              <span>Prélèvements sociaux (17,2%) :</span>
              <span className="font-medium text-red-600">{formatMontant(resultats.pso)}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Total prélèvements :</span>
              <span className="text-red-600">{formatMontant(resultats.impotIR + resultats.pso)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg">
              <span>Net après impôts :</span>
              <span className="text-green-600">{formatMontant(resultats.netIR)}</span>
            </div>
            <div className="text-xs text-gray-500">
              Taux d'imposition : {formatPourcentage(resultats.tauxImpositionIR)}
            </div>
          </div>
        </div>
      </div>

      {/* Alertes et conseils */}
      {(resultats.alertes?.length || resultats.conseils?.length) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resultats.alertes && resultats.alertes.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-800 mb-2">⚠️ Points d'attention</h4>
              <ul className="space-y-1">
                {resultats.alertes.map((alerte, index) => (
                  <li key={index} className="text-sm text-orange-700 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{alerte}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {resultats.conseils && resultats.conseils.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">💡 Conseils d'optimisation</h4>
              <ul className="space-y-1">
                {resultats.conseils.map((conseil, index) => (
                  <li key={index} className="text-sm text-green-700 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{conseil}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Note pédagogique */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
        <h4 className="font-semibold text-blue-800 mb-2">📚 À retenir sur le rachat d'assurance vie</h4>
        <div className="text-blue-700 space-y-2">
          <p><strong>Choix fiscal :</strong> Vous pouvez opter pour le PFU (30% forfaitaire) ou le barème progressif de l'IR + prélèvements sociaux.</p>
          <p><strong>Abattement après 8 ans :</strong> 4 600 € (célibataire) ou 9 200 € (couple) applicable uniquement sur l'impôt sur le revenu, pas sur les prélèvements sociaux.</p>
          <p><strong>Impact RFR :</strong> Les intérêts s'ajoutent au revenu fiscal de référence quel que soit le mode d'imposition, pouvant impacter l'éligibilité à certaines aides.</p>
          <p><strong>Optimisation :</strong> Pour les TMI élevées (≥30%) et contrats de plus de 8 ans, le barème IR est souvent plus favorable.</p>
        </div>
      </div>
    </div>
  );
};

export default RachatResultats;
