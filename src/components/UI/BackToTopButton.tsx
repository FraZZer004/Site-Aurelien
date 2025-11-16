import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

const BackToTopButton: React.FC = () => {
    const [visible, setVisible] = useState(false);

    // ➤ Affiche le bouton après 250px de défilement
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 250) {
                setVisible(true);
            } else {
                setVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <button
            onClick={scrollToTop}
            className={`
        fixed bottom-6 right-6 z-50
        p-3 rounded-full backdrop-blur-lg
        border border-yellow-400/40
        bg-black/40
        text-yellow-300 shadow-[0_8px_20px_rgba(0,0,0,0.4)]
        hover:bg-yellow-400 hover:text-black
        hover:shadow-[0_8px_25px_rgba(250,204,21,0.6)]
        transition-all duration-300
        ${visible ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"}
      `}
            aria-label="Revenir en haut de page"
        >
            <ArrowUp size={22} />
        </button>
    );
};

export default BackToTopButton;