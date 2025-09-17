import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const rules = [
    // Evénements
    { test: /^\/portfolio\/events\/[^/]+$/, to: '/portfolio/events' },
    // Dessins
    { test: /^\/portfolio\/dessins\/[^/]+$/, to: '/portfolio/dessins' },
    // Shootings
    { test: /^\/portfolio\/shootings\/[^/]+$/, to: '/portfolio/shootings' },
    // Affiches
    { test: /^\/portfolio\/affiches\/[^/]+$/, to: '/portfolio/affiches' },
    // Contact
    { test: /^\/portfolio\/contact\/[^/]+$/, to: '/portfolio/contact' },
    // Ajoute ici d’autres sections détail -> base si besoin
];

export default function RefreshRedirectGuard({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Détection du "hard reload"
        let isReload = false;

        // Méthode moderne (PerformanceNavigationTiming)
        const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
        if (navEntry?.type === 'reload') {
            isReload = true;
        }

        // Fallback plus ancien (Safari / vieux Chrome)
        if ((performance as any).navigation?.type === 1) {
            isReload = true;
        }

        if (!isReload) return;

        const hit = rules.find((r) => r.test.test(location.pathname));
        if (hit) {
            navigate(hit.to, { replace: true });
        }
    }, [location.pathname, navigate]);

    return <>{children}</>;
}