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
  currentPath
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
        className="fixed top-6 left-6 z-50 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-all duration-300"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-black dark:bg-opacity-90 z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full pt-24 px-8">
          <nav>
            <ul className="space-y-8">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <div className="space-y-4">
                    <button
                      onClick={() => {
                        if (item.subItems) {
                          toggleSubmenu(item.id);
                        } else {
                          handleNavigation(item.path);
                        }
                      }}
                      className={`flex items-center justify-between w-full text-xl font-light hover:text-gray-600 dark:hover:text-gray-300 transition-colors relative ${
                        currentPath === item.path || (item.subItems && currentPath.startsWith(item.path))
                          ? 'text-black dark:text-white' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.subItems && (
                        expandedMenu === item.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />
                      )}
                    </button>

                    {item.subItems && expandedMenu === item.id && (
                      <ul className="pl-4 space-y-4">
                        {item.subItems.map((subItem) => (
                          <li key={subItem.id}>
                            <button
                              onClick={() => handleNavigation(subItem.path)}
                              className={`text-lg font-light hover:text-gray-600 dark:hover:text-gray-300 transition-colors relative ${
                                currentPath === subItem.path 
                                  ? 'text-black dark:text-white' 
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}
                            >
                              {subItem.label}
                              {currentPath === subItem.path && (
                                <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-black dark:bg-white" />
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="mt-auto mb-8 space-y-4">
            <button
              onClick={toggleDarkMode}
              className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              {isDarkMode ? (
                <>
                  <Sun size={20} />
                  <span>Mode clair</span>
                </>
              ) : (
                <>
                  <Moon size={20} />
                  <span>Mode sombre</span>
                </>
              )}
            </button>
            <p className="text-sm text-gray-400 dark:text-gray-500">© 2025 Aurélien Communeau</p>
          </div>
        </div>
      </div>
      
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;