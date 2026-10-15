# Installation — GitHub Pages + Google Apps Script

## Préparer les services privés

1. Ouvre la base Google Sheets « Beauregard Véhicules — Base métier » dans le sous-dossier véhicules. Cette base ne contient aucun véhicule réel.
2. Extensions → Apps Script. Utilise un projet lié à cette base, indépendant de Runner/Navettes.
3. Ajoute tous les fichiers `.gs` de `backend/`, avec les mêmes noms, et le fichier HTML `Bridge`. Remplace le manifeste `appsscript.json` par celui fourni. Une seule copie de `Model.gs` doit exister.
4. Exécute `setupVehicles` depuis l’éditeur. Autorise uniquement le nouveau projet. La fonction crée les onglets manquants et les dossiers privés ; elle ne vide pas les onglets existants.
5. Reviens au Sheet et recharge-le. Menu « Beauregard Véhicules » → « Configurer les deux codes ». Saisis deux codes distincts d’au moins 12 caractères. Ils sont hachés avec un secret serveur. Ne les copie pas dans GitHub ni dans un document public.
6. Copie les 15 fichiers PNG de `frontend/assets/vehicles` dans le dossier « Illustrations système » créé par l’installation. Les SVG servent à l’interface ; les PNG à la composition des PDF.
7. Pour la génération des vues PDF, active l’API Google Slides dans le projet Google Cloud associé à Apps Script si elle ne l’est pas. Les illustrations et marqueurs sont composés côté serveur, puis insérés dans un document A4. Les fichiers de travail temporaires sont mis à la corbeille après génération.
8. Menu « Vérifier la configuration » : aucun élément manquant ne doit être signalé.

## Déployer Apps Script

Déployer → Nouveau déploiement → Application Web. Exécuter en tant que propriétaire, accès « Tout le monde ». Ce réglage rend le point d’entrée accessible, **pas les fichiers Drive**. Chaque action métier reste protégée par la session et les droits serveur. Vérifie la configuration et les tests de refus d’accès avant tout usage réel.

Copie l’URL `/exec` dans `frontend/config.js` (`apiUrl`). Aucune donnée sensible n’est placée dans cette URL. Le paramètre public `channel` utilisé par l’application sert uniquement à corréler la fenêtre de communication.

Le champ serveur `FRONTEND_ORIGIN` vaut `https://runner-fb.github.io`. Il n’autorise pas d’autre domaine. Les messages sont adressés à une origine exacte ; le serveur valide indépendamment l’authentification. Le navigateur doit autoriser le chargement de la page Google intégrée.

## Publier sur GitHub Pages

Le dépôt dédié est `runner-fb/beauregard-vehicules`. Ne modifie pas `planning-pwa`.

1. Relance `node scripts/build-cache.cjs` après configuration.
2. Dans Settings → Pages, choisis **GitHub Actions** comme source.
3. Le workflow `pages.yml` doit être déclenché manuellement après vérification de la configuration. Il refuse une URL backend vide et vérifie les tests avant publication.
4. Vérifie l’URL fournie par GitHub Pages, puis exécute l’intégralité de `docs/RECETTE.md` sur données fictives.

## Configuration et édition

`ACTIVE_EDITION` dans les propriétés serveur est la référence métier. L’édition frontend sert seulement au démarrage hors connexion. Les archives ne sont accessibles qu’aux sessions administrateur. Ne change pas l’édition active sans décision sur les contrôles ouverts : cette procédure n’a pas été validée et n’est volontairement pas automatisée.

## Alternative d’installation technique

`backend/appsscript.json` permet l’utilisation de clasp après authentification personnelle. Aucun jeton OAuth ni fichier de connexion ne doit être ajouté au dépôt. Les outils de ce dossier ne récupèrent jamais de secrets existants.
