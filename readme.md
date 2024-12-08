# TBS Game API

## Description
Une API de jeu de stratégie au tour par tour (Turn-Based Strategy - TBS) permettant aux joueurs de créer des personnages, combattre des adversaires (IA), acheter des items dans une boutique, et gérer leurs inventaires.

## Fonctionnalités

### Gestion des Joueurs :
- Création de personnages avec des attributs comme la force, la résistance, la vitalité.
- Authentification JWT (JSON Web Token).
- Gestion des armes et des inventaires.

### Système de Combat :
- Mode de combat au tour par tour.
- Actions possibles : attaquer, se soigner.
- Journal détaillé des actions (log des combats).

### Boutique :
- Système de rafraîchissement automatique des items toutes les 24 heures.
- Achat d'items avec gestion des ressources (or, inventaire).

## Technologies Utilisées

### Backend :
- **NestJS** : Framework backend progressif pour Node.js.
- **Prisma ORM** : Gestion et manipulation de la base de données.
- **TypeScript** : Typage statique pour JavaScript.

### Base de Données :
- **MySQL** (compatible avec Prisma).

## Installation

Clonez le dépôt :
```bash
git clone https://github.com/ManaxBIP/API-Project---TBS-Game.git
cd API-Project---TBS-Game
```

Installez les dépendances :
```bash
npm install
```

Configurez votre fichier `.env` :
```plaintext
DATABASE_URL="mysql://user:password@localhost:3306/db"
JWT_SECRET="your_jwt_secret"
```

Appliquez les migrations Prisma :
```bash
npx prisma migrate dev --name init
```

Démarrez le serveur de développement :
```bash
npm run start:dev
```

## Endpoints Principaux

### Authentification
- `POST /auth/login` : Connexion (Ajoute le JWT dans le cookie)
- `POST /auth/logout` : Déconnexion (supprime le JWT dans le cookie)

### Joueurs
- `POST /player/create` : Crée un nouveau personnage
- `GET /player/stats` : Récupère les informations du joueur connecté
- `DELETE /player/delete` : Supprime le joueur connecté

### Boutique
- `GET /shop` : Liste les items disponibles dans la boutique
- `POST /shop/buy` : Achète un item

Voir la totalité sur la doc api en lançant le projet sur `/api`.

## Modèle de Base de Données (Prisma)

Voici un aperçu du schéma Prisma utilisé dans le projet :
```prisma
model Player {
    id         Int      @id @default(autoincrement())
    name       String   @unique
    race       String
    password   String
    gold       Int      @default(100)
    strength   Int      @default(10)
    resistance Int      @default(10)
    vitality   Int      @default(100)
    inventory  Inventory[]
    weapon     Items?
    games      Game[]
    createdAt  DateTime @default(now())
}

model Shop {
    id        Int      @id @default(autoincrement())
    items     Items[]
    updatedAt DateTime @default(now())
}

model Game {
    id        Int      @id @default(autoincrement())
    playerId  Int
    opponentId Int
    playerHp  Int      @default(100)
    opponentHp Int     @default(100)
    turn      Int      @default(1)
    status    String   @default("ongoing")
    log       String[]
}

model Items {
    id        Int      @id @default(autoincrement())
    name      String   @unique
    type      String
    price     Int
    strength  Int
    resistance Int
    vitality  Int
}
```

## Contributeurs
- **Nom du développeur** : Dalyll REGUIA
- **Contact** : dalyll.reguia@gmail.com
