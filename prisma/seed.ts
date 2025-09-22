import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding ... 🌱');

  // --- ⚠️ Clear all data ⚠️ ---
  // The order is important to respect foreign key constraints
  await prisma.participationFormation.deleteMany();
  await prisma.formation.deleteMany();
  await prisma.presence.deleteMany();
  await prisma.conge.deleteMany();
  await prisma.avantage.deleteMany();
  await prisma.prime.deleteMany();
  await prisma.ficheDePaie.deleteMany();
  await prisma.annonce.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  console.log('All existing data cleared.');

  // --- Create Roles ---
  const roles = ['Admin', 'RH', 'Employe'];
  await prisma.role.createMany({
    data: roles.map(nomRole => ({ nomRole })),
    skipDuplicates: true,
  });
  console.log(`Created ${roles.length} roles.`);

  const adminRole = await prisma.role.findUniqueOrThrow({ where: { nomRole: 'Admin' } });
  const rhRole = await prisma.role.findUniqueOrThrow({ where: { nomRole: 'RH' } });
  const employeRole = await prisma.role.findUniqueOrThrow({ where: { nomRole: 'Employe' } });
  
  // --- Create Users with Hashed Passwords ---
  const saltRounds = 10;
  const hashedPasswordAdmin = await bcrypt.hash('password123', saltRounds);
  const hashedPasswordRH = await bcrypt.hash('password123', saltRounds);
  const hashedPasswordEmploye = await bcrypt.hash('password123', saltRounds);
  
  const userAdmin = await prisma.user.create({
    data: {
      login: 'admin@regideso.com',
      password: hashedPasswordAdmin,
      roleId: adminRole.id,
    },
  });
  
  const userRH = await prisma.user.create({
    data: {
      login: 'rh@regideso.com',
      password: hashedPasswordRH,
      roleId: rhRole.id,
    },
  });
  
  const userEmploye = await prisma.user.create({
    data: {
      login: 'employe@regideso.com',
      password: hashedPasswordEmploye,
      roleId: employeRole.id,
    },
  });

  console.log('Created users for each role.');

  // --- Create Employees ---
  const employee1 = await prisma.employee.create({
    data: {
      userId: userAdmin.id,
      matricule: 'EMP-A001',
      nom: 'Dupont',
      prenom: 'Jean',
      dateNaissance: new Date('1985-04-15'),
      telephone: '0612345678',
      service: 'Direction',
      poste: 'Directeur Général',
      salaireBase: 5000.00,
      dateEmbauche: new Date('2020-01-10'),
    },
  });

  const employee2 = await prisma.employee.create({
    data: {
      userId: userEmploye.id,
      matricule: 'EMP-M002',
      nom: 'Martin',
      prenom: 'Sophie',
      dateNaissance: new Date('1990-09-20'),
      telephone: '0698765432',
      service: 'Marketing',
      poste: 'Chef de projet',
      salaireBase: 3500.00,
      dateEmbauche: new Date('2021-05-25'),
    },
  });
  
  console.log('Created 2 employees.');
  
  // --- Create FichesDePaie ---
  const fiche1 = await prisma.ficheDePaie.create({
    data: {
      employeId: employee1.id,
      mois: new Date('2025-08-01'),
      annee: 2025,
      motif: 'Salaire standard du mois d\'août',
      statut: 'Payé',
    },
  });

  const fiche2 = await prisma.ficheDePaie.create({
    data: {
      employeId: employee2.id,
      mois: new Date('2025-08-01'),
      annee: 2025,
      statut: 'Généré',
    },
  });
  
  console.log('Created 2 pay slips.');

  // --- Create Avantages ---
  const avantage1 = await prisma.avantage.create({
    data: {
      nomAvantages: 'Mutuelle',
      montantAvantages: 50.00,
      fiches_de_paie: { connect: { id: fiche1.id } },
    },
  });

  const avantage2 = await prisma.avantage.create({
    data: {
      nomAvantages: 'Ticket restaurant',
      montantAvantages: 100.00,
      fiches_de_paie: { connect: { id: fiche2.id } },
    },
  });

  console.log('Created 2 benefits.');
  
  // --- Create Primes ---
  const prime1 = await prisma.prime.create({
    data: {
      nomPrime: 'Prime de performance',
      montantPrime: 200.00,
      fiches_de_paie: { connect: { id: fiche1.id } },
    },
  });

  const prime2 = await prisma.prime.create({
    data: {
      nomPrime: 'Prime exceptionnelle',
      montantPrime: 500.00,
      fiches_de_paie: { connect: { id: fiche2.id } },
    },
  });
  
  console.log('Created 2 bonuses.');
  
  // --- Create Conges ---
  await prisma.conge.createMany({
    data: [
      {
        employeId: employee1.id,
        dateDebut: new Date('2025-09-01'),
        dateFin: new Date('2025-09-05'),
        motif: 'Vacances d\'été',
        statut: 'Approuvé',
      },
      {
        employeId: employee2.id,
        dateDebut: new Date('2025-10-10'),
        dateFin: new Date('2025-10-12'),
        motif: 'Congé familial',
        statut: 'En attente',
      },
    ],
  });
  
  console.log('Created 2 leaves.');

  // --- Create Presences ---
  await prisma.presence.createMany({
    data: [
      {
        employeId: employee1.id,
        dateJournee: new Date('2025-09-22'),
        heureArrivee: new Date('2025-09-22T08:00:00Z'),
        heureDepart: new Date('2025-09-22T17:00:00Z'),
      },
      {
        employeId: employee2.id,
        dateJournee: new Date('2025-09-22'),
        heureArrivee: new Date('2025-09-22T08:30:00Z'),
        heureDepart: new Date('2025-09-22T17:30:00Z'),
      },
    ],
  });
  
  console.log('Created 2 attendance records.');
  
  // --- Create Formations ---
  const formation1 = await prisma.formation.create({
    data: {
      titre: 'Gestion de projet Agile',
      description: 'Apprendre les fondamentaux de la méthode Agile et Scrum.',
      dureeHeures: 16,
    },
  });

  const formation2 = await prisma.formation.create({
    data: {
      titre: 'Communication interpersonnelle',
      description: 'Améliorer ses compétences en communication verbale et non-verbale.',
      dureeHeures: 8,
    },
  });
  
  console.log('Created 2 trainings.');

  // --- Create ParticipationFormations ---
  await prisma.participationFormation.createMany({
    data: [
      {
        employeId: employee2.id,
        formationId: formation1.id,
        dateInscription: new Date(),
        statut: 'Planifié',
      },
      {
        employeId: employee1.id,
        formationId: formation2.id,
        dateInscription: new Date(),
        statut: 'Terminé',
        resultat: 'Réussite',
      },
    ],
  });
  
  console.log('Created 2 training participations.');

  // --- Create Annonces ---
  await prisma.annonce.createMany({
    data: [
      {
        titre: 'Fermeture exceptionnelle du bureau',
        contenu: 'Le bureau sera fermé le 25 décembre 2025 pour les fêtes de fin d\'année. Nous vous souhaitons de joyeuses fêtes !',
        datePub: new Date(),
      },
      {
        titre: 'Événement d\'entreprise: Repas de fin d\'année',
        contenu: 'Un repas d\'équipe est organisé le 15 octobre à 19h au restaurant La Petite Table. Inscrivez-vous avant le 10 octobre !',
        datePub: new Date(),
      },
    ],
  });
  
  console.log('Created 2 announcements.');
  
  console.log('Seeding finished. ✅');
}

main()
  .catch((e) => {
    console.error('An error occurred during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });