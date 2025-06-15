
import React from "react";

const SimulateurDeces: React.FC = () => (
  <div className="w-full max-w-2xl mx-auto bg-card rounded-xl shadow-xl p-8 animate-fade-in">
    <h2 className="text-2xl font-bold mb-2 text-primary">Simulation décès (en cours)</h2>
    <p className="mb-4 text-muted-foreground">
      Ici, vous pourrez simuler le montant transmis et la fiscalité applicable selon la clause bénéficiaire.
    </p>
    <ul className="mb-2 list-disc list-inside text-sm text-gray-600">
      <li>Nombre de bénéficiaires, âge, abattements…</li>
      <li>Détails calculés selon les articles fiscaux applicables.</li>
      <li>Sera bientôt disponible !</li>
    </ul>
    <span className="inline-block bg-accent text-accent-foreground px-4 py-2 rounded shadow mt-4">Contactez-nous pour être averti de sa mise en ligne</span>
  </div>
);

export default SimulateurDeces;
