# Avancement

_Dernière mise à jour : 27 octobre 2026._

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

## Décisions récentes
- Vocabulaire : **thèmes** = grands axes stables ; **dossiers** = sujets transversaux qui
  agrègent des éléments de plusieurs thèmes et portent les critères. Voir `CLAUDE.md`.
  Fait : « Libertés publiques » est un dossier (4 questions), les textes sont classés par thème.
- Vision produit (débat entre les deux porteurs) : moteur de recherche (tout trouver) vs site
  éditorial (une vingtaine de sujets). Compromis retenu pour le MVP : dossiers éditoriaux
  rédigés avec l'IA et relus ; recherche limitée au contenu de Socle ; plus tard, moteur
  « Qu'ont-ils voté ? » sur tous les scrutins (données complètes) et enregistrement des
  questions sans réponse pour choisir les prochains dossiers.

## Prochaines étapes
1. Design : première passe faite (Figtree, dossiers colorés, thèmes en tuiles, accueil simplifié).
   À affiner avec les porteurs du projet.
5. Enregistrer les questions sans réponse : nécessite un service externe (formulaire), à choisir.
6. Moteur « Qu'ont-ils voté ? » sur tous les scrutins de la législature.
2. Analyse des programmes dès que les PDF sont disponibles.
3. Idée V2 (discutée, non commencée) : dans les dossiers, des affirmations —
   affirmation qui circule → sources officielles → verdict vrai / faux / nuancé → qui l'a dite,
   reprise, ou a relayé la source officielle. Pas de classement global des médias (neutralité,
   risque juridique). Couche factuelle possible : actionnariat des médias.
4. Dossier « police » envisagé : critères vérifiables (contrôles d'identité, décisions de justice,
   rapports d'instances indépendantes), rubrique « ce qui n'est pas mesuré », comparaisons
   internationales (sources officielles étrangères), votes et propositions. Sources à vérifier.
