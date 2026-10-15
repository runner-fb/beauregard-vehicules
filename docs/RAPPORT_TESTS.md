# Rapport de vérification — 14 octobre 2026

## Exécution locale

Commande : `node --test --test-reporter=tap tests/*.test.cjs`.

Résultat observé : **33 tests réussis, 0 échec**. La sortie exacte est conservée dans `tests/results.tap`.

Ces tests exécutent la logique métier, l’authentification et la synchronisation avec des services simulés. Ils couvrent les droits, les états verrouillés, les obligations de saisie, les retours, les contestations, les conflits et les interruptions de requêtes. Deux régressions supplémentaires vérifient la reprise des suppressions de photos interrompues et la conservation des longues valeurs Sheets sans interprétation de formule.

## Limites de ces résultats

Les 33 tests automatisés ne correspondent pas à la validation des 33 scénarios de recette utilisateur. Aucun essai complet n’a encore été exécuté sur le backend Google, dans un navigateur mobile ou sur un téléphone physique. Le pont Apps Script, la conversion PDF, Drive, la caméra, IndexedDB réel, le partage natif et la reprise hors ligne restent à vérifier.

## État du déploiement

Le Google Sheets métier existe avec les sept tables. Le dépôt indépendant existe. Le backend n’est pas installé ni déployé. L’adresse du backend est vide dans la configuration ; le workflow bloque une publication tant qu’elle manque.

La tentative d’accès à Google Sheets dans le navigateur de travail redirige vers la connexion Google, qui renvoie « 502 Bad Gateway — Connection refused », y compris après un rechargement. Le connecteur Drive fonctionne mais ne fournit pas d’action de création/déploiement Apps Script. Ce blocage ne démontre pas une panne du compte Google du propriétaire.

La recette détaillée demeure à exécuter dans `RECETTE.md`. L’application n’est pas déclarée prête à l’emploi.
