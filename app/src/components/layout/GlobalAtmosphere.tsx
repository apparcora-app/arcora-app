/**
 * GlobalAtmosphere — Theme-aware ambient 3D animation layer.
 *
 * Renders floating isometric cubes, data-flow lines, drifting module icons,
 * and particle fields. Accepts a `theme` prop to switch between the marketing
 * site's light palette and a dark-mode palette tuned for auth pages.
 *
 * Usage:
 *   <GlobalAtmosphere theme="dark" />   ← behind Login / Register
 *   <GlobalAtmosphere />                ← defaults to "light" (marketing)
 */
import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

type GlobalAtmosphereProps = {
  className?: string;
  theme?: 'light' | 'dark';
};

/* ------------------------------------------------------------------ */
/*  Data — floating cubes                                              */
/* ------------------------------------------------------------------ */
const floatingCubes = [
  { className: 'left-[3%] top-[8%]', tone: 'cyan', size: '2.2rem', delay: '0s', duration: '18s', driftX: '0px', driftY: '15px' },
  { className: 'left-[8%] top-[65%]', tone: 'blue', size: '1.3rem', delay: '-4s', duration: '20s', driftX: '20px', driftY: '0px' },
  { className: 'right-[5%] top-[12%]', tone: 'purple', size: '1.6rem', delay: '-7s', duration: '22s', driftX: '0px', driftY: '-18px' },
  { className: 'right-[3%] top-[55%]', tone: 'glass', size: '2.0rem', delay: '-11s', duration: '19s', driftX: '-25px', driftY: '0px' },
  { className: 'left-[22%] top-[88%]', tone: 'purple', size: '1.0rem', delay: '-2s', duration: '16s', driftX: '0px', driftY: '-12px' },
  { className: 'right-[12%] top-[82%]', tone: 'cyan', size: '1.4rem', delay: '-14s', duration: '21s', driftX: '15px', driftY: '0px' },
  { className: 'left-[42%] top-[4%]', tone: 'glass', size: '0.9rem', delay: '-6s', duration: '17s', driftX: '0px', driftY: '20px' },
  { className: 'right-[22%] top-[6%]', tone: 'blue', size: '1.1rem', delay: '-9s', duration: '23s', driftX: '-15px', driftY: '0px' },
  { className: 'left-[6%] top-[38%]', tone: 'glass', size: '0.75rem', delay: '-13s', duration: '15s', driftX: '0px', driftY: '-10px' },
  { className: 'right-[7%] top-[38%]', tone: 'purple', size: '0.85rem', delay: '-16s', duration: '24s', driftX: '20px', driftY: '0px' },
  { className: 'left-[32%] top-[50%]', tone: 'cyan', size: '1.2rem', delay: '-3s', duration: '19s', driftX: '0px', driftY: '18px' },
  { className: 'right-[35%] top-[70%]', tone: 'glass', size: '1.5rem', delay: '-8s', duration: '21s', driftX: '-22px', driftY: '0px' },
];

/* ------------------------------------------------------------------ */
/*  Data — "chaos to order" sorting cubes                              */
/* ------------------------------------------------------------------ */
const sortingCubes = [
  { tone: 'cyan', startX: '-20vw', startY: '15vh', stackY: '0rem', delay: '0s' },
  { tone: 'blue', startX: '12vw', startY: '25vh', stackY: '-1.4rem', delay: '1.5s' },
  { tone: 'purple', startX: '-15vw', startY: '-10vh', stackY: '-2.8rem', delay: '3s' },
  { tone: 'glass', startX: '8vw', startY: '-20vh', stackY: '-4.2rem', delay: '4.5s' },
  { tone: 'cyan', startX: '-8vw', startY: '30vh', stackY: '-5.6rem', delay: '6s' },
  { tone: 'blue', startX: '18vw', startY: '5vh', stackY: '-7.0rem', delay: '7.5s' },
];

/* ------------------------------------------------------------------ */
/*  Data — connection lines                                           */
/* ------------------------------------------------------------------ */
const connectionLines = [
  'left-[14%] top-[28%] w-28 rotate-[18deg]',
  'right-[10%] top-[38%] w-36 -rotate-[12deg]',
  'left-[42%] top-[76%] w-32 rotate-[8deg]',
];

/* ------------------------------------------------------------------ */
/*  Data — drifting module-label icons                                 */
/* ------------------------------------------------------------------ */
const moduleIcons = [
  { label: 'Bills', className: 'left-[2%] top-[12%]', size: '5.5rem', color: 'blue', rotate: '-8deg', delay: '0s', duration: '22s', driftX: '18px', driftY: '25px' },
  { label: 'Subscriptions', className: 'right-[6%] top-[25%]', size: '4.8rem', color: 'purple', rotate: '12deg', delay: '-4s', duration: '18s', driftX: '-20px', driftY: '12px' },
  { label: 'Warranties', className: 'left-[18%] bottom-[15%]', size: '5rem', color: 'glass', rotate: '-5deg', delay: '-8s', duration: '24s', driftX: '15px', driftY: '-18px' },
  { label: 'Documents', className: 'right-[14%] bottom-[20%]', size: '5.8rem', color: 'cyan', rotate: '10deg', delay: '-12s', duration: '20s', driftX: '-18px', driftY: '-24px' },
  { label: 'Passwords', className: 'left-[45%] top-[8%]', size: '4.2rem', color: 'purple', rotate: '8deg', delay: '-2s', duration: '19s', driftX: '0px', driftY: '20px' },
  { label: 'Reminders', className: 'right-[42%] bottom-[8%]', size: '4.8rem', color: 'cyan', rotate: '-12deg', delay: '-16s', duration: '26s', driftX: '22px', driftY: '8px' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export const GlobalAtmosphere = ({
  className,
  theme = 'light',
}: GlobalAtmosphereProps) => {
  const isDark = theme === 'dark';
  const toneClass = (base: string) =>
    isDark ? `arcora-cube-${base} arcora-cube-${base}--dark` : `arcora-cube-${base}`;

  return (
    <div
      aria-hidden="true"
      className={cn(
        'arcora-atmosphere arcora-atmosphere--site',
        isDark && 'arcora-atmosphere--dark',
        className,
      )}
    >
      {/* Grid overlay */}
      <div className="arcora-atmosphere-grid" />

      {/* Colour wash */}
      <div className="arcora-atmosphere-wash" />

      {/* Connection lines */}
      <div className="arcora-atmosphere-lines">
        {connectionLines.map((line) => (
          <span key={line} className={cn('arcora-connection-line', line)} />
        ))}
      </div>

      {/* Cubes + module icons */}
      <div className="arcora-atmosphere-cubes">
        {/* Floating cubes */}
        {floatingCubes.map((cube) => (
          <span
            key={`${cube.className}-${cube.size}`}
            className={cn('arcora-floating-cube', cube.className, toneClass(cube.tone))}
            style={
              {
                '--cube-delay': cube.delay,
                '--cube-duration': cube.duration,
                '--cube-size': cube.size,
                '--drift-x': cube.driftX,
                '--drift-y': cube.driftY,
              } as CSSProperties
            }
          >
            <span className="arcora-cube-3d">
              <span className="arcora-cube-face-top" />
              <span className="arcora-cube-face-front" />
              <span className="arcora-cube-face-right" />
            </span>
          </span>
        ))}

        {/* Sorting cubes — "chaos to order" */}
        {sortingCubes.map((cube, i) => (
          <span
            key={`sort-${i}`}
            className={cn('arcora-sorting-cube', toneClass(cube.tone))}
            style={{
              '--cube-delay': cube.delay,
              '--sort-start-x': cube.startX,
              '--sort-start-y': cube.startY,
              '--sort-stack-y': cube.stackY,
              '--cube-size': '1.6rem',
              zIndex: 10 - i,
            } as CSSProperties}
          >
            <span className="arcora-cube-3d">
              <span className="arcora-cube-face-top" />
              <span className="arcora-cube-face-front" />
              <span className="arcora-cube-face-right" />
            </span>
          </span>
        ))}

        {/* Module label icons */}
        {moduleIcons.map((mod) => (
          <div
            key={mod.label}
            className={cn('arcora-module-icon-container', mod.className)}
            style={{
              '--module-delay': mod.delay,
              '--module-duration': mod.duration,
              '--drift-start-x': '0px',
              '--drift-start-y': '0px',
              '--drift-end-x': mod.driftX,
              '--drift-end-y': mod.driftY,
              zIndex: 30,
            } as CSSProperties}
          >
            <div className="flex flex-col items-center gap-3" style={{ transform: `rotate(${mod.rotate})` }}>
              <div
                className={cn(
                  'arcora-module-icon',
                  isDark ? `arcora-module-icon--${mod.color}-dark` : `arcora-module-icon--${mod.color}`,
                )}
                style={{ '--module-size': mod.size } as CSSProperties}
              />
              <span
                className={cn(
                  'text-[0.6rem] font-[800] tracking-widest uppercase',
                  isDark ? 'text-slate-400/70' : 'text-[#94a3b8]',
                )}
              >
                {mod.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
