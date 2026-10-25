# Socle — règles du projet pour Claude Code

Lire `PROGRESS.md` en début de session, avant de toucher au code.
@AGENTS.md

## Le projet
Site de référence sourcé sur la politique française, pour débattre avant la présidentielle 2027
à partir d'un socle de faits commun. Version actuelle : démo (v1), pas une version de production.
Les deux personnes du projet sont des non-développeurs : expliquer simplement, donner les commandes
exactes, dire comment tester. Demander avant toute action en ligne ou irréversible (déploiement,
suppression de données, changement de réglages GitHub).

## Principes non négociables
- **Neutralité totale** : mêmes critères pour tous les partis, méthode visible (page `/methode`).
- Toujours séparer le **fait** (sourcé, daté), ses **lectures** possibles et les **valeurs**.
- Chaque chiffre, vote ou citation pointe vers sa **source officielle** (Assemblée nationale, Légifrance,
  PDF officiel du parti).
- **Ne jamais inventer** un vote, un chiffre, une promesse, une citation, ni écrire un résumé de loi
  de mémoire. S'il manque une donnée : état vide explicite (« Programme à venir », « À analyser par
  un juriste », « Résumé à rédiger »).
- Les rattachements textes ↔ critères et partis ↔ groupes sont des choix éditoriaux :
  `statut: "à valider"` et affichés comme tels.
- Pas de jugement global sur un parti ou un média (pas de « vrai/faux » sur « qui est liberticide »,
  pas de classement de fiabilité des journaux).

## Données
- **Votes** : open data de l'Assemblée nationale (17e législature). `npm run import` télécharge et
  écrit `data/scrutins.json`, `groupes.json`, `deputes.json`, `dossiers.json`, `meta.json` (ne pas
  les modifier à la main). Le script vérifie chaque décompte nominatif contre le décompte officiel.
- **Sélection** : `data/grille.json` (thème, critères avec mots-clés, textes retenus). Un seul vote
  par texte : vote sur l'ensemble, dernière lecture à l'Assemblée (CMP si elle existe).
- **Partis** : `data/partis.json` (parti → groupe(s) parlementaire(s)). LIOT et non-inscrits : pas de parti.
- **Programmes** : PDF officiels dans `programmes/`, déclarés dans `programmes/sources.json`.
  Priorité : programme 2027 > programme présidentiel 2022 > texte officiel du parti. Un parti
  n'hérite jamais du programme d'un autre. Badge avec provenance et année.
  `npm run programmes:telecharger | extraire | verifier`. Positions dans `data/positions.json` :
  résumé neutre + citation courte **exacte** + page ; `verifier` (et `npm test`) refuse toute
  citation absente mot pour mot de la page indiquée.
- Distinguer « Pas de proposition trouvée dans le programme » (document lu pour ce critère) et
  « Programme à venir » (pas encore analysé) : champ `criteresAnalyses`.

## Design
- Mobile d'abord, sobre et crédible (Wikipédia moderne, inspiré du DSFR **sans** la police Marianne,
  le logo ni l'identité de l'État).
- **Progressive disclosure** : niveau 1 = la réponse en un écran (une phrase + un visuel) ;
  niveau 2 = détails repliés (`Deplier`, `Rangee`) ; niveau 3 = sources/statut/date dans une ligne
  en pied de page (`PiedFiche`). Pas d'encart explicatif répété : la structure doit répondre.
- Pages réponse : partis classés par part de députés ayant voté pour (absents compris) ; égalités
  nommées ensemble. Hémicycle : ordre gauche → droite déduit des numéros de place.
- Couleurs de vote : pour = bleu, contre = orange, abstention = gris, absent = gris clair
  (tokens dans `src/app/globals.css`). Couleurs de groupe = celles de l'open data.
- Accessibilité : jamais la couleur seule, `prefers-reduced-motion` respecté.

## Stack et commandes
- Next.js 16 (App Router) + TypeScript strict + Tailwind 4, données en JSON local, pas de backend.
- Next 16 a des changements cassants : lire `node_modules/next/dist/docs/` avant d'utiliser une API.
  `cacheComponents` est volontairement désactivé (site 100 % statique).
- `npm run dev`, `npm test` (Vitest), `npm run lint`, `npm run build`.
- Publication : GitHub Pages via `.github/workflows/pages.yml` (export statique quand
  `PAGES_BASE_PATH` est défini) → https://clemeeent.github.io/socle/
- Environnement cloud Claude : le `fetch` de Node passe par le proxy avec `NODE_USE_ENV_PROXY=1`.

## Conventions
- Interface en français ; commentaires de code en anglais ; noms de données métier en français.
- Avant de dire qu'une étape est finie : `npm test`, `npm run lint`, vérifier l'écran en largeur
  mobile (390 px) dans un navigateur.
- Un commit par étape qui marche, message clair. Travailler sur une branche, pas directement sur
  la branche par défaut.
- Mettre à jour `PROGRESS.md` à la fin de chaque session.
