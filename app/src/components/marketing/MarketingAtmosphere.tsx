import type { CSSProperties, ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

type MarketingAtmosphereProps = {
  className?: string;
  variant?: 'site' | 'hero' | 'compact';
};

type MarketingRevealProps = {
  as?: 'div' | 'section';
  children: ReactNode;
  className?: string;
  delay?: number;
};

type ConnectedCubeFieldProps = {
  className?: string;
  density?: 'hero' | 'section';
};

const floatingCubes = [
  { className: 'left-[3%] top-[8%] arcora-cube-cyan', size: '2.4rem', delay: '0s', duration: '18s', driftX: '0px', driftY: '15px' },
  { className: 'left-[8%] top-[65%] arcora-cube-blue', size: '1.3rem', delay: '-4s', duration: '20s', driftX: '20px', driftY: '0px' },
  { className: 'right-[5%] top-[12%] arcora-cube-purple', size: '1.8rem', delay: '-7s', duration: '22s', driftX: '0px', driftY: '-18px' },
  { className: 'right-[3%] top-[55%] arcora-cube-glass', size: '2.2rem', delay: '-11s', duration: '19s', driftX: '-25px', driftY: '0px' },
  { className: 'left-[22%] top-[88%] arcora-cube-purple', size: '1.0rem', delay: '-2s', duration: '16s', driftX: '0px', driftY: '-12px' },
  { className: 'right-[12%] top-[82%] arcora-cube-cyan', size: '1.5rem', delay: '-14s', duration: '21s', driftX: '15px', driftY: '0px' },
  { className: 'left-[42%] top-[4%] arcora-cube-glass', size: '0.9rem', delay: '-6s', duration: '17s', driftX: '0px', driftY: '20px' },
  { className: 'right-[22%] top-[6%] arcora-cube-blue', size: '1.1rem', delay: '-9s', duration: '23s', driftX: '-15px', driftY: '0px' },
  { className: 'left-[6%] top-[38%] arcora-cube-glass', size: '0.75rem', delay: '-13s', duration: '15s', driftX: '0px', driftY: '-10px' },
  { className: 'right-[7%] top-[38%] arcora-cube-purple', size: '0.85rem', delay: '-16s', duration: '24s', driftX: '20px', driftY: '0px' },
  { className: 'left-[32%] top-[50%] arcora-cube-cyan', size: '1.2rem', delay: '-3s', duration: '19s', driftX: '0px', driftY: '18px' },
  { className: 'right-[35%] top-[70%] arcora-cube-glass', size: '1.6rem', delay: '-8s', duration: '21s', driftX: '-22px', driftY: '0px' },
  { className: 'left-[15%] top-[25%] arcora-cube-blue', size: '1.4rem', delay: '-1s', duration: '18s', driftX: '0px', driftY: '-15px' },
  { className: 'right-[40%] top-[20%] arcora-cube-purple', size: '0.9rem', delay: '-12s', duration: '17s', driftX: '18px', driftY: '0px' },
];

const sortingCubes = [
  { tone: 'arcora-cube-cyan', startX: '-20vw', startY: '15vh', stackY: '0rem', delay: '0s' },
  { tone: 'arcora-cube-blue', startX: '12vw', startY: '25vh', stackY: '-1.4rem', delay: '1.5s' },
  { tone: 'arcora-cube-purple', startX: '-15vw', startY: '-10vh', stackY: '-2.8rem', delay: '3s' },
  { tone: 'arcora-cube-glass', startX: '8vw', startY: '-20vh', stackY: '-4.2rem', delay: '4.5s' },
  { tone: 'arcora-cube-cyan', startX: '-8vw', startY: '30vh', stackY: '-5.6rem', delay: '6s' },
  { tone: 'arcora-cube-blue', startX: '18vw', startY: '5vh', stackY: '-7.0rem', delay: '7.5s' },
];

const moduleIcons = [
  { label: 'Bills', className: 'left-[2%] top-[12%]', size: '6.5rem', colorClass: 'arcora-module-icon--blue', rotate: '-8deg', delay: '0s', duration: '22s', driftX: '18px', driftY: '25px' },
  { label: 'Subscriptions', className: 'right-[6%] top-[25%]', size: '5.5rem', colorClass: 'arcora-module-icon--purple', rotate: '12deg', delay: '-4s', duration: '18s', driftX: '-20px', driftY: '12px' },
  { label: 'Warranties', className: 'left-[18%] bottom-[15%]', size: '6rem', colorClass: 'arcora-module-icon--glass', rotate: '-5deg', delay: '-8s', duration: '24s', driftX: '15px', driftY: '-18px' },
  { label: 'Documents', className: 'right-[14%] bottom-[20%]', size: '7rem', colorClass: 'arcora-module-icon--cyan', rotate: '10deg', delay: '-12s', duration: '20s', driftX: '-18px', driftY: '-24px' },
  { label: 'Passwords', className: 'left-[45%] top-[8%]', size: '5rem', colorClass: 'arcora-module-icon--purple', rotate: '8deg', delay: '-2s', duration: '19s', driftX: '0px', driftY: '20px' },
  { label: 'Reminders', className: 'right-[42%] bottom-[8%]', size: '5.8rem', colorClass: 'arcora-module-icon--cyan', rotate: '-12deg', delay: '-16s', duration: '26s', driftX: '22px', driftY: '8px' },
];

const connectionLines = [
  'left-[14%] top-[28%] w-28 rotate-[18deg]',
  'right-[10%] top-[38%] w-36 -rotate-[12deg]',
  'left-[42%] top-[76%] w-32 rotate-[8deg]',
];

const networkCubes = [
  {
    label: 'Bills',
    className: 'left-[1%] top-[17%] h-20 w-20 md:h-24 md:w-24',
    tone: 'arcora-network-cube--blue',
    delay: 0,
  },
  {
    label: 'Documents',
    className: 'left-[15%] top-[69%] h-16 w-16 md:h-20 md:w-20',
    tone: 'arcora-network-cube--cyan',
    delay: 0.3,
  },
  {
    label: 'Dashboard',
    className: 'left-[43%] top-[6%] h-14 w-14 md:h-[4.5rem] md:w-[4.5rem]',
    tone: 'arcora-network-cube--indigo',
    delay: 0.6,
  },
  {
    label: 'Passwords',
    className: 'right-[4%] top-[18%] h-16 w-16 md:h-24 md:w-24',
    tone: 'arcora-network-cube--violet',
    delay: 0.9,
  },
  {
    label: 'Reminders',
    className: 'right-[9%] bottom-[13%] h-20 w-20 md:h-24 md:w-24',
    tone: 'arcora-network-cube--teal',
    delay: 1.2,
  },
  {
    label: 'Warranties',
    className: 'left-[50%] bottom-[2%] h-14 w-14 md:h-[4.5rem] md:w-[4.5rem]',
    tone: 'arcora-network-cube--blue',
    delay: 1.5,
  },
];

export const MarketingAtmosphere = ({
  className,
  variant = 'site',
}: MarketingAtmosphereProps) => (
  <div
    aria-hidden="true"
    className={cn('arcora-atmosphere', `arcora-atmosphere--${variant}`, className)}
  >
    <div className="arcora-atmosphere-grid" />
    <div className="arcora-atmosphere-wash" />
    <div className="arcora-atmosphere-lines">
      {connectionLines.map((line) => (
        <span key={line} className={cn('arcora-connection-line', line)} />
      ))}
    </div>
    <div className="arcora-atmosphere-cubes">
      {floatingCubes.map((cube) => (
        <span
          key={`${cube.className}-${cube.size}`}
          className={cn('arcora-floating-cube', cube.className)}
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
      
      {sortingCubes.map((cube, i) => (
        <span
          key={`sort-${i}`}
          className={cn('arcora-sorting-cube', cube.tone)}
          style={{
            '--cube-delay': cube.delay,
            '--sort-start-x': cube.startX,
            '--sort-start-y': cube.startY,
            '--sort-stack-y': cube.stackY,
            '--cube-size': '1.8rem',
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

      {/* Foreground Module Icons */}
      {moduleIcons.map((module) => (
        <div
          key={module.label}
          className={cn('arcora-module-icon-container', module.className)}
          style={{
            '--module-delay': module.delay,
            '--module-duration': module.duration,
            '--drift-start-x': '0px',
            '--drift-start-y': '0px',
            '--drift-end-x': module.driftX,
            '--drift-end-y': module.driftY,
            zIndex: 30,
          } as CSSProperties}
        >
          <div className="flex flex-col items-center gap-3" style={{ transform: `rotate(${module.rotate})` }}>
            <div className={cn("arcora-module-icon", module.colorClass)} style={{ '--module-size': module.size } as CSSProperties} />
            <span className="text-[0.65rem] font-[800] tracking-widest text-[#94a3b8] uppercase">
              {module.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const ConnectedCubeField = ({
  className,
  density = 'hero',
}: ConnectedCubeFieldProps) => {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !prefersReducedMotion;

  return (
    <div
      aria-hidden="true"
      className={cn('arcora-cube-field', `arcora-cube-field--${density}`, className)}
    >
      <svg
        className="arcora-cube-field-lines"
        viewBox="0 0 800 520"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="arcoraNetworkStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(37, 99, 235, 0)" />
            <stop offset="22%" stopColor="rgba(59, 130, 246, 0.56)" />
            <stop offset="54%" stopColor="rgba(56, 189, 248, 0.46)" />
            <stop offset="78%" stopColor="rgba(20, 184, 166, 0.42)" />
            <stop offset="100%" stopColor="rgba(20, 184, 166, 0)" />
          </linearGradient>
        </defs>
        {[
          'M48 112 C178 28 290 82 382 168 C500 278 592 228 752 110',
          'M92 396 C230 260 330 362 430 286 C540 204 610 326 730 406',
          'M132 168 C238 238 318 236 414 226 C520 214 604 170 704 178',
          'M188 438 C300 404 402 346 488 278 C584 202 642 156 742 96',
        ].map((path, index) => (
          <g key={path}>
            <motion.path
              d={path}
              fill="none"
              stroke="url(#arcoraNetworkStroke)"
              strokeLinecap="round"
              strokeWidth={index === 0 ? 2.2 : 1.4}
              strokeDasharray={index === 0 ? '10 18' : '7 16'}
              animate={shouldAnimate ? { strokeDashoffset: [0, -90] } : undefined}
              transition={{
                duration: 16 + index * 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            {shouldAnimate && (
              <g>
                <animateMotion
                  dur={`${12 + index * 2}s`}
                  repeatCount="indefinite"
                  path={path}
                  calcMode="linear"
                />
                <foreignObject width="32" height="32" x="-16" y="-16" className="overflow-visible pointer-events-none">
                  <div className={cn("arcora-packet-cube absolute inset-0 transform scale-[0.4]", index % 2 === 0 ? "arcora-cube-cyan" : "arcora-cube-blue")}>
                    <span className="arcora-cube-3d">
                      <span className="arcora-cube-face-top" />
                      <span className="arcora-cube-face-front" />
                      <span className="arcora-cube-face-right" />
                    </span>
                  </div>
                </foreignObject>
              </g>
            )}
          </g>
        ))}
      </svg>

      <div className="arcora-cube-field-particles">
        {Array.from({ length: density === 'hero' ? 18 : 10 }).map((_, index) => (
          <span
            key={index}
            className="arcora-field-particle"
            style={
              {
                '--particle-delay': `${index * -0.9}s`,
                '--particle-left': `${8 + ((index * 19) % 84)}%`,
                '--particle-top': `${12 + ((index * 31) % 72)}%`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      {networkCubes.map((cube) => (
        <motion.div
          key={cube.label}
          className={cn('arcora-network-cube absolute', cube.className, cube.tone)}
          animate={
            shouldAnimate
              ? {
                  y: [0, -10, 0, 6, 0],
                  x: [0, 4, -3, 0],
                  rotate: [0, 2, 0, -1, 0],
                }
              : undefined
          }
          transition={{
            duration: 11,
            delay: cube.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <span className="arcora-network-cube-face" />
          <span className="arcora-network-cube-label">{cube.label}</span>
        </motion.div>
      ))}
    </div>
  );
};

export const MarketingReveal = ({
  as = 'div',
  children,
  className,
  delay = 0,
}: MarketingRevealProps) => {
  const prefersReducedMotion = useReducedMotion();
  const Component = as === 'section' ? motion.section : motion.div;

  if (prefersReducedMotion) {
    const StaticComponent = as;
    return <StaticComponent className={className}>{children}</StaticComponent>;
  }

  return (
    <Component
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.58, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </Component>
  );
};
