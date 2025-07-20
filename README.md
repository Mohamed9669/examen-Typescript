# Gestion des Approvisionnements

Ce projet est une application complète de gestion des approvisionnements, réalisée en TypeScript avec un backend mocké via `json-server` et un frontend moderne (Vite + TypeScript + Tailwind CSS).

## Fonctionnalités
- Création et visualisation des approvisionnements
- Gestion des articles (avec prix) et des fournisseurs
- Calcul automatique du montant total
- Filtrage et recherche par référence
- Interface moderne et responsive

---

## 1. Installation

### Prérequis
- Node.js >= 16
- npm

### Installation des dépendances

```bash
cd app.back
npm install (deja fait)
cd ../app.front
npm install (deja fait)
```

---

## 2. Lancement du projet

### Backend (json-server)

```bash
cd app.back
npx json-server --watch db.json --port 3000
```

### Frontend (Vite)

Dans un autre terminal :

```bash
cd app.front
npm run dev
```

des codes inconnue on etais ajouter par vite je crois au cas ou!

