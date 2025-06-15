import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { formatPourcentage, formatMontant } from "@/lib/utils";
import { Button } from "../ui/button";

type Supports = "fonds_euros" | "uc" | "gsm";

const defaultParams = {
  duree: 15,
  versementInitial: 10000,
  versementMensuel: 300,
  support: "fonds_euros" as Supports,
  repartition: 70,
  rendementEuros: 2.2,
  rendementUC: 5,
  rendementGSM: 7,
  pctUC: 30,
  pctGSM: 0,
  fraisGestionEuros: 0.6,
  fraisGestionUC: 0.8,
  fraisGestionGSM: 1.9,
  fraisEntree: 2,
  fraisArbitrage: 0.5,
};

type Params = typeof defaultParams;

const SimulateurFrais = () => {
  const [params, setParams] = useState(defaultParams);
  const [showResults, setShowResults] = useState(false);

  const handleChange = (name: keyof Params, value: number | string) => {
    setParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const percentFormat = (value: number) => `${value} %`;
  const montantFormat = (value: number) => `${value.toFixed(0)} €`;

  function calcSimu(withFees: boolean) {
    let capital = params.versementInitial;
    let data = [];

    for (let mois = 1; mois <= params.duree * 12; mois++) {
      // 1. Calcul des rendements
      const rendementEurosMensuel = params.rendementEuros / 100 / 12;
      const rendementUCMensuel = params.rendementUC / 100 / 12;
      const rendementGSMMensuel = params.rendementGSM / 100 / 12;

      // 2. Calcul des frais
      const fraisGestionEurosMensuel = params.fraisGestionEuros / 100 / 12;
      const fraisGestionUCMensuel = params.fraisGestionUC / 100 / 12;
      const fraisGestionGSMMensuel = params.fraisGestionGSM / 100 / 12;

      // 3. Application des rendements et frais par support
      const interetsEuros = capital * (1 - params.pctUC / 100 - params.pctGSM / 100) * rendementEurosMensuel;
      const interetsUC = capital * (params.pctUC / 100) * rendementUCMensuel;
      const interetsGSM = capital * (params.pctGSM / 100) * rendementGSMMensuel;

      let fraisEuros = 0;
      let fraisUC = 0;
      let fraisGSM = 0;

      if (withFees) {
        fraisEuros = capital * (1 - params.pctUC / 100 - params.pctGSM / 100) * fraisGestionEurosMensuel;
        fraisUC = capital * (params.pctUC / 100) * fraisGestionUCMensuel;
        fraisGSM = capital * (params.pctGSM / 100) * fraisGestionGSMMensuel;
      }

      capital += interetsEuros + interetsUC + interetsGSM - fraisEuros - fraisUC - fraisGSM;

      // Versement mensuel
      capital += params.versementMensuel;

      data.push({ mois, capital });
    }

    return data;
  }

  const ready = params.versementInitial > 0 && params.duree > 0;

  // Gestion du submit (calcul)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
  };

  // Réinit
  const handleReset = () => {
    setParams(defaultParams);
    setShowResults(false);
  };

  const resultats = useMemo(() => {
    if (showResults) {
      const dataSansFrais = calcSimu(false);
      const dataAvecFrais = calcSimu(true);

      const capitalSansFrais = dataSansFrais[dataSansFrais.length - 1]?.capital || 0;
      const capitalAvecFrais = dataAvecFrais[dataAvecFrais.length - 1]?.capital || 0;
      const difference = capitalSansFrais - capitalAvecFrais;

      return {
        dataSansFrais,
        dataAvecFrais,
        capitalSansFrais,
        capitalAvecFrais,
        difference,
      };
    }
    return null;
  }, [params, showResults]);

  const chartData = useMemo(() => {
    if (resultats) {
      const dataSansFrais = resultats.dataSansFrais;
      const dataAvecFrais = resultats.dataAvecFrais;

      // Fusionner les deux tableaux en un seul pour le graphique
      const chartData = dataSansFrais.map((item, index) => ({
        mois: item.mois,
        "Sans Frais": item.capital,
        "Avec Frais": dataAvecFrais[index]?.capital || 0,
      }));
      return chartData;
    }
    return [];
  }, [resultats]);

  return (
    <div className="w-full max-w-3xl mx-auto bg-card rounded-xl shadow-xl p-8 animate-fade-in">
      <h2 className="text-2xl font-bold mb-2 text-primary">Impact des frais sur votre assurance vie</h2>
      <p className="text-muted-foreground mb-6 font-medium">
        Comparez le capital simulé avec et sans frais, visualisez l'érosion à long terme, personnalisez tous les paramètres selon votre contrat.
      </p>
      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        <div>
          <Label htmlFor="duree">Durée (années)</Label>
          <Input
            type="number"
            id="duree"
            min={1}
            max={40}
            value={params.duree}
            onChange={(e) => handleChange("duree", parseInt(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="versementInitial">Versement initial (€)</Label>
          <Input
            type="number"
            id="versementInitial"
            min={0}
            value={params.versementInitial}
            onChange={(e) =>
              handleChange("versementInitial", parseInt(e.target.value))
            }
          />
        </div>
        <div>
          <Label htmlFor="versementMensuel">Versement mensuel (€)</Label>
          <Input
            type="number"
            id="versementMensuel"
            min={0}
            value={params.versementMensuel}
            onChange={(e) =>
              handleChange("versementMensuel", parseInt(e.target.value))
            }
          />
        </div>

        <div>
          <Label htmlFor="rendementEuros">Rendement Fonds € (%)</Label>
          <Input
            type="number"
            id="rendementEuros"
            min={0}
            max={10}
            step={0.1}
            value={params.rendementEuros}
            onChange={(e) =>
              handleChange("rendementEuros", parseFloat(e.target.value))
            }
          />
        </div>
        <div>
          <Label htmlFor="rendementUC">Rendement UC (%)</Label>
          <Input
            type="number"
            id="rendementUC"
            min={0}
            max={20}
            step={0.1}
            value={params.rendementUC}
            onChange={(e) => handleChange("rendementUC", parseFloat(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="rendementGSM">Rendement GSM (%)</Label>
          <Input
            type="number"
            id="rendementGSM"
            min={0}
            max={20}
            step={0.1}
            value={params.rendementGSM}
            onChange={(e) => handleChange("rendementGSM", parseFloat(e.target.value))}
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="pctUC">Répartition UC (%)</Label>
          <Slider
            id="pctUC"
            defaultValue={[params.pctUC]}
            max={100}
            step={5}
            onValueChange={(value) => handleChange("pctUC", value[0])}
          />
          <p className="text-sm text-muted-foreground mt-1">
            {params.pctUC}% en Unités de Compte (UC)
          </p>
        </div>
        <div className="col-span-2">
          <Label htmlFor="pctGSM">Répartition GSM (%)</Label>
          <Slider
            id="pctGSM"
            defaultValue={[params.pctGSM]}
            max={100}
            step={5}
            onValueChange={(value) => handleChange("pctGSM", value[0])}
          />
          <p className="text-sm text-muted-foreground mt-1">
            {params.pctGSM}% en Gestion Sous Mandat (GSM)
          </p>
        </div>

        <Separator className="col-span-2" />

        <div>
          <Label htmlFor="fraisGestionEuros">Frais gestion € (%)</Label>
          <Input
            type="number"
            id="fraisGestionEuros"
            min={0}
            max={5}
            step={0.1}
            value={params.fraisGestionEuros}
            onChange={(e) =>
              handleChange("fraisGestionEuros", parseFloat(e.target.value))
            }
          />
        </div>
        <div>
          <Label htmlFor="fraisGestionUC">Frais gestion UC (%)</Label>
          <Input
            type="number"
            id="fraisGestionUC"
            min={0}
            max={5}
            step={0.1}
            value={params.fraisGestionUC}
            onChange={(e) =>
              handleChange("fraisGestionUC", parseFloat(e.target.value))
            }
          />
        </div>
        <div>
          <Label htmlFor="fraisGestionGSM">Frais gestion GSM (%)</Label>
          <Input
            type="number"
            id="fraisGestionGSM"
            min={0}
            max={5}
            step={0.1}
            value={params.fraisGestionGSM}
            onChange={(e) =>
              handleChange("fraisGestionGSM", parseFloat(e.target.value))
            }
          />
        </div>

        <div>
          <Label htmlFor="fraisEntree">Frais d'entrée (%)</Label>
          <Input
            type="number"
            id="fraisEntree"
            min={0}
            max={5}
            step={0.1}
            value={params.fraisEntree}
            onChange={(e) =>
              handleChange("fraisEntree", parseFloat(e.target.value))
            }
          />
        </div>
        <div>
          <Label htmlFor="fraisArbitrage">Frais d'arbitrage (%)</Label>
          <Input
            type="number"
            id="fraisArbitrage"
            min={0}
            max={5}
            step={0.1}
            value={params.fraisArbitrage}
            onChange={(e) =>
              handleChange("fraisArbitrage", parseFloat(e.target.value))
            }
          />
        </div>
        <div className="col-span-2 flex gap-4 mt-4">
          <Button
            type="submit"
            disabled={!ready}
            className=""
            variant="default"
          >
            Calculer
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleReset}
          >
            Réinitialiser
          </Button>
        </div>
      </form>
      {/* Aide, infos */}
      {showResults && ready && (
        <>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mois" />
                <YAxis tickFormatter={montantFormat} />
                <Tooltip formatter={(value: number) => [montantFormat(value), "Capital"]} />
                <Area
                  type="monotone"
                  dataKey="Sans Frais"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  name="Sans Frais"
                />
                <Area
                  type="monotone"
                  dataKey="Avec Frais"
                  stroke="#8884d8"
                  fill="#8884d8"
                  name="Avec Frais"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 p-4 rounded-md bg-muted">
            <h3 className="text-lg font-semibold mb-2">Résultats</h3>
            {resultats && (
              <>
                <p>
                  Capital final sans frais :{" "}
                  {formatMontant(resultats.capitalSansFrais)}
                </p>
                <p>
                  Capital final avec frais : {formatMontant(resultats.capitalAvecFrais)}
                </p>
                <p className="font-semibold text-primary">
                  Différence due aux frais : {formatMontant(resultats.difference)}
                </p>
              </>
            )}
          </div>

          <div className="mt-6 p-4 rounded-md bg-muted">
            <h3 className="text-lg font-semibold mb-2">Pédagogie</h3>
            <p>
              Les frais, bien que faibles en apparence, ont un impact significatif
              sur le long terme.
            </p>
            <p>
              Ce simulateur vous permet de visualiser l'érosion de votre capital due
              aux différents types de frais.
            </p>
          </div>
        </>
      )}
      {/* Info bas de page */}
    </div>
  );
};

export default SimulateurFrais;
