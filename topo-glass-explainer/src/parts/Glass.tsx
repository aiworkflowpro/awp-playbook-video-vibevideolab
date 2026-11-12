import React from 'react';
import {easeOut, ramp, useSrc} from '../lib/anim';
import {THEME} from '../theme';

const glassStyle: React.CSSProperties = {
  background: `linear-gradient(150deg, rgba(233,245,247,.2), ${THEME.glassFill} 45%, rgba(8,23,27,.16))`,
  border: `2px solid ${THEME.glassLine}`,
  boxShadow: 'inset 0 1px 0 rgba(233,245,247,.35), inset 0 0 24px rgba(169,214,229,.12), 0 12px 36px rgba(8,23,27,.35)',
  backdropFilter: 'blur(16px)',
};

export type TileProps = {a: number; b: number; x: number; y: number; size?: number; label?: string; labelSize?: number; fill?: string; children?: React.ReactNode; fade?: number; labelGap?: number; bare?: boolean};
// Rounded glass tile with an icon and optional label; pops in with a soft overshoot-free scale, centered at x,y.
export const Tile: React.FC<TileProps> = ({a, b, x, y, size = 150, label, labelSize = 40, fill, children, fade = 10, labelGap = 16, bare}) => {
  const f = useSrc();
  if (f < a || f > b + fade) return null;
  const t = easeOut(ramp(f, a, a + 12));
  const o = Math.min(ramp(f, a, a + 8), 1 - ramp(f, b, b + fade));
  return (
    <div style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, opacity: o, transform: `scale(${0.82 + 0.18 * t})`, textAlign: 'center'}}>
      <div style={{...(bare ? {} : glassStyle), background: bare ? 'transparent' : fill ?? glassStyle.background, width: size, height: size, borderRadius: size * 0.27, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{children}</div>
      {label && <div style={{marginTop: labelGap, marginLeft: -200, marginRight: -200, fontFamily: THEME.sans, fontWeight: 700, fontSize: labelSize, lineHeight: 1.05, whiteSpace: 'pre', letterSpacing: '-0.012em', color: '#fff', textShadow: '0 2px 14px rgba(8,23,27,.4)'}}>{label}</div>}
    </div>
  );
};

export type BarProps = {a: number; b: number; x: number; y: number; width: number; height?: number; text: string; size?: number; origin?: 'left' | 'center'; fade?: number};
// Glass pill that stretches open from a thin bar while its label fades in.
export const GlassBar: React.FC<BarProps> = ({a, b, x, y, width, height = 66, text, size = 42, origin = 'center', fade = 10}) => {
  const f = useSrc();
  if (f < a || f > b + fade) return null;
  const open = easeOut(ramp(f, a, a + 18));
  const textOn = ramp(f, a + 6, a + 26);
  const o = Math.min(ramp(f, a, a + 6), 1 - ramp(f, b, b + fade));
  const fit = Math.max(width, text.length * size * 0.6 + height * 0.7);
  const w = fit * (0.72 + 0.28 * open);
  const h = height * (0.34 + 0.66 * open);
  return (
    <div style={{position: 'absolute', left: origin === 'center' ? x - w / 2 : x, top: y - h / 2, width: w, height: h, borderRadius: h / 2, opacity: o, ...glassStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
      <span style={{fontFamily: THEME.sans, fontWeight: 700, fontSize: size, letterSpacing: '-0.012em', color: '#fff', whiteSpace: 'nowrap', opacity: textOn}}>{text}</span>
    </div>
  );
};

export const glass = glassStyle;
