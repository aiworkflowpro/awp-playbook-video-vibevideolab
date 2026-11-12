import {word} from '../plan';
import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {asset, PLAN, planData} from '../plan';
import {easeInOut, easeOut, ramp, track, useSrc} from '../lib/anim';
import {THEME} from '../theme';
import {AgentMark, Cairn, Loop, MapIcon, Pack} from '../parts/Icons';
import {DiagramPill, GradBg, Pie, PromptTree, ReactLoop} from '../parts/Diagrams';
import {Cam, CamKey, DimLayer, HomePage, OcrLayer, OcrRun, PromptCard, Sidebar, UiBox} from '../parts/Ui';
import {ChapterPill} from '../parts/Text';
import {Tile} from '../parts/Glass';
import {Reveal} from '../parts/Text';

const PROMPTS: Record<string, string> = {
  p1: word('backdrops.001'),
  p2: word('backdrops.002'),
  p3: word('backdrops.003'),
  p4a: word('backdrops.004'),
  p4: word('backdrops.005'),
  p5: word('backdrops.006'),
  p6: word('backdrops.007'),
  p7: word('backdrops.008'),
  p8: word('backdrops.009'),
};
const ATTACH = {contract: word('backdrops.010'), notes: word('backdrops.011'), folder: word('backdrops.012')};
const GREETINGS: Record<string, string> = {evening: word('backdrops.014'), late: word('backdrops.015'), there: word('backdrops.016'), shall: word('backdrops.017')};

// Starter ideas under the console prompt: three prompts from the same chapter, by console shot.
const IDEA_SETS: Array<[string[], string[]]> = [
  [['56', '57', '58'], ['p1', 'p3', 'p6']],
  [['60', '64'], ['p4', 'p1', 'p3']],
  [['76'], ['p3', 'p6', 'p5']],
  [['94', '101', '104', '131', '133', '136'], ['p5', 'p6', 'p2']],
  [['201', '203'], ['p7', 'p8', 'p5']],
  [['207'], ['p8', 'p7', 'p4']],
  [['223', '231'], ['p5', 'p3', 'p1']],
];
const ideasFor = (id: string) => (IDEA_SETS.find(([ids]) => ids.includes(id))?.[1] ?? ['p1', 'p3', 'p5']).map((k) => PROMPTS[k]);

type HomeEntry = {a: number; b: number; variant: string; cam: number[][]; typed: number[][]; prompt: string | null; lum: number[][]};
const HOMES = planData<Record<string, HomeEntry>>(PLAN.data.uiHome);
type PageState = {f: number; rect: number[] | null; lum: number; bg: number[]; runs: OcrRun[]; boxes: UiBox[]};
const PAGES = planData<Record<string, {a: number; b: number; states: PageState[]}>>(PLAN.data.uiPages);

export const HomeShot: React.FC<{id: string; shot: HomeEntry}> = ({id, shot}) => {
  const f = useSrc();
  const prompt = shot.prompt ? PROMPTS[shot.prompt] : '';
  const keys = shot.typed.map((k) => [k[0], k[1]] as const);
  const count = prompt ? Math.round(track(f, keys.length ? keys : [[shot.a, 0]]) * prompt.length) : 0;
  const attach = (shot as {attach?: Array<keyof typeof ATTACH>}).attach?.map((k) => ATTACH[k]);
  const folder = ['p5', 'p6', 'p7'].includes(shot.prompt ?? '') ? ATTACH.folder : undefined;
  return (
    <AbsoluteFill>
      <GradBg />
      <Cam keys={shot.cam as unknown as CamKey[]}>
        <HomePage greeting={GREETINGS[shot.variant]} text={prompt.slice(0, count)} caret={count > 0 && count < prompt.length} attach={attach} folder={folder} chatMode={id === '56' || id === '57'} ideas={ideasFor(id).filter((idea) => idea !== prompt)} />
      </Cam>
      {/* Dimmed while a dialog opens: full-zoom frames only, from the shot's brightness keys. */}
      <AbsoluteFill style={{background: `rgba(8,23,27,${track(f, shot.lum.map((k) => [k[0], k[1] < 225 && k[1] > 120 ? Math.min(0.36, 1 - k[1] / 248) : 0] as const))})`}} />
    </AbsoluteFill>
  );
};

export const PageShot: React.FC<{shot: {a: number; b: number; states: PageState[]}; serif?: boolean; pill?: boolean}> = ({shot, serif, pill}) => {
  const f = useSrc();
  const state = shot.states.filter((s) => s.f <= f + 3).pop() ?? shot.states[0];
  const rect = state.rect;
  const full = rect && rect[2] > 1860 && rect[3] > 1000;
  const [r, g, b] = state.bg;
  const dim = state.lum < 215;
  return (
    <AbsoluteFill>
      {full || Math.abs(r - b) < 22 ? <AbsoluteFill style={{background: dim ? `rgb(${r},${g},${b})` : THEME.paper}} /> : <GradBg />}
      {rect && !full && <div style={{position: 'absolute', left: rect[0], top: rect[1], width: rect[2], height: rect[3], background: dim ? '#b5c4c1' : '#f3f6f5', borderRadius: 20, boxShadow: '0 20px 60px rgba(8,23,27,.25)'}} />}
      <OcrLayer runs={state.runs.filter((run) => !(pill && run[0].startsWith(word('film.001')) && run[2] < 180))} boxes={state.boxes.filter((b) => !(b[1] < 170 && b[0] < 500 && pill))} family={serif ? THEME.serif : THEME.ui} />
      {pill && <div style={{opacity: 0.9, filter: 'saturate(.8)'}}><ChapterPill label={word('backdrops.018')} /></div>}
    </AbsoluteFill>
  );
};

// Floating prompt card on the gradient with its parts lighting up.
export const PartsCard: React.FC<{a: number; b: number}> = ({a, b}) => {
  const f = useSrc();
  // Six part names light up in turn; the four middle ones (tool, step, result, limit) mark their phrase in the prompt.
  const labels = ['backdrops.019', 'backdrops.020', 'backdrops.021', 'backdrops.022', 'backdrops.023', 'backdrops.024'].map((id, i) => [word(id), a + i * 26] as const);
  const zoom = 1 - 0.0 * ramp(f, a, b);
  const only = (from: number, to: number) => ramp(f, from, from + 8) * (1 - ramp(f, to, to + 6));
  const hl: Array<[string, number]> = ['backdrops.025', 'backdrops.026', 'backdrops.027', 'backdrops.028'].map((id, i) => [word(id), only(labels[i + 1][1], labels[i + 2][1])]);
  return (
    <AbsoluteFill>
      <GradBg />
      <div style={{position: 'absolute', left: 280, top: 462, transformOrigin: '0 0', transform: `scale(${zoom})`}}>
        <PromptCard text={word('backdrops.042')} hl={hl} width={1365} />
      </div>
      <div style={{position: 'absolute', left: 265, top: 275, display: 'flex', gap: 48, fontFamily: THEME.sans, fontWeight: 700, fontSize: 64, color: '#fff'}}>
        {labels.map(([label, at], i) => {
          const next = labels[i + 1]?.[1] ?? 1e9;
          return <span key={label} style={{opacity: ramp(f, at, at + 10) * (f > next ? 0.45 : 1)}}>{label}</span>;
        })}
      </div>
    </AbsoluteFill>
  );
};

// Hook graphic: four tiles wired into a dial that fills.
export const Stopwatch: React.FC = () => {
  const f = useSrc();
  const fill = 0.62 * ramp(f, 66, 112);
  const cx = 960, cy = 450, r = 138;
  const angle = fill * 2 * Math.PI - Math.PI / 2;
  const tiles: Array<[number, number, number]> = [[430, 240, 59], [430, 620, 60], [1490, 240, 66], [1490, 620, 62]];
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(70% 70% at 80% 40%, rgba(29,74,70,.75), rgba(8,23,27,0) 70%), linear-gradient(120deg, #0b1f22, #0f2a2c 55%, #1d4a46)'}} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <g fill="none" stroke="rgba(255,255,255,.75)" strokeWidth={3} strokeDasharray="10 10">
          <path d={`M 520 240 H 610 V 420 H 760`} />
          <path d={`M 520 620 H 610 V 480 H 760`} />
          <path d={`M 1400 240 H 1310 V 420 H 1160`} />
          <path d={`M 1400 620 H 1310 V 480 H 1160`} />
        </g>
        <circle cx={cx} cy={cy} r={r} fill="rgba(8,23,27,.25)" stroke="#fff" strokeWidth={13} style={{filter: 'drop-shadow(0 0 14px rgba(169,214,229,.6))'}} />
        <path d={`M ${cx - 16} ${cy - r - 38} h 32 M ${cx} ${cy - r - 38} v 28 M ${cx - 94} ${cy - r + 8} l -22 -22 M ${cx + 94} ${cy - r + 8} l 22 -22`} stroke="#fff" strokeWidth={12} strokeLinecap="round" />
        {fill > 0 && <path d={`M ${cx} ${cy} L ${cx} ${cy - r + 16} A ${r - 16} ${r - 16} 0 ${fill > 0.5 ? 1 : 0} 1 ${cx + (r - 16) * Math.cos(angle)} ${cy + (r - 16) * Math.sin(angle)} Z`} fill={THEME.signal} style={{filter: 'drop-shadow(0 0 16px rgba(232,240,194,.55))'}} />}
      </svg>
      {tiles.map(([x, y, a]) => <Tile key={x * y} a={a} b={200} x={x} y={y} size={210}><AgentMark size={130} /></Tile>)}
      <Reveal a={59} b={118} text={word('backdrops.029')} x={960} y={815} size={76} weight={800} lineHeight={1.08} times={[60, 64, 68, 72, 76, 80, 84, 88, 92, 96]} dur={16} shadow={false} />
    </AbsoluteFill>
  );
};

// Soft halftone cloud with agent steps ticking over.
export const Halftone: React.FC<{items: string[]; a: number}> = ({items, a}) => {
  const f = useSrc();
  const spots = React.useMemo(() => {
    const out: Array<[number, number, number]> = [];
    for (let y = 0; y < 1080; y += 18) {
      for (let x = (y / 18) % 2 ? 9 : 0; x < 1920; x += 18) {
        const dx = (x - 960) / 860;
        const dy = (y - 540) / 500;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 1.05) out.push([x, y, Math.max(1, 8.2 * (1 - d * d * 0.85))]);
      }
    }
    return out;
  }, []);
  return (
    <AbsoluteFill style={{background: THEME.paper}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {spots.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#8fbfcf" opacity={0.86} />)}
      </svg>
      {items.map((text, i) => {
        const on = ramp(f, a + i * 9, a + i * 9 + 8);
        return (
          <div key={text} style={{position: 'absolute', left: 560 + [0, 160, 70][i], top: 325 + i * 145, height: 80, padding: '0 28px', display: 'flex', alignItems: 'center', gap: 30, borderRadius: 16, background: 'rgba(238,242,241,.82)', fontFamily: THEME.ui, fontSize: 32, color: '#24403d', opacity: on}}>
            <span style={{width: 34, height: 34, borderRadius: 20, background: THEME.accent}} />
            {text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Generated still from the plan; an empty slot draws nothing.
const Still: React.FC<{name: string; style: React.CSSProperties}> = ({name, style}) => {
  const file = asset('still', name);
  return file ? <Img src={file} style={style} /> : null;
};

// Cairns over a blurred valley: rising in a row, or a low camera sliding past with a glass label riding each top stone.
const PAN_COLUMNS: Array<[number, number, number]> = [[470, 778, 500], [1063, 518, 500], [1538, 300, 470], [1866, 130, 440]];
const PAN_LABELS: Array<[string, number]> = [[word('backdrops.030'), 0], [word('backdrops.031'), 1], [word('backdrops.032'), 2], [word('backdrops.033'), 3]];
export const Pillars: React.FC<{a: number; b: number; mode: 'rise' | 'pan' | 'row'; title?: boolean; pan0?: number; pan1?: number; labelsFrom?: number[]}> = ({a, b, mode, title = true, pan0 = 0, pan1 = 1, labelsFrom = []}) => {
  const f = useSrc();
  const t = (f - a) / Math.max(1, b - a);
  const lift = mode === 'rise' ? [0, 1, 2, 3].map((i) => 1 - easeOut(ramp(f, a + i * 16, a + 30 + i * 16))) : [0, 0, 0, 0];
  const panX = (pan0 + (pan1 - pan0) * t - 0.5) * 900;
  const scale = mode === 'row' ? 0.84 : 1;
  const xs = mode === 'row' ? [362, 769, 1153, 1555].map((x) => 960 + (x - 960) / 0.84) : [345, 769, 1153, 1577];
  const cairnTop = mode === 'row' ? 340 : 505;
  const tint = mode === 'row' ? 'sepia(.35) brightness(1.2) saturate(1.2)' : 'brightness(1.1) saturate(.5)';
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#b9cdd0'}}>
      <Still name="valley" style={{position: 'absolute', left: -60, top: -60, width: 2040, height: 1200, filter: 'blur(26px) brightness(1.08) saturate(.62)', transform: mode === 'pan' ? `translateX(${-panX * 0.1}px)` : undefined}} />
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(255,255,255,.34), rgba(255,255,255,0) 45%, rgba(233,245,247,.22))'}} />
      {mode === 'pan' ? (
        <div style={{position: 'absolute', inset: 0, transform: `translateX(${-panX}px)`}}>
          {PAN_COLUMNS.map(([x, top, width], i) => <Still key={i} name="cairn" style={{position: 'absolute', left: x - width / 2, top, width, filter: tint}} />)}
          {PAN_LABELS.map(([label, i]) => {
            const from = labelsFrom[i];
            if (from === undefined) return null;
            const [x, top] = PAN_COLUMNS[i];
            return <DiagramPill key={label} x={x} y={top - 118} w={label.length * 34 + 90} h={108} text={label} size={68} o={ramp(f, from, from + 10)} />;
          })}
        </div>
      ) : (
        <div style={{position: 'absolute', inset: 0, transformOrigin: '50% 100%', transform: `scale(${scale})`}}>
          {xs.map((x, i) => <Still key={x} name="cairn" style={{position: 'absolute', left: x - 170, top: cairnTop + lift[i] * 540, width: 340, filter: tint}} />)}
        </div>
      )}
      {title && <div style={{position: 'absolute', left: 0, right: 0, top: mode === 'row' ? 150 : 210, textAlign: 'center', fontFamily: THEME.sans, fontWeight: 800, fontSize: mode === 'row' ? 72 : 86, letterSpacing: '-0.02em', color: THEME.ink, opacity: ramp(f, a, a + 14)}}>{word('backdrops.034')}</div>}
    </AbsoluteFill>
  );
};

export const PillarLabels: React.FC<{items: Array<[string, number, number, number]>; size?: number; h?: number}> = ({items, size = 68, h = 108}) => {
  const f = useSrc();
  return <>{items.map(([label, at, x, y]) => <DiagramPill key={label + at} x={x} y={y} w={(label.length * 34 + 90) * (size / 68)} h={h} text={label} size={size} o={ramp(f, at, at + 10)} />)}</>;
};

// Agent mark fans out to two outcomes with dashed links.
export const FanOut: React.FC<{a: number}> = ({a}) => {
  const f = useSrc();
  const up = easeInOut(ramp(f, a + 44, a + 62));
  const y = 540 - up * 240;
  const size = 340 - up * 110;
  return (
    <AbsoluteFill>
      <GradBg />
      <Tile a={a} b={a + 400} x={960} y={y} size={size}><AgentMark size={size * 0.64} /></Tile>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <path d="M 930 440 C 900 520, 800 620, 760 660" stroke="#fff" strokeWidth={3.5} strokeDasharray="10 10" fill="none" opacity={ramp(f, a + 50, a + 60)} />
        <path d="M 990 440 C 1020 520, 1120 620, 1160 660" stroke="#fff" strokeWidth={3.5} strokeDasharray="10 10" fill="none" opacity={ramp(f, a + 76, a + 86)} />
      </svg>
      <div style={{position: 'absolute', left: 560, top: 680, display: 'flex', alignItems: 'center', gap: 14, fontFamily: THEME.sans, fontWeight: 700, fontSize: 56, lineHeight: 1.05, color: '#fff', opacity: ramp(f, a + 55, a + 66)}}><MapIcon size={50} /> <span>{word('backdrops.035')}<br />{word('backdrops.036')}</span></div>
      <div style={{position: 'absolute', left: 1150, top: 680, display: 'flex', alignItems: 'center', gap: 14, fontFamily: THEME.sans, fontWeight: 700, fontSize: 56, lineHeight: 1.05, color: '#fff', opacity: ramp(f, a + 80, a + 92)}}><Loop size={50} /> <span>{word('backdrops.037')}<br />{word('backdrops.038')}</span></div>
    </AbsoluteFill>
  );
};

export const TwoScopes: React.FC<{a: number; second?: number}> = ({a, second}) => {
  const f = useSrc();
  const shift = second ? easeInOut(ramp(f, second, second + 14)) : 0;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(60% 80% at 80% 50%, #1d4a46, rgba(29,74,70,0) 75%), #0f2a2c'}} />
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${-shift * 450}px)`}}>
        <div style={{opacity: 1 - shift * 0.45}}>
          <Tile a={a} b={a + 400} x={960} y={500} size={360} label={word('backdrops.039')} labelSize={80} fill="rgba(29,74,70,.72)" labelGap={14}><Pack size={220} /></Tile>
        </div>
      </div>
      {second && <Tile a={second} b={second + 400} x={1190} y={500} size={360} label={word('backdrops.040')} labelSize={80} fill="rgba(29,74,70,.72)" labelGap={14}><Cairn size={220} /></Tile>}
    </AbsoluteFill>
  );
};

// Starfield of scattered tasks; the agent pulls a handful together.
export const Scatter: React.FC<{a: number}> = ({a}) => {
  const f = useSrc();
  const dots = React.useMemo(() => {
    const out: Array<[number, number]> = [];
    let seed = 7;
    const next = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 46; i++) out.push([next() * 1920, next() * 1080]);
    return out;
  }, []);
  const agent = ramp(f, a + 70, a + 86);
  const pulled = easeOut(ramp(f, a + 96, a + 118));
  const hubs = [-60, -120, 180, 0, 60, 120].map((deg) => [960 + Math.cos((deg * Math.PI) / 180) * 340, 540 + Math.sin((deg * Math.PI) / 180) * 340] as const);
  return (
    <AbsoluteFill>
      <GradBg />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {dots.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={13} fill="#fff" opacity={ramp(f, a + i * 1.2, a + i * 1.2 + 8) * (Math.hypot(x - 960, y - 540) < 400 ? 1 - pulled : 1)} />)}
        {hubs.map(([x, y], i) => <g key={i} opacity={pulled}><line x1={960} y1={540} x2={x} y2={y} stroke="#fff" strokeWidth={3.5} /><circle cx={x} cy={y} r={32} fill={THEME.signal} /></g>)}
      </svg>
      <DiagramPill x={960} y={540} w={370} h={150} text={word('backdrops.041')} size={84} o={agent} />
    </AbsoluteFill>
  );
};

export {DimLayer, Pie, PromptTree, ReactLoop, GradBg, Cam, HomePage, PromptCard, Sidebar, HOMES, PAGES, PROMPTS};
