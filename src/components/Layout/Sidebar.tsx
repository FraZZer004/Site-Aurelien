import React from 'react';
import {
    Menu,
    X,
    Sun,
    Moon,
    ChevronDown,
    ChevronUp,
    Search,
    Calendar,
    Camera,
    Palette,
    PenTool,
    Image as ImageIcon,
} from 'lucide-react';
import { menuItems } from '../../data/menuItems';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { photos } from '../../data/photos';
import { Photo } from '../../types';
import Lightbox from '../Portfolio/Lightbox';

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
    currentPath: string;
}

type SearchResult = {
    id: string;
    label: string;
    categoryId: string;
    categoryLabel: string;
    groupId?: string; // eventId, shootingId, drawingId, artId…
};

const Sidebar: React.FC<SidebarProps> = ({
                                             isOpen,
                                             toggleSidebar,
                                             currentPath,
                                         }) => {
    const { isDarkMode, toggleDarkMode } = useTheme();
    const navigate = useNavigate();
    const [expandedMenu, setExpandedMenu] = React.useState<string | null>(
        currentPath.startsWith('/portfolio') ? 'portfolio' : null
    );

    const handleNavigation = (path: string) => {
        navigate(path);
        toggleSidebar();
    };

    const toggleSubmenu = (menuId: string) => {
        setExpandedMenu(expandedMenu === menuId ? null : menuId);
    };

    // ---------- 🔍 RECHERCHE ----------
    const [searchTerm, setSearchTerm] = React.useState('');
    const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
    const [isSearchFocused, setIsSearchFocused] = React.useState(false);

    // Lightbox globale pour les résultats de recherche
    const [lightboxPhotos, setLightboxPhotos] = React.useState<Photo[]>([]);
    const [lightboxPhoto, setLightboxPhoto] = React.useState<Photo | null>(null);

    // Construire les résultats à partir de `photos`
    React.useEffect(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) {
            setSearchResults([]);
            return;
        }

        const matches = photos.filter((p) => {
            const title = (p.title || '').toLowerCase();
            const alt = (p.alt || '').toLowerCase();
            return title.includes(term) || alt.includes(term);
        });

        const map = new Map<string, SearchResult>();

        for (const p of matches) {
            const categoryId = p.categoryId;
            let groupId: string | undefined;
            let categoryLabel = '';

            switch (categoryId) {
                case 'events':
                    groupId = (p as any).eventId;
                    categoryLabel = 'Événements';
                    break;
                case 'shootings':
                    groupId = (p as any).shootingId;
                    categoryLabel = 'Shootings';
                    break;
                case 'drawings':
                    groupId = (p as any).drawingId;
                    categoryLabel = 'Dessins';
                    break;
                case 'art':
                    groupId = (p as any).artId;
                    categoryLabel = 'Projets personnels';
                    break;
                case 'affiches':
                    categoryLabel = 'Affiches';
                    break;
                default:
                    categoryLabel = categoryId;
            }

            const label = p.title || p.alt || '(Sans titre)';
            const key = `${categoryId}-${groupId || p.id}`;

            if (!map.has(key)) {
                map.set(key, {
                    id: key,
                    label,
                    categoryId,
                    categoryLabel,
                    groupId,
                });
            }
        }

        setSearchResults(Array.from(map.values()).slice(0, 8));
    }, [searchTerm]);

    // Quand on clique sur un résultat → ouvrir la première image correspondante en Lightbox
    const handleSearchSelect = (result: SearchResult) => {
        const matched = photos.filter((p) => {
            if (p.categoryId !== result.categoryId) return false;
            const anyP = p as any;

            if (result.groupId) {
                switch (result.categoryId) {
                    case 'events':
                        return anyP.eventId === result.groupId && !p.isPreview;
                    case 'shootings':
                        return anyP.shootingId === result.groupId && !p.isPreview;
                    case 'drawings':
                        return anyP.drawingId === result.groupId && !p.isPreview;
                    case 'art':
                        return anyP.artId === result.groupId && !p.isPreview;
                    default:
                        return true;
                }
            }

            const label = p.title || p.alt || '';
            return label === result.label;
        });

        if (matched.length === 0) return;

        // Ouvrir la première photo trouvée
        setLightboxPhotos(matched);
        setLightboxPhoto(matched[0]);

        // Nettoyer l'UI de recherche + fermer la sidebar
        setSearchTerm('');
        setSearchResults([]);
        setIsSearchFocused(false);
        toggleSidebar();
    };

    const handleLightboxClose = () => setLightboxPhoto(null);

    const handleLightboxNavigate = (direction: 'prev' | 'next') => {
        if (!lightboxPhoto || lightboxPhotos.length === 0) return;

        const currentIndex = lightboxPhotos.findIndex(
            (p) => p.id === lightboxPhoto.id
        );
        if (currentIndex === -1) return;

        let nextIndex = currentIndex;
        if (direction === 'prev') {
            nextIndex = currentIndex === 0 ? lightboxPhotos.length - 1 : currentIndex - 1;
        } else {
            nextIndex =
                currentIndex === lightboxPhotos.length - 1 ? 0 : currentIndex + 1;
        }
        setLightboxPhoto(lightboxPhotos[nextIndex]);
    };

    // ---------- Icônes pour les sous-items du portfolio ----------
    const getSubItemIcon = (subId: string) => {
        switch (subId) {
            case 'events':
                return <Calendar className="w-5 h-5" />;
            case 'shootings':
                return <Camera className="w-5 h-5" />;
            case 'art':
                return <Palette className="w-5 h-5" />;
            case 'drawings':
                return <PenTool className="w-5 h-5" />;
            case 'affiches':
                return <ImageIcon className="w-5 h-5" />;
            default:
                return null;
        }
    };

    return (
        <>
            {/* Menu Button */}
            <button
                onClick={toggleSidebar}
                className="
          fixed top-6 left-6 z-50
          p-2.5
          rounded-full
          border border-white/40
          bg-black/40
          text-white
          backdrop-blur-md
          shadow-[0_10px_30px_rgba(0,0,0,0.45)]
          hover:bg-black/60
          hover:scale-[1.02]
          transition-all duration-200
        "
                aria-label="Toggle menu"
            >
                {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Sidebar */}
            <div
                className={`
          fixed top-0 left-0 h-full w-72
          z-40
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
            >
                {/* Panneau glass */}
                <div
                    className="
            relative h-full
            bg-white/85 dark:bg-black/85
            backdrop-blur-2xl
            border-r border-black/5 dark:border-white/10
            shadow-[0_25px_60px_rgba(0,0,0,0.60)]
            flex flex-col
            pt-24 pb-6 px-7
          "
                >
                    {/* Ligne décorative */}
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-orange-500 via-yellow-500 to-white-500 opacity-60" />

                    {/* 🔍 Barre de recherche */}
                    <div className="mb-6">
                        <div
                            className="
                flex items-center gap-2
                rounded-full
                px-3 py-2
                bg-black/5 dark:bg-white/5
                border border-black/10 dark:border-white/15
                focus-within:ring-1 focus-within:ring-yellow-400
                transition-all
              "
                        >
                            <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => {
                                    setTimeout(() => setIsSearchFocused(false), 150);
                                }}
                                placeholder="Rechercher (RS6, BMW...)"
                                className="
                  flex-1 bg-transparent outline-none
                  text-sm text-black dark:text-white
                  placeholder:text-gray-400 dark:placeholder:text-gray-500
                "
                            />
                        </div>

                        {isSearchFocused &&
                            searchTerm.trim() !== '' &&
                            searchResults.length > 0 && (
                                <div
                                    className="
                    mt-2 rounded-2xl
                    bg-white/95 dark:bg-black/95
                    border border-black/5 dark:border-white/10
                    shadow-[0_18px_45px_rgba(0,0,0,0.25)]
                    max-h-64 overflow-y-auto
                    text-sm
                  "
                                >
                                    {searchResults.map((result) => (
                                        <button
                                            key={result.id}
                                            type="button"
                                            onClick={() => handleSearchSelect(result)}
                                            className="
                        w-full text-left px-3 py-2.5
                        hover:bg-black/5 dark:hover:bg-white/5
                        flex flex-col
                      "
                                        >
                      <span className="text-black dark:text-white">
                        {result.label}
                      </span>
                                            <span className="text-[11px] uppercase tracking-[0.16em] text-gray-500 dark:text-gray-500">
                        {result.categoryLabel}
                      </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                    </div>

                    {/* Navigation */}
                    <nav className="mt-2">
                        <ul className="space-y-4">
                            {menuItems.map((item) => {
                                const isActiveRoot =
                                    currentPath === item.path ||
                                    (item.subItems && currentPath.startsWith(item.path));

                                return (
                                    <li key={item.id}>
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => {
                                                    if (item.subItems) {
                                                        toggleSubmenu(item.id);
                                                    } else {
                                                        handleNavigation(item.path);
                                                    }
                                                }}
                                                className={`
                          group
                          flex items-center justify-between w-full
                          rounded-2xl
                          px-3 py-2.5
                          text-base font-light
                          transition-all duration-200
                          ${
                                                    isActiveRoot
                                                        ? 'bg-black/5 text-black dark:bg-white/5 dark:text-white'
                                                        : 'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-gray-100'
                                                }
                        `}
                                            >
                                                <span>{item.label}</span>
                                                {item.subItems && (
                                                    <span className="text-gray-400 dark:text-gray-500 group-hover:text-gray-300">
                            {expandedMenu === item.id ? (
                                <ChevronUp size={18} />
                            ) : (
                                <ChevronDown size={18} />
                            )}
                          </span>
                                                )}
                                            </button>

                                            {/* Sous-menus */}
                                            {item.subItems && expandedMenu === item.id && (
                                                <ul className="pl-3 space-y-2">
                                                    {item.subItems.map((subItem) => {
                                                        const isActiveSub = currentPath === subItem.path;
                                                        const icon = getSubItemIcon(subItem.id);

                                                        return (
                                                            <li key={subItem.id}>
                                                                <button
                                                                    onClick={() => handleNavigation(subItem.path)}
                                                                    className={`
                                    relative w-full text-left
                                    text-sm font-light
                                    px-3 py-2
                                    rounded-xl
                                    flex items-center gap-3
                                    transition-all duration-200
                                    ${
                                                                        isActiveSub
                                                                            ? 'bg-black/5 text-black dark:bg-white/8 dark:text-white'
                                                                            : 'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-gray-100'
                                                                    }
                                  `}
                                                                >
                                                                    {/* Barre jaune pour l’élément actif */}
                                                                    <span
                                                                        className={`
                                      w-1 h-6 rounded-full mr-1
                                      ${
                                                                            isActiveSub
                                                                                ? 'bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-500'
                                                                                : 'bg-transparent'
                                                                        }
                                    `}
                                                                    />
                                                                    {/* Icône */}
                                                                    {icon && (
                                                                        <span
                                                                            className={`
                                        ${
                                                                                isActiveSub
                                                                                    ? 'text-yellow-400'
                                                                                    : 'text-white group-hover:text-yellow-300'
                                                                            }
                                      `}
                                                                        >
                                      {icon}
                                    </span>
                                                                    )}
                                                                    <span>{subItem.label}</span>
                                                                </button>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Bas de sidebar */}
                    <div className="mt-auto pt-6 space-y-4 border-t border-black/5 dark:border-white/10">
                        <button
                            onClick={toggleDarkMode}
                            className={`
                w-full
                flex items-center justify-center gap-2
                py-2.5 px-4
                text-xs uppercase tracking-wider font-medium
                rounded-full
                border
                transition-all duration-200 ease-out
                ${
                                isDarkMode
                                    ? `
                      text-white bg-[rgb(29,29,29)]/85 border-white/55
                      shadow-[0_6px_0_rgba(255,255,255,0.35)]
                      hover:translate-y-[3px]
                      hover:shadow-[0_2px_0_rgba(255,255,255,0.25)]
                      hover:bg-white hover:text-black
                    `
                                    : `
                      text-black bg-white border-black/35
                      shadow-[0_6px_0_rgba(0,0,0,0.55)]
                      hover:translate-y-[3px]
                      hover:shadow-[0_2px_0_rgba(0,0,0,0.45)]
                      hover:bg-[rgb(29,29,29)] hover:text-white
                    `
                            }
              `}
                        >
                            {isDarkMode ? (
                                <>
                                    <Sun size={18} />
                                    <span>Mode clair</span>
                                </>
                            ) : (
                                <>
                                    <Moon size={18} />
                                    <span>Mode sombre</span>
                                </>
                            )}
                        </button>

                        <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
                            © 2025 Aurélien Communeau
                        </p>
                    </div>
                </div>
            </div>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-[1px] z-30"
                    onClick={toggleSidebar}
                />
            )}

            {/* Lightbox globale pour les résultats de recherche */}
            {lightboxPhoto && (
                <Lightbox
                    photo={lightboxPhoto}
                    photos={lightboxPhotos}
                    onClose={handleLightboxClose}
                    onNavigate={handleLightboxNavigate}
                />
            )}
        </>
    );
};

export default Sidebar;