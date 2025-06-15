
import React from "react";

const SimulateurRachat: React.FC = () => (
  <div className="w-full max-w-2xl mx-auto bg-card rounded-xl shadow-xl p-8 animate-fade-in">
    <h2 className="text-2xl font-bold mb-2 text-primary">Simulateur de rachat (en cours)</h2>
    <p className="mb-4 text-muted-foreground">
      Cette rubrique permettra de simuler l’impact fiscal d’un rachat partiel ou total.
    </p>
    <ul className="mb-2 list-disc list-inside text-sm text-gray-600">
      <li>Choisissez montant, type de rachat, ancienneté…</li>
      <li>Visualisez la fiscalité (PFU, abattements IR), affichez graphiques et calculs détaillés.</li>
      <li>Sera bientôt disponible !</li>
    </ul>
    <span className="inline-block bg-accent text-accent-foreground px-4 py-2 rounded shadow mt-4">Contactez-nous pour être averti de sa mise en ligne</span>
  </div>
);

export default SimulateurRachat;
