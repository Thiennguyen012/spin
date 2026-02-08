import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

interface ParticleBackgroundProps {
  customBackground?: string | null;
}

const ParticleBackground = ({ customBackground }: ParticleBackgroundProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        delay: Math.random() * 5,
        duration: Math.random() * 3 + 2,
      });
    }
    setParticles(newParticles);
  }, []);

  const bgUrl = customBackground || "/asset/quaysoyepfix.png";

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Background image */}
      <img
        src={bgUrl}
        alt=""
        className="absolute inset-0 w-full h-full"
        style={{ objectFit: "fill" }}
      />

      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-lucky-gold particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

export default ParticleBackground;
