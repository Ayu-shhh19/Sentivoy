import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useUIStore } from "@/lib/uiStore";

export function usePageReveal<T extends HTMLElement = HTMLDivElement>(
  key: string,
  selector = "[data-reveal]",
) {
  const ref = useRef<T>(null);
  const enabled = useUIStore((state) => state.animations);
  useEffect(() => {
    if (!ref.current || !enabled) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        const targets = ref.current?.querySelectorAll<HTMLElement>(selector) ?? [];
        targets.forEach((element, index) => {
          gsap.fromTo(
            element,
            { autoAlpha: 0, y: 22 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.65,
              ease: "power3.out",
              delay:
                element.getBoundingClientRect().top < window.innerHeight
                  ? Math.min(index * 0.055, 0.25)
                  : 0,
              clearProps: "transform,opacity,visibility",
              scrollTrigger: { trigger: element, start: "top 95%", once: true },
            },
          );
        });
      },
      ref,
    );
    return () => media.revert();
  }, [key, enabled, selector]);
  return ref;
}
