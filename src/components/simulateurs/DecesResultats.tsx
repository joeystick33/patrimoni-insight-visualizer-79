import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { formatMontant, formatPourcentage } from "@/lib/utils";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

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
  isExonereTepa: boolean;
  tauxImposition: number;
}

interface DecesResultatsProps {
  resultats: {
    beneficiaires: ResultatBeneficiaire[];
    totalTransmis: number;
    totalImpots: number;
    totalNet: number;
    ratioApres70: number;
    base990I: number;
    base757B: number;
    optimisations: string[];
    alertes: string[];
  };
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

const DecesResultats: React.FC<DecesResultatsProps> = ({ resultats }) => {
  // Données pour le graphique en secteurs
  const pieData = resultats.beneficiaires.map((b, index) => ({
    name: b.nom,
    value: b.montantNet,
    color: COLORS[index % COLORS.length]
  }));

  const barData = resultats.beneficiaires.map(b => ({
    nom: b.nom.split(' ')[0],
    brut: b.montantBrut,
    impot: b.impotTotal,
    net: b.montantNet
  }));

  const chartConfig = {
    brut: {
      label: "Montant brut",
      color: "#8884d8"
    },
    impot: {
      label: "Impôts",
      color: "#ff7300"
    },
    net: {
      label: "Montant net",
      color: "#82ca9d"
    }
  };

  return (
    <div className="mt-8 space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-primary">🎯 Résultats de la simulation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{formatMontant(resultats.totalTransmis)}</div>
              <div className="text-sm text-blue-600">Montant total transmis</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{formatMontant(resultats.totalImpots)}</div>
              <div className="text-sm text-red-600">Total des impôts</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{formatMontant(resultats.totalNet)}</div>
              <div className="text-sm text-green-600">Montant net aux bénéficiaires</div>
            </div>
          </div>

          {/* Répartition proportionnelle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">{formatMontant(resultats.base990I)}</div>
              <div className="text-sm text-blue-600">Base 990 I (avant 70 ans)</div>
              <div className="text-xs text-gray-500">{formatPourcentage(100 - resultats.ratioApres70)} du capital</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-600">{formatMontant(resultats.base757B)}</div>
              <div className="text-sm text-purple-600">Base 757 B (après 70 ans)</div>
              <div className="text-xs text-gray-500">{formatPourcentage(resultats.ratioApres70)} du capital</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Répartition nette par bénéficiaire</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ value, percent }) => `${formatMontant(value)} (${(percent * 100).toFixed(1)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comparaison brut/net par bénéficiaire</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nom" />
                  <YAxis tickFormatter={(value) => formatMontant(value)} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="brut" fill="#8884d8" />
                  <Bar dataKey="net" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Détail par bénéficiaire */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Détail par bénéficiaire</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {resultats.beneficiaires.map((beneficiaire, index) => {
              const typeClause = (beneficiaire as any).typeClause;
              const pourcentageUsufruit = (beneficiaire as any).pourcentageUsufruit;
              const pourcentageNuePropriete = (beneficiaire as any).pourcentageNuePropriete;
              const usufruitier = (beneficiaire as any).usufruitier;
              const partUsufruit = (beneficiaire as any).partUsufruit;
              const partNuePropriete = (beneficiaire as any).partNuePropriete;

              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-semibold text-lg">{beneficiaire.nom} ({beneficiaire.lienParente})</h4>
                    {beneficiaire.isExonereTepa && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        ✅ Exonération Tepa
                      </span>
                    )}
                  </div>

                  {/* Affichage spécial pour les clauses démembrées */}
                  {(typeClause === "usufruit" || typeClause === "nue-propriete") && (
                    <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <h5 className="font-medium text-amber-800 mb-2">🔄 Démembrement de propriété</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-amber-700">Part d'usufruit : {formatPourcentage(pourcentageUsufruit || 0)}</div>
                          {usufruitier && (
                            <div className="text-xs text-amber-600">Usufruitier : {usufruitier}</div>
                          )}
                        </div>
                        <div>
                          <div className="text-amber-700">Part de nue-propriété : {formatPourcentage(pourcentageNuePropriete || 0)}</div>
                          <div className="text-xs text-amber-600">
                            {typeClause === "usufruit"
                              ? "Bénéficie de l'usufruit"
                              : "Bénéficie de la nue-propriété"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">💰 Répartition proportionnelle</h5>
                      <div className="text-sm space-y-1">
                        <div>Montant brut total: <span className="font-medium">{formatMontant(beneficiaire.montantBrut)}</span></div>
                        <div className="text-blue-600">• Base 990 I (avant 70): {formatMontant(beneficiaire.base990I)}</div>
                        <div className="text-purple-600">• Base 757 B (après 70): {formatMontant(beneficiaire.base757B)}</div>
                        {(partUsufruit || partNuePropriete) && (
                          <div className="text-amber-600 text-xs">
                            • Part effective: {formatPourcentage(
                              ((partUsufruit || partNuePropriete || 0) * 100) || 0
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">⚖️ Fiscalité détaillée</h5>
                      <div className="text-sm space-y-1">
                        {beneficiaire.isExonereTepa ? (
                          <div className="text-green-600 font-medium">Exonération totale (Loi Tepa)</div>
                        ) : (
                          <>
                            <div className="text-blue-600">
                              Régime 990 I: {formatMontant(beneficiaire.impotAvant70)}
                              <div className="text-xs">
                                Abattement {(partUsufruit || partNuePropriete) ? 'proportionnel' : 'standard'}: {formatMontant(beneficiaire.abattementAvant70)}
                              </div>
                            </div>
                            <div className="text-purple-600">
                              Régime 757 B: {formatMontant(beneficiaire.impotApres70)}
                              <div className="text-xs">
                                Abattement {(partUsufruit || partNuePropriete) ? 'proportionnel' : 'proratisé'}: {formatMontant(beneficiaire.abattementApres70)}
                              </div>
                            </div>
                          </>
                        )}
                        <div className="border-t pt-1 font-medium">
                          Total impôts: <span className="text-red-600">{formatMontant(beneficiaire.impotTotal)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-semibold text-green-700">
                      💵 Montant net transmis: {formatMontant(beneficiaire.montantNet)}
                    </div>
                    <div className="text-sm text-green-600">
                      Taux de prélèvement: {formatPourcentage(beneficiaire.tauxImposition)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Méthode proportionnelle expliquée */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-700">📐 Méthode de calcul appliquée</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2 text-blue-700">
            <p><strong>Répartition automatique :</strong> Le capital total est divisé proportionnellement selon le ratio des primes versées.</p>
            <p><strong>Base 990 I :</strong> {formatPourcentage(100 - resultats.ratioApres70)} du capital.</p>
            <p><strong>Base 757 B :</strong> {formatPourcentage(resultats.ratioApres70)} du capital.</p>
            <p><strong>Clauses démembrées :</strong> Abattements proportionnels aux parts d'usufruit/nue-propriété selon le barème fiscal.</p>
            <p><strong>Abattement 990 I :</strong> 152 500 € × part effective pour les clauses démembrées, 152 500 € par bénéficiaire sinon.</p>
            <p><strong>Abattement 757 B :</strong> 30 500 € global réparti proportionnellement aux parts reçues.</p>
            <p><strong>Conjoint/PACS :</strong> Exonération totale grâce à la loi Tepa (0% d'impôt).</p>
          </div>
        </CardContent>
      </Card>

      {/* Optimisations et alertes */}
      {(resultats.optimisations.length > 0 || resultats.alertes.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resultats.optimisations.length > 0 && (
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-700">💡 Conseils d'optimisation</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {resultats.optimisations.map((conseil, index) => (
                    <li key={index} className="text-sm text-green-700 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{conseil}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {resultats.alertes.length > 0 && (
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-700">⚠️ Points d'attention</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {resultats.alertes.map((alerte, index) => (
                    <li key={index} className="text-sm text-orange-700 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{alerte}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default DecesResultats;
