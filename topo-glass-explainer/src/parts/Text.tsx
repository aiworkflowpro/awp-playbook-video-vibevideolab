import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp01, easeOut, ramp, useSrc} from '../lib/anim';
import {THEME} from '../theme';

export type RevealProps = {
  a: number;
  b: number;
  text: string;
  x: number;
  y: number;
  width?: number;
  align?: 'left' | 'center' | 'right';
  size?: number;
  weight?: number;
  color?: string;
  lead?: number;
  step?: number;
  fadeOut?: number;
  rise?: number;
  dur?: number;
  lineHeight?: number;
  times?: number[];
  shadow?: boolean;
  tracking?: number;
  bullet?: React.ReactNode;
};

// Word-by-word caption: each word fades up from below, slowly settling. Line breaks are "\n" in the text.
export const Reveal: React.FC<RevealProps> = ({a, b, text, x, y, width = 1700, align = 'center', size = 64, weight = 700, color = '#fff', lead = 14, step = 3.5, fadeOut = 10, rise = 10, dur = 16, lineHeight = 1.14, times, shadow = true, tracking = -0.018, bullet}) => {
  const f = useSrc();
  const start0 = a - lead;
  if (f < start0 - 1 || f > b + fadeOut) return null;
  const lines = text.split('\n');
  const frames = times ?? Array.from({length: lines.join(' ').split(/\s+/).length}, (_, i) => start0 + i * step);
  const out = 1 - ramp(f, b - fadeOut, b);
  let index = 0;
  return (
    <div style={{position: 'absolute', left: align === 'left' ? x : align === 'center' ? x - width / 2 : x - width, top: y, width, textAlign: align, fontFamily: THEME.sans, fontWeight: weight, fontSize: size, lineHeight, color, letterSpacing: `${tracking}em`, opacity: out, textShadow: shadow ? '0 2px 18px rgba(8,23,27,.28)' : undefined}}>
      {lines.map((line, l) => (
        <div key={l} style={{whiteSpace: 'nowrap'}}>
          {l === 0 && bullet}
          {line.split(/\s+/).filter(Boolean).map((word, w) => {
            const start = frames[index++] ?? a;
            const t = ramp(f, start, start + dur);
            return (
              <span key={w} style={{display: 'inline-block', marginRight: '0.26em', opacity: clamp01(t * 1.15), transform: `translateY(${(1 - easeOut(t)) * rise}px)`}}>{word}</span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export type ScrimProps = {a: number; b: number; dir: 'bottom' | 'right' | 'left' | 'top'; size?: number; alpha?: number; fade?: number};
// Dark night gradient under text.
export const Scrim: React.FC<ScrimProps> = ({a, b, dir, size = 0.42, alpha = 0.78, fade = 10}) => {
  const f = useSrc();
  if (f < a || f > b) return null;
  const o = Math.min(ramp(f, a, a + fade), 1 - ramp(f, b - fade, b));
  const to = {bottom: 'top', top: 'bottom', right: 'left', left: 'right'}[dir];
  const stops = `rgba(8,23,27,${alpha}) 0%, rgba(8,23,27,${alpha * 0.62}) ${size * 40}%, rgba(8,23,27,0) ${size * 100}%`;
  return <AbsoluteFill style={{opacity: o, background: `linear-gradient(to ${to}, ${stops})`}} />;
};

// Chapter pill, fixed top-left through the a-roll and UI.
export const ChapterPill: React.FC<{label: string; dark?: boolean}> = ({label, dark}) => (
  <div style={{position: 'absolute', left: 96, top: 52, height: 100, display: 'flex', alignItems: 'center', paddingLeft: 24, paddingRight: 22, boxSizing: 'border-box', borderRadius: 34, fontFamily: THEME.sans, fontWeight: 500, fontSize: 46, letterSpacing: '-0.006em', color: dark ? 'rgba(255,255,255,.92)' : '#fff', background: 'rgba(8,23,27,.42)', backdropFilter: 'blur(14px)', border: `2px solid ${THEME.glassLine}`, boxShadow: 'inset 0 1px 0 rgba(233,245,247,.25)'}}><span style={{width: 14, height: 14, marginRight: 18, borderRadius: 3, background: THEME.accent, transform: 'rotate(45deg)'}} />{label}</div>
);

export const BulletDot: React.FC = () => (
  <span style={{display: 'inline-block', width: 12, height: 12, borderRadius: 8, border: '2.5px solid #fff', marginRight: 14, transform: 'translateY(-6px)'}} />
);
export const BulletCheck: React.FC<{ok?: boolean}> = ({ok = true}) => (
  <svg width="34" height="34" viewBox="0 0 34 34" style={{marginRight: 14, transform: 'translateY(4px)'}}>
    {ok ? (
      <>
        <rect x="3" y="4" width="26" height="26" rx="4" fill="#fff" />
        <path d="M9 17l6 7L30 4" stroke={THEME.moss} strokeWidth="4.4" fill="none" />
      </>
    ) : (
      <>
        <circle cx="16" cy="17" r="13" fill="#fff" />
        <path d="M11 12l10 10M21 12L11 22" stroke={THEME.rust} strokeWidth="3.6" />
      </>
    )}
  </svg>
);
