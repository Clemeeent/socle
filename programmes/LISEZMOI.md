# Programmes des partis

Déposer ici les PDF **officiels** (téléchargés depuis le site du parti), puis les
déclarer dans `sources.json`. Exemple d'entrée :

```json
{
  "id": "rn-2022",
  "parti": "rn",
  "type": "programme-presidentiel-2022",
  "titre": "Titre exact du document",
  "annee": 2022,
  "url": "https://site-officiel-du-parti.fr/chemin/programme.pdf",
  "fichier": "rn-2022.pdf",
  "consulteLe": "2026-10-25",
  "criteresAnalyses": []
}
```

- `type` : `programme-2027`, `programme-presidentiel-2022` ou `texte-officiel`.
- `criteresAnalyses` : les critères pour lesquels le document a été entièrement relu.
  Un critère analysé sans position = « Pas de proposition trouvée dans le programme ».
  Un critère non analysé = « Programme pas encore analysé ».

## Commandes

```bash
npm run programmes:extraire   # texte page par page + passages candidats par critère
npm run programmes:verifier   # contrôle que chaque citation de data/positions.json
                              # figure mot pour mot à la page indiquée du PDF
```

Les passages candidats sont écrits dans `programmes/candidats/`. Les positions retenues
(résumé neutre + citation courte + page) vont dans `data/positions.json`, avec
`"statut": "à valider"`.
