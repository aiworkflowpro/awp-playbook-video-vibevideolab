import React from 'react';
import {AbsoluteFill} from 'remotion';
import {easeInOut, lerp, track, useSrc} from '../lib/anim';
import {word} from '../plan';
import {THEME} from '../theme';
import {AgentMark, Calendar, Doc, Folder, Logbook, MapIcon, Mic, Pack, RopeKnot, Search} from './Icons';

// Unbranded console screens. Canonical page space: the home screen fully zoomed in; cameras map it to the frame.
export type CamKey = readonly [frame: number, scale: number, tx: number, ty: number];

export const Cam: React.FC<{keys: ReadonlyArray<CamKey>; children: React.ReactNode}> = ({keys, children}) => {
  const f = useSrc();
  const at = (i: number) => track(f, keys.map((k) => [k[0], k[i]] as const), easeInOut);
  return <AbsoluteFill style={{transformOrigin: '0 0', transform: `translate(${at(2)}px, ${at(3)}px) scale(${at(1)})`}}>{children}</AbsoluteFill>;
};

const ui: React.CSSProperties = {fontFamily: THEME.ui, color: THEME.uiInk};

// Mode tabs read from the plan (Ask / Run); the second one is active in the console.
const Toggle: React.FC<{y: number; x: number}> = ({x, y}) => (
  <div style={{position: 'absolute', left: x, top: y, height: 44, display: 'flex', alignItems: 'center', background: THEME.paperDark, borderRadius: 22, padding: 3, fontSize: 24, fontWeight: 500, ...ui}}>
    <span style={{padding: '0 18px', color: THEME.uiMuted}}>{word('cards.047')}</span>
    <span style={{padding: '0 18px', height: 38, lineHeight: '38px', background: THEME.night, color: '#fff', borderRadius: 19}}>{word('cards.048')}</span>
  </div>
);

// Right end of the prompt card: a neutral settings chip, voice input and the send key.
const SendRow: React.FC<{right: number; y: number}> = ({right, y}) => (
  <div style={{position: 'absolute', right, top: y, height: 50, display: 'flex', alignItems: 'center', gap: 22, fontSize: 24, whiteSpace: 'nowrap', ...ui}}>
    <span style={{display: 'flex', alignItems: 'center', gap: 10, height: 44, padding: '0 18px', border: `1.5px solid ${THEME.uiLine}`, borderRadius: 22, color: THEME.uiMuted}}>
      <svg width="22" height="22" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx={16} cy={7} r={2} /><circle cx={10} cy={17} r={2} /></g></svg>
      Settings
    </span>
    <Mic size={32} color={THEME.uiInk} />
    <span style={{flex: '0 0 50px', width: 50, height: 50, background: THEME.send, borderRadius: 25, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <svg width="26" height="26" viewBox="0 0 24 24"><path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke={THEME.ink} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  </div>
);

export type PromptState = {greeting: string; text: string; caret?: boolean; hl?: Array<[string, number]>; attach?: string[]; folder?: string; tray?: boolean};

const Highlighted: React.FC<{text: string; hl?: Array<[string, number]>}> = ({text, hl}) => {
  if (!hl?.length) return <>{text}</>;
  const parts: React.ReactNode[] = [];
  let rest = text;
  let key = 0;
  for (const [word, opacity] of hl) {
    const i = rest.indexOf(word);
    if (i < 0) continue;
    parts.push(rest.slice(0, i));
    parts.push(<span key={key++} style={{background: `rgba(242,165,65,${opacity * 0.42})`, boxShadow: `inset 0 -3px 0 rgba(217,138,30,${opacity})`, borderRadius: 3}}>{word}</span>);
    rest = rest.slice(i + word.length);
  }
  parts.push(rest);
  return <>{parts}</>;
};

// The prompt card alone: used inside the home page and floating on the night map.
export const PromptCard: React.FC<{text: string; caret?: boolean; hl?: Array<[string, number]>; attach?: string[]; width?: number}> = ({text, caret, hl, attach, width = 1365}) => {
  const f = useSrc();
  return (
    <div style={{position: 'relative', width, background: '#fff', borderRadius: 28, border: `1.5px solid ${THEME.uiLine}`, borderLeft: `6px solid ${THEME.accent}`, boxShadow: '0 10px 34px rgba(8,23,27,.10)', padding: '34px 42px 100px', minHeight: 252, boxSizing: 'border-box', ...ui}}>
      {attach && (
        <div style={{display: 'flex', gap: 22, marginBottom: 26}}>
          {attach.map((name) => (
            <div key={name} style={{height: 64, display: 'flex', alignItems: 'center', gap: 14, padding: '0 22px 0 16px', borderRadius: 14, background: THEME.paper, border: `1.5px solid ${THEME.uiLine}`, fontSize: 24, fontWeight: 500}}>
              <Doc size={30} color={THEME.nightMid} />
              {name}
              <span style={{fontSize: 16, fontWeight: 600, color: THEME.uiMuted, padding: '2px 7px', border: `1px solid ${THEME.uiLine}`, borderRadius: 6}}>{name.split('.').pop()?.toUpperCase()}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{fontSize: 33.5, lineHeight: '46px', whiteSpace: 'pre-wrap', color: THEME.ink, minHeight: 46}}>
        {text ? <Highlighted text={text} hl={hl} /> : null}
        {caret && Math.floor(f / 12) % 2 === 0 && <span style={{display: 'inline-block', width: 2.5, height: 38, background: THEME.ink, marginLeft: 2, transform: 'translateY(6px)'}} />}
      </div>
      <div style={{position: 'absolute', left: 34, bottom: 26, width: 44, height: 44, borderRadius: 22, border: `1.5px solid ${THEME.uiLine}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <svg width="20" height="20" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke={THEME.uiInk} strokeWidth={2.2} strokeLinecap="round" /></svg>
      </div>
      <div style={{position: 'absolute', left: 96, bottom: 26, height: 44}}><Toggle x={0} y={0} /></div>
      <div style={{position: 'absolute', right: 22, bottom: 22, height: 50}}><SendRow right={0} y={0} /></div>
    </div>
  );
};

const IDEA_ICONS = [MapIcon, Logbook, RopeKnot];
const Idea: React.FC<{y: number; text: string; i: number}> = ({y, text, i}) => {
  const Icon = IDEA_ICONS[i % IDEA_ICONS.length];
  return (
    <div style={{position: 'absolute', left: 327, top: y, width: 1300, display: 'flex', alignItems: 'center', gap: 28, fontSize: 27, ...ui}}>
      <span style={{flex: '0 0 50px', height: 50, borderRadius: 14, background: THEME.paperDark, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon size={28} color={THEME.nightMid} /></span>
      <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{text}</span>
    </div>
  );
};

// A row of short starter chips: the first words of this chapter's prompts.
const short = (text: string) => (text.split(/\s+/).length > 5 ? `${text.split(/\s+/).slice(0, 5).join(' ')}…` : text);
const StarterChips: React.FC<{ideas: string[]}> = ({ideas}) => (
  <div style={{display: 'flex', justifyContent: 'center', gap: 20, marginTop: 40, fontSize: 25, ...ui}}>
    {ideas.map((label, i) => {
      const Icon = IDEA_ICONS[i % IDEA_ICONS.length];
      return <span key={label} style={{display: 'flex', alignItems: 'center', gap: 10, padding: '10px 22px', background: '#fff', border: `1.5px solid ${THEME.uiLine}`, borderRadius: 24}}><Icon size={24} color={THEME.nightMid} />{short(label)}</span>;
    })}
  </div>
);

// Home screen in canonical page space. The prompt card grows down as text wraps.
export const HomePage: React.FC<PromptState & {sidebar?: boolean; chatMode?: boolean; ideas?: string[]}> = ({greeting, text, caret, hl, attach, folder, sidebar = true, chatMode, ideas = []}) => (
  <div style={{position: 'absolute', left: -643, top: -377, width: 2613, height: 1794, background: THEME.paper, borderRadius: 26, boxShadow: '0 30px 80px rgba(8,23,27,.35)', overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 643, top: 377, width: 1920, height: 1400}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 240, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 28, fontFamily: THEME.sans, fontWeight: 500, fontSize: 88, letterSpacing: '-0.02em', color: THEME.uiInk}}>
        <AgentMark size={70} />
        {greeting}
      </div>
      <div style={{position: 'absolute', left: 285, top: 405}}>
        <PromptCard text={text} caret={caret} hl={hl} attach={attach} />
        {chatMode ? <StarterChips ideas={ideas} /> : <>{folder ? <div style={{width: 1320, marginLeft: 22, height: 70, border: `1.5px solid ${THEME.uiLine}`, borderTop: 'none', borderRadius: '0 0 22px 22px', background: THEME.paperDark, display: 'flex', alignItems: 'center', padding: '0 34px', boxSizing: 'border-box', fontSize: 24, color: THEME.uiInk, fontFamily: THEME.ui}}>
          <span style={{display: 'flex', alignItems: 'center', gap: 10}}><Folder size={24} color={THEME.nightMid} />{folder}</span>
        </div> : <div style={{height: 70}} />}
        <div style={{position: 'relative', height: 330, fontFamily: THEME.ui}}>
          <div style={{position: 'absolute', left: 42, top: 72, width: 60, height: 4, borderRadius: 2, background: THEME.accent}} />
          <div style={{position: 'absolute', left: -285, top: 112, width: 1920}}>{ideas.map((idea, i) => <Idea key={idea} y={i * 92} text={idea} i={i} />)}</div>
        </div></>}
      </div>
    </div>
    {sidebar && <Sidebar />}
  </div>
);

// Left rail of the console window, in window coordinates: icons and quiet placeholder rows, no labels.
const RAIL: Array<[React.FC<{size?: number; color?: string}>, number]> = [[Search, 0.62], [MapIcon, 0.5], [Logbook, 0.7], [Pack, 0.44], [RopeKnot, 0.56], [Calendar, 0.38]];
export const Sidebar: React.FC<{recent?: string}> = ({recent}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: 540, height: '100%', fontSize: 25, ...ui, background: THEME.night}}>
    <div style={{position: 'absolute', left: 44, top: 60}}><AgentMark size={64} /></div>
    <div style={{position: 'absolute', left: 38, top: 160, width: 464, height: 58, borderRadius: 14, background: 'rgba(169,214,229,.12)', border: `1.5px solid ${THEME.glassLine}`}} />
    {RAIL.map(([Icon, w], i) => (
      <div key={i} style={{position: 'absolute', left: 58, top: 250 + i * 64, display: 'flex', alignItems: 'center', gap: 22}}>
        <Icon size={30} color={i === 0 ? THEME.accent : THEME.glacier} />
        <span style={{width: 330 * w, height: 12, borderRadius: 6, background: 'rgba(169,214,229,.22)'}} />
      </div>
    ))}
    <div style={{position: 'absolute', left: 58, top: 660, width: 120, height: 3, background: 'rgba(169,214,229,.3)'}} />
    {recent && <div style={{position: 'absolute', left: 38, top: 690, width: 464, height: 50, lineHeight: '50px', paddingLeft: 24, color: '#fff', background: 'rgba(169,214,229,.12)', borderRadius: 10, boxSizing: 'border-box'}}>{recent}</div>}
  </div>
);

// Page text runs placed by position and width, set in our typeface.
export type OcrRun = [text: string, x: number, baseline: number, width: number, size: number];
export type UiBox = [x: number, y: number, w: number, h: number, r: number, g: number, b: number, er: number, eg: number, eb: number];
export const OcrLayer: React.FC<{runs: ReadonlyArray<OcrRun>; boxes?: ReadonlyArray<UiBox>; family?: string}> = ({runs, boxes = [], family = THEME.ui}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
    {boxes.map(([x, y, w, h, r, g, b, er, eg, eb], i) => (
      <rect key={i} x={x} y={y} width={w} height={h} rx={Math.min(18, h / 2)} fill={`rgb(${r},${g},${b})`} stroke={`rgb(${er},${eg},${eb})`} strokeWidth={1.4} />
    ))}
    {runs.map(([text, x, baseline, width, size], i) => {
      const inBox = [...boxes].reverse().find((b) => x >= b[0] && x < b[0] + b[2] && baseline - 6 >= b[1] && baseline - 6 <= b[1] + b[3]);
      const dark = inBox ? inBox[4] + inBox[5] + inBox[6] < 240 : false;
      return <text key={i} x={x} y={baseline} fontFamily={family} fontSize={size} textLength={width} lengthAdjust="spacingAndGlyphs" fill={dark ? '#fff' : '#1f3a37'}>{text}</text>;
    })}
  </svg>
);

export const DimLayer: React.FC<{a: number; b: number; alpha?: number}> = ({a, b, alpha = 0.32}) => {
  const f = useSrc();
  if (f < a || f > b) return null;
  return <AbsoluteFill style={{background: `rgba(8,23,27,${alpha * Math.min(track(f, [[a, 0], [a + 8, 1]]), track(f, [[b - 8, 1], [b, 0]]))})`}} />;
};

export const chars = (text: string, f: number, keys: ReadonlyArray<readonly [number, number]>) => text.slice(0, Math.round(track(f, keys) * text.length));
export const camLerp = lerp;
