import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {THEME} from '../theme';
import {ContourPaths, levels, seededTerrain, traceContours} from './Contours';

// The stage behind narration-only windows when the plan has no presenter take: a night topographic map (two seeded
// contour layers from parts/Contours), a faint survey grid and the guide emblem, an amber hexagon compass, where a speaker would stand.
// Everything is a pure function of the film frame: no randomness without the fixed seed, no images.

// Map area larger than the frame so the drift never shows an edge; two seeded terrains give the parallax layers.
const MAP_W = 2560;
const MAP_H = 1600;
const FAR = traceContours(seededTerrain(1729, MAP_W, MAP_H), MAP_W, MAP_H, 24, levels(-0.5, 1.6, 15));
const NEAR = traceContours(seededTerrain(4111, MAP_W, MAP_H), MAP_W, MAP_H, 24, levels(-0.4, 1.8, 12));
const rgba = (hex: string, a: number) => `rgba(${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)},${a})`;

const Hexagon: React.FC<{r: number; stroke: string; width: number; fill?: string}> = ({r, stroke, width, fill = 'none'}) => {
  const pts = Array.from({length: 6}, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`;
  }).join(' ');
  return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={width} strokeLinejoin="round" />;
};

/** The guide emblem: amber hexagon with a compass needle that settles and sways; centred at (x, y). */
export const GuideEmblem: React.FC<{x: number; y: number; size?: number; frame: number; opacity?: number}> = ({x, y, size = 260, frame, opacity = 1}) => {
  const sway = 7 * Math.sin(frame / 41) + 3 * Math.sin(frame / 17 + 1.3);
  const breath = 0.5 + 0.5 * Math.sin(frame / 53);
  const r = size / 2;
  return (
    <svg width={size * 2} height={size * 2} viewBox={`${-size} ${-size} ${size * 2} ${size * 2}`} style={{position: 'absolute', left: x - size, top: y - size, opacity, overflow: 'visible'}}>
      <defs>
        <radialGradient id="stageGlow">
          <stop offset="0%" stopColor={THEME.accent} stopOpacity={0.22 + 0.08 * breath} />
          <stop offset="100%" stopColor={THEME.accent} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle r={size * 0.95} fill="url(#stageGlow)" />
      <Hexagon r={r * 1.18} stroke={rgba(THEME.glacier, 0.18)} width={1.5} />
      <Hexagon r={r} stroke={THEME.accent} width={5} fill={rgba(THEME.night, 0.55)} />
      <Hexagon r={r * 0.8} stroke={rgba(THEME.accent, 0.35)} width={1.5} />
      {Array.from({length: 24}, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        const long = i % 6 === 0;
        const r0 = r * (long ? 0.6 : 0.66), r1 = r * 0.72;
        return <line key={i} x1={r0 * Math.cos(a)} y1={r0 * Math.sin(a)} x2={r1 * Math.cos(a)} y2={r1 * Math.sin(a)} stroke={long ? THEME.accent : rgba(THEME.glacier, 0.45)} strokeWidth={long ? 3 : 1.5} strokeLinecap="round" />;
      })}
      <g transform={`rotate(${sway})`}>
        <path d={`M0 ${-r * 0.54} L${r * 0.12} 0 L0 ${r * 0.1} L${-r * 0.12} 0 Z`} fill={THEME.accent} />
        <path d={`M0 ${r * 0.54} L${r * 0.12} 0 L0 ${-r * 0.1} L${-r * 0.12} 0 Z`} fill={rgba(THEME.glacier, 0.55)} />
      </g>
      <circle r={r * 0.06} fill={THEME.nightDeep} stroke={THEME.accent} strokeWidth={2.5} />
    </svg>
  );
};

export type StagePlace = {x: number; y: number; size?: number} | null;
/** Night topographic stage; `emblem` places the guide emblem (null: none). */
export const Stage: React.FC<{emblem?: StagePlace}> = ({emblem = {x: 960, y: 500}}) => {
  const f = useCurrentFrame();
  // Slow drift that stays inside the map margin (±220 px); the near map moves twice as far as the far one (parallax).
  const dx = 160 * Math.sin(f / 700) + 60 * Math.sin(f / 260);
  const dy = 70 * Math.cos(f / 900);
  const wrap = (v: number, span: number) => ((v % span) + span) % span;
  const farX = -320 - dx * 0.5, farY = -260 + dy * 0.5;
  const nearX = -320 - dx, nearY = -260 + dy;
  const gridX = wrap(-dx * 0.5, 120), gridY = wrap(dy * 0.5, 120);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: `radial-gradient(90% 80% at 50% 42%, ${THEME.nightMid} 0%, ${THEME.night} 55%, ${THEME.nightDeep} 100%)`}}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <g stroke={rgba(THEME.glacier, 0.045)} strokeWidth={1}>
          {Array.from({length: 18}, (_, i) => <line key={`v${i}`} x1={gridX + i * 120 - 120} y1={0} x2={gridX + i * 120 - 120} y2={1080} />)}
          {Array.from({length: 11}, (_, i) => <line key={`h${i}`} x1={0} y1={gridY + i * 120 - 120} x2={1920} y2={gridY + i * 120 - 120} />)}
        </g>
        <g transform={`translate(${farX} ${farY})`}>
          <ContourPaths paths={FAR} line={[0.1, 1.2]} indexLine={[0.1, 1.2]} />
        </g>
        <g transform={`translate(${nearX} ${nearY})`}>
          <ContourPaths paths={NEAR} line={[0.16, 1.4]} indexLine={[0.3, 2.2]} indexFrom={1} />
        </g>
      </svg>
      {emblem && <GuideEmblem x={emblem.x - dx * 0.06} y={emblem.y - dy * 0.06} size={emblem.size} frame={f} />}
      <AbsoluteFill style={{background: `radial-gradient(120% 100% at 50% 45%, ${rgba(THEME.nightDeep, 0)} 55%, ${rgba(THEME.nightDeep, 0.55)} 100%)`}} />
    </AbsoluteFill>
  );
};
