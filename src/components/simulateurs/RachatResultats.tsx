
import React from "react";
import {
  ChartContainer,
  ChartLegendContent,
  ChartTooltipContent,
} from "@/components/ui/chart";

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

const RachatResultats: React.FC<Props> = ({ montantRachat, resultats }) => {
  const data = [
    {
      name: "PFU",
      Net: resultats.netPFU,
      Impôt: resultats.impotPFU,
      "Prélèv. sociaux": resultats.pso,
    },
    {
      name: "Barème IR",
      Net: resultats.netIR,
      Impôt: resultats.impotIR,
      "Prélèv. sociaux": resultats.pso,
    },
  ];

  return (
    <div className="mt-8 flex flex-col items-center gap-6">
      <div className="w-full max-w-xl">
        <ChartContainer
          config={{
            Net: { color: "#22c55e", label: "Montant net" },
            Impôt: { color: "#eab308", label: "Impôt" },
            "Prélèv. sociaux": { color: "#334155", label: "Prélèv. sociaux" },
          }}
          className="bg-white dark:bg-slate-900 rounded-xl p-3"
        >
          {({ BarChart, XAxis, YAxis, Bar, Tooltip, Legend, ResponsiveContainer }) => (
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend content={<ChartLegendContent />} />
              <Bar dataKey="Net" stackId="a" />
              <Bar dataKey="Impôt" stackId="a" />
              <Bar dataKey="Prélèv. sociaux" stackId="a" />
            </BarChart>
          )}
        </ChartContainer>
      </div>
      <div className="grid gap-3 w-full max-w-xl">
        <div className="flex justify-between">
          <span>Montant brut racheté&nbsp;:</span>
          <span className="font-bold">{montantRachat.toLocaleString("fr-FR", {maximumFractionDigits: 0})} €</span>
        </div>
        <div className="flex justify-between">
          <span>Part d’intérêts imposable :</span>
          <span>{resultats.partInterets.toLocaleString("fr-FR", {maximumFractionDigits: 0})} €</span>
        </div>
        <div className="flex justify-between">
          <span>Abattement (si > 8 ans) :</span>
          <span>{resultats.abattement ? `${resultats.abattement.toLocaleString("fr-FR")} €` : "—"}</span>
        </div>
        <div className="flex justify-between">
          <span>Impôt PFU (12,8%) :</span>
          <span>{resultats.impotPFU.toLocaleString("fr-FR", {maximumFractionDigits: 0})} €</span>
        </div>
        <div className="flex justify-between">
          <span>Impôt barème IR :</span>
          <span>{resultats.impotIR.toLocaleString("fr-FR", {maximumFractionDigits: 0})} €</span>
        </div>
        <div className="flex justify-between">
          <span>Prélèvements sociaux (17,2%) :</span>
          <span>{resultats.pso.toLocaleString("fr-FR", {maximumFractionDigits: 0})} €</span>
        </div>
      </div>
      <div className="text-xl font-bold text-primary mt-4">
        <span>
          Net après impôts&nbsp;:<br />PFU : {resultats.netPFU.toLocaleString("fr-FR", {maximumFractionDigits: 0})} €<br />
          Barème IR : {resultats.netIR.toLocaleString("fr-FR", {maximumFractionDigits: 0})} €
        </span>
      </div>
      {resultats.message && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 rounded shadow text-yellow-700 dark:text-yellow-300 mt-2 text-center">
          {resultats.message}
        </div>
      )}
    </div>
  );
};

export default RachatResultats;
