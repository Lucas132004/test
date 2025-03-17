import React, { useEffect, useRef } from 'react';

export function Globe({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let rotation = 0;

    const draw = () => {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw globe
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 100, 0, Math.PI * 2);
      ctx.strokeStyle = '#2c5530';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw latitude lines
      for (let i = 1; i < 4; i++) {
        const radius = Math.abs(100 * Math.cos((i * Math.PI) / 8));
        const yOffset = 100 * Math.sin((i * Math.PI) / 8);
        
        ctx.beginPath();
        ctx.ellipse(
          canvas.width / 2,
          canvas.height / 2 - yOffset,
          100,
          radius,
          0,
          0,
          Math.PI * 2
        );
        ctx.strokeStyle = 'rgba(44, 85, 48, 0.3)';
        ctx.stroke();

        // Draw the mirrored line below the equator
        ctx.beginPath();
        ctx.ellipse(
          canvas.width / 2,
          canvas.height / 2 + yOffset,
          100,
          radius,
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }

      // Draw longitude lines
      for (let i = 0; i < 8; i++) {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rotation + (i * Math.PI) / 4);
        ctx.beginPath();
        ctx.arc(0, 0, 100, -Math.PI / 2, Math.PI / 2);
        ctx.strokeStyle = 'rgba(44, 85, 48, 0.3)';
        ctx.stroke();
        ctx.restore();
      }

      rotation += 0.002;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      className={`${className} absolute`}
    />
  );
}