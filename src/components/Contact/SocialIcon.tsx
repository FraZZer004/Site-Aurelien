import React from 'react';
import { Instagram, Facebook, Globe, Twitter, Camera, Film } from 'lucide-react';

interface SocialIconProps {
    href: string;
    label: string;
    platform?: 'instagram' | 'facebook' | 'website' | 'x' | 'behance' | 'tiktok' | 'other';
}

const SocialIcon: React.FC<SocialIconProps> = ({ href, label, platform = 'other' }) => {
    const baseClasses =
        'inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-black/40 text-xs text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-200 hover:-translate-y-[1px]';

    const renderIcon = () => {
        switch (platform) {
            case 'instagram':
                return <Instagram size={16} />;
            case 'facebook':
                return <Facebook size={16} />;
            case 'website':
                return <Globe size={16} />;
            case 'x':
                return <Twitter size={16} />;
            case 'behance':
                return <Camera size={16} />;
            case 'tiktok':
                return <Film size={16} />;
            default:
                return <Globe size={16} />;
        }
    };

    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            className={baseClasses}
        >
            {renderIcon()}
            <span className="hidden sm:inline">{label}</span>
        </a>
    );
};

export default SocialIcon;