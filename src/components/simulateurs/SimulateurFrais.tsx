import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
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
  fraisGestionAssureur: 0.6,
  fraisGestionUC: 0.8,
  fraisGestionGSM: 1.9,
  fraisSurVersement: 2,
  fraisArbitrage: 0.5,
  nbArbitragesParAn: 1,
};

type Params = typeof defaultParams;

const SimulateurFrais = () => {
  const [params, setParams] = useState(defaultParams);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string>("");

  const handleChange = (name: keyof Params, value: number | string) => {
    setParams((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (params.pctUC + params.pctGSM > 100) {
      setError("La répartition UC + GSM ne peut pas dépasser 100%");
      return;
    }
    
    if (params.versementInitial < 0 || params.versementMensuel < 0 || params.duree <= 0) {
      setError("Les montants et la durée doivent être positifs");
      return;
    }
    
    setShowResults(true);
  };

  const handleReset = () => {
    setParams(defaultParams);
    setShowResults(false);
    setError("");
  };

  // Calcul avec distinction frais assureur vs gérants de fonds
  function calcSimu(withFees: boolean) {
    let capitalEuros = 0;
    let capitalUC = 0;
    let capitalGSM = 0;
    let data = [];
    let totalFraisSurVersement = 0;
    let totalFraisAssureur = 0;
    let totalFraisGerants = 0;
    let totalFraisArbitrage = 0;

    // Répartition du versement initial par support
    const pctEuros = (100 - params.pctUC - params.pctGSM) / 100;
    const pctUC = params.pctUC / 100;
    const pctGSM = params.pctGSM / 100;

    let versementInitialNet = params.versementInitial;
    
    // Frais sur versement initial
    if (withFees) {
      const fraisSurVersementInitial = params.versementInitial * (params.fraisSurVersement / 100);
      versementInitialNet -= fraisSurVersementInitial;
      totalFraisSurVersement += fraisSurVersementInitial;
    }

    // Répartition initiale
    capitalEuros = versementInitialNet * pctEuros;
    capitalUC = versementInitialNet * pctUC;
    capitalGSM = versementInitialNet * pctGSM;

    for (let mois = 1; mois <= params.duree * 12; mois++) {
      // Calcul des rendements mensuels par support
      const rendementEurosMensuel = params.rendementEuros / 100 / 12;
      const rendementUCMensuel = params.rendementUC / 100 / 12;
      const rendementGSMMensuel = params.rendementGSM / 100 / 12;

      // Application des rendements sur chaque support
      const interetsEuros = capitalEuros * rendementEurosMensuel;
      const interetsUC = capitalUC * rendementUCMensuel;
      const interetsGSM = capitalGSM * rendementGSMMensuel;

      capitalEuros += interetsEuros;
      capitalUC += interetsUC;
      capitalGSM += interetsGSM;

      // Calcul des frais de gestion
      if (withFees) {
        // FRAIS ASSUREUR : sur l'intégralité du contrat
        const capitalTotal = capitalEuros + capitalUC + capitalGSM;
        const fraisAssureurMensuel = capitalTotal * (params.fraisGestionAssureur / 100 / 12);
        
        // Répartition proportionnelle des frais assureur sur chaque support
        const fraisAssureurEuros = fraisAssureurMensuel * (capitalEuros / capitalTotal || 0);
        const fraisAssureurUC = fraisAssureurMensuel * (capitalUC / capitalTotal || 0);
        const fraisAssureurGSM = fraisAssureurMensuel * (capitalGSM / capitalTotal || 0);
        
        capitalEuros -= fraisAssureurEuros;
        capitalUC -= fraisAssureurUC;
        capitalGSM -= fraisAssureurGSM;
        
        totalFraisAssureur += fraisAssureurMensuel;

        // FRAIS GÉRANTS : sur l'encours spécifique de chaque support
        const fraisGerantUC = capitalUC * (params.fraisGestionUC / 100 / 12);
        const fraisGerantGSM = capitalGSM * (params.fraisGestionGSM / 100 / 12);
        
        capitalUC -= fraisGerantUC;
        capitalGSM -= fraisGerantGSM;
        
        const fraisGerantsMensuel = fraisGerantUC + fraisGerantGSM;
        totalFraisGerants += fraisGerantsMensuel;

        // Frais d'arbitrage (calculés sur le capital total une fois par an)
        if (mois % 12 === 0 && params.nbArbitragesParAn > 0) {
          const capitalTotalApresGestion = capitalEuros + capitalUC + capitalGSM;
          const fraisArbitrageMensuel = capitalTotalApresGestion * (params.fraisArbitrage / 100) * params.nbArbitragesParAn;
          
          // Répartition proportionnelle des frais d'arbitrage
          const fraisArbitrageEuros = fraisArbitrageMensuel * (capitalEuros / capitalTotalApresGestion || 0);
          const fraisArbitrageUC = fraisArbitrageMensuel * (capitalUC / capitalTotalApresGestion || 0);
          const fraisArbitrageGSM = fraisArbitrageMensuel * (capitalGSM / capitalTotalApresGestion || 0);
          
          capitalEuros -= fraisArbitrageEuros;
          capitalUC -= fraisArbitrageUC;
          capitalGSM -= fraisArbitrageGSM;
          
          totalFraisArbitrage += fraisArbitrageMensuel;
        }
      }

      // Versement mensuel
      if (params.versementMensuel > 0) {
        let versementMensuelNet = params.versementMensuel;
        
        // Frais sur versements mensuels
        if (withFees) {
          const fraisSurVersementMensuel = versementMensuelNet * (params.fraisSurVersement / 100);
          versementMensuelNet -= fraisSurVersementMensuel;
          totalFraisSurVersement += fraisSurVersementMensuel;
        }
        
        // Répartition du versement mensuel selon l'allocation
        capitalEuros += versementMensuelNet * pctEuros;
        capitalUC += versementMensuelNet * pctUC;
        capitalGSM += versementMensuelNet * pctGSM;
      }

      const capitalTotal = capitalEuros + capitalUC + capitalGSM;
      
      data.push({ 
        mois, 
        capital: capitalTotal,
        capitalEuros,
        capitalUC,
        capitalGSM,
        totalFraisSurVersement: withFees ? totalFraisSurVersement : 0,
        totalFraisAssureur: withFees ? totalFraisAssureur : 0,
        totalFraisGerants: withFees ? totalFraisGerants : 0,
        totalFraisArbitrage: withFees ? totalFraisArbitrage : 0
      });
    }

    return {
      data,
      totalFraisSurVersement,
      totalFraisAssureur,
      totalFraisGerants,
      totalFraisArbitrage,
      totalFrais: totalFraisSurVersement + totalFraisAssureur + totalFraisGerants + totalFraisArbitrage
    };
  }

  const ready = params.versementInitial >= 0 && params.duree > 0;

  const resultats = useMemo(() => {
    if (showResults && ready && !error) {
      const sansFrais = calcSimu(false);
      const avecFrais = calcSimu(true);

      const capitalSansFrais = sansFrais.data[sansFrais.data.length - 1]?.capital || 0;
      const capitalAvecFrais = avecFrais.data[avecFrais.data.length - 1]?.capital || 0;
      const difference = capitalSansFrais - capitalAvecFrais;
      const totalVersements = params.versementInitial + (params.versementMensuel * params.duree * 12);
      const rendementSansFrais = capitalSansFrais - totalVersements;
      const rendementAvecFrais = capitalAvecFrais - totalVersements;
      const impactSurRendement = rendementSansFrais > 0 ? (difference / rendementSansFrais) * 100 : 0;

      return {
        dataSansFrais: sansFrais.data,
        dataAvecFrais: avecFrais.data,
        capitalSansFrais,
        capitalAvecFrais,
        difference,
        totalVersements,
        rendementSansFrais,
        rendementAvecFrais,
        impactSurRendement,
        totalFraisSurVersement: avecFrais.totalFraisSurVersement,
        totalFraisAssureur: avecFrais.totalFraisAssureur,
        totalFraisGerants: avecFrais.totalFraisGerants,
        totalFraisArbitrage: avecFrais.totalFraisArbitrage,
        totalFrais: avecFrais.totalFrais
      };
    }
    return null;
  }, [params, showResults, ready, error]);

  const chartData = useMemo(() => {
    if (resultats) {
      return resultats.dataSansFrais.map((item, index) => ({
        mois: item.mois,
        "Sans Frais": item.capital,
        "Avec Frais": resultats.dataAvecFrais[index]?.capital || 0,
      }));
    }
    return [];
  }, [resultats]);

  // Données pour le graphique des frais avec distinction assureur/gérants
  const fraisData = resultats ? [
    { name: "Frais sur versements", value: resultats.totalFraisSurVersement },
    { name: "Frais assureur (contrat)", value: resultats.totalFraisAssureur },
    { name: "Frais gérants UC/GSM", value: resultats.totalFraisGerants },
    { name: "Frais d'arbitrage", value: resultats.totalFraisArbitrage },
  ].filter(item => item.value > 0) : [];

  return (
    <div className="w-full max-w-4xl mx-auto bg-card rounded-xl shadow-xl p-8 animate-fade-in">
      <h2 className="text-2xl font-bold mb-2 text-primary">💰 Impact des frais sur votre assurance vie</h2>
      <p className="text-muted-foreground mb-6 font-medium">
        Analysez l'impact réel des frais sur votre épargne et optimisez votre allocation d'actifs selon votre profil de risque.
      </p>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          ⚠️ {error}
        </div>
      )}
      
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6" autoComplete="off" onSubmit={handleSubmit}>
        {/* Paramètres de base */}
        <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-4">📊 Paramètres du contrat</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                onChange={(e) => handleChange("versementInitial", parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="versementMensuel">Versement mensuel (€)</Label>
              <Input
                type="number"
                id="versementMensuel"
                min={0}
                value={params.versementMensuel}
                onChange={(e) => handleChange("versementMensuel", parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Rendements */}
        <div className="col-span-2 bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-4">📈 Hypothèses de rendement</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="rendementEuros">Fonds € (%/an)</Label>
              <Input
                type="number"
                id="rendementEuros"
                min={0}
                max={10}
                step={0.1}
                value={params.rendementEuros}
                onChange={(e) => handleChange("rendementEuros", parseFloat(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="rendementUC">UC (%/an)</Label>
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
              <Label htmlFor="rendementGSM">GSM (%/an)</Label>
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
          </div>
        </div>

        {/* Allocation */}
        <div className="col-span-2 bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-4">🎯 Allocation d'actifs</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="pctUC">Unités de Compte (UC) : {params.pctUC}%</Label>
              <Slider
                id="pctUC"
                value={[params.pctUC]}
                max={100}
                step={5}
                onValueChange={(value) => handleChange("pctUC", value[0])}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="pctGSM">Gestion Sous Mandat (GSM) : {params.pctGSM}%</Label>
              <Slider
                id="pctGSM"
                value={[params.pctGSM]}
                max={100}
                step={5}
                onValueChange={(value) => handleChange("pctGSM", value[0])}
                className="mt-2"
              />
            </div>
            <div className="text-sm text-gray-600">
              Fonds € : {100 - params.pctUC - params.pctGSM}%
            </div>
          </div>
        </div>

        <Separator className="col-span-2" />

        {/* Structure de frais mise à jour */}
        <div className="col-span-2 bg-orange-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-4">💸 Structure de frais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fraisGestionAssureur">Frais assureur - contrat total (%/an)</Label>
              <Input
                type="number"
                id="fraisGestionAssureur"
                min={0}
                max={5}
                step={0.1}
                value={params.fraisGestionAssureur}
                onChange={(e) => handleChange("fraisGestionAssureur", parseFloat(e.target.value))}
              />
              <p className="text-xs text-gray-500 mt-1">Appliqués sur l'intégralité du contrat</p>
            </div>
            <div>
              <Label htmlFor="fraisGestionUC">Frais gérant UC (%/an)</Label>
              <Input
                type="number"
                id="fraisGestionUC"
                min={0}
                max={5}
                step={0.1}
                value={params.fraisGestionUC}
                onChange={(e) => handleChange("fraisGestionUC", parseFloat(e.target.value))}
              />
              <p className="text-xs text-gray-500 mt-1">Appliqués sur l'encours UC uniquement</p>
            </div>
            <div>
              <Label htmlFor="fraisGestionGSM">Frais gérant GSM (%/an)</Label>
              <Input
                type="number"
                id="fraisGestionGSM"
                min={0}
                max={5}
                step={0.1}
                value={params.fraisGestionGSM}
                onChange={(e) => handleChange("fraisGestionGSM", parseFloat(e.target.value))}
              />
              <p className="text-xs text-gray-500 mt-1">Appliqués sur l'encours GSM uniquement</p>
            </div>
            <div>
              <Label htmlFor="fraisSurVersement">Frais sur versements (%)</Label>
              <Input
                type="number"
                id="fraisSurVersement"
                min={0}
                max={5}
                step={0.1}
                value={params.fraisSurVersement}
                onChange={(e) => handleChange("fraisSurVersement", parseFloat(e.target.value))}
              />
              <p className="text-xs text-gray-500 mt-1">Appliqués sur chaque versement (initial et mensuels)</p>
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
                onChange={(e) => handleChange("fraisArbitrage", parseFloat(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="nbArbitragesParAn">Nb arbitrages/an</Label>
              <Input
                type="number"
                id="nbArbitragesParAn"
                min={0}
                max={12}
                step={1}
                value={params.nbArbitragesParAn}
                onChange={(e) => handleChange("nbArbitragesParAn", parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="col-span-2 flex gap-4 mt-4">
          <Button type="submit" disabled={!ready} variant="default">
            🧮 Calculer l'impact
          </Button>
          <Button type="button" variant="secondary" onClick={handleReset}>
            🔄 Réinitialiser
          </Button>
        </div>
      </form>

      {showResults && ready && resultats && !error && (
        <div className="space-y-8">
          {/* Résumé */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-200">
              <div className="text-xl font-bold text-blue-600">{formatMontant(resultats.totalVersements)}</div>
              <div className="text-sm text-blue-600">Total versé</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
              <div className="text-xl font-bold text-green-600">{formatMontant(resultats.capitalSansFrais)}</div>
              <div className="text-sm text-green-600">Capital sans frais</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center border border-orange-200">
              <div className="text-xl font-bold text-orange-600">{formatMontant(resultats.capitalAvecFrais)}</div>
              <div className="text-sm text-orange-600">Capital avec frais</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center border border-red-200">
              <div className="text-xl font-bold text-red-600">{formatMontant(resultats.difference)}</div>
              <div className="text-sm text-red-600">Coût des frais</div>
            </div>
          </div>

          {/* Graphique principal */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-lg mb-4 text-center">Évolution du capital dans le temps</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mois" tickFormatter={(mois) => `${Math.floor(mois/12)}a`} />
                  <YAxis tickFormatter={(value) => formatMontant(value)} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [formatMontant(value), name]}
                    labelFormatter={(mois) => `Mois ${mois} (${Math.floor(Number(mois)/12)} ans ${Number(mois)%12} mois)`}
                  />
                  <Area type="monotone" dataKey="Sans Frais" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="Avec Frais" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Détail des frais mis à jour */}
          {fraisData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-lg mb-4">Répartition des frais</h3>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={fraisData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => formatMontant(value)} />
                      <Tooltip formatter={(value: number) => formatMontant(value)} />
                      <Bar dataKey="value" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h4 className="font-semibold mb-2">💡 Analyse de l'impact</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Impact sur le rendement :</span> 
                      <span className="text-red-600 ml-2">{formatPourcentage(resultats.impactSurRendement)}</span>
                    </div>
                    <div>
                      <span className="font-medium">Rendement net annuel :</span>
                      <span className="ml-2">{formatPourcentage((Math.pow(resultats.capitalAvecFrais / resultats.totalVersements, 1 / params.duree) - 1) * 100)}</span>
                    </div>
                    <div>
                      <span className="font-medium">Total des frais :</span>
                      <span className="text-red-600 ml-2">{formatMontant(resultats.totalFrais)}</span>
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>• Frais assureur : {formatMontant(resultats.totalFraisAssureur)}</div>
                        <div>• Frais gérants : {formatMontant(resultats.totalFraisGerants)}</div>
                        <div>• Frais versements : {formatMontant(resultats.totalFraisSurVersement)}</div>
                        {resultats.totalFraisArbitrage > 0 && (
                          <div>• Frais arbitrage : {formatMontant(resultats.totalFraisArbitrage)}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                  <h4 className="font-semibold text-blue-800 mb-2">🎯 Conseils d'optimisation</h4>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Négociez les frais sur versements, souvent évitables</li>
                    <li>• Limitez les arbitrages fréquents</li>
                    <li>• Comparez les frais assureur entre contrats</li>
                    <li>• Attention aux frais cumulés assureur + gérants</li>
                    <li>• Considérez l'allocation UC/€ selon votre horizon</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SimulateurFrais;
