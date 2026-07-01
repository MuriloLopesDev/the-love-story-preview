import { useState } from "react";
import heroImg from "@/assets/hero.jpg";
import { WEDDING_ENVELOPE_STORAGE_KEY } from "@/lib/wedding-envelope";

type WeddingEnvelopeIntroProps = {
  onComplete: () => void;
};

export function WeddingEnvelopeIntro({ onComplete }: WeddingEnvelopeIntroProps) {
  const [opening, setOpening] = useState(false);

  function openEnvelope() {
    if (opening) return;

    setOpening(true);

    try {
      window.sessionStorage.setItem(WEDDING_ENVELOPE_STORAGE_KEY, "true");
    } catch {
      // The animation should still complete if storage is unavailable.
    }

    window.setTimeout(onComplete, 2600);
  }

  return (
    <section
      className={`wedding-envelope-intro ${opening ? "is-opening" : ""}`}
      aria-label="Convite de casamento de Murilo e Mirelle"
    >
      <img
        src={heroImg}
        alt=""
        aria-hidden="true"
        className="wedding-envelope-intro__background"
        width={1536}
        height={1024}
      />
      <div className="wedding-envelope-intro__veil" />

      <div className="wedding-envelope-intro__content">
        <p className="divider-leaf text-xs uppercase tracking-[0.3em]">Murilo & Mirelle</p>

        <div className={`wedding-envelope ${opening ? "is-opening" : ""}`}>
          <div className="wedding-envelope__shadow" />
          <div className="wedding-envelope__letter">
            <span className="wedding-envelope__letter-kicker">Save the date</span>
            <strong>Murilo</strong>
            <em>&</em>
            <strong>Mirelle</strong>
            <span>10.10.2026</span>
          </div>
          <div className="wedding-envelope__back" />
          <div className="wedding-envelope__flap wedding-envelope__flap--top" />
          <div className="wedding-envelope__flap wedding-envelope__flap--left" />
          <div className="wedding-envelope__flap wedding-envelope__flap--right" />
          <div className="wedding-envelope__front" />
          
          <button
            type="button"
            className="wedding-envelope__seal"
            aria-label="Abrir convite de Murilo e Mirelle"
            onClick={openEnvelope}
          >
            M&M
          </button>
        </div>

        <p className="wedding-envelope-intro__hint">Clique no lacre para abrir o convite</p>
      </div>
    </section>
  );
}
