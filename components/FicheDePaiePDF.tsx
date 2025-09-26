"use client"

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Définition des types pour les props du composant
interface EmployeDetails {
  nom: string;
  prenom: string;
  adresse: string;
  ville: string;
  numSecu: string;
  poste: string;
  coefficient: number;
}

interface EntrepriseDetails {
  nom: string;
  adresse: string;
  ville: string;
  siret: string;
  ape: string;
}

interface FicheDePaieData {
  mois: string; // ex: "2025-05-01T00:00:00.000Z"
  annee: number;
  avantages: { nomAvantages: string; montantAvantages: number }[];
  primes: { nomPrime: string; montantPrime: number }[];
}

interface FicheDePaiePDFProps {
  fiche: FicheDePaieData;
  employe: EmployeDetails;
  entreprise: EntrepriseDetails;
  logoUrl?: string;
}


// Création des styles pour le document PDF
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    padding: 30,
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 70,
    height: 70,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#4A90E2',
  },
  section: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottom: '1px solid #EAEAEA',
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    backgroundColor: '#F2F2F2',
    padding: 5,
    marginBottom: 5,
  },
  flexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flexCol: {
    flexDirection: 'column',
  },
  infoBlock: {
    flex: 1,
    paddingRight: 10,
  },
  infoText: {
    marginBottom: 2,
  },
  infoLabel: {
    fontFamily: 'Helvetica-Bold',
  },
  table: {
    display: "flex",
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomColor: '#EAEAEA',
    borderBottomWidth: 1,
    alignItems: 'center',
    minHeight: 18,
  },
  tableHeader: {
    backgroundColor: '#F2F2F2',
    fontFamily: 'Helvetica-Bold',
  },
  tableCol: {
    width: '25%',
    padding: 4,
  },
  tableColLabel: {
    width: '40%',
    padding: 4,
  },
  textRight: {
    textAlign: 'right',
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 5,
    borderTop: '1px solid #333',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: 'grey',
    fontSize: 8,
  }
});

// Le composant qui génère le PDF
export const FicheDePaiePDF: React.FC<FicheDePaiePDFProps> = ({ fiche, employe, entreprise, logoUrl }) => {
  const periode = `${format(new Date(fiche.mois), "MMMM yyyy", { locale: fr })}`;
  
  // Données de remplissage basées sur l'image
  const salaireBase = 3000.00;
  const totalCotisationsSalariales = 687.28;
  const salaireBrut = salaireBase; // Simplification
  const netAPayer = salaireBrut - totalCotisationsSalariales;

  const cotisations = [
      { libelle: 'CSG non déductible', base: 2910.03, tauxSalarial: 2.40, montantSalarial: 69.84 },
      { libelle: 'CRDS', base: 2910.03, tauxSalarial: 0.50, montantSalarial: 14.55 },
      { libelle: 'Sécurité sociale', base: 3000.03, tauxSalarial: 0.75, montantSalarial: 22.50, tauxPatronal: 12.80, montantPatronal: 384.00 },
      { libelle: 'Assurance vieillesse', base: 3000.03, tauxSalarial: 6.55, montantSalarial: 196.50, tauxPatronal: 8.55, montantPatronal: 256.50 },
      // ... Ajoutez les autres lignes de cotisation ici pour un modèle complet
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* EN-TÊTE */}
        <View style={styles.header}>
          <Text style={styles.title}>Bulletin de paie</Text>
          {logoUrl && <Image style={styles.logo} src={logoUrl} />}
        </View>

        {/* INFORMATIONS GÉNÉRALES */}
        <View style={[styles.section, styles.flexRow]}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Employeur</Text>
            <Text style={styles.infoText}>{entreprise.nom}</Text>
            <Text style={styles.infoText}>{entreprise.adresse}</Text>
            <Text style={styles.infoText}>{entreprise.ville}</Text>
            <Text style={styles.infoText}>SIRET : {entreprise.siret}</Text>
            <Text style={styles.infoText}>APE : {entreprise.ape}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Salarié</Text>
            <Text style={styles.infoText}>{`${employe.prenom} ${employe.nom}`}</Text>
            <Text style={styles.infoText}>{employe.adresse}</Text>
            <Text style={styles.infoText}>{employe.ville}</Text>
            <Text style={styles.infoText}>N° SS : {employe.numSecu}</Text>
            <Text style={styles.infoText}>Emploi : {employe.poste}</Text>
          </View>
          <View style={styles.infoBlock}>
             <Text style={styles.infoLabel}>Période</Text>
             <Text style={styles.infoText}>{periode.charAt(0).toUpperCase() + periode.slice(1)}</Text>
          </View>
        </View>

        {/* SALAIRE BRUT */}
        <Text style={styles.sectionTitle}>Rémunération</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableColLabel, styles.bold]}>Libellé</Text>
            <Text style={[styles.tableCol, styles.bold, styles.textRight]}>Base</Text>
            <Text style={[styles.tableCol, styles.bold, styles.textRight]}>Taux</Text>
            <Text style={[styles.tableCol, styles.bold, styles.textRight]}>Montant</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>Salaire de base</Text>
            <Text style={[styles.tableCol, styles.textRight]}>151.67</Text>
            <Text style={[styles.tableCol, styles.textRight]}>19.78 €</Text>
            <Text style={[styles.tableCol, styles.textRight]}>{salaireBase.toFixed(2)} €</Text>
          </View>
          {/* Mapper les avantages et primes venant de vos données */}
          {fiche.primes.map(p => (
            <View style={styles.tableRow} key={p.nomPrime}>
              <Text style={styles.tableColLabel}>{p.nomPrime}</Text>
              <Text style={styles.tableCol}></Text>
              <Text style={styles.tableCol}></Text>
              <Text style={[styles.tableCol, styles.textRight]}>{p.montantPrime.toFixed(2)} €</Text>
            </View>
          ))}
        </View>
        <View style={styles.totalRow}>
            <Text style={[styles.bold, {fontSize: 11}]}>SALAIRE BRUT : {salaireBrut.toFixed(2)} €</Text>
        </View>


        {/* COTISATIONS */}
        <Text style={[styles.sectionTitle, { marginTop: 15 }]}>Cotisations et Contributions Sociales</Text>
        <View style={styles.table}>
           <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={{ width: '40%', padding: 4, fontFamily: 'Helvetica-Bold' }}>Libellé</Text>
            <Text style={{ width: '15%', padding: 4, fontFamily: 'Helvetica-Bold', textAlign: 'right' }}>Base</Text>
            <Text style={{ width: '10%', padding: 4, fontFamily: 'Helvetica-Bold', textAlign: 'right' }}>Taux</Text>
            <Text style={{ width: '15%', padding: 4, fontFamily: 'Helvetica-Bold', textAlign: 'right' }}>Part Salariale</Text>
            <Text style={{ width: '10%', padding: 4, fontFamily: 'Helvetica-Bold', textAlign: 'right' }}>Taux</Text>
            <Text style={{ width: '15%', padding: 4, fontFamily: 'Helvetica-Bold', textAlign: 'right' }}>Part Patronale</Text>
          </View>
          {/* Lignes de cotisations (données de remplissage) */}
          {cotisations.map(c => (
            <View style={styles.tableRow} key={c.libelle}>
              <Text style={{ width: '40%', padding: 4 }}>{c.libelle}</Text>
              <Text style={{ width: '15%', padding: 4, textAlign: 'right' }}>{c.base.toFixed(2)}</Text>
              <Text style={{ width: '10%', padding: 4, textAlign: 'right' }}>{c.tauxSalarial.toFixed(2)}%</Text>
              <Text style={{ width: '15%', padding: 4, textAlign: 'right' }}>{c.montantSalarial.toFixed(2)}</Text>
              <Text style={{ width: '10%', padding: 4, textAlign: 'right' }}>{c.tauxPatronal?.toFixed(2) ?? ''}%</Text>
              <Text style={{ width: '15%', padding: 4, textAlign: 'right' }}>{c.montantPatronal?.toFixed(2) ?? ''}</Text>
            </View>
          ))}
        </View>
        <View style={styles.totalRow}>
            <Text style={styles.bold}>Total Cotisations Salariales : {totalCotisationsSalariales.toFixed(2)} €</Text>
        </View>

        {/* NET À PAYER */}
        <View style={[styles.totalRow, {marginTop: 20, backgroundColor: '#4A90E2', padding: 8}]}>
            <Text style={[styles.bold, {fontSize: 12, color: 'white'}]}>NET À PAYER : {netAPayer.toFixed(2)} €</Text>
        </View>

        {/* PIED DE PAGE */}
        <Text style={styles.footer}>
          Bulletin de paie à conserver sans limitation de durée.
        </Text>
      </Page>
    </Document>
  );
};