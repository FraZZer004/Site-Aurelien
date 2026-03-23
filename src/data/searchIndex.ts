// src/data/searchIndex.ts
import type { Photo } from '../types';

export interface SearchItem {
    id: string;
    title: string;
    categoryId: string;
    path: string;
    thumbnailSrc?: string;
    keywords: string[];
}

/**
 * Donne le chemin à partir de la catégorie.
 * Pour l'instant on renvoie les pages "racine" des sections.
 * On pourra affiner plus tard (ancrages ou pages de détail).
 */
const getBasePathForPhoto = (photo: Photo): string => {
    switch (photo.categoryId) {
        case 'events':
            return '/portfolio/events';
        case 'shootings':
            return '/portfolio/shootings';
        case 'art':
            return '/portfolio/art';
        case 'drawings':
            return '/portfolio/drawings';
        case 'affiches':
            return '/portfolio/affiches';
        default:
            return '/portfolio';
    }
};

export const buildSearchItems = (photos: Photo[]): SearchItem[] => photos.map((photo) => {
    const title =
        photo.title ||
        photo.alt ||
        'Sans titre';

    const baseKeywords: string[] = [
        title,
        photo.description || '',
        photo.brand || '',
        ...(photo.keywords || []),
    ];

    const normalizedKeywords = baseKeywords
        .join(' ')
        .split(/[\s,]+/)
        .filter(Boolean);

    return {
        id: photo.id,
        title,
        categoryId: photo.categoryId,
        path: getBasePathForPhoto(photo),
        thumbnailSrc: photo.src,
        keywords: normalizedKeywords.map((k) => k.toLowerCase()),
    };
});