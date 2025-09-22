-- Script d'initialisation de la base de données GRH REGIDESO
-- Ce script crée les rôles par défaut et un utilisateur administrateur

-- Insertion des rôles par défaut
INSERT INTO Role (nomRole) VALUES 
  ('Admin'),
  ('RH'),
  ('Employe');

-- Insertion d'un utilisateur administrateur par défaut
-- Mot de passe: admin123 (à changer en production)
INSERT INTO User (login, password, roleId) VALUES 
  ('admin', '$2b$10$rOvHPnuKJ5PZmGxJ5fKrKOQGQxJ5fKrKOQGQxJ5fKrKOQGQxJ5fKrK', 1);

-- Insertion d'un employé de test
INSERT INTO Employee (userId, matricule, nom, prenom, dateNaissance, telephone, service, poste, salaireBase, dateEmbauche) VALUES 
  (1, 'EMP001', 'Mukendi', 'Jean', '1985-03-15', '+243123456789', 'Ressources Humaines', 'Directeur RH', 2500.00, '2020-01-15');
