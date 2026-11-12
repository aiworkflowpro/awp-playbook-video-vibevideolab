import {word} from '../plan';
import React from 'react';
import {BulletCheck, BulletDot, Reveal, Scrim} from '../parts/Text';
import {GlassBar, Tile} from '../parts/Glass';
import {Pie} from '../parts/Diagrams';
import {AgentMark, Bell, Cairn, Calendar, Doc, Envelope, FileTile, Folder, Logbook, MapIcon, Pack, RopeKnot, Search} from '../parts/Icons';
import {THEME} from '../theme';
import {easeInOut, ramp, track} from '../lib/anim';

// Everything that sits on top of the stage, presenter or footage, in layout frames; positions on the 1920x1080 frame.
const s = (seconds: number) => Math.round(seconds * 23.976);
// A tile for one of the four things the guide carries; the compass mark stays with the guide itself.
const CarryTile = (a: number, b: number, x: number, y: number, Icon: React.FC<{size?: number}>, size = 130) => (
  <Tile key={`ct${a}${x}`} a={a} b={b} x={x} y={y} size={size}><Icon size={size * 0.5} /></Tile>
);
const Bottom = (a: number, b: number, text: string, x = 960, y = 905, size = 64, extra: object = {}) => [
  <Scrim key={`sc${a}`} a={a - 4} b={b + 2} dir="bottom" />,
  <Reveal key={`rv${a}`} a={a} b={b} text={text} x={x} y={y} size={size} {...extra} />,
];

const bulletList = (a: number, b: number, x: number, y: number, items: string[], gap = 80, size = 48, mark: 'dot' | 'check' = 'dot', spacing = 36, cross = -1) =>
  items.map((text, i) => (
    <Reveal key={`bl${a}${i}`} a={a + i * spacing} b={b} text={text} x={x} y={y + i * gap} width={800} align="left" size={size} bullet={mark === 'dot' ? <BulletDot /> : <BulletCheck ok={i !== cross} />} />
  ));

export const OVERLAYS: React.ReactNode[] = [
  // Opening
  CarryTile(14, 59, 207, 389, Pack, 225),
  CarryTile(17, 59, 480, 389, MapIcon, 225),
  CarryTile(22, 59, 1443, 385, Logbook, 225),
  CarryTile(26, 59, 1710, 383, RopeKnot, 225),
  ...Bottom(14, 59, word('overlays.001'), 960, 900, 76, {weight: 800}),
  ...Bottom(s(5.3), 166, word('overlays.002'), 840, 925, 72, {weight: 800}),
  <Reveal key="type1" a={s(7.3)} b={s(8.2)} text={word('overlays.003')} x={85} y={480} width={800} align="left" size={62} />,
  <Reveal key="type2" a={205} b={s(9.0)} text={word('overlays.004')} x={1420} y={260} width={500} align="left" size={56} />,
  // Titles on footage
  <Reveal key="book" a={369} b={392} lead={2} text={word('overlays.005')} x={960} y={500} size={78} weight={800} rise={0} />,
  <Reveal key="compare" a={400} b={414} lead={2} text={word('overlays.006')} x={960} y={500} size={78} weight={800} rise={0} />,
  <Reveal key="draft" a={420} b={441} lead={2} text={word('overlays.007')} x={960} y={500} size={78} weight={800} rise={0} />,
  <Reveal key="send" a={448} b={482} lead={2} text={word('overlays.008')} x={960} y={500} size={78} weight={800} rise={0} />,
  ...Bottom(s(24.0), s(26.9), word('overlays.009'), 960, 905, 74, {weight: 800}),
  ...Bottom(s(31.0), 824, word('overlays.010'), 900, 905, 74, {weight: 800}),
  ...Bottom(s(34.6), 867, word('overlays.011'), 960, 905, 74, {weight: 800}),
  <Tile key="tc" a={s(37.1)} b={s(38.9)} x={1415} y={720} size={150} label={word('overlays.012')} labelSize={36}><Search size={84} /></Tile>,
  <Tile key="tans" a={s(38.0)} b={s(38.9)} x={1695} y={720} size={150} label={word('overlays.013')} labelSize={36}><Doc size={84} /></Tile>,
  <Tile key="tact" a={s(38.4)} b={s(38.9)} x={1555} y={880} size={150} label={word('overlays.014')} labelSize={36}><AgentMark size={94} /></Tile>,

  // Part 1
  ...Bottom(s(59.3), 1485, word('overlays.015'), 960, 898, 64),
  <EmailStat key="em" />,
  <EveryStat key="every" />,
  ...Bottom(s(77.0), s(80.5), word('overlays.016'), 960, 905, 62),
  ...Bottom(s(85.0), s(88.0), word('overlays.017'), 960, 905, 62),
  <Scrim key="scCo" a={s(90.0)} b={s(98.0)} dir="right" size={0.62} alpha={0.92} />,
  <GlassBar key="coAg" a={s(90.2)} b={2350} x={1408} y={302} width={600} height={100} text={word('overlays.018')} size={54} />,
  ...bulletList(s(91.8), 2350, 1149, 390, [word('overlays.019'), word('overlays.020'), word('overlays.021'), word('overlays.022')], 108, 56, 'check'),
  <AgentPair key="pair" />,
  <Tile key="tpack" a={s(116.0)} b={s(118.0)} x={185} y={730} size={132} label={word('overlays.023')} labelSize={36} fill="rgba(15,42,44,.55)"><Pack size={80} /></Tile>,
  <Tile key="tmap" a={s(116.8)} b={s(118.0)} x={1690} y={730} size={132} label={word('overlays.024')} labelSize={36} fill="rgba(29,74,70,.55)"><MapIcon size={80} /></Tile>,
  <GlassBar key="cb" a={s(158.0)} b={3837} x={300} y={460} width={320} height={82} text={word('overlays.025')} size={42} />,
  <GlassBar key="ag" a={s(159.0)} b={3837} x={1600} y={460} width={230} height={82} text={word('overlays.026')} size={42} />,
  <Scrim key="scEm" a={s(192.0)} b={4678} dir="right" size={0.5} alpha={0.55} />,
  ...bulletList(s(192.2), 4678, 1265, 392, [word('overlays.027'), word('overlays.028'), word('overlays.029')], 121, 56, 'check', 15, 2),
  <Scrim key="scFlow" a={s(260.0)} b={6308} dir="right" size={0.62} alpha={0.9} />,
  <Tile key="fe" a={s(260.2)} b={6308} x={1045} y={240} size={124} label={word('overlays.030')} labelSize={22} labelGap={2}><AgentMark size={76} /></Tile>,
  <Tile key="fc" a={s(261.7)} b={6308} x={1045} y={510} size={124} label={word('overlays.031')} labelSize={22} labelGap={2}><Pack size={72} /></Tile>,
  <Tile key="env" a={s(303.0)} b={s(307.2)} x={341} y={518} size={240}><Envelope size={140} /></Tile>,
  <Tile key="cal" a={s(304.0)} b={s(307.2)} x={1572} y={518} size={240}><Calendar size={140} /></Tile>,
  <GlassBar key="co2" a={s(361.8)} b={s(363.4)} x={959} y={907} width={740} height={150} text={word('overlays.032')} size={66} />,
  <Reveal key="n1" a={s(364.0)} b={s(369.7)} text={word('overlays.033')} x={330} y={230} width={500} size={40} />,
  <Reveal key="n1b" a={s(365.0)} b={s(369.7)} text={word('overlays.034')} x={330} y={290} width={700} size={58} />,
  <Scrim key="scV" a={s(370.0)} b={s(374.2)} dir="right" size={0.45} alpha={0.45} />,
  ...bulletList(s(370.0), s(374.2), 1385, 370, [word('overlays.035'), word('overlays.036'), word('overlays.037')], 86, 44),
  <Reveal key="n1c" a={s(380.2)} b={s(385.2)} text={word('overlays.038')} x={330} y={225} width={700} size={52} step={0} />,
  <Reveal key="n2" a={s(381.6)} b={s(385.2)} text={word('overlays.039')} x={330} y={560} width={500} size={40} />,
  <Reveal key="n2b" a={s(382.2)} b={s(385.2)} text={word('overlays.040')} x={330} y={620} width={700} size={52} />,
  <Tile key="fe2" a={s(385.8)} b={9333} x={1635} y={280} size={124} label={word('overlays.041')} labelSize={22} labelGap={2}><Logbook size={72} /></Tile>,
  <Tile key="fc2" a={s(387.4)} b={9333} x={1635} y={590} size={124} label={word('overlays.042')} labelSize={22} labelGap={2}><Pack size={72} /></Tile>,
  <Scrim key="scTu" a={s(408.0)} b={s(412.9)} dir="right" size={0.5} alpha={0.45} />,
  <Reveal key="tu" a={s(408.1)} b={s(412.9)} text={word('overlays.043')} x={1495} y={280} width={600} align="left" size={40} weight={800} />,
  ...bulletList(s(409.0), s(412.9), 1495, 340, [word('overlays.044'), word('overlays.045'), word('overlays.046')], 62, 42),
  ...Bottom(s(413.0), s(414.7), word('overlays.047'), 960, 915, 58),

  // Part 2
  <Scrim key="scDir" a={s(432.0)} b={10440} dir="right" size={0.65} alpha={0.75} />,
  <Reveal key="dir" a={s(432.1)} b={10440} text={word('overlays.048')} x={1185} y={455} width={700} align="left" size={50} />,
  <Reveal key="own" a={s(434.0)} b={10440} text={word('overlays.049')} x={1185} y={525} width={700} align="left" size={50} />,
  <Scrim key="scAg" a={s(440.0)} b={10632} dir="right" size={0.7} alpha={0.85} />,
  <Reveal key="rc" a={s(441.2)} b={10632} text={word('overlays.050')} x={1490} y={330} width={500} size={50} align="left" />,
  <GlassBar key="agt" a={s(440.2)} b={10632} x={1610} y={490} width={260} height={86} text={word('overlays.051')} size={44} />,
  <Scrim key="scFolder" a={s(472.0)} b={s(479.0)} dir="right" size={0.3} alpha={0.1} />,
            <Reveal key="long" a={12553} b={s(525.1)} text={word('overlays.052')} x={460} y={420} size={60} />,
  <Reveal key="short" a={12582} b={s(527.0)} text={word('overlays.053')} x={1413} y={420} size={60} />,
  <Reveal key="bull" a={12613} b={s(529.0)} text={word('overlays.054')} x={480} y={420} size={60} />,
  <Reveal key="open" a={12663} b={s(531.0)} text={word('overlays.055')} x={1413} y={420} size={60} />,
  <Reveal key="del" a={12727} b={s(533.8)} text={word('overlays.056')} x={480} y={420} size={60} />,
  ...Bottom(s(533.9), s(535.9), word('overlays.057'), 960, 905, 60),
  ...Bottom(s(539.6), s(541.0), word('overlays.058'), 960, 905, 60),
  <Tile key="ppt" bare a={s(546.5)} b={s(550.0)} x={1400} y={420} size={150}><FileTile size={150} color={THEME.send} label={word('overlays.059')} /></Tile>,
  <Tile key="doc" bare a={s(547.2)} b={s(550.0)} x={1590} y={420} size={150}><FileTile size={150} color={THEME.nightMid} label={word('overlays.060')} /></Tile>,
  <Tile key="xls" bare a={s(547.9)} b={s(550.0)} x={1400} y={620} size={150}><FileTile size={150} color={THEME.moss} label={word('overlays.061')} /></Tile>,
  <Tile key="pdf" bare a={s(548.5)} b={s(550.0)} x={1590} y={620} size={150}><FileTile size={150} color={THEME.rust} label={word('overlays.062')} /></Tile>,
  ...Bottom(s(588.0), s(590.9), word('overlays.063'), 960, 905, 60),

  // Part 3
  <Reveal key="loan" a={s(633.0)} b={s(634.9)} text={word('overlays.064')} x={960} y={520} size={62} />,
  <Reveal key="car" a={s(634.95)} b={s(635.95)} text={word('overlays.065')} x={960} y={520} size={62} />,
  <Reveal key="med" a={s(636.0)} b={s(636.95)} text={word('overlays.066')} x={960} y={520} size={62} />,
  <Reveal key="ins" a={s(637.0)} b={s(637.9)} text={word('overlays.067')} x={960} y={520} size={62} />,
  <Scrim key="scCla" a={s(650.0)} b={s(653.9)} dir="bottom" />,
  <GlassBar key="cla" a={s(650.2)} b={s(653.8)} x={959} y={898} width={540} height={165} text={word('overlays.068')} size={70} />,
  ...Bottom(s(654.0), s(656.9), word('overlays.069'), 960, 905, 60),
  ...Bottom(15817, 15851, word('overlays.070'), 960, 905, 60),
  <Tile key="tel" a={s(662.1)} b={s(664.9)} x={345} y={570} size={150} label={word('overlays.071')} labelSize={40} fill="rgba(29,74,70,.65)" labelGap={6}><Logbook size={88} /></Tile>,
  <Tile key="mic" a={s(663.3)} b={s(664.9)} x={1590} y={570} size={150} label={word('overlays.072')} labelSize={40} fill="rgba(29,74,70,.65)" labelGap={6}><MapIcon size={88} /></Tile>,
  <Scrim key="scDig" a={s(683.0)} b={s(687.9)} dir="right" size={0.45} alpha={0.75} />,
  ...bulletList(s(683.1), s(687.9), 1410, 420, [word('overlays.073'), word('overlays.074'), word('overlays.075')], 90, 44),
  <Scrim key="scMic" a={16502} b={16531} dir="right" size={0.6} alpha={0.8} />,
  <Tile key="mic2" a={16502} b={16531} x={1610} y={480} size={150} label={word('overlays.076')} labelSize={40} labelGap={6} fill="rgba(29,74,70,.8)"><Bell size={88} /></Tile>,
  <Scrim key="scDocs" a={s(723.0)} b={s(731.9)} dir="bottom" size={0.5} />,
  <SourceRow key="srcrow" />,
  <Scrim key="scTel" a={s(764.0)} b={s(765.9)} dir="right" size={0.6} alpha={0.8} />,
  <Tile key="tel2" a={s(764.1)} b={s(765.9)} x={1537} y={484} size={285} label={word('overlays.077')} labelSize={72} labelGap={10} fill="rgba(29,74,70,.8)"><RopeKnot size={170} /></Tile>,
  ...Bottom(s(766.0), s(770.0), word('overlays.078'), 960, 905, 56),
  <Reveal key="bc" a={s(768.0)} b={s(770.0)} text={word('overlays.079')} x={960} y={970} size={56} />,
  <Tile key="o1" a={s(772.0)} b={s(778.9)} x={307} y={475} size={165}><AgentMark size={100} /></Tile>,
  <Tile key="o2" bare a={s(772.0)} b={s(778.9)} x={307} y={657} size={100}><Doc size={95} /></Tile>,
  <Tile key="o3" a={s(774.0)} b={s(778.9)} x={1542} y={358} size={165}><MapIcon size={100} /></Tile>,
  <Tile key="o4" a={s(775.5)} b={s(778.9)} x={1542} y={700} size={165}><Logbook size={100} /></Tile>,
  ...Bottom(s(778.0), s(779.0), word('overlays.080'), 960, 905, 56),
  <Scrim key="scAdv" a={s(780.0)} b={s(785.9)} dir="right" size={0.65} alpha={0.7} />,
  <GlassBar key="adv" a={s(780.1)} b={s(785.9)} x={1387} y={389} width={605} height={155} text={word('overlays.081')} size={66} />,
  <Tile key="an1" bare a={s(784.2)} b={s(785.9)} x={1180} y={605} size={150}><AgentMark size={150} /></Tile>,
  <Tile key="an2" bare a={s(784.5)} b={s(785.9)} x={1378} y={605} size={150}><Cairn size={140} /></Tile>,
  <Tile key="an3" bare a={s(784.8)} b={s(785.9)} x={1576} y={605} size={150}><RopeKnot size={140} /></Tile>,
  ...Bottom(s(803.2), s(804.0), word('overlays.082'), 960, 905, 52),
  ...Bottom(s(812.0), s(814.9), word('overlays.083'), 960, 905, 62),
  <Scrim key="scMind" a={s(868.0)} b={s(875.2)} dir="right" size={0.5} alpha={0.82} />,
  <Reveal key="mind" a={s(868.2)} b={s(875.2)} text={word('overlays.084')} x={1149} y={395} width={720} align="left" size={62} />,
  ...bulletList(20840, s(875.2), 1130, 512, [word('overlays.085'), word('overlays.086')], 80, 62),

  // Ending
  <Scrim key="scPie" a={27617} b={27794} dir="right" size={0.55} alpha={0.9} />,
  <Pie key="pieUS" a={27625} b={27794} x={1482} y={484} value={(f) => 0.6 * ramp(f, 27640, 27700)} r={135} />,
  <Reveal key="us" a={27650} b={27794} text={word('overlays.087')} x={1482} y={660} width={800} size={58} />,
  <Scrim key="scPie2" a={27794} b={27879} dir="right" size={0.62} alpha={0.95} />,
  <Reveal key="z1" a={27794} b={27879} text={word('overlays.088')} x={1482} y={268} width={500} size={58} />,
  <Pie key="pieZ" a={27794} b={27879} x={1482} y={484} value={(f) => 0.4 * ramp(f, 27800, 27840)} r={135} color={THEME.accent} />,
  <Numeric key="zv" />,
];

function AgentPair() {
  const f = React.useContext(frameContext);
  const a = 2400;
  const b = s(105.0);
  const x = track(f, [[2425, 959], [2448, 596]], easeInOut);
  const inner = (label: string, icon: React.ReactNode) => <div style={{textAlign: 'center', color: '#fff', fontFamily: THEME.sans, fontWeight: 700, fontSize: 36, lineHeight: 1.04}}>{icon}<div>{label}</div></div>;
  return <>
    {f >= 2440 && f <= b && <div style={{position: 'absolute', left: 716, top: 829, width: 480, borderTop: '4px dashed rgba(255,255,255,.85)'}} />}
    <Tile a={a} b={b} x={x} y={829} size={246} fill="rgba(29,74,70,.75)">{inner(word('overlays.089'), <Logbook size={104} />)}</Tile>
    <Tile a={2436} b={b} x={1318} y={829} size={246} fill="rgba(29,74,70,.75)">{inner(word('overlays.090'), <AgentMark size={110} />)}</Tile>
  </>;
}

function SourceRow() {
  const f = React.useContext(frameContext);
  const b = s(731.9);
  const items: Array<[number, number, string, React.ReactNode]> = [
    [453, s(723.0), word('overlays.091'), <Doc size={100} />],
    [795, s(725.0), word('overlays.092'), <Search size={100} />],
    [1123, s(726.4), word('overlays.093'), <Logbook size={100} />],
    [1465, s(729.0), word('overlays.094'), <Folder size={100} />],
  ];
  if (f < items[0][1] || f > b + 8) return null;
  const o = 1 - ramp(f, b, b + 8);
  return <div style={{position: 'absolute', inset: 0, opacity: o}}>
    <svg width={1920} height={1080} style={{position: 'absolute'}}>
      {items.slice(0, -1).map(([x, at], i) => {
        const next = items[i + 1];
        const t = ramp(f, next[1] - 16, next[1]);
        const end = x + (next[0] - x) * t;
        return t > 0 && <path key={i} d={`M ${x + 30} 790 Q ${(x + end) / 2} ${670} ${end - 20} 790`} fill="none" stroke="#f2a541" strokeWidth={4} />;
      })}
    </svg>
    {items.map(([x, at, label, icon]) => (
      <Tile key={label} bare a={at} b={b + 8} x={x} y={826} size={100} label={label} labelSize={50} labelGap={4}>{icon}</Tile>
    ))}
  </div>;
}

function EmailStat() {
  return <>
    <Tile a={s(68.2)} b={1701} x={1525} y={402} size={120} fill="transparent" fade={1}><Cairn size={110} /></Tile>
    <Reveal a={s(69.0)} b={1701} text={word('overlays.095')} x={1525} y={490} width={500} size={66} fadeOut={1} />
  </>;
}

function EveryStat() {
  return <>
    <Tile a={s(72.0)} b={1838} x={384} y={280} size={130} fill="transparent" fade={1}><MapIcon size={110} /></Tile>
    <Reveal a={s(72.6)} b={1838} text={word('overlays.096')} x={384} y={380} width={500} size={62} fadeOut={1} />
  </>;
}

function Numeric() {
  const value = (f: number) => Math.round(40 * ramp(f, 27800, 27840));
  return <NumericRender value={value} />;
}
const NumericRender: React.FC<{value: (f: number) => number}> = ({value}) => {
  const f = React.useContext(frameContext);
  return <div style={{position: 'absolute', left: 1232, top: 650, width: 500, textAlign: 'center', fontFamily: THEME.sans, fontWeight: 700, fontSize: 88, color: '#fff', opacity: f >= 27794 && f <= 27879 ? 1 : 0}}>{value(f)}%</div>;
};
import {SrcFrameContext as frameContext} from '../lib/anim';
