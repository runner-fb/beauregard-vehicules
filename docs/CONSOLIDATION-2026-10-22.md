# Consolidation Beauregard Véhicules — 22 octobre 2026

## Portée et niveau de preuve

Corrections préparées et enregistrées sur une branche séparée. La présence du code et les contrôles ciblés ne prouvent pas le fonctionnement intégral en production. Aucun test de navigation Playwright, aucune recette métier complète, aucune donnée réelle modifiée, aucun déploiement et aucune fusion dans main.

## Références

- Dépôt : https://github.com/runner-fb/beauregard-vehicules
- Branche livrée : `fix/consolidation-finale-20261022`
- Dernier commit de code vérifié : `983f1682a170814d3f9b1e1e569c31312a2046f9`
- main préservée : `300ba6d2e28d71cf011e7ceed381cbf6b480de02`
- PR n°2 examinée et corrigée sur la branche séparée : `ba9a2a022ffd0a0814c459eb123485b771b075a0`. Aucune fusion de PR effectuée. main est ancêtre de la consolidation : aucune modification de main absente par divergence.
- Référence d’audit : `Audit_Beauregard_Vehicules_2026-10-22.md`, 97 exigences. Les statuts Drive ci-dessous reprennent les comparaisons de cet audit, sans nouvelle modification de Drive.
- Projet Apps Script indiqué : `1P_DwZIa12mPFz0Pz8eZ6vHtGxmwjSupVVsvRxBCqTpEDnqnAaCunzcxV`. L’éditeur redirige vers la page publique : contenu enregistré, version et déploiement actifs non vérifiés. Aucun enregistrement ni redéploiement effectué.
- Dossiers Drive de référence : `1-Hb8eAkTPF3IQJNpNH0n54e54gxHUmAC` et corrections `1qKzJ56FgbS1gquETQd-jeew2fvKWooNp` ; inchangés.

## E01 à E15

| Écart | État du code livré | Preuve / fichiers | Correction et limites |
|---|---|---|---|
| E01 — Droits collectifs | Corrigé et enregistré ; recette non effectuée | Auth.gs:session_; Store.gs:editionAccess_/record_; Api.gs:list | Rôle valide et session nommée ; édition active partagée entre contrôleurs, archives administrateur en lecture seule. Aucun verrouillage par créateur. |
| E02 — Données locales | Corrigé et enregistré ; recette non effectuée | transport.js:Auth.current/allows ; app.js:home/list/render ; photos.js:show/capture | Accès local conditionné à une session autorisée ; vérification après réponses asynchrones ; écran masqué à expiration. Brouillons conservés. Protection applicative, pas chiffrement contre un accès physique aux outils du navigateur. |
| E03 — Révisions | Corrigé et enregistré ; recette non effectuée | Records.gs:deleteDraft_ | Révision entière obligatoire et égalité exigée pour supprimer un dossier existant ; signatures et clôture protégées. |
| E04 — Suppressions | Corrigé et enregistré ; recette non effectuée | Api.gs:reconcile ; sync.js | Tombstones conservés ; réconciliation des copies locales propres et sales, par lots de 100. Un identifiant inconnu ne suffit pas à déclarer une suppression. |
| E05 — Immatriculation | Corrigé et enregistré ; recette non effectuée | Records.gs:dataShape_/create_/save_/ready_ ; Model.validate ; app.js | Format AA123BB pour nouveaux dossiers ; plaque historique inchangée acceptée seulement sur la base des données serveur existantes. |
| E06 — Progression | Corrigé et enregistré ; recette non effectuée | Model.progress ; app.js:goSignatures/mutate | Progression par quatre étapes validées et récapitulatif consulté ; 100 % uniquement à l’état final. Modèle frontend/backend identique. |
| E07 — Hors ligne | Corrigé et enregistré ; recette non effectuée | app.js:list/importRecord/return ; transport.js | Messages de couverture du cache ; reprise des dossiers disponibles et du départ finalisé en cache avec session valide. Ni photos jamais téléchargées ni dossiers absents du cache ne sont promis disponibles. |
| E08 — Retours et annulations | Corrigé et enregistré ; recette non effectuée | Records.gs:create_ ; app.js:makeLocal/return/cancelDuplicate ; sync.js | Réutilisation du retour local ; operation de création idempotente ; choix explicite face à un autre contrôle ; mode parallèle conservé. Nouveau UUID après suppression, candidat annulé masqué et conservé pour récupération. |
| E09 — Photographies | Corrigé et enregistré ; recette non effectuée | photos.js:discardLocal/capture ; app.js ; sync.js | Nettoyage limité aux captures locales non distantes et sans référence dans les dossiers ; annulation caméra/session ; références métier et photographies initiales protégées. |
| E10 — Codes | Corrigé et enregistré ; recette non effectuée | app.js:login/toggleCode | Un seul bouton afficher/masquer ; suppression du deuxième bouton et de son action. |
| E11 — Contestations | Corrigé et enregistré ; recette non effectuée | Model.contestRelevant ; app.js ; Records.gs:save_ | Retour avec nouveau dommage, aggravation ou présence antérieure déclarée ; contrôle partagé frontend/backend. Contestations historiques inchangées préservées. |
| E12 — Marqueurs | Corrigé et enregistré ; recette non effectuée | Pdf.gs:annotated_ ; modèle et maps.js préservés | Croix dans les illustrations PDF ; rouge pour nouveau dommage, noir pour dommage initial. Numéros conservés dans les données et détails. PDF historiques conservés, pas régénérés. |
| E13 — Clôture | Corrigé et enregistré ; recette non effectuée | app.js:render/summary | Récapitulatif détaillé, photos et signatures consultables sur l’écran final en lecture seule ; contrôles serveur de verrouillage préservés. |
| E14 — Libellés | Corrigé et enregistré ; recette non effectuée | app.js | Retrait des mentions facultative inutiles ; terminologie contrôleur et Prendre une photo conservée. Aucun changement arbitraire des règles facultatives de signature/évolution. |
| E15 — PDF et Google Slides | Partiellement corrigé — configuration active non vérifiée | Pdf.gs:annotated_/génération ; configuration Google non accessible | Erreurs Slides distinguées, URL miniature et réponse HTTP contrôlées, identifiants de dossiers exigés. Activation API, permissions et génération réelle restent non vérifiées. |

## Matrice exhaustive A à K

« Conforme » ci-dessous signifie conformité statique du code examiné, jamais validation fonctionnelle. Les contraintes visuelles, services actifs et comportements nécessitant une recette restent partiels ou non vérifiables. Source Drive, Apps Script et déploiement non accessibles ne sont pas assimilés au contenu GitHub.

| Exigence demandée | Drive source | Drive corrections (audit) | GitHub consolidé — statique | Preuve / réserve | Apps Script actif | Déployée | Vérifiée en fonctionnement |
|---|---|---|---|---|---|---|---|
| A1 Séparation administrateur / contrôleur — Oui | Non vérifiable | Partiellement conforme | Conforme | E01 : Auth.gs:session_; Store.gs:editionAccess_/record_; Api.gs:list. Rôle valide et session nommée ; édition active partagée entre contrôleurs, archives administrateur en lecture seule. Aucun verrouillage par créateur. | Non vérifiable | Non vérifiable | Non effectuée |
| A2 Gestion et affichage des codes d’accès — Oui | Non vérifiable | Partiellement conforme | Partiellement conforme | Gestion des codes conservée ; valeurs et paramètres du projet actif non accessibles. | Non vérifiable | Non vérifiable | Non effectuée |
| A3 Afficher / masquer le code — Oui | Non vérifiable | Conforme | Conforme | E10 : app.js:login/toggleCode. Un seul bouton afficher/masquer ; suppression du deuxième bouton et de son action. | Non vérifiable | Non vérifiable | Non effectuée |
| A4 Autorisations côté serveur — Oui | Non vérifiable | Partiellement conforme | Conforme | E01 : Auth.gs:session_; Store.gs:editionAccess_/record_; Api.gs:list. Rôle valide et session nommée ; édition active partagée entre contrôleurs, archives administrateur en lecture seule. Aucun verrouillage par créateur. | Non vérifiable | Non vérifiable | Non effectuée |
| A5 Filtrage des dossiers selon les droits — Oui | Non vérifiable | Partiellement conforme | Conforme | E01 : Auth.gs:session_; Store.gs:editionAccess_/record_; Api.gs:list. Rôle valide et session nommée ; édition active partagée entre contrôleurs, archives administrateur en lecture seule. Aucun verrouillage par créateur. | Non vérifiable | Non vérifiable | Non effectuée |
| A6 Propriété dans record_() — Oui | Non vérifiable | Absente | Conforme | Exigence précisée par la mission finale : autorisation collective par édition dans record_, pas de propriété exclusive par créateur (E01). | Non vérifiable | Non vérifiable | Non effectuée |
| A7 Protection des dossiers signés et clôturés — Oui | Non vérifiable | Conforme | Conforme | Records.gs:save_, deleteDraft_, sign_, finalize_ ; gardes d’état présentes | Non vérifiable | Non vérifiable | Non effectuée |
| A8 Suppression des anciens textes et slogans — Oui | Non vérifiable | Non vérifiable | Non vérifiable | Liste exacte des slogans historiques non disponible ; pas de validation globale inventée | Non vérifiable | Non vérifiable | Non effectuée |
| A9 Terminologie contrôleur — Oui | Non vérifiable | Conforme | Conforme | Libellés du frontend et métadonnées de dossier examinés | Non vérifiable | Non vérifiable | Non effectuée |
| A10 Tutoiement — Oui | Non vérifiable | Partiellement conforme | Partiellement conforme | Textes locaux harmonisés ; exhaustivité des erreurs distantes et anciens slogans non établie. | Non vérifiable | Non vérifiable | Non effectuée |
| B1 Accueil compact et téléphone — Oui | Non vérifiable | Partiellement conforme | Partiellement conforme | app.js:home et style.css ; adaptation présente, rendu réel non vérifié | Non vérifiable | Non vérifiable | Non effectuée |
| B2 Création avec confirmation — Oui | Non vérifiable | Conforme | Conforme | app.js : formulaire et confirmation avant création | Non vérifiable | Non vérifiable | Non effectuée |
| B3 Reprise des dossiers en cours — Oui | Non vérifiable | Partiellement conforme | Conforme | E02 : transport.js:Auth.current/allows ; app.js:home/list/render ; photos.js:show/capture. Accès local conditionné à une session autorisée ; vérification après réponses asynchrones ; écran masqué à expiration. Brouillons conservés. Protection applicative, pas chiffrement contre un accès physique aux outils du navigateur. | Non vérifiable | Non vérifiable | Non effectuée |
| B4 Sauvegarde des brouillons — Oui | Non vérifiable | Partiellement conforme | Conforme | storage.js et app.js : IndexedDB et chaîne de sauvegarde ; livraison partielle | Non vérifiable | Non vérifiable | Non effectuée |
| B5 Suppression définitive des brouillons — Oui | Non vérifiable | Partiellement conforme | Conforme | E03 : Records.gs:deleteDraft_. Révision entière obligatoire et égalité exigée pour supprimer un dossier existant ; signatures et clôture protégées. | Non vérifiable | Non vérifiable | Non effectuée |
| B6 Aucune réapparition après synchronisation — Oui | Non vérifiable | Partiellement conforme | Conforme | E04 : Api.gs:reconcile ; sync.js. Tombstones conservés ; réconciliation des copies locales propres et sales, par lots de 100. Un identifiant inconnu ne suffit pas à déclarer une suppression. | Non vérifiable | Non vérifiable | Non effectuée |
| B7 Absence de doublons — Oui | Non vérifiable | Partiellement conforme | Conforme | E08 : Records.gs:create_ ; app.js:makeLocal/return/cancelDuplicate ; sync.js. Réutilisation du retour local ; operation de création idempotente ; choix explicite face à un autre contrôle ; mode parallèle conservé. Nouveau UUID après suppression, candidat annulé masqué et conservé pour récupération. | Non vérifiable | Non vérifiable | Non effectuée |
| B8 Interdiction de supprimer un état signé / clôturé — Oui | Non vérifiable | Conforme | Conforme | deleteDraft_ : état draft et aucune décision de signature exigés | Non vérifiable | Non vérifiable | Non effectuée |
| B9 Annulations correctes — Oui | Non vérifiable | Partiellement conforme | Conforme | E08 : Records.gs:create_ ; app.js:makeLocal/return/cancelDuplicate ; sync.js. Réutilisation du retour local ; operation de création idempotente ; choix explicite face à un autre contrôle ; mode parallèle conservé. Nouveau UUID après suppression, candidat annulé masqué et conservé pour récupération. | Non vérifiable | Non vérifiable | Non effectuée |
| C1 Immatriculation obligatoire AA123BB — Oui | Non vérifiable | Partiellement conforme | Conforme | E05 : Records.gs:dataShape_/create_/save_/ready_ ; Model.validate ; app.js. Format AA123BB pour nouveaux dossiers ; plaque historique inchangée acceptée seulement sur la base des données serveur existantes. | Non vérifiable | Non vérifiable | Non effectuée |
| C2 Marque, modèle, couleur et type — Oui | Non vérifiable | Partiellement conforme | Conforme | Model.validate, dataShape_ et formulaire ; validation métier répartie dans fichiers non livrés | Non vérifiable | Non vérifiable | Non effectuée |
| C3 Voiture, 9 places, utilitaire — Oui | Non vérifiable | Partiellement conforme | Conforme | Model.types et sélection de type ; ressources correspondantes | Non vérifiable | Non vérifiable | Non effectuée |
| C4 Photo compteur obligatoire — Oui | Non vérifiable | Partiellement conforme | Conforme | Model.validate, Model.photos et ready_ ; présence exigée avant validation | Non vérifiable | Non vérifiable | Non effectuée |
| C5 Photo jauge obligatoire — Oui | Non vérifiable | Partiellement conforme | Conforme | Model.validate et ready_ ; même chaîne de contrôle | Non vérifiable | Non vérifiable | Non effectuée |
| C6 Niveau de carburant — Oui | Non vérifiable | Partiellement conforme | Conforme | Model.fuels, formulaire et récapitulatif | Non vérifiable | Non vérifiable | Non effectuée |
| C7 Remplacement correct des photographies — Oui | Non vérifiable | Partiellement conforme | Conforme | E09 : photos.js:discardLocal/capture ; app.js ; sync.js. Nettoyage limité aux captures locales non distantes et sans référence dans les dossiers ; annulation caméra/session ; références métier et photographies initiales protégées. | Non vérifiable | Non vérifiable | Non effectuée |
| C8 Messages d’erreur explicites — Oui | Non vérifiable | Partiellement conforme | Partiellement conforme | E15 : Pdf.gs:annotated_/génération ; configuration Google non accessible. Erreurs Slides distinguées, URL miniature et réponse HTTP contrôlées, identifiants de dossiers exigés. Activation API, permissions et génération réelle restent non vérifiées. | Non vérifiable | Non vérifiable | Non effectuée |
| D1 Ordre Avant → Droite → Arrière → Gauche — Oui | Non vérifiable | Conforme | Conforme | Navigation des vues et modèle examinés ; ordre conservé dans la consolidation | Non vérifiable | Non vérifiable | Non effectuée |
| D2 Visuels adaptés au véhicule — Oui | Non vérifiable | Non vérifiable | Conforme | maps.js et SVG ; quinze PNG PDF identifiés, non livrés dans le paquet de corrections | Non vérifiable | Non vérifiable | Non effectuée |
| D3 Navigation face par face — Oui | Non vérifiable | Conforme | Conforme | app.js : étape extérieure et commandes de vue | Non vérifiable | Non vérifiable | Non effectuée |
| D4 Zoom et déplacement — Oui | Non vérifiable | Non vérifiable | Conforme | maps.js : mécanismes présents ; gestes mobiles non exécutés | Non vérifiable | Non vérifiable | Non effectuée |
| D5 Placement des dommages — Oui | Non vérifiable | Partiellement conforme | Conforme | maps.js, formulaire dommage et coordonnées normalisées backend | Non vérifiable | Non vérifiable | Non effectuée |
| D6 Croix rouges à la place des numéros sur véhicule — Oui | Non vérifiable | Partiellement conforme | Conforme | E12 : Pdf.gs:annotated_ ; modèle et maps.js préservés. Croix dans les illustrations PDF ; rouge pour nouveau dommage, noir pour dommage initial. Numéros conservés dans les données et détails. PDF historiques conservés, pas régénérés. | Non vérifiable | Non vérifiable | Non effectuée |
| D7 Numéros conservés dans les données — Oui | Non vérifiable | Partiellement conforme | Conforme | Dommages number, allocation serveur et PDF ; pas de suppression des numéros | Non vérifiable | Non vérifiable | Non effectuée |
| D8 Catégories de dommages — Oui | Non vérifiable | Partiellement conforme | Conforme | Model.damageTypes et formulaire dommage | Non vérifiable | Non vérifiable | Non effectuée |
| D9 Photographies multiples — Oui | Non vérifiable | Partiellement conforme | Conforme | Dommage photos[], capture et contrôle serveur de la collection | Non vérifiable | Non vérifiable | Non effectuée |
| D10 Remarques extérieures — Oui | Non vérifiable | Partiellement conforme | Conforme | Commentaire dommage et remarques de vue persistés | Non vérifiable | Non vérifiable | Non effectuée |
| D11 Restitution extérieure au récapitulatif — Oui | Non vérifiable | Partiellement conforme | Conforme | app.js : vues, dommages, commentaires et emplacements photo ; chargement réel non vérifié | Non vérifiable | Non vérifiable | Non effectuée |
| E1 Visuels intérieurs — Oui | Non vérifiable | Non vérifiable | Conforme | Ressources interieur par type et maps.js | Non vérifiable | Non vérifiable | Non effectuée |
| E2 Navigation intérieure cohérente — Oui | Non vérifiable | Conforme | Conforme | Étape intérieure distincte dans app.js | Non vérifiable | Non vérifiable | Non effectuée |
| E3 Placement des constatations intérieures — Oui | Non vérifiable | Partiellement conforme | Conforme | Même modèle coordonnées / dommages avec view=interieur | Non vérifiable | Non vérifiable | Non effectuée |
| E4 Photos et remarques intérieures — Oui | Non vérifiable | Partiellement conforme | Conforme | Collections de photos et commentaires dans le même modèle | Non vérifiable | Non vérifiable | Non effectuée |
| E5 Enregistrement et reprise intérieure — Oui | Non vérifiable | Partiellement conforme | Conforme | Storage, modèle et sauvegarde communs ; non exécuté | Non vérifiable | Non vérifiable | Non effectuée |
| E6 Intérieur au récapitulatif — Oui | Non vérifiable | Partiellement conforme | Conforme | Vue intérieure incluse dans la restitution | Non vérifiable | Non vérifiable | Non effectuée |
| F1 Réutilisation de l’état initial — Oui | Non vérifiable | Partiellement conforme | Conforme | Records.gs:create_ et Model.newData ; initialId et valeurs initiales | Non vérifiable | Non vérifiable | Non effectuée |
| F2 Comparaison des dommages — Oui | Non vérifiable | Partiellement conforme | Conforme | Dommages initiaux conservés et évolution distincte | Non vérifiable | Non vérifiable | Non effectuée |
| F3 Statuts inchangé / aggravé / réparé — Oui | Non vérifiable | Partiellement conforme | Conforme | Trois statuts présents. Évolution vide historiquement facultative conservée ; aucune obligation supplémentaire inventée. | Non vérifiable | Non vérifiable | Non effectuée |
| F4 Ajout de nouveaux dommages au retour — Oui | Non vérifiable | Partiellement conforme | Conforme | Modèle distingue nouveaux dommages et éléments initiaux | Non vérifiable | Non vérifiable | Non effectuée |
| F5 Conservation des photographies initiales — Oui | Non vérifiable | Partiellement conforme | Conforme | InitialId, initial photos et contrôle ready_ des références | Non vérifiable | Non vérifiable | Non effectuée |
| F6 Gestion de l’antériorité — Oui | Non vérifiable | Partiellement conforme | Conforme | Métadonnées et restitution initial / retour présentes | Non vérifiable | Non vérifiable | Non effectuée |
| F7 Contestation seulement pertinente — Oui | Non vérifiable | Partiellement conforme | Conforme | E11 : Model.contestRelevant ; app.js ; Records.gs:save_. Retour avec nouveau dommage, aggravation ou présence antérieure déclarée ; contrôle partagé frontend/backend. Contestations historiques inchangées préservées. | Non vérifiable | Non vérifiable | Non effectuée |
| F8 Impossible de créer un second retour par erreur — Oui | Non vérifiable | Partiellement conforme | Conforme | E08 : Records.gs:create_ ; app.js:makeLocal/return/cancelDuplicate ; sync.js. Réutilisation du retour local ; operation de création idempotente ; choix explicite face à un autre contrôle ; mode parallèle conservé. Nouveau UUID après suppression, candidat annulé masqué et conservé pour récupération. | Non vérifiable | Non vérifiable | Non effectuée |
| F9 Message Aucun dossier hors ligne corrigé — Oui | Non vérifiable | Absente | Conforme | E07 : app.js:list/importRecord/return ; transport.js. Messages de couverture du cache ; reprise des dossiers disponibles et du départ finalisé en cache avec session valide. Ni photos jamais téléchargées ni dossiers absents du cache ne sont promis disponibles. | Non vérifiable | Non vérifiable | Non effectuée |
| F10 Aucun brouillon parasite après annulation — Oui | Non vérifiable | Partiellement conforme | Conforme | E08 : Records.gs:create_ ; app.js:makeLocal/return/cancelDuplicate ; sync.js. Réutilisation du retour local ; operation de création idempotente ; choix explicite face à un autre contrôle ; mode parallèle conservé. Nouveau UUID après suppression, candidat annulé masqué et conservé pour récupération. | Non vérifiable | Non vérifiable | Non effectuée |
| F11 Bouton Réaliser le retour cohérent — Oui | Non vérifiable | Partiellement conforme | Conforme | E07 : app.js:list/importRecord/return ; transport.js. Messages de couverture du cache ; reprise des dossiers disponibles et du départ finalisé en cache avec session valide. Ni photos jamais téléchargées ni dossiers absents du cache ne sont promis disponibles. | Non vérifiable | Non vérifiable | Non effectuée |
| G1 Récapitulatif complet avant validation — Oui | Non vérifiable | Partiellement conforme | Conforme | app.js : véhicule, vues, dommages, photos et décisions ; preuve statique | Non vérifiable | Non vérifiable | Non effectuée |
| G2 Toutes vues et photos au récapitulatif — Oui | Non vérifiable | Partiellement conforme | Partiellement conforme | Toutes les vues et références photos rendues ; disponibilité réelle des fichiers distants à vérifier. | Non vérifiable | Non vérifiable | Non effectuée |
| G3 Informations obligatoires identifiées — Oui | Non vérifiable | Partiellement conforme | Conforme | E05 : Records.gs:dataShape_/create_/save_/ready_ ; Model.validate ; app.js. Format AA123BB pour nouveaux dossiers ; plaque historique inchangée acceptée seulement sur la base des données serveur existantes. | Non vérifiable | Non vérifiable | Non effectuée |
| G4 Messages de validation compréhensibles — Oui | Non vérifiable | Partiellement conforme | Partiellement conforme | E15 : Pdf.gs:annotated_/génération ; configuration Google non accessible. Erreurs Slides distinguées, URL miniature et réponse HTTP contrôlées, identifiants de dossiers exigés. Activation API, permissions et génération réelle restent non vérifiées. | Non vérifiable | Non vérifiable | Non effectuée |
| G5 Progression basée sur étapes terminées — Oui | Non vérifiable | Non vérifiable | Conforme | E06 : Model.progress ; app.js:goSignatures/mutate. Progression par quatre étapes validées et récapitulatif consulté ; 100 % uniquement à l’état final. Modèle frontend/backend identique. | Non vérifiable | Non vérifiable | Non effectuée |
| G6 Pas de 100 % prématuré — Oui | Non vérifiable | Non vérifiable | Conforme | E06 : Model.progress ; app.js:goSignatures/mutate. Progression par quatre étapes validées et récapitulatif consulté ; 100 % uniquement à l’état final. Modèle frontend/backend identique. | Non vérifiable | Non vérifiable | Non effectuée |
| G7 Navigation retour sans perte — Oui | Non vérifiable | Partiellement conforme | Partiellement conforme | Chaîne de sauvegarde attendue et erreurs propagées ; absence de perte en navigation à confirmer sur appareil. | Non vérifiable | Non vérifiable | Non effectuée |
| H1 Signatures distinctes — Oui | Non vérifiable | Partiellement conforme | Conforme | Deux parties loueur / locataire, identité signataire et journal enrichi dans PR | Non vérifiable | Non vérifiable | Non effectuée |
| H2 Signatures facultatives cohérentes — Oui | Non vérifiable | Partiellement conforme | Conforme | Décision motivée d’absence ; deux décisions obligatoires pour finaliser | Non vérifiable | Non vérifiable | Non effectuée |
| H3 Verrouillage des états signés — Oui | Non vérifiable | Conforme | Conforme | sign_ passe à locked après image, save_/Photos contrôlent l’état | Non vérifiable | Non vérifiable | Non effectuée |
| H4 Clôture correcte — Oui | Non vérifiable | Conforme | Conforme | finalize_ appelle ready_, exige les deux décisions et devient final | Non vérifiable | Non vérifiable | Non effectuée |
| H5 Écran final compréhensible — Oui | Non vérifiable | Partiellement conforme | Conforme | E13 : app.js:render/summary. Récapitulatif détaillé, photos et signatures consultables sur l’écran final en lecture seule ; contrôles serveur de verrouillage préservés. | Non vérifiable | Non vérifiable | Non effectuée |
| H6 Boutons adaptés au statut — Oui | Non vérifiable | Partiellement conforme | Conforme | E13 : app.js:render/summary. Récapitulatif détaillé, photos et signatures consultables sur l’écran final en lecture seule ; contrôles serveur de verrouillage préservés. | Non vérifiable | Non vérifiable | Non effectuée |
| H7 Pas de retour inexpliqué au récapitulatif — Oui | Non vérifiable | Non vérifiable | Non vérifiable | Aucun scénario de navigation exécuté ; transitions asynchrones non certifiées | Non vérifiable | Non vérifiable | Non effectuée |
| I1 Génération effective du PDF — Oui | Non vérifiable | Non vérifiable | Partiellement conforme | E15 : Pdf.gs:annotated_/génération ; configuration Google non accessible. Erreurs Slides distinguées, URL miniature et réponse HTTP contrôlées, identifiants de dossiers exigés. Activation API, permissions et génération réelle restent non vérifiées. | Non vérifiable | Non vérifiable | Non effectuée |
| I2 Problème Google Slides API résolu — Oui | Non vérifiable | Non vérifiable | Partiellement conforme | E15 : Pdf.gs:annotated_/génération ; configuration Google non accessible. Erreurs Slides distinguées, URL miniature et réponse HTTP contrôlées, identifiants de dossiers exigés. Activation API, permissions et génération réelle restent non vérifiées. | Non vérifiable | Non vérifiable | Non effectuée |
| I3 A4 multipages — Oui | Non vérifiable | Non vérifiable | Conforme | Pdf.gs : dimensions et sauts de page explicites | Non vérifiable | Non vérifiable | Non effectuée |
| I4 Informations complètes du véhicule au PDF — Oui | Non vérifiable | Non vérifiable | Conforme | Pdf.gs : identification et mesures ; rendu réel non exécuté | Non vérifiable | Non vérifiable | Non effectuée |
| I5 Photos et dommages au PDF — Oui | Non vérifiable | Non vérifiable | Partiellement conforme | E15 : Pdf.gs:annotated_/génération ; configuration Google non accessible. Erreurs Slides distinguées, URL miniature et réponse HTTP contrôlées, identifiants de dossiers exigés. Activation API, permissions et génération réelle restent non vérifiées. | Non vérifiable | Non vérifiable | Non effectuée |
| I6 Signatures disponibles au PDF — Oui | Non vérifiable | Non vérifiable | Conforme | Insertion conditionnelle des images / motifs d’absence dans Pdf.gs | Non vérifiable | Non vérifiable | Non effectuée |
| I7 Cohérence prise en charge / retour au PDF — Oui | Non vérifiable | Non vérifiable | Conforme | InitialId et valeurs initiales exploités ; contrôle statique uniquement | Non vérifiable | Non vérifiable | Non effectuée |
| I8 Classement PDF sur Drive — Oui | Non vérifiable | Partiellement conforme | Partiellement conforme | Classement édition/véhicule préservé dans Store.gs ; identifiants et droits réels non vérifiés. | Non vérifiable | Non vérifiable | Non effectuée |
| J1 IndexedDB — Oui | Non vérifiable | Non vérifiable | Conforme | storage.js : bases et transactions ; module non livré dans corrections | Non vérifiable | Non vérifiable | Non effectuée |
| J2 Sauvegarde locale — Oui | Non vérifiable | Partiellement conforme | Conforme | Storage et chaîne de sauvegarde de app.js | Non vérifiable | Non vérifiable | Non effectuée |
| J3 Reprise hors ligne — Oui | Non vérifiable | Partiellement conforme | Conforme | E07 : app.js:list/importRecord/return ; transport.js. Messages de couverture du cache ; reprise des dossiers disponibles et du départ finalisé en cache avec session valide. Ni photos jamais téléchargées ni dossiers absents du cache ne sont promis disponibles. | Non vérifiable | Non vérifiable | Non effectuée |
| J4 Synchronisation différée — Oui | Non vérifiable | Conforme | Conforme | sync.js : dirty, reprise et suivi generation | Non vérifiable | Non vérifiable | Non effectuée |
| J5 Prévention des doublons de synchronisation — Oui | Non vérifiable | Partiellement conforme | Conforme | E08 : Records.gs:create_ ; app.js:makeLocal/return/cancelDuplicate ; sync.js. Réutilisation du retour local ; operation de création idempotente ; choix explicite face à un autre contrôle ; mode parallèle conservé. Nouveau UUID après suppression, candidat annulé masqué et conservé pour récupération. | Non vérifiable | Non vérifiable | Non effectuée |
| J6 Gestion des conflits — Oui | Non vérifiable | Partiellement conforme | Conforme | E03 : Records.gs:deleteDraft_. Révision entière obligatoire et égalité exigée pour supprimer un dossier existant ; signatures et clôture protégées. | Non vérifiable | Non vérifiable | Non effectuée |
| J7 Contrôles simultanés — Oui | Non vérifiable | Partiellement conforme | Partiellement conforme | Mode parallèle conservé ; reprise idempotente et garde de finalisation. Concurrence réelle non exécutée. | Non vérifiable | Non vérifiable | Non effectuée |
| J8 Transport API fonctionnel — Oui | Non vérifiable | Non vérifiable | Non vérifiable | transport.js / Bridge.gs lus ; échange réel non exécuté | Non vérifiable | Non vérifiable | Non effectuée |
| J9 Cohérence frontend / backend — Oui | Non vérifiable | Partiellement conforme | Partiellement conforme | Modèles locaux identiques et nouvelle route reconcile alignée ; backend actif non comparé directement. | Non vérifiable | Non vérifiable | Non effectuée |
| J10 Opérations interdites bloquées hors ligne — Oui | Non vérifiable | Partiellement conforme | Conforme | E02 : transport.js:Auth.current/allows ; app.js:home/list/render ; photos.js:show/capture. Accès local conditionné à une session autorisée ; vérification après réponses asynchrones ; écran masqué à expiration. Brouillons conservés. Protection applicative, pas chiffrement contre un accès physique aux outils du navigateur. | Non vérifiable | Non vérifiable | Non effectuée |
| J11 Service Worker / versions — Oui | Non vérifiable | Partiellement conforme | Partiellement conforme | Cache recalculé sur 31 ressources existantes ; activation sans forcer les inspections ouvertes. Mise à jour installée à vérifier. | Non vérifiable | Non vérifiable | Non effectuée |
| K1 Mobile-first — Oui | Non vérifiable | Partiellement conforme | Partiellement conforme | CSS responsive et grilles présents ; aucune vérification visuelle mobile | Non vérifiable | Non vérifiable | Non effectuée |
| K2 Espacements et boutons — Oui | Non vérifiable | Partiellement conforme | Partiellement conforme | CSS inspecté ; taille et absence de chevauchement non validées en rendu | Non vérifiable | Non vérifiable | Non effectuée |
| K3 Formulaires compacts — Oui | Non vérifiable | Partiellement conforme | Partiellement conforme | Classes et structure présentes ; appréciation visuelle non vérifiée | Non vérifiable | Non vérifiable | Non effectuée |
| K4 Libellé Prendre une photo — Oui | Non vérifiable | Conforme | Conforme | Libellés et appels de capture dans app.js | Non vérifiable | Non vérifiable | Non effectuée |
| K5 Mentions facultative inutiles retirées — Oui | Non vérifiable | Partiellement conforme | Conforme | E14 : app.js. Retrait des mentions facultative inutiles ; terminologie contrôleur et Prendre une photo conservée. Aucun changement arbitraire des règles facultatives de signature/évolution. | Non vérifiable | Non vérifiable | Non effectuée |
| K6 Indicateurs de chargement — Oui | Non vérifiable | Conforme | Conforme | Chargement des listes, état de synchronisation, boutons occupés | Non vérifiable | Non vérifiable | Non effectuée |
| K7 Charte graphique Beauregard — Oui | Non vérifiable | Partiellement conforme | Partiellement conforme | Style récent et couleurs préservés par fusion ; rendu non validé | Non vérifiable | Non vérifiable | Non effectuée |
| K8 Navigation sans blocage — Oui | Non vérifiable | Non vérifiable | Non vérifiable | Aucun parcours exécuté ; dépendances réseau identifiées E07 | Non vérifiable | Non vérifiable | Non effectuée |
| K9 Absence de défilement inutile — Oui | Non vérifiable | Non vérifiable | Non vérifiable | Impossible à certifier par lecture CSS seule | Non vérifiable | Non vérifiable | Non effectuée |

## Fichiers livrés

Différence complète par rapport à main (y compris les éléments utiles de la PR n°2 conservés) :

- `backend/Api.gs`
- `backend/Auth.gs`
- `backend/Model.gs`
- `backend/Pdf.gs`
- `backend/Records.gs`
- `backend/Store.gs`
- `frontend/index.html`
- `frontend/js/app.js`
- `frontend/js/model.js`
- `frontend/js/photos.js`
- `frontend/js/sync.js`
- `frontend/js/transport.js`
- `frontend/style.css`
- `frontend/sw.js`
- `tests/backend.test.cjs`
- `tests/consolidation.test.cjs`
- `tests/sync.test.cjs`

Les fichiers backend sont livrés uniquement dans GitHub. Aucun remplacement automatique des sources Apps Script actives. Ne pas déployer isolément ce frontend : la réconciliation dépend de la nouvelle route backend `reconcile`. Comparer et préparer ensemble les deux versions avant toute autorisation de déploiement.

## Commits distants vérifiés

- [6e03f6e](https://github.com/runner-fb/beauregard-vehicules/commit/6e03f6e055f5f6b4b70d93f10f485008f77bdd27) — fix: droits collectifs et revisions obligatoires des suppressions
- [ea629cf](https://github.com/runner-fb/beauregard-vehicules/commit/ea629cfa97197a8392066d4a4776a02b57fcebbf) — fix: sessions locales et reconciliation des brouillons supprimes
- [6b568dd](https://github.com/runner-fb/beauregard-vehicules/commit/6b568dd27178b2404bfda7b5f75aded3770d7078) — fix: validation metier et preservation des plaques historiques
- [aae8a1c](https://github.com/runner-fb/beauregard-vehicules/commit/aae8a1ccc322a71ee21c908ebd643d79b3eef56a) — fix: parcours metier et reprise hors ligne
- [59978ae](https://github.com/runner-fb/beauregard-vehicules/commit/59978aed649f0a5a57e9cbc8afc410794cda1a74) — fix: photos temporaires et consultation des controles clotures
- [84eba35](https://github.com/runner-fb/beauregard-vehicules/commit/84eba357de8adddc79a1422e84189c5303a962a9) — fix: reprise sure des retours concurrents
- [39d19cd](https://github.com/runner-fb/beauregard-vehicules/commit/39d19cd34d7e73c2b0a8131695911d88ec04ef86) — test: regressions ciblees sans navigateur
- [6596f76](https://github.com/runner-fb/beauregard-vehicules/commit/6596f76d8bf5a62163832976277dc30afc80c07b) — fix: reperes PDF et erreurs Slides explicites
- [765496d](https://github.com/runner-fb/beauregard-vehicules/commit/765496d6897164743af79cc9e66f2fd0c98c94ac) — fix: reponses tardives et reprise apres suppression
- [2c939c8](https://github.com/runner-fb/beauregard-vehicules/commit/2c939c80c213a6e80c67153e1b3b6ca28da1f1a4) — test: synchronisation avec session et reconciliation
- [983f168](https://github.com/runner-fb/beauregard-vehicules/commit/983f1682a170814d3f9b1e1e569c31312a2046f9) — fix: actualisation du cache consolide

Les commits locaux et les commits créés par l’interface GitHub ont des SHA différents ; l’identité complète des arbres de fichiers a été vérifiée après téléchargement distant. Arbre du code livré : `2b17410dfd52f92012c90641bd12bcb5aaccbf07`.

## Contrôles effectués

- 7 tests ciblés de consolidation réussis : droits collectifs, révisions de suppression, retour idempotent/concurrent, plaques historiques et modèles identiques, progression, tombstone local, nettoyage photo sans perte de référence.
- 11 tests unitaires de synchronisation réussis avec session autorisée et route de réconciliation simulée.
- Contrôles syntaxiques JavaScript / Apps Script et différences Git sans erreur constatée.
- Cache PWA régénéré : 31 ressources ; fichier syntaxiquement valide.
- Aucun test fonctionnel navigateur, aucune génération PDF avec des données métier.

## Points restant à vérifier ou à décider

1. **E15 / priorité haute** : accès authentifié au projet Apps Script, versions/déploiement, activation Slides API et autorisations Drive. Le code d’erreur est amélioré ; résolution du service actif non prouvée.
2. **A8 / précision de référence** : liste exacte des anciens slogans à retirer non disponible ; aucune suppression textuelle supposée.
3. **Sécurité locale** : contrôle d’affichage et des actions en session autorisée, sans chiffrement de la base locale contre un utilisateur ayant accès aux outils de développement du même profil navigateur. Brouillons préservés ; tout durcissement physique doit prévoir leur migration.
4. **Hors ligne** : seuls les dossiers et photos effectivement disponibles localement peuvent être repris ; une session expirée doit être renouvelée en ligne.
5. **F3** : évolution facultative conservée conformément au comportement existant ; les trois statuts restent disponibles.
6. Les points visuels et la conformité fonctionnelle intégrale restent à valider lors de la recette autorisée. Aucun écart statique établi n’est présenté comme testé en fonctionnement.

## Recette fonctionnelle ultérieure proposée

1. Appareil partagé : connexion contrôleur/admin, expiration pendant chargement ou capture, déconnexion, reprise par collègue autorisé, archives.
2. Deux appareils : modification concurrente, suppression avec ancienne révision, tombstone après reconnexion et non-réapparition d’un brouillon propre.
3. Retour : initial en cache, reprise locale, doublon distant, choix parallèle légitime, annulation et recréation après suppression.
4. Identification : plaque stricte nouvelle, plaque historique conservée, photos compteur/jauge obligatoires, remplacement/annulation caméra.
5. Extérieur/intérieur : trois types de véhicules, ordre des faces, gestes tactiles, croix et numéros, photos multiples, antériorité et contestations.
6. Progression, récapitulatif, retour aux étapes, décisions de signature distinctes, verrouillage et consultation finale sans modification.
7. PDF sur dossier fictif autorisé : A4 multipages, toutes photos, signatures, croix et détails numérotés, classement Drive, permissions Slides.
8. Installation/mise à jour PWA et reconnexion sans perte des brouillons.

Aucune fusion, mise à jour Apps Script ou mise en production ne doit être effectuée sans l’accord demandé par la mission.
