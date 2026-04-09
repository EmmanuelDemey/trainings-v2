/**
 * Genea11y - Script principal
 * Formation Accessibilité
 *
 * Ce fichier contient les données et fonctions de base.
 * Les stagiaires compléteront ce fichier au fil des TPs.
 */

// --- Données exemple ---
const personnes = [
  { id: 1, nom: "Dupont", prenom: "Jean", dateNaissance: "1980-05-15" },
  { id: 2, nom: "Martin", prenom: "Marie", dateNaissance: "1975-03-22" },
  { id: 3, nom: "Bernard", prenom: "Pierre", dateNaissance: "1990-11-08" },
  { id: 4, nom: "Durand", prenom: "Sophie", dateNaissance: "1985-09-30" },
  { id: 5, nom: "Petit", prenom: "Lucas", dateNaissance: "2000-01-12" },
];

document.addEventListener("DOMContentLoaded", () => {
  // TODO PW04 : Appeler la fonction de rendu du tableau
  // TODO PW04 bonus : Initialiser le tri du tableau
  // TODO PW07 : Initialiser la modale
});

// --- PW04 : Rendu du tableau ---
// TODO : Créer une fonction qui génère les lignes du tableau
// à partir du tableau `personnes`

// --- PW04 bonus : Tri du tableau ---
// TODO : Créer une fonction de tri qui met à jour aria-sort

// --- PW05 : Validation du formulaire ---
// TODO : Créer une fonction de validation pour creation.html

// --- PW07 : Gestion de la modale ---
// TODO : Créer les fonctions openModal / closeModal
