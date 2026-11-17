# FOLEY — Prototype V3

## Utiliser l’application

L’écran de jeu ne contient aucun libellé visible : pictogrammes et nombres uniquement.
Les noms techniques restent dans sons.json et dans les descriptions d’accessibilité pour les lecteurs d’écran.

- ▣ ＋ : ouvrir la caméra et scanner une carte. La caméra se ferme après chaque scan.
- Menu de pictogrammes et ＋ : ajouter un son sans caméra pour tester.
- Toucher une image : la sélectionner (contour sombre et coche).
- ↑ / ↓ : déplacer le son sélectionné dans la séquence.
- 🗑 : effacer uniquement le son sélectionné.
- ↺ : arrêter et vider toute la séquence.
- ▶ : lire les cinq sons dans l’ordre. Actif uniquement avec cinq sons.
- ■ : arrêter la lecture, en conservant la séquence.
- ⌛ : chargement. ✓ : prêt ou terminé. ⚠ : problème de caméra, de catalogue ou de fichier audio.

Le son en cours de lecture reçoit une bordure verte. Une même carte peut être ajoutée plusieurs fois.
Les QR existants S001 à S005 restent compatibles. Scanner les cartes dans l’application.
La page qr.html sert à imprimer les cartes : seuls pictogrammes et QR apparaissent sur les cartes.
Cette page d’administration et ce guide conservent leurs instructions en français.

## Ajouter tes MP3

Les bruitages ne sont PAS inclus. Dépose tes fichiers dans audio/ :

| ID | Pictogramme | Fichier |
| --- | --- | --- |
| S001 | 🥘 | audio/casserole.mp3 |
| S002 | 🚪 | audio/porte.mp3 |
| S003 | 🐶 | audio/chien.mp3 |
| S004 | 🌧️ | audio/pluie.mp3 |
| S005 | 🚗 | audio/klaxon.mp3 |

Pour d’autres bruitages, adapte les champs fichier, icone et nom dans sons.json.
Garde les identifiants si tu veux conserver les QR déjà imprimés.
Les emojis pourront être remplacés par des illustrations dans une prochaine version.

## Installer ou mettre à jour

1. Décompresse le ZIP.
2. Ajoute tes MP3 dans audio/.
3. Dans ton dépôt GitHub, importe le CONTENU du dossier, pas le ZIP.
4. Remplace les fichiers de la V2 par ceux de la V3, en conservant tes MP3.
   Si tu as personnalisé sons.json, conserve tes références et tes chemins audio.
5. Valide les modifications. Si Pages était déjà activé, la mise à jour sera publiée.
6. Pour une première installation, active GitHub Pages sur la branche main, dossier racine.
7. Ouvre l’adresse HTTPS sur ton téléphone et autorise l’accès à la caméra.

Ouvrir index.html par double-clic ne suffit pas : utiliser un serveur HTTP local pour les essais sur ordinateur et HTTPS sur téléphone.
Les fichiers publiés dans un dépôt public et sur GitHub Pages sont accessibles publiquement.

## Vérification et dépannage

Syntaxe JavaScript vérifiée. Tests de logique automatisés avec DOM et moteur audio simulés : déplacement, suppression, doublons, compatibilité des IDs, limite de cinq sons, planification consécutive de cinq sons, arrêt et reset pendant le chargement.
Le navigateur de test n’a pas pu être lancé dans cet environnement : affichage mobile, lecture réelle et caméra restent à vérifier.
Il reste à tester tes vrais MP3 et le scan avec la caméra sur ton téléphone (notamment iPhone).

Si ⚠ apparaît :
- Caméra : vérifier HTTPS, autorisation caméra et connexion internet.
- Audio : vérifier les noms et chemins de sons.json, les majuscules et les fichiers dans audio/.
- Catalogue : vérifier la présence et la syntaxe de sons.json.
- QR : vérifier que son ID existe dans sons.json.

Le scanner utilise html5-qrcode 2.3.8 et la page d’impression qrcodejs via des scripts distants. Une connexion internet est nécessaire. Les sons utilisent Web Audio et sont préchargés avant lecture.
