# Socle — v1 de démonstration

Site de référence sourcé sur la politique française : votes de l'Assemblée nationale,
critères visibles, mêmes règles pour tous les groupes.

## Lancer le site en local

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:3000

## Mettre à jour les votes

```bash
npm run import           # réutilise les fichiers déjà téléchargés (.cache/)
npm run import -- --fresh  # retélécharge l'open data de l'Assemblée
```

Le script télécharge l'open data officiel (scrutins, députés et groupes, dossiers
législatifs), ne garde que les scrutins listés dans `data/grille.json` et écrit les
fichiers JSON dans `data/`. Il s'arrête en erreur si un décompte nominatif ne
correspond pas au décompte officiel.

## Programmes des partis

Voir `programmes/LISEZMOI.md`. En bref : déposer les PDF officiels dans `programmes/`,
les déclarer dans `programmes/sources.json`, puis :

```bash
npm run programmes:extraire   # passages candidats par critère → programmes/candidats/
npm run programmes:verifier   # chaque citation de data/positions.json doit figurer
                              # mot pour mot à la page indiquée du PDF
npm test                      # inclut la même vérification
```

## Où sont les choses

| Fichier | Rôle |
|---|---|
| `data/grille.json` | Critères et sélection des textes (à faire valider par un juriste) |
| `data/questions.json` | Questions d'exemple et leur reformulation |
| `data/partis.json` | Partis et groupe(s) parlementaire(s) associé(s) (à valider) |
| `data/positions.json` | Propositions tirées des programmes, avec citation et page |
| `data/*.json` (autres) | Générés par `npm run import`, ne pas modifier à la main |
| `src/lib/stats.ts` | Tous les calculs affichés |
| `src/lib/question.ts` | Interprétation des questions (point d'entrée pour un futur LLM) |

## Déployer

Le projet se déploie tel quel sur Vercel : les données sont déjà dans `data/`, la
construction du site n'a pas besoin d'accès réseau.
