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

  // Données pour le graphique en barres
  const barData = resultats.beneficiaires.map(b => ({
    nom: b.nom.split(' ')[0], // Premier prénom seulement
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
            {resultats.beneficiaires.map((beneficiaire, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-semibold text-lg">{beneficiaire.nom} ({beneficiaire.lienParente})</h4>
                  {beneficiaire.isExonereTepa && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      ✅ Exonération Tepa
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium mb-2">💰 Montants reçus</h5>
                    <div className="text-sm space-y-1">
                      <div>Montant brut total: <span className="font-medium">{formatMontant(beneficiaire.montantBrut)}</span></div>
                      <div>• Part primes/produits avant 70 ans: {formatMontant(beneficiaire.partAvant70)}</div>
                      <div>• Part primes/produits après 70 ans: {formatMontant(beneficiaire.partApres70)}</div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">⚖️ Fiscalité</h5>
                    <div className="text-sm space-y-1">
                      <div>Abattement art. 990 I: {formatMontant(beneficiaire.abattementAvant70)}</div>
                      <div>Abattement art. 757 B: {formatMontant(beneficiaire.abattementApres70)}</div>
                      {beneficiaire.isExonereTepa ? (
                        <div className="text-green-600 font-medium">Exonération totale (Loi Tepa)</div>
                      ) : (
                        <>
                          <div>Impôt art. 990 I: <span className="text-red-600">{formatMontant(beneficiaire.impotAvant70)}</span></div>
                          <div>Impôt art. 757 B: <span className="text-red-600">{formatMontant(beneficiaire.impotApres70)}</span></div>
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
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Informations fiscales importantes */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-700">ℹ️ Rappels fiscaux</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2 text-blue-700">
            <p><strong>Loi Tepa :</strong> Exonération totale des droits de succession pour les conjoints mariés et partenaires PACS.</p>
            <p><strong>Article 990 I :</strong> Abattement de 152 500 € par bénéficiaire sur les primes avant 70 ans + produits.</p>
            <p><strong>Article 757 B :</strong> Abattement global de 30 500 € (tous bénéficiaires confondus) sur les primes après 70 ans uniquement.</p>
            <p><strong>Réintégration fiscale :</strong> Les primes après 70 ans (dépassant l'abattement 757B) sont réintégrées dans la succession avec les abattements de droit commun.</p>
            <p><strong>Concubins :</strong> Aucune exonération, taux maximal de 60% et abattement minimal de 1 594 €.</p>
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
