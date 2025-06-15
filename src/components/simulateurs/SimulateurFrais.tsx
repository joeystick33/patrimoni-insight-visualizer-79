import React, { useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Area, AreaChart } from "recharts";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Supports = "fonds_euros" | "uc" | "gsm";
const supports = [
  { id: "fonds_euros", label: "Fonds euros" },
  { id: "uc", label: "Unités de compte (UC)" },
  { id: "gsm", label: "Gestion profilée (GSM)" },
];

const defaultParams = {
  duree: 15,
  versementInitial: 10000,
  versementMensuel: 300,
  support: "fonds_euros" as Supports,
  repartition: 70,
  rendementEuros: 2.2,
  rendementUC: 5.0,
  rendementGSM: 4.0,
  fraisEntree: 1.5,
  fraisGestionContrat: 0.7,
  fraisGestionUC: 0.85,
  fraisGestionGSM: 1.00,
};

function currencyFormat(val: number) {
  return val.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}

function percentFormat(val: number) {
  return `${val.toFixed(2)} %`;
}

const SimulateurFrais = () => {
  const [params, setParams] = useState(defaultParams);

  // Calculer la répartition
  const otherPct = 100 - params.repartition;

  // Calculs du simulateur
  function simulation(withFees: boolean) {
    let capital = params.versementInitial;
    const data: { annee: number; capital: number }[] = [
      { annee: 0, capital }
    ];

    // Récupère taux par support
    const tauxEuros = withFees
      ? params.rendementEuros - params.fraisGestionContrat
      : params.rendementEuros;
    const tauxUC = withFees
      ? params.rendementUC - (params.fraisGestionContrat + params.fraisGestionUC)
      : params.rendementUC;
    const tauxGSM = withFees
      ? params.rendementGSM - (params.fraisGestionContrat + params.fraisGestionGSM)
      : params.rendementGSM;

    let pctEuros = 0,
      pctUC = 0,
      pctGSM = 0;
    if (params.support === "fonds_euros") {
      pctEuros = 1;
    } else if (params.support === "uc") {
      pctEuros = params.repartition / 100;
      pctUC = otherPct / 100;
    } else if (params.support === "gsm") {
      pctEuros = params.repartition / 100;
      pctGSM = otherPct / 100;
    }

    // Versement initial avec frais d'entrée
    let capitalCurrent = params.versementInitial * (1 - (withFees ? params.fraisEntree / 100 : 0));

    // Taux de rendement mensuel composite
    const tauxMensuelComposite = (pctEuros * tauxEuros + pctUC * tauxUC + pctGSM * tauxGSM) / 100 / 12;
    
    // Versement mensuel net après frais d'entrée
    const versementMensuelNet = params.versementMensuel * (1 - (withFees ? params.fraisEntree / 100 : 0));

    for (let i = 1; i <= params.duree; i++) {
      // Application des intérêts mensuels et ajout des versements mensuels
      for (let mois = 0; mois < 12; mois++) {
        capitalCurrent = capitalCurrent * (1 + tauxMensuelComposite) + versementMensuelNet;
      }
      
      data.push({
        annee: i,
        capital: capitalCurrent,
      });
    }
    return data;
  }

  const dataAvecFrais = simulation(true);
  const dataSansFrais = simulation(false);

  const capitalNetAvecFrais = dataAvecFrais[dataAvecFrais.length - 1].capital;
  const capitalNetSansFrais = dataSansFrais[dataSansFrais.length - 1].capital;
  const impactFrais = capitalNetSansFrais - capitalNetAvecFrais;

  return (
    <div className="w-full max-w-3xl mx-auto bg-card rounded-xl shadow-xl p-8 animate-fade-in">
      <h2 className="text-2xl font-bold mb-2 text-primary">Impact des frais sur votre assurance vie</h2>
      <p className="text-muted-foreground mb-6 font-medium">
        Comparez le capital simulé avec et sans frais, visualisez l'érosion à long terme, personnalisez tous les paramètres selon votre contrat.
      </p>
      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
        onSubmit={e => e.preventDefault()}
      >
        <div className="space-y-4">
          <label className="font-semibold block">
            Durée (années)
            <input
              type="range"
              min={5}
              max={40}
              step={1}
              value={params.duree}
              onChange={e => setParams(p => ({ ...p, duree: parseInt(e.target.value, 10) }))}
              className="w-full accent-primary"
            />
            <span className="font-mono ml-2">{params.duree} ans</span>
          </label>
          <label className="font-semibold block">
            Versement initial (€)
            <Input
              type="number"
              min={0}
              step={500}
              value={params.versementInitial}
              onChange={e => setParams(p => ({ ...p, versementInitial: Number(e.target.value) }))}
              className="w-full"
            />
          </label>
          <label className="font-semibold block">
            Versement mensuel (€)
            <Input
              type="number"
              min={0}
              step={50}
              value={params.versementMensuel}
              onChange={e => setParams(p => ({ ...p, versementMensuel: Number(e.target.value) }))}
              className="w-full"
            />
          </label>
          <label className="font-semibold block">
            Support / Gestion
            <select
              value={params.support}
              onChange={e => setParams(p => ({ ...p, support: e.target.value as Supports }))}
              className="w-full px-4 py-2 rounded border mt-1"
            >
              {supports.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </label>
          {(params.support === "uc" || params.support === "gsm") && (
            <label className="font-semibold block">
              Répartition Fonds € / {params.support === "uc" ? "UC" : "GSM"} (%)
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={params.repartition}
                  onChange={e => setParams(p => ({ ...p, repartition: Number(e.target.value) }))}
                  className="w-full accent-primary"
                />
                <span className="ml-2">
                  {params.repartition}% / {100 - params.repartition}%
                </span>
              </div>
            </label>
          )}
        </div>
        <div className="space-y-4">
          <label className="font-semibold block">
            Taux de rendement Fonds € (%/an)
            <Input
              type="number"
              min={0}
              max={8}
              step={0.1}
              value={params.rendementEuros}
              onChange={e => setParams(p => ({ ...p, rendementEuros: Number(e.target.value) }))}
              className="w-full"
            />
          </label>
          {(params.support === "uc" || params.support === "fonds_euros") && (
            <label className="font-semibold block">
              Taux de rendement UC (%/an)
              <Input
                type="number"
                min={0}
                max={15}
                step={0.1}
                value={params.rendementUC}
                onChange={e => setParams(p => ({ ...p, rendementUC: Number(e.target.value) }))}
                className="w-full"
                disabled={params.support === "fonds_euros"}
              />
            </label>
          )}
          {params.support === "gsm" && (
            <label className="font-semibold block">
              Taux GSM (%/an)
              <Input
                type="number"
                min={0}
                max={10}
                step={0.1}
                value={params.rendementGSM}
                onChange={e => setParams(p => ({ ...p, rendementGSM: Number(e.target.value) }))}
                className="w-full"
              />
            </label>
          )}
          <label className="font-semibold block">
            Frais d'entrée (% sur chaque versement)
            <Input
              type="number"
              min={0}
              max={10}
              step={0.05}
              value={params.fraisEntree}
              onChange={e => setParams(p => ({ ...p, fraisEntree: Number(e.target.value) }))}
              className="w-full"
            />
          </label>
          <label className="font-semibold block">
            Frais de gestion du contrat (%/an)
            <Input
              type="number"
              min={0}
              max={2}
              step={0.01}
              value={params.fraisGestionContrat}
              onChange={e => setParams(p => ({ ...p, fraisGestionContrat: Number(e.target.value) }))}
              className="w-full"
            />
          </label>
          {(params.support === "uc") && (
            <label className="font-semibold block">
              Frais de gestion sur UC (%/an)
              <Input
                type="number"
                min={0}
                max={2}
                step={0.01}
                value={params.fraisGestionUC}
                onChange={e => setParams(p => ({ ...p, fraisGestionUC: Number(e.target.value) }))}
                className="w-full"
              />
            </label>
          )}
          {(params.support === "gsm") && (
            <label className="font-semibold block">
              Frais de gestion GSM (%/an)
              <Input
                type="number"
                min={0}
                max={2}
                step={0.01}
                value={params.fraisGestionGSM}
                onChange={e => setParams(p => ({ ...p, fraisGestionGSM: Number(e.target.value) }))}
                className="w-full"
              />
            </label>
          )}
        </div>
      </form>

      <div className="mb-6 flex flex-wrap justify-between items-center gap-6 bg-muted/70 rounded-xl px-6 py-4">
        <div>
          <span className="block text-muted-foreground text-xs mb-1">Capital net simulé avec frais</span>
          <span className="text-xl font-semibold text-primary">{currencyFormat(capitalNetAvecFrais)}</span>
        </div>
        <div>
          <span className="block text-muted-foreground text-xs mb-1">Capital net simulé sans frais</span>
          <span className="text-xl font-semibold">{currencyFormat(capitalNetSansFrais)}</span>
        </div>
        <div>
          <span className="block text-muted-foreground text-xs mb-1">Impact cumulé des frais</span>
          <span className="text-xl font-semibold text-destructive">{currencyFormat(impactFrais)}</span>
        </div>
      </div>
      <div className="bg-background p-4 rounded-xl shadow-md">
        <h3 className="font-bold text-lg mb-2">Projection sur durée totale</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={dataAvecFrais.map((row, i) => ({
            annee: row.annee,
            "Avec frais": row.capital,
            "Sans frais": dataSansFrais[i]?.capital ?? row.capital
          }))}>
            <defs>
              <linearGradient id="colorFrais" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorSansFrais" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#75e4cb" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#75e4cb" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="annee" tickFormatter={v => `${v} ans`}/>
            <YAxis tickFormatter={currencyFormat}/>
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip formatter={(val: number) => currencyFormat(val)} />
            <Legend />
            <Area type="monotone" dataKey="Avec frais" stroke="#2563eb" fill="url(#colorFrais)" />
            <Area type="monotone" dataKey="Sans frais" stroke="#75e4cb" fill="url(#colorSansFrais)" />
          </AreaChart>
        </ResponsiveContainer>
        <span className="block text-xs text-muted-foreground mt-2">Évolution du capital brut et net, dans le temps</span>
      </div>
      <div className="mt-6 text-sm text-muted-foreground">
        <span className="">
          <strong>NB :</strong> Les performances passées ne préjugent pas des performances futures. Le simulateur est un outil pédagogique, non un conseil en investissement.
        </span>
      </div>
    </div>
  );
};

export default SimulateurFrais;
