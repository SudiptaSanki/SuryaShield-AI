"use client";

import { useEffect, useRef } from "react";

export default function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const stars: { x: number; y: number; radius: number; speed: number; alpha: number }[] = [];
    const numStars = 200;

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5,
        speed: Math.random() * 0.5 + 0.1,
        alpha: Math.random()
      });
    }

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle nebula gradient in background
      const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/1.5);
      gradient.addColorStop(0, "rgba(26, 17, 69, 0.1)");
      gradient.addColorStop(1, "rgba(6, 9, 24, 0.8)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw stars
      for (const star of stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        
        // Twinkle effect
        star.alpha += (Math.random() - 0.5) * 0.05;
        star.alpha = Math.max(0.1, Math.min(1, star.alpha));
        
        ctx.fillStyle = `rgba(232, 230, 240, ${star.alpha})`;
        ctx.fill();

        // Move stars slowly
        star.y += star.speed;
        
        // Reset if off screen
        if (star.y > height) {
          star.y = 0;
          star.x = Math.random() * width;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
    />
  );
}
