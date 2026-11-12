import {word} from '../plan';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {easeInOut, easeOut, ramp, track, useSrc} from '../lib/anim';
import {THEME} from '../theme';
import {AgentMark} from './Icons';
import {GradBg} from './Diagrams';

const NAVY = THEME.night;
const lines = (count: number, width: number, gap = 15, color = '#4a625f') => (
  <div>
    {Array.from({length: count}, (_, i) => (
      <div key={i} style={{height: 5, width: width * (i % 7 === 6 ? 0.6 : 1), marginBottom: gap - 5, background: color, opacity: 0.55}} />
    ))}
  </div>
);

// Logbook spreads on a soft wash: title type set large, body copy as ruled lines.
export const ReportSpread: React.FC<{a: number; b: number; variant: 0 | 1 | 2 | 3}> = ({a, variant}) => {
  const f = useSrc();
  const rise = (1 - easeOut(ramp(f, a, a + 10))) * 30;
  const pages = [
    {n: '', title: '', panel: word('cards.001')},
    {n: word('cards.002'), title: word('cards.003'), panel: word('cards.004')},
    {n: word('cards.005'), title: word('cards.006'), panel: word('cards.007')},
    {n: word('cards.008'), title: word('cards.009'), panel: word('cards.010')},
  ][variant];
  return (
    <AbsoluteFill style={{background: 'radial-gradient(70% 60% at 10% 100%, #a9d6e5, rgba(169,214,229,0) 70%), radial-gradient(70% 60% at 90% 0%, #a9d6e5, rgba(169,214,229,0) 70%), #fff'}}>
      {variant === 0 ? (
        <div style={{position: 'absolute', left: 300, top: 140 + rise, width: 1316, height: 800, background: NAVY, borderRadius: 16, color: '#fff', fontFamily: THEME.sans}}>
          <div style={{position: 'absolute', left: 66, top: 12, fontSize: 19, fontWeight: 700}}>{word('cards.011')}</div>
          <div style={{position: 'absolute', left: 66, top: 200, fontSize: 56, lineHeight: 1.26, fontWeight: 300}}><b>{word('cards.012')}</b><br />{word('cards.013')}<br />{word('cards.014')}<br />{word('cards.015')}</div>
          <svg width="800" height="700" style={{position: 'absolute', right: 40, top: 40}} opacity={0.72}>
            {Array.from({length: 44}, (_, i) => <path key={i} d={`M ${60 + i * 16} 560 C ${160 + i * 8} ${360 - i * 3}, ${260 + i * 9} ${140 + i * 2}, ${360 + i * 9} ${60 + i}`} stroke="#fff" strokeWidth="1.1" fill="none" />)}
          </svg>
        </div>
      ) : (
        <div style={{position: 'absolute', left: 280, top: 92 + rise, width: 1356, height: 895, background: '#fff', borderRadius: 16, boxShadow: '0 20px 60px rgba(16,32,31,.2)', overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 30, top: 80, display: 'flex', gap: 14, color: NAVY, fontFamily: THEME.sans}}>
            <span style={{fontSize: 118, fontWeight: 700, lineHeight: 1}}>{pages.n}</span>
            <span style={{fontSize: 44, fontWeight: 800, lineHeight: 1.16, whiteSpace: 'pre', transform: 'scaleX(.84)', transformOrigin: '0 0', marginTop: 10}}>{pages.title}</span>
          </div>
          <div style={{position: 'absolute', left: 60, top: 260, display: 'flex', gap: 28}}>{lines(30, 260)}{lines(30, 260)}</div>
          <div style={{position: 'absolute', right: 0, top: 0, width: 678, height: '100%', background: NAVY, color: '#fff', fontFamily: THEME.sans, padding: '200px 44px', boxSizing: 'border-box'}}>
            <div style={{fontSize: 40, fontWeight: 800, lineHeight: 1.1, transform: 'scaleX(.86)', transformOrigin: '0 0', whiteSpace: 'nowrap'}}>{pages.panel}</div>
            <div style={{marginTop: 26}}>{lines(4, 520, 18, '#fff')}</div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// Small file window that slides in from the right.
export const FolderWindow: React.FC<{a: number; b: number}> = ({a, b}) => {
  const f = useSrc();
  if (f < a || f > b) return null;
  const x = track(f, [[a, 1920], [a + 18, 1330]], easeOut) ;
  const file = ramp(f, a + 60, a + 72);
  return (
    <div style={{position: 'absolute', left: x, top: 280, width: 700, height: 565, background: '#f5f8f7', borderRadius: 30, boxShadow: '0 20px 60px rgba(8,23,27,.35)', fontFamily: THEME.ui, color: '#24403d'}}>
      {['#c2d1ce', '#c2d1ce', '#c2d1ce'].map((c, i) => <span key={c} style={{position: 'absolute', left: 34 + i * 26, top: 36, width: 18, height: 18, borderRadius: 10, background: c}} />)}
      <span style={{position: 'absolute', left: 170, top: 30, fontSize: 26, color: '#7d9592'}}>‹   ›</span>
      <span style={{position: 'absolute', left: 318, top: 30, fontSize: 24}}>{word('cards.016')}</span>
      <div style={{position: 'absolute', left: 30, top: 110, width: 170, textAlign: 'center', fontSize: 22, lineHeight: 1.2, opacity: file}}>
        <div style={{width: 62, height: 78, margin: '0 auto 12px', background: '#fff', border: '1px solid #c2d1ce', boxShadow: '0 2px 5px rgba(8,23,27,.12)'}} />{word('cards.017')}</div>
      <svg width="46" height="52" viewBox="0 0 24 28" style={{position: 'absolute', left: 104, top: track(f, [[a + 40, 400], [a + 66, 165]], easeOut), opacity: file}}><path d="M3 2l15 13h-8l5 10-4 2-5-10-5 5z" fill={THEME.nightDeep} stroke="#fff" strokeWidth="1.4" /></svg>
    </div>
  );
};

// Notes deck in a dark editor frame, then blur and the big initial.
const SlideThumb: React.FC<{i: number}> = ({i}) => <div style={{width: 165, height: 92, background: i === 0 ? THEME.night : '#fff', outline: i === 0 ? '2px solid #fff' : undefined, marginBottom: 26}} />;
export const DeckView: React.FC<{a: number; page: 'cover' | 'stat' | 'blur'}> = ({a, page}) => {
  const f = useSrc();
  const blur = page === 'blur' ? 16 * ramp(f, a, a + 12) : 0;
  return (
    <AbsoluteFill>
      <GradBg />
      <div style={{position: 'absolute', left: 190, top: 150, width: 1600, height: 845, background: '#1d3a3a', borderRadius: 12, filter: `blur(${blur}px)`, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 50, top: 12}}>{Array.from({length: 7}, (_, i) => <SlideThumb key={i} i={i} />)}</div>
        <div style={{position: 'absolute', left: 245, top: 90, width: 1290, height: 725, background: page === 'cover' ? THEME.night : page === 'blur' ? '#a9bab7' : '#fff', color: page === 'cover' ? '#fff' : THEME.night, fontFamily: THEME.ui, padding: 90, boxSizing: 'border-box'}}>
          {page === 'cover' ? (
            <>
              <div style={{width: 72, height: 72, borderRadius: 40, background: THEME.moss, marginBottom: 90}} />
              <div style={{fontSize: 88, fontWeight: 700, letterSpacing: '0.02em'}}>{word('cards.018')}</div>
              <div style={{fontSize: 33, marginTop: 30}}>{word('cards.019')}</div>
              <div style={{fontSize: 22, marginTop: 30, fontStyle: 'italic', opacity: 0.8}}>{word('cards.020')}</div>
              <div style={{fontSize: 19, marginTop: 110, opacity: 0.6}}>{word('cards.021')}</div>
            </>
          ) : (
            <>
              <div style={{fontSize: 44, fontWeight: 700}}>{word('cards.022')}</div>
              <div style={{fontSize: 150, fontWeight: 800, color: THEME.moss, marginTop: 40}}>{word('cards.023')}</div>
              <div style={{display: 'flex', gap: 30, marginTop: 40}}>{[0, 1, 2].map((i) => <div key={i} style={{flex: 1, height: 200, background: '#e1ece9', borderRadius: 12}} />)}</div>
            </>
          )}
        </div>
      </div>
      {page === 'blur' && (
        <div style={{position: 'absolute', left: 780, top: 360, width: 360, height: 360, borderRadius: 96, background: 'linear-gradient(145deg, rgba(255,255,255,.5), rgba(169,214,229,.45))', boxShadow: 'inset 0 0 40px rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.8 + 0.2 * easeOut(ramp(f, a, a + 12))})`, fontFamily: THEME.sans, fontWeight: 800, fontSize: 150, color: THEME.send}}>{word('cards.024')}</div>
      )}
    </AbsoluteFill>
  );
};

const SAME = [word('cards.025'), word('cards.026'), word('cards.027')];
const STATS: Array<[string, string, number, number]> = [[word('cards.028'), word('cards.029'), 430, 190], [word('cards.030'), word('cards.031'), 680, 190], [word('cards.032'), word('cards.033'), 430, 340], [word('cards.034'), word('cards.035'), 650, 340]];
// Example slide with a check-list beside it.
export const GrowthCard: React.FC<{a: number}> = ({a}) => {
  const f = useSrc();
  const styled = ramp(f, a + 60, a + 70);
  const scale = track(f, [[a, 1.5], [a + 28, 1]], easeInOut);
  return (
    <AbsoluteFill>
      <GradBg />
      <div style={{position: 'absolute', left: 195, top: 270, width: 960, height: 540, transformOrigin: '50% 50%', transform: `scale(${scale})`, background: `linear-gradient(135deg, rgba(169,214,229,${styled}), #fff 34%, #fff 64%, rgba(169,214,229,${styled}))`, backgroundColor: '#fff', fontFamily: THEME.sans, color: THEME.ink}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 78, textAlign: 'center', fontSize: 48, fontWeight: 800, letterSpacing: '-0.02em'}}>{word('cards.036')}</div>
        <div style={{position: 'absolute', left: 100, top: 210, width: 270, fontSize: 25, lineHeight: 1.15, color: '#1f3a37'}}>{word('cards.037')}</div>
        {STATS.map(([v, l], i) => (
          <div key={`${v}${i}`} style={{position: 'absolute', left: 400 + (i % 2) * 280, top: 190 + Math.floor(i / 2) * 160, width: 260, textAlign: 'center'}}>
            <div style={{fontSize: 72, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1}}>{v}</div>
            <div style={{fontSize: 25, fontWeight: 600, lineHeight: 1.1, marginTop: 4}}>{l}</div>
          </div>
        ))}
      </div>
      {SAME.map((label, i) => (
        <div key={`${label}${i}`} style={{position: 'absolute', left: 1230, top: 400 + i * 120, display: 'flex', alignItems: 'center', gap: 22, fontFamily: THEME.sans, fontWeight: 700, fontSize: 56, color: '#fff', opacity: ramp(f, a + 48 + i * 26, a + 60 + i * 26)}}>
          <svg width="46" height="46" viewBox="0 0 24 24"><rect x={2} y={2} width={20} height={20} rx={5} fill={THEME.accent} /><path d="M7 12.5l3.2 3.2L17 8.6" fill="none" stroke={THEME.ink} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" /></svg>
          {label}
        </div>
      ))}
    </AbsoluteFill>
  );
};

const STATUS = [word('cards.038'), word('cards.039')];
// Halftone globe of connected tasks with a status pill in the middle.
export const DotMap: React.FC<{a: number}> = ({a}) => {
  const f = useSrc();
  const spots = React.useMemo(() => {
    const out: Array<[number, number, number]> = [];
    for (let y = 0; y < 1080; y += 17) {
      for (let x = (y / 17) % 2 ? 8 : 0; x < 1920; x += 17) {
        const d = Math.hypot((x - 960) / 840, (y - 540) / 520);
        if (d < 1) out.push([x, y, Math.max(1, 9 * (1 - d * 0.8))]);
      }
    }
    return out;
  }, []);
  const label = f < a + 30 ? STATUS[0] : STATUS[1];
  return (
    <AbsoluteFill style={{background: 'linear-gradient(120deg, #0f2a2c, #1d4a46)'}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>{spots.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={Math.hypot((x - 960) / 840, (y - 540) / 520) < 0.34 ? THEME.accent : THEME.glacier} opacity={0.3 + 0.5 * (1 - Math.hypot((x - 960) / 840, (y - 540) / 520))} />)}</svg>
      <div style={{position: 'absolute', left: 660, top: 462, height: 150, width: 600, background: 'rgba(255,255,255,.9)', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 30, paddingLeft: 36, boxSizing: 'border-box', fontFamily: THEME.ui, fontSize: 60, color: THEME.uiInk}}><AgentMark size={92} />{label}</div>
    </AbsoluteFill>
  );
};

const PHONE_TEXT = word('cards.040');
// Phone frame on the gradient; the request fills in line by line.
export const PhoneChat: React.FC<{a: number; b: number}> = ({a, b}) => {
  const f = useSrc();
  const count = Math.round(ramp(f, a + 10, b - 50) * PHONE_TEXT.length);
  const y = track(f, [[a, 0], [a + 200, 0], [b, -220]]);
  return (
    <AbsoluteFill>
      <GradBg />
      <div style={{position: 'absolute', left: 660, top: 72 + y, width: 600, height: 1006 - y, borderRadius: 88, background: '#f5f8f7', border: '9px solid #08171b', boxSizing: 'border-box', overflow: 'hidden', fontFamily: THEME.ui}}>
        <div style={{position: 'absolute', left: 215, top: 26, width: 150, height: 40, background: THEME.nightDeep, borderRadius: 24}} />
        <div style={{position: 'absolute', left: 40, top: 112}}><AgentMark size={58} /></div>
        <div style={{position: 'absolute', left: 40, top: 200, width: 500, fontSize: 31, lineHeight: 1.22, color: THEME.ink, whiteSpace: 'pre-wrap'}}>{PHONE_TEXT.slice(0, count)}</div>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 240, background: 'linear-gradient(to top, #d5e6ea, rgba(213,230,234,0))'}} />
        <div style={{position: 'absolute', left: 260, bottom: 96, width: 70, height: 70, borderRadius: 40, background: '#fff', boxShadow: '0 2px 10px rgba(8,23,27,.12)', textAlign: 'center', lineHeight: '70px', fontSize: 28}}><svg width="28" height="34" viewBox="0 0 24 30" style={{verticalAlign: 'middle'}}><rect x="8" y="2" width="8" height="16" rx="4" fill="#1f3a37" /><path d="M4 14a8 8 0 0016 0M12 22v5" stroke="#1f3a37" strokeWidth="2" fill="none" /></svg></div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center', gap: 18, fontSize: 26, fontWeight: 500, opacity: ramp(f, b - 50, b - 38)}}>
          <span style={{padding: '12px 30px', borderRadius: 26, background: THEME.night, color: '#fff'}}>{word('cards.042')}</span>
          <span style={{padding: '12px 30px', borderRadius: 26, border: `1.5px solid ${THEME.uiLine}`, color: THEME.uiInk}}>{word('cards.043')}</span>
        </div>
        <div style={{position: 'absolute', left: 230, bottom: 28, width: 130, height: 46, borderRadius: 24, background: '#fff', textAlign: 'center', lineHeight: '46px', fontSize: 20}}>{word('cards.041')}</div>
      </div>
    </AbsoluteFill>
  );
};

// Tilted dark prompt screens, drifting past the camera.
export const DarkPrompt: React.FC<{a: number; b: number; title: string; hint: string; rotate: number}> = ({a, b, title, hint, rotate}) => {
  const f = useSrc();
  const x = track(f, [[a, 0], [b, -120]]);
  return (
    <AbsoluteFill style={{background: THEME.nightDeep, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 160 + x, top: 40, transform: `rotate(${rotate}deg) scale(1.3)`, transformOrigin: '0 0', fontFamily: THEME.ui, color: THEME.paperDark, fontSize: 92, whiteSpace: 'nowrap'}}>{title}</div>
      <div style={{position: 'absolute', left: -60, right: -60, top: 340, height: 500, background: '#12262a', transform: `rotate(${rotate}deg)`}} />
      <div style={{position: 'absolute', left: 150 + x, top: 500, transform: `rotate(${rotate}deg)`, fontFamily: THEME.ui, color: '#7d9592', fontSize: 66}}>{hint}</div>
    </AbsoluteFill>
  );
};

// Soft-focus headline lines tracking across.
export const NewsLine: React.FC<{a: number; b: number; lines: Array<[string, boolean]>; serif?: boolean}> = ({a, b, lines: rows, serif}) => {
  const f = useSrc();
  const x = track(f, [[a, 0], [b, -60]]);
  return (
    <AbsoluteFill style={{background: THEME.paper}}>
      <div style={{position: 'absolute', left: -20 + x, top: 340, fontFamily: serif ? THEME.serif : THEME.sans, fontWeight: serif ? 400 : 800, fontSize: 122, lineHeight: 1.08, color: THEME.ink, filter: 'blur(1.4px)', whiteSpace: 'nowrap'}}>
        {rows.map(([text, strong], i) => <div key={i} style={{opacity: strong ? 1 : 0.62}}>{text}</div>)}
      </div>
    </AbsoluteFill>
  );
};

const CAPTIONS = [word('cards.044'), word('cards.045')];
const TYPED = word('cards.046');
// Two-mode toggle (Ask, then Run) with a one-line meaning under it.
export const ModeToggle: React.FC<{a: number; b: number}> = ({a, b}) => {
  const f = useSrc();
  const typed = TYPED;
  const titleOn = f < a + 22;
  const count = Math.round(ramp(f, a, a + 14) * typed.length);
  const flip = easeInOut(ramp(f, a + 90, a + 100));
  const caption = flip > 0.5 ? CAPTIONS[1] : CAPTIONS[0];
  const captionOn = ramp(f, flip > 0.5 ? a + 104 : a + 32, flip > 0.5 ? a + 120 : a + 48);
  return (
    <AbsoluteFill style={{background: THEME.paper, fontFamily: THEME.sans}}>
      {titleOn ? (
        <div style={{position: 'absolute', left: 430, top: 465, display: 'flex', alignItems: 'center', gap: 16, fontFamily: THEME.serif, fontSize: 138, fontWeight: 500, color: THEME.uiInk, letterSpacing: '-0.02em'}}><AgentMark size={124} />{typed.slice(0, count)}</div>
      ) : (
        <>
          <div style={{position: 'absolute', left: 430, top: 455, width: 1060, height: 165, background: '#d8e2df', borderRadius: 44, boxShadow: '0 22px 50px rgba(16,32,31,.16)'}}>
            <div style={{position: 'absolute', left: 12 + flip * 518, top: 12, width: 518, height: 141, background: THEME.night, borderRadius: 36}} />
            <div style={{position: 'absolute', left: 0, top: 0, width: 530, lineHeight: '165px', textAlign: 'center', fontSize: 68, color: flip > 0.5 ? THEME.uiMuted : '#fff'}}>{word('cards.047')}</div>
            <div style={{position: 'absolute', left: 530, top: 0, width: 530, lineHeight: '165px', textAlign: 'center', fontSize: 68, color: flip > 0.5 ? '#fff' : THEME.uiMuted}}>{word('cards.048')}</div>
          </div>
          <div style={{position: 'absolute', left: 660 + flip * 500, top: 630, width: 600, textAlign: 'center', fontWeight: 800, fontSize: 62, lineHeight: 1.15, color: THEME.ink, opacity: captionOn, whiteSpace: 'pre'}}>{caption}</div>
        </>
      )}
    </AbsoluteFill>
  );
};
