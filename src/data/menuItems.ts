import { MenuItem } from '../types';
import {
    Calendar,
    Camera,
    FolderGit2,
    Pencil,
    Image as ImageIcon,
} from 'lucide-react';

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
                icon: Calendar,
            },
            {
                id: 'shootings',
                label: 'Shootings',
                path: '/portfolio/shootings',
                icon: Camera,
            },
            {
                id: 'art',
                label: 'Projets Personnels',
                path: '/portfolio/art',
                icon: FolderGit2,
            },
            {
                id: 'drawings',
                label: 'Dessins',
                path: '/portfolio/drawings',
                icon: Pencil,
            },
            {
                id: 'affiches',
                label: 'Affiches',
                path: '/portfolio/affiches',
                icon: ImageIcon,
            },
        ],
    },
    {
        id: 'contact',
        label: 'Contact',
        path: '/contact',
    },
];