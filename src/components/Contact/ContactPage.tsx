import React from 'react';
import { Mail } from 'lucide-react';
import { socialLinks, contactInfo } from '../../data/social';
import SocialIcon from './SocialIcon';
import FadeInSection from '../UI/FadeInSection';

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen py-20 px-6 bg-white dark:bg-black">
      <div className="max-w-4xl mx-auto">
        <FadeInSection>
          <h1 className="text-3xl md:text-4xl font-light text-center mb-4 text-black dark:text-white">Contact</h1>
        </FadeInSection>
        
        <FadeInSection delay={200}>
          <p className="text-center text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-16">
            N'hésitez pas à me contacter pour discuter de votre projet ou pour toute demande d'information.
          </p>
        </FadeInSection>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
          <FadeInSection delay={300}>
            <div>
              <h2 className="text-2xl font-light mb-6 text-black dark:text-white">Coordonnées</h2>
              
              <div className="space-y-6">
                <a 
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                >
                  <Mail className="mr-4" size={20} />
                  <span>{contactInfo.email}</span>
                </a>
                
                <a
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                >
                </a>
              </div>
            </div>
          </FadeInSection>
          
          <FadeInSection delay={400}>
            <div>
              <h2 className="text-2xl font-light mb-6 text-black dark:text-white">Réseaux sociaux</h2>
              
              <div className="flex space-x-4">
                {socialLinks.map((link) => (
                  <SocialIcon
                    key={link.id}
                    iconName={link.icon}
                    url={link.url}
                    platform={link.platform}
                  />
                ))}
              </div>
            </div>
          </FadeInSection>
        </div>
        
        <FadeInSection delay={500}>
          <div className="mt-24 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              © 2025 Aurélien Communeau - Photographe
            </p>
          </div>
        </FadeInSection>
      </div>
    </div>
  );
};

export default ContactPage;