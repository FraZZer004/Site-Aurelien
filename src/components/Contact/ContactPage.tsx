import React from 'react';
import FadeInSection from '../UI/FadeInSection';
import SocialIcon from './SocialIcon';

const ContactPage: React.FC = () => {
    const [status, setStatus] = React.useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('sending');

        const form = e.currentTarget;
        const formData = new FormData(form);

        try {
            const res = await fetch('https://formspree.io/f/xdkyzwjb', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                },
                body: formData,
            });

            if (res.ok) {
                setStatus('success');
                form.reset();
            } else {
                setStatus('error');
            }
        } catch (err) {
            setStatus('error');
        }
    };

    return (
        <section className="min-h-screen py-24 px-6 bg-white text-black dark:bg-black dark:text-white transition-colors duration-300">
            <div className="max-w-5xl mx-auto">
                {/* Titre + intro */}
                <FadeInSection>
                    <div className="text-center mb-14">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-light mb-4">
                            Me contacter
                        </h1>
                        {/* petite barre, j’ai corrigé la classe Tailwind qui avait un bug */}
                        <div className="mt-3 h-[3px] w-20 mx-auto rounded-full bg-gradient-to-r from-transparent via-[#4A4A4A] to-transparent" />
                        <br />
                        <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
                            Une question, un projet photo, un devis ou simplement l’envie de discuter ?
                            N’hésite pas à m’écrire, je réponds avec plaisir dès que possible.
                        </p>
                    </div>
                </FadeInSection>

                <div className="grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-start">
                    {/* Formulaire */}
                    <FadeInSection delay={200}>
                        <div className="
              relative overflow-hidden rounded-3xl
              bg-white/90 dark:bg-[rgb(29,29,29)]/80
              border border-black/5 dark:border-white/10
              shadow-[0_24px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.7)]
              p-6 md:p-8
              transition-colors duration-300
            ">
                            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-black/15 dark:via-white/20 to-transparent" />

                            <h2 className="text-xl md:text-2xl font-light mb-6">
                                Parlons de ton projet
                            </h2>

                            <form
                                className="space-y-5"
                                onSubmit={handleSubmit}
                            >
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                                            Nom complet
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            className="
                        w-full rounded-2xl
                        bg-gray-50 dark:bg-black/40
                        border border-gray-200 dark:border-white/10
                        px-4 py-2.5 text-sm
                        text-black dark:text-white
                        placeholder:text-gray-400 dark:placeholder:text-gray-500
                        focus:outline-none focus:ring-2 focus:ring-yellow-500/70 focus:border-transparent
                        transition-colors duration-300
                      "
                                            placeholder="Nom & prénom"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                                            Adresse e-mail
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            className="
                        w-full rounded-2xl
                        bg-gray-50 dark:bg-black/40
                        border border-gray-200 dark:border-white/10
                        px-4 py-2.5 text-sm
                        text-black dark:text-white
                        placeholder:text-gray-400 dark:placeholder:text-gray-500
                        focus:outline-none focus:ring-2 focus:ring-yellow-500/70 focus:border-transparent
                        transition-colors duration-300
                      "
                                            placeholder="tonadresse@mail.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                                        Sujet
                                    </label>
                                    <input
                                        type="text"
                                        name="subject"
                                        className="
                      w-full rounded-2xl
                      bg-gray-50 dark:bg-black/40
                      border border-gray-200 dark:border-white/10
                      px-4 py-2.5 text-sm
                      text-black dark:text-white
                      placeholder:text-gray-400 dark:placeholder:text-gray-500
                      focus:outline-none focus:ring-2 focus:ring-yellow-500/70 focus:border-transparent
                      transition-colors duration-300
                    "
                                        placeholder="Shooting automobile, événement, devis…"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                                        Message
                                    </label>
                                    <textarea
                                        rows={5}
                                        name="message"
                                        required
                                        className="
                      w-full rounded-2xl
                      bg-gray-50 dark:bg-black/40
                      border border-gray-200 dark:border-white/10
                      px-4 py-3 text-sm
                      text-black dark:text-white
                      placeholder:text-gray-400 dark:placeholder:text-gray-500
                      resize-none
                      focus:outline-none focus:ring-2 focus:ring-yellow-500/70 focus:border-transparent
                      transition-colors duration-300
                    "
                                        placeholder="Parle-moi de ton projet, de la date, du lieu, de ton véhicule…"
                                    />
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={status === 'sending'}
                                        className={`
                      inline-flex items-center justify-center
                      px-8 py-3
                      text-xs md:text-sm uppercase tracking-wider font-medium
                      rounded-full
                      border
                      bg-black text-white
                      dark:bg-[rgb(29,29,29)]/90 dark:text-white
                      border-black/40 dark:border-white/60
                      shadow-[0_6px_0_rgba(0,0,0,0.35)] dark:shadow-[0_6px_0_rgba(255,255,255,0.35)]
                      hover:translate-y-[3px]
                      hover:shadow-[0_2px_0_rgba(0,0,0,0.2)] dark:hover:shadow-[0_2px_0_rgba(255,255,255,0.2)]
                      hover:bg-white hover:text-black
                      dark:hover:bg-white dark:hover:text-black
                      transition-all duration-200 ease-out
                      disabled:opacity-60 disabled:translate-y-0 disabled:shadow-none disabled:cursor-not-allowed
                    `}
                                    >
                                        {status === 'sending' ? 'Envoi…' : 'Envoyer le message'}
                                    </button>

                                    {status === 'success' && (
                                        <p className="mt-3 text-sm text-emerald-400">
                                            Message envoyé avec succès. Merci !
                                        </p>
                                    )}

                                    {status === 'error' && (
                                        <p className="mt-3 text-sm text-red-400">
                                            Une erreur est survenue. Tu peux réessayer ou m’écrire directement par e-mail.
                                        </p>
                                    )}
                                </div>
                            </form>
                        </div>
                    </FadeInSection>

                    {/* Bloc infos + réseaux */}
                    <FadeInSection delay={400}>
                        <div className="space-y-6">
                            {/* Carte infos */}
                            <div className="
                rounded-3xl
                bg-gray-50/90 dark:bg-[rgb(20,20,20)]/85
                border border-gray-200/80 dark:border-white/10
                p-6
                shadow-[0_18px_45px_rgba(0,0,0,0.08)] dark:shadow-[0_18px_45px_rgba(0,0,0,0.6)]
                transition-colors duration-300
              ">
                                <h3 className="text-lg font-light mb-4">Informations</h3>
                                <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-500 mb-1">
                                            E-mail
                                        </p>
                                        <a
                                            href="mailto:aurelien.communeau@orange.fr"
                                            className="hover:underline"
                                        >
                                            aurelien.communeau@orange.fr
                                        </a>
                                    </div>

                                    <div>
                                        <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-500 mb-1">
                                            Instagram
                                        </p>
                                        <a
                                            href="https://www.instagram.com/aurel_photx/"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="hover:underline"
                                        >
                                            @aurel_photx
                                        </a>
                                    </div>

                                    <div>
                                        <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-500 mb-1">
                                            Basé en
                                        </p>
                                        <p>France</p>
                                    </div>
                                </div>
                            </div>

                            {/* Carte réseaux */}
                            <div className="
                rounded-3xl
                bg-gray-50/90 dark:bg-[rgb(20,20,20)]/85
                border border-gray-200/80 dark:border-white/10
                p-6
                shadow-[0_18px_45px_rgba(0,0,0,0.08)] dark:shadow-[0_18px_45px_rgba(0,0,0,0.6)]
                transition-colors duration-300
              ">
                                <h3 className="text-lg font-light mb-4">Réseaux</h3>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                                    Tu peux aussi suivre mon travail et m&apos;écrire directement via
                                    les réseaux :
                                </p>

                                <div className="flex flex-wrap gap-3">
                                    <SocialIcon
                                        label="Instagram"
                                        href="https://www.instagram.com/aurel_photx/"
                                        platform="instagram"
                                    />
                                    <SocialIcon
                                        label="TikTok"
                                        href="https://www.tiktok.com/@aurelphotx"
                                        platform="tiktok"
                                    />
                                </div>
                            </div>
                        </div>
                    </FadeInSection>
                </div>
            </div>
        </section>
    );
};

export default ContactPage;