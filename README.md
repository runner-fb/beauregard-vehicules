# Beauregard Véhicules 2027

Application indépendante du projet Runner/Navettes. Frontend destiné à GitHub Pages ; backend Google Apps Script, base Google Sheets, photos et PDF privés dans Drive.

**État : développement et tests automatisés réalisés, recette Google/mobile non terminée. Ne pas utiliser de données réelles avant la recette.** L’URL Apps Script doit être configurée après installation ; ce dépôt ne constitue pas une attestation de mise en service.

## Organisation

- `frontend/` : PWA, formulaires, caméra, marqueurs, signatures, IndexedDB, synchronisation.
- `backend/` : Apps Script et pont HTML sécurisé, authentification, droits, records, photos, PDF et installation.
- `tests/` : tests exécutables métier/sécurité et synchronisation avec services Google simulés.
- `docs/` : installation, administration, guide contrôleur, sauvegarde/restauration, données et rapport de tests.
- `scripts/build-cache.cjs` : manifeste de cache versionné, à relancer après tout changement frontend.

## Vérifier localement

Node.js récent, sans dépendance :

```
node --test --test-reporter=tap tests/*.test.cjs
node scripts/build-cache.cjs
```

Les tests n’affirment pas avoir exercé Google Drive, la conversion PDF Google, une caméra, un véritable navigateur hors ligne ou un téléphone physique.

## Installer

Suis `docs/INSTALLATION.md`. Aucun code d’accès n’est fourni ou codé en dur. La procédure de changement d’édition avec dossiers ouverts n’est pas activée.
