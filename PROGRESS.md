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
- Structure « affirmation » : un dossier peut contenir des affirmations (texte, origine, verdict,
  indicateurs avec sources et valeurs). Un test refuse tout verdict sans origine retrouvée ni
  données sourcées pour chaque indicateur.
- Dossier « Budget de l'éducation » (squelette) : l'affirmation des « 10 milliards », 4 indicateurs
  (crédits en euros courants, en euros constants, part dans le budget de l'État, dépense
  intérieure d'éducation en % du PIB). **Aucun chiffre** : verdict « à établir ».

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

## Bloquant pour les dossiers à données réelles
- Le 27/10/2026, l'environnement cloud refuse l'accès à education.gouv.fr, budget.gouv.fr,
  data.gouv.fr, insee.fr, legifrance.gouv.fr (« 403 » du proxy : politique réseau). Seul
  data.assemblee-nationale.fr répond. À régler dans les réglages de l'environnement (accès
  réseau « Full », ou ajouter ces domaines à la liste autorisée).
- Une fois l'accès ouvert, pour le dossier éducation : renseigner `url` de chaque source dans
  `data/dossiers.json` (document exact, pas la page d'accueil), remplir `valeurs` (année, valeur,
  lien, tableau/page), retrouver l'origine du « 10 milliards », puis seulement écrire le verdict.

## À faire en priorité : 3 dossiers à partir de vrais débats (données réelles)
Exemples tirés de discussions réelles du porteur du projet. Chaque chiffre doit venir d'une source
officielle téléchargée (jamais de mémoire) ; si une donnée n'existe pas, le dire (« non mesuré »).
Nécessite un accès réseau complet (l'environnement de la session doit être en « Full »).

1. **« La police est-elle raciste ? »** (thème Sécurité et justice)
   - Contrôles d'identité : enquêtes du Défenseur des droits (defenseurdesdroits.fr).
   - Décisions de justice : Cour de cassation (contrôles au faciès, 2016), Conseil d'État (2023).
   - IGPN : rapports annuels (interieur.gouv.fr).
   - Ce qui n'est pas mesuré en France et pourquoi (statistiques ethniques, enregistrement des
     contrôles).
   - Comparaison Angleterre/Pays de Galles : statistiques officielles « stop and search » par
     origine (gov.uk, Home Office), polices territoriales, commissaires élus.
   - Votes de l'Assemblée liés (récépissé, polices municipales) : aucun trouvé dans les scrutins
     de la 17e législature (recherche faite le 27/10/2026) ; à vérifier sur la législature 16.
   - Propositions des partis : dès que les programmes sont analysés.
2. **« Les 10 milliards pour l'éducation : la plus grande part du budget jamais consacrée à
   l'éducation ? »** (thème Éducation) — format affirmation → verdict vrai / faux / nuancé.
   - Séries officielles : budget de l'Éducation nationale (mission Enseignement scolaire), part
     dans le budget de l'État, dépense intérieure d'éducation en % du PIB, en euros constants
     (education.gouv.fr « Repères et références statistiques », budget.gouv.fr, INSEE).
   - Montrer que la réponse dépend de l'indicateur (montant, part du budget, part du PIB).
   - Retrouver l'origine exacte du chiffre « 10 milliards » (qui, quand) avant de conclure.
3. **« Les violences en manifestation viennent de l'ultragauche ? »** (thèmes Sécurité et
   justice, Institutions) — affirmation → déclarations publiques des services de renseignement
   (citation exacte + source), textes votés sur le maintien de l'ordre.

Structure à prévoir : un dossier peut contenir des **affirmations** (texte de l'affirmation,
verdict, explication courte, indicateurs avec sources) en plus des questions fondées sur des votes.

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
