import { MenuItem } from '../types';

export const menuItems: MenuItem[] = [
  {
    id: 'home',
    label: 'Accueil',
    path: '/',
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    path: '/portfolio',
    subItems: [
      {
        id: 'events',
        label: 'Événements',
        path: '/portfolio/events',
      },
      {
        id: 'shootings',
        label: 'Shootings',
        path: '/portfolio/shootings',
      },
      {
        id: 'art',
        label: 'Projets Personnels',
        path: '/portfolio/art',
      },
      {
        id: 'drawings',
        label: 'Dessins',
        path: '/portfolio/drawings',
      },
      {
        id: 'affiches',
        label: 'Affiches',
        path: '/portfolio/affiches',
      },
    ],
  },
  {
    id: 'contact',
    label: 'Contact',
    path: '/contact',
  },
];