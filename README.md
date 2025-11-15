# Aurélien Communeau — Portfolio Photo

Site vitrine réalisé avec React, TypeScript et Tailwind CSS pour présenter le travail photographique d'Aurélien Communeau. Le design mixe halos lumineux, contrastes noir/carbone et accents jaune racing pour évoquer les shows automobiles et les sessions nocturnes sur circuit.

## 🌈 Ambiance visuelle

- **Palette** : noir profond (`#020202`), blanc nacré et touche d'ambre pour les highlights (boutons, pictos, halos). Les cartes et overlays utilisent des dégradés radiaux inspirés des phares LED.
- **Typo & layout** : lignes fines, capitales espacées et hero full-screen avec un halo ovale qui simule un flash studio.
- **Micro-interactions** : hover avec halos, transitions `ease-out`, légères élévations pour rappeler la carrosserie qui catch la lumière.

## ⚙️ Pile technique

- [Vite](https://vitejs.dev) + React 18 + TypeScript pour une base moderne et ultra rapide.
- [React Router](https://reactrouter.com/) pour les routes `/`, `/portfolio`, `/portfolio/events/:id`, `/contact`, etc.
- [Tailwind CSS](https://tailwindcss.com/) pour le responsive, le mode sombre et la gestion fine des effets.
- [lucide-react](https://lucide.dev/) pour les icônes minimalistes (Menu, Soleil, Lune, etc.).
- Contexte maison (`ThemeContext`) pour la persistance du mode sombre dans `localStorage`.

## ✨ Expérience utilisateur

- **Navigation latérale cinématique**  
  Bouton flottant circulaire, slide-in/out, sous-menus pour les familles de médias et indicateur de page active. Le switch Sun/Moon applique la classe `dark` à `<html>` pour garder le rendu choisi entre deux visites.

- **Hero & section À propos**  
  Hero plein écran avec CTA “Découvrir”, halo flou et background photo. Sous le pli, un set de cartes “Passion / Créativité / Événements” rappelle les spécialités.

- **Portfolio piloté par les données**  
  `src/data/categories.ts` + `src/data/photos.ts` définissent les couvertures, les séries Prestige Auto, les shootings privés, les dessins et affiches. Chaque catégorie mène à une page dédiée.

- **Mosaïques dynamiques**  
  `MasonryGrid` redistribue automatiquement les clichés en 1, 2 ou 3 colonnes, avec overlays affichant date, description et série.

- **Lightbox hybride photo/vidéo**  
  Navigation clavier, swipe mobile, fermetures via clic en dehors ou ESC. Lecture vidéo auto-adaptée avec options `loop`, `muted`, `poster`.

- **Contact & social**  
  Page contact minimaliste avec CTA mailto, icônes sociales configurables dans `src/data/social.ts` et rappel de copyright.

## 🗂️ Structure du projet

- `src/components` — Layout, Hero, Portfolio (grilles, lightbox, carrousels), Contact, UI.
- `src/context/ThemeContext.tsx` — Contexte mode sombre/clair.
- `src/data/*.ts` — Catégories, photos, menus, réseaux.
- `public/assets` — Visuels haute déf utilisés par les grilles.
- `tailwind.config.js` / `index.css` — tokens, fontes, animations.

## 🚀 Mise en route

Pré-requis : Node.js ≥ 18 et npm ≥ 9.

```bash
npm install
npm run dev
```

Visite `http://localhost:5173`.  
Build prod : `npm run build` puis `npm run preview` pour un check final.

| Script          | Rôle |
|-----------------|------|
| `npm run dev`   | Vite en mode développement (HMR) |
| `npm run build` | Bundle optimisé dans `dist/` |
| `npm run preview` | Sert le build pour vérification |
| `npm run lint`  | Vérifie le code avec ESLint |

## 🛠️ Personnalisation rapide

- **Photos & vidéos** : importer les médias dans `public/assets/...` puis les référencer dans `src/data/photos.ts` avec `categoryId`, `eventId` (si besoin) et métadonnées.
- **Nouvelles catégories** : mettre à jour `src/data/categories.ts` (nom, description, image de couverture).
- **Menu** : `src/data/menuItems.ts` contrôle l'arborescence de la sidebar (liens + sous-liens).
- **Contact / social** : éditer `src/data/social.ts` pour l'email ou les plateformes.
- **Palette** : ajuster les couleurs ou ombres globales depuis `tailwind.config.js` ou `src/index.css`.