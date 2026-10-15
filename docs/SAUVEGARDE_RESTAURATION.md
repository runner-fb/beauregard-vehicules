# Sauvegarde et restauration

## Appareil

À l’accueil, « Exporter la sauvegarde locale » produit un JSON contenant les brouillons et les photos locales, sans code d’accès ni jeton de session. Conserve-le dans un emplacement privé.

« Restaurer une sauvegarde locale » réimporte uniquement les identifiants absents. Aucun dossier présent n’est écrasé. Pour fusionner des versions différentes, conserve les deux sauvegardes et utilise la résolution de conflits après une revue technique. Les données non synchronisées ne sont jamais purgées automatiquement.

## Google

Avant une mise à jour :
- Duplique la base Sheets et conserve une copie de tout le dossier métier Drive.
- Exporte le projet Apps Script et note sa version de déploiement ainsi que les propriétés de configuration dans un coffre privé. Ne publie pas PEPPER, CODE_admin, CODE_controller ni les sessions.
- Conserve le SHA du commit GitHub correspondant au frontend et au backend.

## Restauration serveur

Arrête les nouveaux contrôles. Préserve l’état défaillant en copie avant toute intervention. Restaure la base et les fichiers dans un environnement de test ; si les identifiants Drive changent, une migration contrôlée des références est nécessaire. Ne pointe pas directement une copie de base vers une arborescence dont les identifiants diffèrent.

Rétablis DATABASE_ID et DATA_FOLDER_ID uniquement après vérification des liens photos/PDF. Révoque les sessions en changeant AUTH_EPOCH, puis vérifie un dossier complet avec ses photos, son PDF et son avenant avant de réouvrir le service.

Les photos retirées d’un brouillon sont mises à la corbeille Drive seulement après confirmation qu’aucun contrôle ni avenant ne les référence. Une photo déjà intégrée à un contrôle verrouillé n’est pas supprimable par le contrôleur.
