# Corrections validées — Beauregard Véhicules 2027

## État de livraison

Corrections préparées et testées localement, transférées sur la branche GitHub `fix/recette-validee-20261018` le 19 octobre. **Non déployées en production** : la version en ligne n’a pas été modifiée.

Base inspectée : `d04e7f2ed769c7ab411ae8aa225cbfa13e7ac913` sur `main`.
Branche de corrections : `fix/recette-validee-20261018`.
Premier commit local : `deb8c13` — corrections et recette isolée. Les ajustements et résultats finaux font l’objet du commit qui contient ce rapport.

## Modifications réalisées dans le code

- Extérieur : ordre avant, droite, arrière, gauche ; disparition de la navigation supérieure par vues ; Continuer et retour à la vue précédente ; déclaration « Aucun dommage » obligatoire sur les vues sans dommage. La validation définitive est présentée au récapitulatif, avec astérisque rouge.
- Récapitulatif compact : kilométrage et carburant sur une ligne chacun, dommages rangés sous leur vue, validations manquantes directement accessibles. L’accès aux signatures renvoie au récapitulatif si le dossier est incomplet.
- Fenêtre de dommage : marges et champs réduits, détails de contestation affichés seulement si la case est cochée ; photos, contestations et déclarations d’antériorité conservées.
- Signatures : étape active rendue visible dans la barre ; avertissement demandé ; prénom et nom du loueur ; identité du contrôleur préremplie pour le locataire. Identité du signataire distincte du contrôleur collecteur dans les données, le récapitulatif et le générateur PDF. Les anciennes signatures sans identité propre affichent « Identité non renseignée » plutôt qu’un nom attribué par supposition.
- Clôture : confirmation par fenêtre de l’application ; écran final limité aux actions, sans récapitulatif complet. Historique, avenants, PDF et navigation restent disponibles ; l’action d’avenant administrateur existante est conservée.
- Retour : identification initiale désactivée dans l’interface et protégée côté serveur ; anciens dommages noirs, grisés et consultables avant modification volontaire ; nouveaux dommages rouges. Évolution des anciens dommages facultative, sans nouvelle photo imposée. Le commentaire d’une aggravation explicitement déclarée reste requis, comme auparavant.
- Liste : filtres En cours, Pris en charge signé et Clôturé ; retour à la liste disponible depuis les dossiers. Retour exceptionnel sans prise en charge conservé et testé.
- Reprise : dernière étape et dernière vue enregistrées localement, pour les prises en charge comme pour les retours ; conservation lors d’une lecture actualisée du serveur.
- Accueil : fiches compactes et quatre icônes (reprendre/consulter, supprimer, synchroniser, JSON). Suppression confirmée interdite aux dossiers signés/clôturés. Retrait logique avec conservation des données pour l’audit, sans purge des photos. Les commandes globales demandées ont disparu ; la synchronisation automatique reste active.
- Export JSON : un seul dossier avec ses photos locales. Partage natif si disponible ; sinon téléchargement et ouverture d’un brouillon mail invitant à joindre le fichier. Aucun e-mail envoyé automatiquement.
- Connexion : code unique, rôle déterminé par le serveur à partir des empreintes existantes ; aucun changement des codes ni de leur stockage. Accueil commun, bouton Dossiers réservé à l’administrateur. L’action serveur `adminList` contrôle explicitement ce droit.
- Chargements : retour visuel et boutons désactivés pendant les opérations ; protection des enregistrements de dommage et des captures contre les doubles clics. Les boutons de navigation ont explicitement `type="button"` pour éviter qu’Annuler soumette un formulaire rempli.

## Fichiers concernés

| Groupe | Fichiers |
|---|---|
| Interface | `frontend/js/app.js`, `frontend/style.css` |
| Règles et interactions | `frontend/js/model.js`, `maps.js`, `photos.js`, `signatures.js` |
| Session et synchronisation | `frontend/js/transport.js`, `sync.js` |
| Cache hors ligne | `frontend/sw.js` (généré par le script existant) |
| Serveur | `backend/Api.gs`, `Auth.gs`, `Model.gs`, `Records.gs`, `Store.gs`, `Pdf.gs` |
| Tests | `tests/backend.test.cjs`, `tests/sync.test.cjs`, `tests/e2e/auth.spec.js`, `public-smoke.spec.js`, `validated-corrections.spec.js` |
| Exécution des tests | `playwright.config.js`, `package.json`, `package-lock.json`, `.github/workflows/validated-corrections.yml`, `.gitignore` |

Le transport GET/JSON et pont iframe, la configuration de production, les identifiants de stockage et la base IndexedDB n’ont pas été remplacés. Aucun dossier réel n’a été modifié pour la recette.

## Vérifications

- **44 tests unitaires réussis** : règles métier, contrôle d’accès, signatures, immutabilité des dommages initiaux et de l’identification du retour, suppression protégée, stockage, conflits, synchronisation et conservation des modifications concurrentes.
- **26 scénarios Playwright distincts validés** (13 sur ordinateur, 13 en émulation Android). Dernière suite : 25 réussites et une fermeture de navigateur avant création du contexte ; le test concerné a été relancé seul et a réussi. Chromium 153 ; ordinateur et émulation Pixel 7. Interface, IndexedDB, synchronisation locale, photos à partir d’images fictives et signatures sur canvas réelles ; API métier simulée. Les tests de présence et d’affichage existants sont inclus.
- Scénarios ajoutés : parcours complet de prise en charge, retour lié, retour sans prise en charge, validation au récapitulatif, signataires distincts, clôture, reprise après rechargement, filtres, ancien dommage en lecture seule, droits Dossiers, suppression confirmée, export JSON, conservation hors ligne, visibilité de l’étape active et annulation d’un formulaire rempli.
- Tentative de la suite d’authentification existante sur le site réel : **2 tests bloqués** avant chargement (`net::ERR_EMPTY_RESPONSE`) et **2 ignorés** faute de secrets de test. Ce résultat n’établit pas une panne de l’application.
- Vérifications syntaxiques JavaScript, tests unitaires, génération du cache et `git diff --check` effectués.

Commande reproductible avec les navigateurs Playwright habituels :

```sh
npm ci
npx playwright install --with-deps chromium webkit
node --test tests/*.test.cjs
LOCAL_TEST_SERVER=1 BASE_URL=http://127.0.0.1:8765/ npx playwright test tests/e2e/validated-corrections.spec.js tests/e2e/public-smoke.spec.js
```

Pour l’environnement de cette session, le téléchargement standard des navigateurs Playwright n’a pas fourni d’archive exploitable. Chromium a été fourni par le paquet npm `@sparticuz/chromium`, installé séparément des dépendances du projet. `PLAYWRIGHT_CHROMIUM_EXECUTABLE` permet de sélectionner cet exécutable. Aucune dépendance de navigateur de production n’a été ajoutée à l’application.

## Blocages et limites

1. **Écriture GitHub refusée** : les tentatives de création d’arbre et de branche renvoient HTTP 403, `Resource not accessible by integration`. Le push Git direct ne dispose pas d’identifiants. Contournement autorisé par l’utilisateur : transfert par l’interface GitHub connectée. Les fichiers sont enregistrés sur la branche dédiée ; aucune fusion dans main ni publication Pages à ce stade. Les commits distants sont distincts des commits locaux (transfert par lots).
2. **Apps Script non connecté** : le navigateur disponible n’a pas de session Google permettant d’ouvrir et mettre à jour le projet. Les changements `.gs` sont préparés mais non installés sur le serveur.
3. Restent à effectuer après connexion Google : vérification du projet Apps Script réel, publication coordonnée serveur/frontend, authentification avec les codes existants, photos et synchronisation réelles, génération et contrôle du PDF réel, puis contrôle mobile du site publié.
4. WebKit/iPhone non exécuté ici. La caméra physique, le partage natif d’un téléphone et le logiciel de messagerie réel restent à vérifier sur appareil. Le test PDF ne valide que le parcours de l’interface avec une réponse simulée, pas le document produit par Google.

## Adresse

Application existante, inchangée par cette intervention :
https://runner-fb.github.io/beauregard-vehicules/

Il n’y a pas encore d’adresse correspondant à une nouvelle version déployée.

## Avancement du 19 octobre

Commits distants déjà vérifiés : `0e5ff6d` (configuration), `2bea465` (serveur), `faae5c3` (styles et cache), `67838ca` (parcours), `c376679` (tests unitaires). Les fichiers applicatifs distants ont été comparés aux fichiers locaux testés : aucune différence. Les tests Playwright et le workflow de recette sont transférés séparément. Leur résultat GitHub sera vérifié après exécution.
