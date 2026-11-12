import {word} from '../plan';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {easeInOut, easeOut, lerp, ramp, useSrc} from '../lib/anim';
import {THEME} from '../theme';
import {glass} from './Glass';
import {Contours} from './Contours';

// Night map backdrop: pine gradient, a glacier glow and a faint amber one drifting, contour lines on top.
export {Contours};
export const GradBg: React.FC<{dim?: number}> = ({dim = 0}) => {
  const f = useSrc();
  const d = f / 240;
  const gx = 72 + Math.sin(d) * 6;
  const gy = 30 + Math.cos(d * 0.8) * 6;
  const ax = 14 + Math.sin(d * 0.7 + 1) * 6;
  const ay = 86 + Math.cos(d * 0.6) * 5;
  return (
    <AbsoluteFill style={{background: `radial-gradient(55% 65% at ${gx}% ${gy}%, rgba(169,214,229,.26) 0%, rgba(169,214,229,.08) 45%, rgba(169,214,229,0) 75%), radial-gradient(42% 52% at ${ax}% ${ay}%, rgba(242,165,65,.13) 0%, rgba(242,165,65,0) 70%), linear-gradient(150deg, ${THEME.nightMid} 0%, ${THEME.night} 52%, ${THEME.nightDeep} 100%)`}}>
      <Contours drift={d} />
      {dim > 0 && <AbsoluteFill style={{background: `rgba(8,23,27,${dim})`}} />}
    </AbsoluteFill>
  );
};

type PillProps = {x: number; y: number; w: number; h: number; text: string; size?: number; o?: number; dimmed?: number};
export const DiagramPill: React.FC<PillProps> = ({x, y, w, h, text, size = 56, o = 1, dimmed = 0}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, borderRadius: h * 0.34, opacity: o, ...glass, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: THEME.sans, fontWeight: 700, fontSize: size, letterSpacing: '-0.01em', color: `rgba(255,255,255,${1 - dimmed * 0.55})`}}>{text}</div>
);

export type Branch = {label: string; at: number; y: number; dimFrom?: number; undimFrom?: number};
// Prompt root with curved branches that draw on as each part is named; `root` labels this instance (default: the shared anchor).
export const PromptTree: React.FC<{a: number; b: number; rootX?: number; rootY?: number; items: Branch[]; shiftAt?: number; shiftX?: number; sub?: Array<{label: string; at: number; y: number}>; leafGap?: number; leafSize?: number; subSize?: number; rootScale?: number; subX?: number; root?: string}> = ({a, b, rootX = 480, rootY = 540, items, shiftAt, shiftX = 0, sub = [], leafGap = 460, leafSize = 50, subSize = 46, rootScale = 1, subX = 150, root}) => {
  const f = useSrc();
  if (f < a || f > b) return null;
  const shift = shiftAt ? shiftX * easeInOut(ramp(f, shiftAt, shiftAt + 20)) : 0;
  const open = easeOut(ramp(f, a, a + 14));
  const slide = easeInOut(ramp(f, items[0].at - 6, items[0].at + 14));
  const leafX = rootX + leafGap;
  // One size for every leaf, shrunk only when the longest label would run off the right edge.
  const longest = Math.max(...items.map((item) => item.label.length));
  const leafFont = Math.min(leafSize, (1920 - 70 - Math.max(0, shiftX) - leafX) / (longest * 0.56));
  const tipX = rootX + 190 * rootScale;
  return (
    <AbsoluteFill style={{transform: `translateX(${shift}px)`}}>
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {items.map((item) => {
          const t = easeOut(ramp(f, item.at, item.at + 14));
          if (t <= 0) return null;
          const endX = lerp(tipX, leafX - 16, t);
          const endY = lerp(rootY, item.y, t);
          if (slide < 0.5) return null;
          return <path key={item.label} d={`M ${tipX} ${rootY} C ${tipX + 90} ${rootY}, ${endX - 90} ${endY}, ${endX} ${endY}`} fill="none" stroke="rgba(255,255,255,.75)" strokeWidth={3.4} />;
        })}
        {sub.map((item) => {
          const t = easeOut(ramp(f, item.at, item.at + 14));
          if (t <= 0) return null;
          const startX = leafX + subX;
          const startY = items[3]?.y ?? rootY;
          const endX = lerp(startX, startX + 150, t);
          const endY = lerp(startY, item.y, t);
          return <path key={item.label} d={`M ${startX} ${startY} C ${startX + 60} ${startY}, ${endX - 60} ${endY}, ${endX} ${endY}`} fill="none" stroke="rgba(255,255,255,.7)" strokeWidth={3.2} />;
        })}
      </svg>
      <DiagramPill x={lerp(960, rootX, slide)} y={rootY} w={lerp(lerp(220, 440, open), 370 * rootScale, slide)} h={lerp(lerp(40, 196, open), 118 * rootScale, slide)} text={root ?? word('diagrams.001')} size={lerp(84, 66 * rootScale, slide)} o={ramp(f, a, a + 6)} />
      {items.map((item) => {
        const on = easeOut(ramp(f, item.at, item.at + 16));
        const dim = (item.dimFrom !== undefined ? ramp(f, item.dimFrom, item.dimFrom + 14) : 0) * (item.undimFrom !== undefined ? 1 - ramp(f, item.undimFrom, item.undimFrom + 14) : 1);
        return (
          <div key={item.label} style={{position: 'absolute', left: leafX, top: item.y - leafFont * 0.6, fontFamily: THEME.sans, fontWeight: 700, fontSize: leafFont, letterSpacing: '-0.012em', color: '#fff', opacity: on * (1 - dim * 0.62)}}>{item.label}</div>
        );
      })}
      {sub.map((item) => (
        <div key={item.label} style={{position: 'absolute', left: leafX + subX + 160, top: item.y - subSize * 0.6, fontFamily: THEME.sans, fontWeight: 700, fontSize: subSize, letterSpacing: '-0.012em', color: '#fff', opacity: easeOut(ramp(f, item.at, item.at + 16))}}>{item.label}</div>
      ))}
    </AbsoluteFill>
  );
};

// Three-stage arc loop that keeps running.
export const ReactLoop: React.FC<{a: number; b: number; acts: number; output: number; back: number; title: number; pulseFrom: number}> = ({a, b, acts, output, back, title, pulseFrom}) => {
  const f = useSrc();
  if (f < a || f > b) return null;
  const cx = 960, cy = 540, r = 400;
  const draw = (start: number, end: number, t: number) => {
    const s = (start * Math.PI) / 180, e = lerp(start, end, t) * (Math.PI / 180);
    const large = Math.abs(lerp(start, end, t) - start) > 180 ? 1 : 0;
    return `M ${cx + r * Math.cos(s)} ${cy + r * Math.sin(s)} A ${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(e)} ${cy + r * Math.sin(e)}`;
  };
  const up = easeInOut(ramp(f, a + 6, acts + 20));
  const down = easeInOut(ramp(f, output - 16, output + 10));
  const backArc = easeInOut(ramp(f, back - 10, back + 16));
  const shrink = easeInOut(ramp(f, title, title + 16));
  const pulse = f > pulseFrom ? 0.5 + 0.5 * Math.sin((f - pulseFrom) / 7) : 0;
  return (
    <AbsoluteFill style={{transform: `translateY(${shrink * 26}px) scale(${1 - shrink * 0.06})`}}>
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <path d={draw(-152, -30, up)} fill="none" stroke="#fff" strokeWidth={4.5} />
        <path d={draw(34, 74, down)} fill="none" stroke="#fff" strokeWidth={4.5} />
        <path d={draw(108, 158, backArc)} fill="none" stroke="#fff" strokeWidth={4.5} />
        {up > 0.98 && <path d={`M ${cx + r * Math.cos(-0.52) - 32} ${cy + r * Math.sin(-0.52) + 6} L ${cx + r * Math.cos(-0.52) + 2} ${cy + r * Math.sin(-0.52) + 34} L ${cx + r * Math.cos(-0.52) + 8} ${cy + r * Math.sin(-0.52) - 16}`} fill="none" stroke="#fff" strokeWidth={4.5} />}
        {backArc > 0.98 && <path d={`M ${cx + r * Math.cos(2.76) - 10} ${cy + r * Math.sin(2.76) + 26} L ${cx + r * Math.cos(2.76) - 6} ${cy + r * Math.sin(2.76) - 24} L ${cx + r * Math.cos(2.76) + 40} ${cy + r * Math.sin(2.76) + 2}`} fill="none" stroke="#fff" strokeWidth={4.5} />}
      </svg>
      <DiagramPill x={560} y={540} w={400} h={170} text={word('diagrams.002')} size={82} o={ramp(f, a, a + 8)} />
      <DiagramPill x={1352} y={540} w={280} h={170} text={word('diagrams.003')} size={82} o={ramp(f, acts, acts + 10)} dimmed={pulse} />
      <div style={{position: 'absolute', left: 760, top: 822, width: 400, textAlign: 'center', fontFamily: THEME.sans, fontWeight: 700, fontSize: 82, color: '#fff', opacity: ramp(f, output, output + 10)}}>{word('diagrams.004')}</div>
      <div style={{position: 'absolute', left: 660, top: 18, width: 600, textAlign: 'center', fontFamily: THEME.sans, fontWeight: 800, fontSize: 70, letterSpacing: '-0.01em', color: '#fff', opacity: ramp(f, title, title + 14)}}>{word('diagrams.005')}</div>
    </AbsoluteFill>
  );
};

// Filled wedge in a dark glass disc: a chosen split, never a statistic.
export const Pie: React.FC<{a: number; b: number; x: number; y: number; r?: number; value: (f: number) => number; fade?: number; color?: string}> = ({a, b, x, y, r = 76, value, fade = 10, color = THEME.signal}) => {
  const f = useSrc();
  if (f < a || f > b + fade) return null;
  const v = Math.max(0, Math.min(0.999, value(f)));
  const angle = v * 2 * Math.PI - Math.PI / 2;
  const o = Math.min(ramp(f, a, a + 8), 1 - ramp(f, b, b + fade));
  const wedge = `M 0 0 L 0 ${-r} A ${r} ${r} 0 ${v > 0.5 ? 1 : 0} 1 ${r * Math.cos(angle)} ${r * Math.sin(angle)} Z`;
  return (
    <svg width={r * 2 + 20} height={r * 2 + 20} viewBox={`${-r - 10} ${-r - 10} ${r * 2 + 20} ${r * 2 + 20}`} style={{position: 'absolute', left: x - r - 10, top: y - r - 10, opacity: o, overflow: 'visible', filter: 'drop-shadow(0 0 18px rgba(169,214,229,.35))'}}>
      <circle r={r} fill="rgba(8,23,27,.6)" stroke={THEME.glacier} strokeOpacity={0.55} strokeWidth={3} />
      <path d={wedge} fill={color} />
      <circle r={r} fill="none" stroke={THEME.glacier} strokeOpacity={0.55} strokeWidth={3} />
    </svg>
  );
};
