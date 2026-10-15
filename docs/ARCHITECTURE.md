# Architecture et décisions

Frontend HTML/CSS/JS natif, sans dépendance réseau à une CDN. GitHub Pages héberge seulement des fichiers statiques publics. Les données métier, codes et sessions ne font pas partie du dépôt.

Le frontend charge un pont Apps Script HtmlService dans une iframe invisible. Il transmet les objets par postMessage à l’origine Google vérifiée, avec corrélation de fenêtre ; le pont utilise google.script.run. Aucune donnée métier, photo, code ou session n’est encodée dans les URL. Le serveur vérifie toujours les droits. Le pont n’expose aucun contrôle interactif susceptible d’être cliqué par un site tiers.

Les données sont enregistrées dans les tables Records, Photos, Sessions, Audit, Operations, Editions et Amendments. Chaque ligne porte un identifiant et jusqu’à dix segments JSON de 40 000 caractères, sous la limite de cellule Sheets. Les écritures passent par un verrou Apps Script. Les vues de listes ne donnent pas les signatures ni les photos.

- Revision : compare-and-swap serveur ; trois voies base/local/serveur dans le navigateur.
- Dommages : objets indexés par UUID, coordonnées normalisées 0–1, numéro stable à six chiffres choisi localement. Un numéro supprimé ne peut pas être réutilisé dans le même dossier.
- Photos : UUID idempotent, JPEG, validation serveur, confirmation distante avant marquage « Enregistrée ».
- Session : token aléatoire, empreinte stockée dans Sheets, expiration 6 h, révocation par epoch. Le frontend garde le token en sessionStorage et ne le met pas dans les brouillons ni sauvegardes.
- Identité : prénom/nom obligatoires après validation du code ; l’identité du journal est celle de la session, pas un champ libre dans une requête métier.
- PDF : les images annotées sont composées depuis le dossier serveur dans des diapositives temporaires, rendues par Google Slides, puis incorporées dans un document A4 converti en PDF. Les fichiers temporaires sont mis à la corbeille. Le PDF final est conservé avec une empreinte et n’est jamais régénéré si une référence existe.
- Avenant : enregistrement séparé, anciennes valeurs vérifiées, PDF distinct.
- Archives : édition non active interdite aux contrôleurs ; écritures sur ces contrôles interdites. Les avenants administrateur restent des enregistrements distincts.

## Limites à vérifier avant mise en service

Google impose des quotas et des limites de durée d’exécution. La génération des cinq vues et d’un PDF très riche doit être chronométrée sur le compte réel. Le pont iframe doit être essayé sur Android Chrome et iOS Safari, notamment avec leurs protections de navigation. La limite de 400 000 caractères par dossier porte sur les données et signatures, les photographies étant séparées.

La résolution des conflits est testée en logique pure et avec un stockage simulé. La durabilité réelle IndexedDB, les quotas du téléphone, la fermeture forcée et la reprise doivent être testés sur un navigateur réel.

Sources techniques consultées le 14 octobre 2026 :
- https://developers.google.com/apps-script/guides/html/communication
- https://developers.google.com/apps-script/guides/html/restrictions
- https://developers.google.com/apps-script/reference/html/x-frame-options-mode
- https://developers.google.com/workspace/slides/api/reference/rest/v1/presentations.pages/getThumbnail
- https://developers.google.com/apps-script/reference/document/body
