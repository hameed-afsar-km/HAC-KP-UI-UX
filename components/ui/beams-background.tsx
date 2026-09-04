"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface AnimatedGradientBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  intensity?: "subtle" | "medium" | "strong";
}

interface Beam {
  x: number;
  y: number;
  width: number;
  length: number;
  angle: number;
  speed: number;
  opacity: number;
  hue: number;
  pulse: number;
  pulseSpeed: number;
}

function createBeam(width: number, height: number): Beam {
  const angle = -35 + Math.random() * 10;
  return {
    x: Math.random() * width * 1.5 - width * 0.25,
    y: Math.random() * height * 1.5 - height * 0.25,
    width: 50 + Math.random() * 80,
    length: height * 2.5,
    angle,
    speed: 0.6 + Math.random() * 1.2,
    opacity: 0.12 + Math.random() * 0.1,
    hue: 16 + Math.random() * 8,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.02 + Math.random() * 0.03,
  };
}

export function BeamsBackground({
  className,
  intensity = "medium",
  children,
}: AnimatedGradientBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beamsRef = useRef<Beam[]>([]);
  const animationFrameRef = useRef<number>(0);
  const prefersReducedMotion = useRef(false);
  const BEAM_COUNT = 12;

  const opacityMap: Record<string, number> = {
    subtle: 0.8,
    medium: 1,
    strong: 1,
  };

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const dpr = window.devicePixelRatio || 1;
    const logicalW = canvas.width / dpr;
    const logicalH = canvas.height / dpr;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const totalBeams = beamsRef.current.length;
    beamsRef.current.forEach((beam, index) => {
      beam.y -= beam.speed;
      beam.pulse += beam.pulseSpeed;

      if (beam.y + beam.length < -100) {
        const column = index % 3;
        const spacing = logicalW / 3;
        beam.y = logicalH + 100;
        beam.x = column * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * 0.5;
        beam.width = 140 + Math.random() * 160;
        beam.speed = 0.5 + Math.random() * 0.4;
        beam.hue = 16 + (index * 8) / totalBeams;
        beam.opacity = 0.12 + Math.random() * 0.1;
      }

      ctx.save();
      ctx.translate(beam.x, beam.y);
      ctx.rotate((beam.angle * Math.PI) / 180);

      const pulsingOpacity =
        beam.opacity * (0.85 + Math.sin(beam.pulse) * 0.15) * opacityMap[intensity];

      const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);
      gradient.addColorStop(0, `hsla(${beam.hue}, 90%, 40%, 0)`);
      gradient.addColorStop(0.05, `hsla(${beam.hue}, 90%, 40%, ${pulsingOpacity * 0.3})`);
      gradient.addColorStop(0.15, `hsla(${beam.hue}, 90%, 40%, ${pulsingOpacity * 0.7})`);
      gradient.addColorStop(0.35, `hsla(${beam.hue}, 90%, 40%, ${pulsingOpacity})`);
      gradient.addColorStop(0.65, `hsla(${beam.hue}, 90%, 40%, ${pulsingOpacity})`);
      gradient.addColorStop(0.85, `hsla(${beam.hue}, 90%, 40%, ${pulsingOpacity * 0.7})`);
      gradient.addColorStop(0.95, `hsla(${beam.hue}, 90%, 40%, ${pulsingOpacity * 0.3})`);
      gradient.addColorStop(1, `hsla(${beam.hue}, 90%, 40%, 0)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
      ctx.restore();
    });

    ctx.restore();
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [intensity]);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      beamsRef.current = Array.from({ length: BEAM_COUNT }, () =>
        createBeam(window.innerWidth, window.innerHeight)
      );
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate]);

  if (prefersReducedMotion.current) {
    return (
      <div className={cn("relative min-h-screen w-full overflow-hidden bg-black", className)}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative min-h-screen w-full overflow-hidden bg-[#0a0a0a]",
        className
      )}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ filter: "blur(30px)", willChange: "transform" }}
      />

      <motion.div
        className="absolute inset-0"
        animate={{
          opacity: [0.02, 0.08, 0.02],
        }}
        transition={{
          duration: 12,
          ease: "easeInOut",
          repeat: Number.POSITIVE_INFINITY,
        }}
        style={{
          background: "radial-gradient(ellipse at 50% 30%, rgba(180, 50, 0, 0.04) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}