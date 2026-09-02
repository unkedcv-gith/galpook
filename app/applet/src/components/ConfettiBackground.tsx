import React, { useMemo } from 'react';

const COLORS = ['#ED3078', '#1EB8BF', '#A3BA13', '#F2C700'];
const SHAPES = ['circle', 'square', 'rect'];

export const ConfettiBackground: React.FC = () => {
  // Generamos un número reducido de partículas para que no sea invasivo (ej. 40)
  const particles = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      // Duración de caída entre 15s y 45s para que sea muy suave y lento
      animationDuration: `${Math.random() * 30 + 15}s`,
      // Retraso aleatorio para que no caigan todas juntas al inicio
      animationDelay: `-${Math.random() * 45}s`, 
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      // Tamaño pequeño (entre 5px y 12px)
      size: `${Math.random() * 7 + 5}px`, 
      // Opacidad baja (0.1 a 0.3)
      opacity: Math.random() * 0.2 + 0.1, 
      // Movimiento lateral suave
      swayDuration: `${Math.random() * 6 + 4}s`,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <style>
        {`
          @keyframes fallAndRotate {
            0% {
              transform: translateY(-10vh) rotate(0deg);
            }
            100% {
              transform: translateY(110vh) rotate(720deg);
            }
          }
          @keyframes sway {
            0% {
              transform: translateX(-25px);
            }
            100% {
              transform: translateX(25px);
            }
          }
          .confetti-container {
            position: absolute;
            top: -10vh; /* Empieza un poco arriba de la pantalla */
            height: 100vh;
            will-change: transform;
          }
          .confetti-particle {
            will-change: transform;
          }
        `}
      </style>
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-container"
          style={{
            left: p.left,
            animation: `sway ${p.swayDuration} ease-in-out infinite alternate`,
          }}
        >
          <div
            className="confetti-particle"
            style={{
              width: p.shape === 'rect' ? `calc(${p.size} * 1.5)` : p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: p.shape === 'circle' ? '50%' : '2px',
              opacity: p.opacity,
              animation: `fallAndRotate ${p.animationDuration} linear infinite`,
              animationDelay: p.animationDelay,
            }}
          />
        </div>
      ))}
    </div>
  );
};
