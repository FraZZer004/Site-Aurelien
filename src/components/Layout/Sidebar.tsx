import React from 'react';
import { Menu, X, Sun, Moon, ChevronDown, ChevronUp } from 'lucide-react';
import { menuItems } from '../../data/menuItems';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
    currentPath: string;
}

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
                                                <ul className="pl-3 space-y-2 mt-2">
                                                    {item.subItems.map((subItem) => {
                                                        const isActiveSub = currentPath === subItem.path;
                                                        const Icon = subItem.icon as
                                                            | React.ComponentType<any>
                                                            | undefined;

                                                        return (
                                                            <li key={subItem.id}>
                                                                <button
                                                                    onClick={() =>
                                                                        handleNavigation(subItem.path)
                                                                    }
                                                                    className={`
                                    group
                                    relative w-full text-left
                                    flex items-center gap-3
                                    text-sm font-light
                                    px-3 py-2
                                    rounded-xl
                                    transition-all duration-200
                                    ${
                                                                        isActiveSub
                                                                            ? 'bg-black/5 text-black dark:bg:white/8 dark:text-white'
                                                                            : 'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-white dark:hover:text-gray-100'
                                                                    }
                                  `}
                                                                >
                                                                    {/* Icône */}
                                                                    {Icon && (
                                                                        <Icon
                                                                            size={18}
                                                                            className={`
                                        transition-colors duration-200
                                        ${
                                                                                isActiveSub
                                                                                    ? 'text-yellow-400'
                                                                                    : 'text-white dark:text-gray-300 group-hover:text-yellow-400'
                                                                            }
                                      `}
                                                                        />
                                                                    )}

                                                                    {/* Label */}
                                                                    <span>{subItem.label}</span>

                                                                    {/* Indicateur actif */}
                                                                    {isActiveSub && (
                                                                        <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-yellow-400" />
                                                                    )}
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
                        {/* Bouton mode clair/sombre – style 3D push comme “Découvrir” */}
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
        </>
    );
};

export default Sidebar;