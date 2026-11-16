import { useEffect, useRef } from "react";

const COLORS = ["#ffffff", "#ffe9c4", "#d4fbff", "#a8c5ff"];

export default function Starfield({
  starCount = 160,
  pixelArt = true,
  shootingStars = true,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    ctx.imageSmoothingEnabled = !pixelArt;

    // Initalize stars
    const stars = Array.from({ length: starCount }, () => {
      const isBright = Math.random() > 0.85;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        size: pixelArt
          ? isBright
            ? 3
            : Math.random() > 0.5
              ? 2
              : 1
          : isBright
            ? Math.random() * 1.6 + 1.1
            : Math.random() * 1.1 + 0.4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        baseAlpha: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.025 + 0.008,
        phase: Math.random() * Math.PI * 2,
        driftX: (Math.random() - 0.5) * 0.06,
        driftY: -Math.random() * 0.1 - 0.02,
        isBright,
      };
    });

    // Shooting stars (only one to keep it fast)
    let meteor = null;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      ctx.imageSmoothingEnabled = !pixelArt;
    };

    // Pause animation if website is not focused
    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        render();
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Fixed stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.phase += s.twinkleSpeed;
        s.x += s.driftX;
        s.y += s.driftY;

        if (s.y < 0) s.y = height;
        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;

        const alpha = Math.max(
          0.05,
          Math.min(1, s.baseAlpha + Math.sin(s.phase) * 0.4),
        );
        ctx.globalAlpha = alpha;
        ctx.fillStyle = s.color;

        if (pixelArt) {
          const px = s.x | 0; // Bitwise OR optimization
          const py = s.y | 0;
          ctx.fillRect(px, py, s.size, s.size);

          // Display cross in the peak of brightness
          if (s.isBright && alpha > 0.78) {
            ctx.fillRect(px - s.size, py, s.size, s.size);
            ctx.fillRect(px + s.size, py, s.size, s.size);
            ctx.fillRect(px, py - s.size, s.size, s.size);
            ctx.fillRect(px, py + s.size, s.size, s.size);
          }
        } else {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Random shooting stars
      if (shootingStars) {
        if (!meteor && Math.random() < 0.0025) {
          meteor = {
            x: Math.random() * width * 0.8,
            y: Math.random() * height * 0.4,
            vx: 6 + Math.random() * 4,
            vy: 3 + Math.random() * 2,
            life: 1,
          };
        }

        if (meteor) {
          ctx.globalAlpha = meteor.life;
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = pixelArt ? 2 : 1.5;
          ctx.beginPath();
          ctx.moveTo(meteor.x, meteor.y);
          ctx.lineTo(meteor.x - meteor.vx * 4, meteor.y - meteor.vy * 4);
          ctx.stroke();

          meteor.x += meteor.vx;
          meteor.y += meteor.vy;
          meteor.life -= 0.03;

          if (meteor.life <= 0) meteor = null;
        }
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener("resize", handleResize, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [starCount, pixelArt, shootingStars]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        pointerEvents: "none", // Doesn't block clicks
        background:
          "radial-gradient(ellipse at bottom, #0b0f17 0%, #040609 100%)",
        imageRendering: pixelArt ? "pixelated" : "auto",
      }}
    />
  );
}
