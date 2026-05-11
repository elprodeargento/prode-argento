'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function LandingHero() {
  return (
    <section className="relative bg-[#002B72] overflow-hidden min-h-[80vh] flex items-center">
      <div className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(116,172,223,0.25) 0%, transparent 70%)',
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-1.5"
        style={{ background: 'repeating-linear-gradient(90deg,#74ACDF 0,#74ACDF 50%,#fff 50%,#fff 100%)', backgroundSize: '14px 6px' }}
      />

      {/* Confetti Animation & Marquee */}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg) rotateX(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg) rotateX(360deg); opacity: 0; }
        }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Confetti Particles (deterministic to avoid hydration errors) */}
      {Array.from({ length: 40 }).map((_, i) => {
        const colors = ['#F5C518', '#74ACDF', '#FFFFFF', '#FF5733', '#00D1B2'];
        const left = (i * 17) % 100;
        const width = 6 + (i % 6);
        const height = width * (0.8 + ((i % 3) * 0.2));
        const duration = 4 + (i % 3); // Faster fall
        const delay = (i % 5) * 0.5; // Less delay so it finishes quicker
        const bg = colors[i % colors.length];
        return (
          <div
            key={`confetti-${i}`}
            className="absolute top-[-10%] z-0 opacity-0"
            style={{
              left: `${left}%`,
              width: `${width}px`,
              height: `${height}px`,
              backgroundColor: bg,
              borderRadius: i % 2 === 0 ? '50%' : '2px',
              animation: `fall ${duration}s linear ${delay}s forwards`,
            }}
          />
        );
      })}

      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-8">
            <div className="w-2 h-2 rounded-full bg-[#F5C518]" />
            <span className="text-white text-xs font-bold tracking-widest uppercase">Mundial 2026 · Para Comercios</span>
            <div className="w-2 h-2 rounded-full bg-[#F5C518]" />
          </div>
          <div className="mb-6 flex justify-center animate-bounce">
            <img
              src="/EL PRODE ARGENTO-05.png"
              alt="Mascota Prode"
              className="h-42 w-auto object-contain drop-shadow-2xl"
            />
          </div>
          <h1 className="font-bebas text-7xl text-white leading-none tracking-wide mb-2">
            PRODE<br /><span className="text-[#F5C518]">MUNDIAL</span><br />2026
          </h1>
          <p className="text-white/70 text-lg font-semibold mb-8 leading-relaxed">
            Creá tu propio prode con la imagen de tu negocio en minutos. Tus clientes juegan, vos vendés más.
          </p>
          <Link href="/empresa/registro">
            <Button size="lg" className="w-full rounded-full font-black text-[#002B72] !bg-[#F5C518] hover:!bg-yellow-300 shadow-xl">
              🚀 Crear el prode de mi comercio
            </Button>
          </Link>
          <div className="flex justify-center gap-8 mt-10">
            {[["5'", "Para configurar"], ["ilimitados", "Participantes"], ["$0", "Para empezar"]].map(([num, label]) => (
              <div key={label} className="text-center">
                <div className={`font-bebas text-[#F5C518] h-9 flex items-center justify-center ${num === 'ilimitados' ? 'text-xl' : 'text-3xl'}`}>{num}</div>
                <div className="text-white/50 text-xs font-bold uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Logos Section - Carousel */}
        <div className="mt-20 pt-10 border-t border-white/10 w-full overflow-hidden">
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-8 text-center">Empresas que ya armaron su prode</p>

          <div className="relative w-full max-w-full overflow-hidden whitespace-nowrap before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-[15%] before:bg-gradient-to-r before:from-[#002B72] before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-[15%] after:bg-gradient-to-l after:from-[#002B72] after:to-transparent">

            <div className="inline-flex items-center gap-16 animate-marquee opacity-90 pl-16">
              {[...["aestherion.svg", "borde.webp", "pupys-10.png", "aestherion.svg", "borde.webp", "pupys-10.png"], ...["aestherion.svg", "borde.webp", "pupys-10.png", "aestherion.svg", "borde.webp", "pupys-10.png"]].map((logo, i) => (
                <div key={i} className="relative h-16 w-32 sm:h-20 sm:w-36 flex-shrink-0 hover:scale-110 transition-transform duration-300 cursor-pointer">
                  <img
                    src={`/${logo}`}
                    alt={`Sponsor ${i + 1}`}
                    className="w-full h-full object-contain drop-shadow-md hover:drop-shadow-xl filter grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
