# Avancement

_Dernière mise à jour : 25 octobre 2026._

## Fait
- Import des votes de l'Assemblée (6 scrutins, 13 groupes) avec contrôle des décomptes.
- Thème « Libertés publiques » : 4 critères (manifester, surveillance, expression, police).
- Écrans : accueil, page réponse (classement des partis + filtres par critère), thème, critère,
  fiche texte (résultat, barres par parti, hémicycle replié), page parti, méthode.
- Refonte « progressive disclosure » : réponse d'abord, détails repliés, sources en pied de page.
- Chaîne des programmes : déclaration des sources, téléchargement, extraction des passages par
  mots-clés, vérification automatique des citations (testée sur un PDF fictif).
- Publication automatique sur GitHub Pages.

## En attente
- **PDF des programmes** : aucun n'est encore téléchargé (sites des partis bloqués depuis
  l'environnement cloud). Déclarés : LFI (Avenir en commun abrégé 2022), Renaissance (restitution
  convention Régalien), RN (programme juin 2024). Les autres partis : document à trouver.
  Sur un Mac : `npm run programmes:telecharger`, puis committer les PDF.
- **Décisions à valider par les porteurs du projet** :
  - sélection des 6 textes et leur rattachement aux critères (fondé sur les intitulés) ;
  - correspondance partis ↔ groupes (`data/partis.json`) ;
  - Place publique : parti à ajouter ? (députés dans le groupe SOC ; le PDF fourni vient de
    wikiglucksmann.fr, à confirmer comme source officielle) ;
  - RN : programme législatif 2024 retenu au lieu du présidentiel 2022 ?
  - LFI : version abrégée ou programme complet ?
  - ordre de l'hémicycle (déduit des numéros de place) à comparer au plan officiel.
- Résumés neutres des textes : à rédiger et faire valider par un juriste.

## Prochaines étapes
1. Design : plus de finesse (typographie, rythme, micro-interactions), à partir de références
   fournies par les porteurs du projet.
2. Analyse des programmes dès que les PDF sont disponibles.
3. Idée V2 (discutée, non commencée) : « dossiers » sur 2-3 grands sujets 2025-2026 —
   affirmation qui circule → sources officielles → verdict vrai / faux / nuancé → qui l'a dite,
   reprise, ou a relayé la source officielle. Pas de classement global des médias (neutralité,
   risque juridique). Couche factuelle possible : actionnariat des médias.
