-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "login" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Role" (
    "id" SERIAL NOT NULL,
    "nomRole" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Employee" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "matricule" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "dateNaissance" TIMESTAMP(3) NOT NULL,
    "telephone" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "poste" TEXT NOT NULL,
    "salaireBase" DOUBLE PRECISION NOT NULL,
    "dateEmbauche" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FicheDePaie" (
    "id" SERIAL NOT NULL,
    "employeId" INTEGER NOT NULL,
    "mois" TIMESTAMP(3) NOT NULL,
    "annee" INTEGER NOT NULL,
    "motif" TEXT,
    "statut" TEXT NOT NULL,

    CONSTRAINT "FicheDePaie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Avantage" (
    "id" SERIAL NOT NULL,
    "nomAvantages" TEXT NOT NULL,
    "montantAvantages" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Avantage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Prime" (
    "id" SERIAL NOT NULL,
    "nomPrime" TEXT NOT NULL,
    "montantPrime" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Prime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Conge" (
    "id" SERIAL NOT NULL,
    "employeId" INTEGER NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "motif" TEXT NOT NULL,
    "statut" TEXT NOT NULL,

    CONSTRAINT "Conge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Presence" (
    "id" SERIAL NOT NULL,
    "employeId" INTEGER NOT NULL,
    "dateJournee" TIMESTAMP(3) NOT NULL,
    "heureArrivee" TIMESTAMP(3),
    "heureDepart" TIMESTAMP(3),

    CONSTRAINT "Presence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Formation" (
    "id" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dureeHeures" INTEGER NOT NULL,

    CONSTRAINT "Formation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ParticipationFormation" (
    "id" SERIAL NOT NULL,
    "employeId" INTEGER NOT NULL,
    "formationId" INTEGER NOT NULL,
    "dateInscription" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" TEXT NOT NULL,
    "resultat" TEXT,

    CONSTRAINT "ParticipationFormation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Annonce" (
    "id" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "datePub" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Annonce_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_FicheDePaieToPrime" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_FicheDePaieToPrime_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_AvantageToFicheDePaie" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AvantageToFicheDePaie_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_login_key" ON "public"."User"("login");

-- CreateIndex
CREATE UNIQUE INDEX "Role_nomRole_key" ON "public"."Role"("nomRole");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_userId_key" ON "public"."Employee"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_matricule_key" ON "public"."Employee"("matricule");

-- CreateIndex
CREATE INDEX "_FicheDePaieToPrime_B_index" ON "public"."_FicheDePaieToPrime"("B");

-- CreateIndex
CREATE INDEX "_AvantageToFicheDePaie_B_index" ON "public"."_AvantageToFicheDePaie"("B");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FicheDePaie" ADD CONSTRAINT "FicheDePaie_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "public"."Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Conge" ADD CONSTRAINT "Conge_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "public"."Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Presence" ADD CONSTRAINT "Presence_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "public"."Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ParticipationFormation" ADD CONSTRAINT "ParticipationFormation_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "public"."Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ParticipationFormation" ADD CONSTRAINT "ParticipationFormation_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "public"."Formation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_FicheDePaieToPrime" ADD CONSTRAINT "_FicheDePaieToPrime_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."FicheDePaie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_FicheDePaieToPrime" ADD CONSTRAINT "_FicheDePaieToPrime_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Prime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AvantageToFicheDePaie" ADD CONSTRAINT "_AvantageToFicheDePaie_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Avantage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AvantageToFicheDePaie" ADD CONSTRAINT "_AvantageToFicheDePaie_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."FicheDePaie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
