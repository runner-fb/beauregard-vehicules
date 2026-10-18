# Playwright — Beauregard Véhicules 2027

## Installation
Copier les fichiers du ZIP à la racine du dépôt `runner-fb/beauregard-vehicules` en conservant les sous-dossiers. Ne pas effacer les fichiers existants.

Sur GitHub : Actions > Recette Playwright Beauregard Vehicules > Run workflow.

## Portée
5 scénarios publics non destructifs sur 3 profils (ordinateur Chrome, Android simulé, iPhone simulé) = 15 exécutions.

Ce pack ne prétend pas couvrir les 121 scénarios du protocole. Pour les tests authentifiés et destructifs, prévoir une base de test séparée et des secrets GitHub Actions. Les appareils sont émulés, pas physiques.

Les rapports HTML, captures, vidéos et traces en cas d'échec sont disponibles dans les artefacts du workflow.
