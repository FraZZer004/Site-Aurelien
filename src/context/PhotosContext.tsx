/**
 * PhotosContext
 * Provides the merged photo list (static photos.ts + dynamic additions from Netlify Blobs).
 *
 * - Initial render uses static photos immediately (no loading spinner on the site).
 * - Dynamic content loads in the background and merges seamlessly.
 * - If the API is unreachable (local dev with `vite dev`), it gracefully falls back
 *   to static photos only.
 * - Exposes a `refresh()` function for the admin to re-fetch after mutations.
 */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { photos as staticPhotos } from '../data/photos';
import type { Photo } from '../types';

interface PhotosContextType {
  photos: Photo[];
  additions: Photo[];
  refresh: () => void;
}

const PhotosContext = createContext<PhotosContextType>({
  photos: staticPhotos,
  additions: [],
  refresh: () => {},
});

export const PhotosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [additions, setAdditions] = useState<Photo[]>([]);
  const [deletions, setDeletions] = useState<string[]>([]);

  const fetchContent = useCallback(() => {
    fetch('/api/content')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { additions: Photo[]; deletions: string[] } | null) => {
        if (data) {
          setAdditions(data.additions ?? []);
          setDeletions(data.deletions ?? []);
        }
      })
      .catch(() => {
        // Silently ignore — local dev without `netlify dev` just shows static photos
      });
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const allPhotos = useMemo(() => {
    if (additions.length === 0 && deletions.length === 0) return staticPhotos;
    const deletionSet = new Set(deletions);
    return [...staticPhotos, ...additions].filter((p) => !deletionSet.has(p.id));
  }, [additions, deletions]);

  const value = useMemo(
    () => ({ photos: allPhotos, additions, refresh: fetchContent }),
    [allPhotos, additions, fetchContent]
  );

  return <PhotosContext.Provider value={value}>{children}</PhotosContext.Provider>;
};

/** Returns the merged photo array — use this in all portfolio pages. */
export const usePhotos = (): Photo[] => useContext(PhotosContext).photos;

/** Returns the additions array — use this in admin to distinguish dynamic vs static photos. */
export const useAdditions = (): Photo[] => useContext(PhotosContext).additions;

/** Returns the refresh function — use this in admin after mutations. */
export const useRefreshPhotos = (): (() => void) => useContext(PhotosContext).refresh;
