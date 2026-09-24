import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useUIStore } from "@/lib/uiStore";

export function UIRuntime() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const smoothScroll = useUIStore((state) => state.smoothScroll);
  const animations = useUIStore((state) => state.animations);
  useEffect(() => {
    void useUIStore.persist.rehydrate();
  }, []);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    const close = () => {
      if (desktop.matches) useUIStore.getState().setMobileOpen(false);
    };
    desktop.addEventListener("change", close);
    return () => desktop.removeEventListener("change", close);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = animations ? "enabled" : "reduced";
    if (pathname !== "/" || !smoothScroll || !animations) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference) and (pointer: fine)", () => {
      const lenis = new Lenis({
        duration: 1.05,
        anchors: { offset: -88 },
        prevent: (node) => node.hasAttribute("data-lenis-prevent"),
      });
      const tick = (time: number) => lenis.raf(time * 1000);
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tick);
      return () => {
        gsap.ticker.remove(tick);
        lenis.destroy();
      };
    });
    return () => media.revert();
  }, [pathname, smoothScroll, animations]);
  return null;
}
