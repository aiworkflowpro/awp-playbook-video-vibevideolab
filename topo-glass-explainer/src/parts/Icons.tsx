import React from 'react';
import {THEME} from '../theme';

// Topo Glass icon set: one 24-unit grid, 2-unit round line, no fills except the guide mark and file tiles.
type IconProps = {size?: number; color?: string};
const Line: React.FC<IconProps & {children: React.ReactNode}> = ({size = 60, color = '#fff', children}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{overflow: 'visible'}}>
    <g fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{children}</g>
  </svg>
);

const HEX = Array.from({length: 6}, (_, i) => {
  const a = ((i * 60 - 90) * Math.PI) / 180;
  return `${(12 + 10.6 * Math.cos(a)).toFixed(2)},${(12 + 10.6 * Math.sin(a)).toFixed(2)}`;
}).join(' ');

// The guide mark: amber hexagon holding a compass needle that points up-right.
export const AgentMark: React.FC<IconProps> = ({size = 90, color = THEME.accent}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <polygon points={HEX} fill={color} stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
    <polygon points={HEX} transform="translate(12 12) scale(.74) translate(-12 -12)" fill="none" stroke={THEME.ink} strokeOpacity={0.32} strokeWidth={1} />
    <g transform="rotate(38 12 12)">
      <path d="M12 4.6l2.3 7.4h-4.6z" fill={THEME.ink} />
      <path d="M12 19.4l2.3-7.4h-4.6z" fill="#fff" stroke={THEME.ink} strokeWidth={0.9} strokeLinejoin="round" />
    </g>
    <circle cx={12} cy={12} r={1.3} fill={color} stroke={THEME.ink} strokeWidth={0.8} />
  </svg>
);

export const Envelope: React.FC<IconProps> = (p) => (
  <Line {...p}><rect x={3} y={5.5} width={18} height={13} rx={2} /><path d="M3.5 7l8.5 6.5L20.5 7" /></Line>
);
export const Calendar: React.FC<IconProps> = (p) => (
  <Line {...p}><rect x={3.5} y={5} width={17} height={15} rx={2} /><path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M14 14h2M8 17h2" /></Line>
);
export const Folder: React.FC<IconProps> = (p) => (
  <Line {...p}><path d="M3 7.5a2 2 0 012-2h4l2 2.5h8a2 2 0 012 2V17a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><path d="M3 11h18" /></Line>
);
export const Doc: React.FC<IconProps> = (p) => (
  <Line {...p}><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 12h6M9 15h6M9 18h4" /></Line>
);
export const Bell: React.FC<IconProps> = (p) => (
  <Line {...p}><path d="M6 17c1.4-1.5 1.5-3.4 1.5-6a4.5 4.5 0 019 0c0 2.6.1 4.5 1.5 6z" /><path d="M10 20a2 2 0 004 0" /></Line>
);
export const Search: React.FC<IconProps> = ({size = 50, ...p}) => (
  <Line size={size} {...p}><circle cx={10.5} cy={10.5} r={6.5} /><path d="M15.5 15.5L21 21" /></Line>
);
// A coiled rope with its free end running out to the right.
export const RopeKnot: React.FC<IconProps> = (p) => (
  <Line {...p}><ellipse cx={11} cy={11} rx={8} ry={6} /><ellipse cx={11} cy={11.4} rx={5} ry={3.6} /><ellipse cx={11} cy={11.8} rx={2.2} ry={1.5} /><path d="M18.6 13c1.6 1.6 2.4 3.6 1.6 7" /></Line>
);
export const Loop: React.FC<IconProps> = (p) => (
  <Line {...p}><path d="M20 12a8 8 0 01-14.2 5" /><path d="M4 12a8 8 0 0114.2-5" /><path d="M18.5 3v4h-4M5.5 21v-4h4" /></Line>
);
export const Cairn: React.FC<IconProps> = (p) => (
  <Line {...p}><path d="M4 20.5h16" /><ellipse cx={12} cy={17.6} rx={6.5} ry={2.4} /><ellipse cx={11.4} cy={12.6} rx={4.6} ry={2.1} /><ellipse cx={12.4} cy={8.4} rx={3.2} ry={1.7} /><ellipse cx={11.8} cy={5} rx={1.8} ry={1.2} /></Line>
);
export const Pack: React.FC<IconProps> = (p) => (
  <Line {...p}><path d="M9 6V5a3 3 0 016 0v1" /><rect x={5} y={6} width={14} height={15} rx={3.5} /><path d="M8.5 13h7v4.5h-7zM5 11h14" /></Line>
);
export const MapIcon: React.FC<IconProps> = (p) => (
  <Line {...p}><path d="M3 6.5l6-2.5 6 2.5 6-2.5v13.5l-6 2.5-6-2.5-6 2.5z" /><path d="M9 4v13.5M15 6.5V20" /></Line>
);
export const Logbook: React.FC<IconProps> = (p) => (
  <Line {...p}><path d="M5 4.5A1.5 1.5 0 016.5 3H19v15H6.5A1.5 1.5 0 005 19.5z" /><path d="M5 19.5A1.5 1.5 0 006.5 21H19v-3M9 7.5h6M9 11h4" /></Line>
);
export const Mic: React.FC<IconProps> = (p) => (
  <Line {...p}><rect x={9} y={3} width={6} height={11} rx={3} /><path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21" /></Line>
);

// File tile: a solid page in a palette colour with its type written on it (ink on light pages, white on dark).
const light = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 150;
};
export const FileTile: React.FC<{size?: number; color: string; label: string}> = ({size = 80, color, label}) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <path d="M10 3h20l10 10v32H10z" fill={color} stroke="rgba(233,245,247,.55)" strokeWidth={1.2} strokeLinejoin="round" />
    <path d="M30 3l10 10H30z" fill="rgba(255,255,255,.4)" />
    <text x="25" y="34" fill={light(color) ? THEME.ink : '#fff'} fontFamily={THEME.sans} fontWeight="700" fontSize="11" textAnchor="middle">{label}</text>
  </svg>
);
