"use client"

import React from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { FicheDePaiePDF } from './FicheDePaiePDF'; // Assurez-vous que le composant PDF est bien importé

// Recopie des interfaces pour plus de clarté
interface Employe {
  id: number;
  nom: string;
  prenom: string;
}

interface Avantage {
  id: number;
  nomAvantages: string;
  montantAvantages: number;
}

interface Prime {
  id: number;
  nomPrime: string;
  montantPrime: number;
}

interface FicheDePaie {
  id: number;
  employe: Employe;
  mois: string;
  annee: number;
  avantages: Avantage[];
  primes: Prime[];
}

// Le composant Viewer qui sera affiché dans la modale
export const FicheDePaieViewer = ({ fiche }: { fiche: FicheDePaie }) => {
  // NOTE: Les données de l'entreprise et les détails de l'employé sont ici en "dur".
  // Idéalement, vous les récupéreriez avec la fiche de paie ou depuis une autre source.
  const entrepriseData = {
    nom: 'Mon Entreprise SAS',
    adresse: '123 Rue de la République',
    ville: '75001 Paris',
    siret: '123 456 789 00010',
    ape: '6201Z'
  };

  const employeDetailsData = {
    nom: fiche.employe.nom,
    prenom: fiche.employe.prenom,
    adresse: '45 Avenue du Peuple',
    ville: '75011 Paris',
    numSecu: '1 23 45 67 890 123 45',
    poste: 'Développeur',
    coefficient: 250
  };
  
  // On ne passe que les données nécessaires au composant PDF
  const ficheDataForPDF = {
    mois: fiche.mois,
    annee: fiche.annee,
    avantages: fiche.avantages,
    primes: fiche.primes,
  };

  return (
    <div style={{ flexGrow: 1, height: '100%', border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
      <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
        <FicheDePaiePDF
          fiche={ficheDataForPDF}
          employe={employeDetailsData}
          entreprise={entrepriseData}
          // Assurez-vous d'avoir un logo dans votre dossier /public
          logoUrl="/logo.png" 
        />
      </PDFViewer>
    </div>
  );
};