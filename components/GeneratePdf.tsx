"use client"

import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import React, { useState, useEffect } from "react"
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

interface Employe {
  id: number
  nom: string
  prenom: string
}

interface Avantage {
  id: number
  nomAvantages: string
  montantAvantages: number
}

interface Prime {
  id: number
  nomPrime: string
  montantPrime: number
}

interface FicheDePaie {
  id: number
  employe: Employe
  mois: string
  annee: number
  motif: string
  statut: string
  avantages: Avantage[]
  primes: Prime[]
}

interface PDFGeneratorProps {
  fiche: FicheDePaie
}

// NOTE: This component assumes you have installed react-pdf.
// If you are using a build system like Next.js, you will need to run:
// npm install @react-pdf/renderer

// Create styles for the PDF document
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 10,
  },
  heading: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'column',
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCell: {
    padding: 5,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 10,
    flexGrow: 1,
    textAlign: 'left',
  },
  tableHeader: {
    backgroundColor: '#e2e8f0',
    fontWeight: 'bold',
  },
});

const FicheDePaieDocument = ({ fiche }: PDFGeneratorProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Fiche de Paie</Text>
      <View style={styles.section}>
        <Text style={styles.text}>Employé: {fiche.employe.prenom} {fiche.employe.nom}</Text>
        <Text style={styles.text}>Période: {fiche.mois} {fiche.annee}</Text>
        <Text style={styles.text}>Motif: {fiche.motif}</Text>
        <Text style={styles.text}>Statut: {fiche.statut}</Text>
      </View>

      {fiche.avantages && fiche.avantages.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.heading}>Avantages</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Nom</Text>
              <Text style={styles.tableCell}>Montant</Text>
            </View>
            {fiche.avantages.map((avantage, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{avantage.nomAvantages}</Text>
                <Text style={styles.tableCell}>{avantage.montantAvantages} €</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {fiche.primes && fiche.primes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.heading}>Primes</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Nom</Text>
              <Text style={styles.tableCell}>Montant</Text>
            </View>
            {fiche.primes.map((prime, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{prime.nomPrime}</Text>
                <Text style={styles.tableCell}>{prime.montantPrime} €</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </Page>
  </Document>
);

export function PDFGenerator({ fiche }: PDFGeneratorProps) {
  const fileName = `fiche-de-paie-${fiche.employe.nom.toLowerCase()}-${fiche.employe.prenom.toLowerCase()}.pdf`;

  return (
    <PDFDownloadLink document={<FicheDePaieDocument fiche={fiche} />} fileName={fileName}>
      {({ loading }) => (
        <Button variant="outline" size="sm" disabled={loading}>
          <FileDown className="h-4 w-4 mr-2" />
          {loading ? 'Génération...' : 'Télécharger PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  )
}
