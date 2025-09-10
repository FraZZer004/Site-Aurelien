export interface MenuItem {
  id: string;
  label: string;
  path: string;
  subItems?: MenuItem[];
}

export interface PhotographyCategory {
  id: string;
  name: string;
  description: string;
  previewImage: string;
}

/** --- Ajouts pour gérer image/vidéo --- */
export type MediaType = 'image' | 'video';

/** Détecte si une source est une vidéo par extension */
export const isVideoSrc = (src: string) => /\.(mp4|mov|webm)$/i.test(src);

/** Renvoie le type média (priorité au champ explicite, sinon détecte par l'extension) */
export const getMediaType = (item: Pick<Photo, 'src' | 'mediaType'>): MediaType =>
    item.mediaType ?? (isVideoSrc(item.src) ? 'video' : 'image');

/** Helper pratique pour lire / if (...) */
export const isVideoItem = (item: Pick<Photo, 'src' | 'mediaType'>): boolean =>
    getMediaType(item) === 'video';
/** ------------------------------------- */

export interface Photo {
  id: string;
  categoryId: string;
  src: string;
  alt: string;
  date: string;
  description: string;
  eventId?: string;
  shootingId?: string;
  artId?: string;
  drawingId?: string;
  afficheId?: string;
  subEventId?: string;
  title?: string;
  isPreview?: boolean;

  /** --- Nouveaux champs optionnels --- */
  mediaType?: MediaType;     // 'video' pour forcer si besoin
  poster?: string;           // miniature d’attente pour vidéo
  muted?: boolean;           // utile si autoplay silencieux
  loop?: boolean;            // boucle
  controls?: boolean;        // true par défaut côté rendu
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
}