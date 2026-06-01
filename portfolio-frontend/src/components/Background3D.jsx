import { useEffect, useRef } from "react";

export default function Background3D() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse tracking
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const handleMouseMove = (e) => {
      mouse.targetX = (e.clientX - width / 2) / (width / 2);
      mouse.targetY = (e.clientY - height / 2) / (height / 2);
    };

    window.addEventListener("mousemove", handleMouseMove);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Generate 3D points
    const particleCount = 120;
    const particles = [];
    const sphereRadius = Math.min(width, height) * 0.35;

    for (let i = 0; i < particleCount; i++) {
      // Uniform distribution on sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = sphereRadius * (0.3 + 0.7 * Math.random());

      particles.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        baseRadius: Math.random() * 2 + 1,
      });
    }

    // Rotation angles
    let angleX = 0.001;
    let angleY = 0.001;

    const focalLength = 500;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse easing
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Base rotation + mouse influence
      const currentAngleX = 0.0015 + mouse.y * 0.005;
      const currentAngleY = 0.0015 + mouse.x * 0.005;

      const cosX = Math.cos(currentAngleX);
      const sinX = Math.sin(currentAngleX);
      const cosY = Math.cos(currentAngleY);
      const sinY = Math.sin(currentAngleY);

      // Project and rotate all points
      const projected = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Rotate Y
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.z * cosY + p.x * sinY;

        // Rotate X
        let y2 = p.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.y * sinX;

        // Update particle actual coords so the rotation persists
        p.x = x1;
        p.y = y2;
        p.z = z2;

        // 3D perspective projection
        // Shift depth forward slightly to avoid division by zero or negative scale
        const zOffset = z2 + focalLength;
        if (zOffset > 10) {
          const scale = focalLength / zOffset;
          const projX = x1 * scale + width / 2;
          const projY = y2 * scale + height / 2;

          projected.push({
            x: projX,
            y: projY,
            z: z2,
            scale: scale,
            radius: p.baseRadius * scale,
          });
        }
      }

      // Draw connections (constellation lines)
      const maxDistance = 140;
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];
        for (let j = i + 1; j < projected.length; j++) {
          const p2 = projected[j];

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            // Depth representation: average z position
            const avgZ = (p1.z + p2.z) / 2;
            // Opacity drops as distance increases and as z is deeper
            const opacity = (1 - dist / maxDistance) * 0.15 * ((avgZ + sphereRadius) / (sphereRadius * 2));
            if (opacity > 0) {
              ctx.beginPath();
              ctx.strokeStyle = `rgba(255, 106, 0, ${opacity})`;
              ctx.lineWidth = 0.5 + p1.scale * 0.5;
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }

      // Draw particle points
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const opacity = 0.15 + 0.65 * ((p.z + sphereRadius) / (sphereRadius * 2));

        // Create glowing radial gradient for each particle
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3);
        grad.addColorStop(0, `rgba(255, 130, 20, ${opacity})`);
        grad.addColorStop(0.3, `rgba(255, 80, 0, ${opacity * 0.6})`);
        grad.addColorStop(1, "rgba(255, 80, 0, 0)");

        ctx.beginPath();
        ctx.fillStyle = grad;
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        pointerEvents: "none",
        background: "transparent",
      }}
    />
  );
}
