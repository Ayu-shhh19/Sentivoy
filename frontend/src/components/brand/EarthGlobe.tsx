import { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";
import { Pause, Play } from "lucide-react";
import { useUIStore } from "@/lib/uiStore";

export function EarthGlobe() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const animations = useUIStore((state) => state.animations);
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    let globe: ReturnType<typeof createGlobe>;
    let frame = 0;
    let visible = true;
    let phi = 0.45;
    let previous = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const size = element.clientWidth;
    const ratio = Math.min(window.devicePixelRatio, 2);
    try {
      globe = createGlobe(element, {
        width: size,
        height: size,
        devicePixelRatio: ratio,
        phi,
        theta: 0.18,
        dark: 1,
        diffuse: 1.7,
        mapSamples: 18000,
        mapBrightness: 5,
        baseColor: [0.12, 0.3, 0.6],
        markerColor: [0.4, 0.8, 1],
        glowColor: [0.12, 0.3, 0.56],
        markers: [
          { location: [37.77, -122.42], size: 0.055 },
          { location: [51.5, -0.12], size: 0.045 },
          { location: [28.6, 77.2], size: 0.06 },
          { location: [1.35, 103.8], size: 0.04 },
          { location: [-33.86, 151.2], size: 0.045 },
        ],
        arcs: [
          { from: [51.5, -0.12], to: [28.6, 77.2] },
          { from: [28.6, 77.2], to: [1.35, 103.8] },
          { from: [37.77, -122.42], to: [51.5, -0.12] },
        ],
        arcColor: [0.4, 0.7, 1],
        arcWidth: 0.45,
        arcHeight: 0.2,
      });
      setReady(true);
    } catch {
      setReady(false);
      return;
    }
    const tick = (time: number) => {
      if (visible && !document.hidden && !paused && animations && !reduced.matches) {
        phi += Math.min(time - (previous || time), 50) * 0.00012;
      }
      if (visible && !document.hidden) globe.update({ phi });
      previous = time;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const resize = new ResizeObserver(() => {
      const width = element.clientWidth;
      globe.update({ width, height: width });
    });
    resize.observe(element);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(element);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      observer.disconnect();
      globe.destroy();
    };
  }, [paused, animations]);

  return (
    <div
      className="earth-scene"
      role="group"
      aria-label="Animated Earth showing illustrative global connections"
    >
      <div className="earth-orbit earth-orbit-one" />
      <div className="earth-orbit earth-orbit-two" />
      {!ready && <div className="earth-fallback" />}
      <canvas
        ref={canvas}
        className="earth-canvas"
        aria-hidden="true"
        style={{ opacity: ready ? 1 : 0 }}
      />
      <span className="earth-label earth-label-top">
        <i /> Global perspective
      </span>
      <span className="earth-label earth-label-bottom">
        Connected by intelligence <span>↗</span>
      </span>
      <button
        className="earth-pause"
        onClick={() => setPaused(!paused)}
        aria-label={paused ? "Rotate Earth" : "Pause Earth rotation"}
      >
        {paused ? <Play size={13} /> : <Pause size={13} />}
      </button>
    </div>
  );
}
