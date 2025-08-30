import React from 'react';
import * as LucideIcons from 'lucide-react';

interface SocialIconProps {
  iconName: string;
  url: string;
  platform: string;
}

const SocialIcon: React.FC<SocialIconProps> = ({ iconName, url, platform }) => {
  const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] || LucideIcons.Link;
  
  return (
    <a 
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300 text-gray-700 dark:text-gray-300"
      aria-label={platform}
    >
      <IconComponent size={24} />
    </a>
  );
};

export default SocialIcon;