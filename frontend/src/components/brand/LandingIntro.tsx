import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useUIStore } from "@/lib/uiStore";

export function LandingIntro({ onComplete }: { onComplete: () => void }) {
  const overlay = useRef<HTMLDivElement>(null);
  const animations = useUIStore((state) => state.animations);

  useEffect(() => {
    const element = overlay.current;
    if (!element) return;
    if (!animations || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onComplete();
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timeline = gsap.timeline({ onComplete });
    timeline
      .fromTo(
        element.querySelector(".landing-intro-symbol"),
        { autoAlpha: 0, scale: 0.72, rotate: -18 },
        { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.5, ease: "back.out(1.6)" },
      )
      .fromTo(
        element.querySelector(".landing-intro-name"),
        { autoAlpha: 0, y: 15 },
        { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" },
        "-=0.22",
      )
      .fromTo(
        element.querySelector(".landing-intro-caption"),
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.3 },
        "-=0.18",
      )
      .fromTo(
        element.querySelector(".landing-intro-progress"),
        { scaleX: 0 },
        { scaleX: 1, duration: 0.75, ease: "power2.inOut" },
        "-=0.28",
      )
      .to(element, { yPercent: -105, duration: 0.72, ease: "power4.inOut" }, "+=0.1");

    return () => {
      timeline.kill();
      document.body.style.overflow = previousOverflow;
    };
  }, [animations, onComplete]);

  return (
    <div className="landing-intro" ref={overlay} role="status" aria-label="Opening Sentivoy">
      <div className="landing-intro-halo" aria-hidden="true" />
      <div className="landing-intro-center">
        <div className="landing-intro-lockup">
          <img
            className="landing-intro-symbol"
            src="/sentivoy-logo.png"
            width="62"
            height="62"
            alt=""
          />
          <span className="landing-intro-name">
            Sentivoy<span>.</span>
          </span>
        </div>
        <p className="landing-intro-caption">A clearer view is coming into focus</p>
        <div className="landing-intro-track" aria-hidden="true">
          <span className="landing-intro-progress" />
        </div>
      </div>
      <span className="landing-intro-index" aria-hidden="true">
        SECURITY, IN PERSPECTIVE <span>↗</span>
      </span>
    </div>
  );
}
