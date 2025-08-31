// src/components/Gallery/VideoPlayer.tsx
import React, { useRef, useEffect } from 'react';

type Props = {
    src: string;
    poster?: string;
    className?: string;
    autoPlay?: boolean;
    controls?: boolean; // <- mets true dans la Lightbox
    muted?: boolean;
    loop?: boolean;
    onClick?: () => void; // pour ouvrir la lightbox si besoin
};

const VideoPlayer: React.FC<Props> = ({
                                          src,
                                          poster,
                                          className,
                                          autoPlay = false,
                                          controls = false,
                                          muted = false,
                                          loop = false,
                                          onClick,
                                      }) => {
    const ref = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const v = ref.current;
        if (!v) return;

        // Nettoyage safe si plus tard tu ajoutes des events
        return () => {};
    }, []);

    return (
        <video
            ref={ref}
            src={src}
            poster={poster}
            className={className}
            playsInline
            preload="metadata"
            autoPlay={autoPlay}
            controls={controls}
            muted={muted}
            loop={loop}
            onClick={onClick}
            style={{ display: 'block' }}
        />
    );
};

export default VideoPlayer;