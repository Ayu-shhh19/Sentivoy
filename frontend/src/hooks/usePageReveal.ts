import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useUIStore } from "@/lib/uiStore";

export function usePageReveal<T extends HTMLElement = HTMLDivElement>(
  key: string,
  selector = "[data-reveal]",
  active = true,
) {
  const ref = useRef<T>(null);
  const enabled = useUIStore((state) => state.animations);
  useLayoutEffect(() => {
    if (!ref.current || !enabled || !active) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        const targets = ref.current?.querySelectorAll<HTMLElement>(selector) ?? [];
        targets.forEach((element) => {
          const direction = element.dataset.reveal;
          const isLanding = key === "landing";
          const siblings =
            element.parentElement?.querySelectorAll<HTMLElement>(":scope > [data-reveal]");
          const order = siblings ? Array.from(siblings).indexOf(element) : 0;
          gsap.fromTo(
            element,
            {
              autoAlpha: 0,
              x: direction === "left" ? -32 : direction === "right" ? 32 : 0,
              y: direction === "left" || direction === "right" ? 0 : isLanding ? 34 : 22,
              scale: direction === "scale" ? 0.96 : 1,
              filter: isLanding ? "blur(7px)" : "none",
            },
            {
              autoAlpha: 1,
              x: 0,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              duration: isLanding ? 0.88 : 0.65,
              ease: "power3.out",
              delay:
                element.getBoundingClientRect().top < window.innerHeight
                  ? Math.min(Math.max(order, 0) * 0.09, 0.27)
                  : Math.min(Math.max(order, 0) * 0.07, 0.21),
              clearProps: "transform,opacity,visibility,filter",
              scrollTrigger: { trigger: element, start: "top 88%", once: true },
            },
          );
        });
      },
      ref,
    );
    return () => media.revert();
  }, [key, enabled, selector, active]);
  return ref;
}
