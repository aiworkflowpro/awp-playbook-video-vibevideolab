import {word} from '../plan';
import {Footage} from './Footage';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {DarkPrompt, DeckView, DotMap, FolderWindow, GrowthCard, ModeToggle, NewsLine, PhoneChat, ReportSpread} from '../parts/Cards';
import {FanOut, GradBg, HOMES, HomeShot, Halftone, PAGES, PageShot, PartsCard, PillarLabels, Pillars, PromptTree, ReactLoop, Scatter, Stopwatch, TwoScopes} from './Backdrops';

// Non-presenter shots by layout frame. a-roll comes from the stage or presenter layer in Film.tsx.
export type Scene = {a: number; b: number; node: React.ReactNode};
const clip = (a: number, b: number, src: string, from = 0, gray = false): Scene => ({a, b, node: <Footage key={a} a={a} b={b} src={src} from={from} gray={gray} />});

const PROMPT_ITEMS = (start: number) => [
  {label: word('table.001'), at: start + 20, y: 270},
  {label: word('table.002'), at: start + 44, y: 405},
  {label: word('table.003'), at: start + 72, y: 540},
  {label: word('table.004'), at: start + 104, y: 675},
  {label: word('table.005'), at: start + 136, y: 810},
];

export const SCENES: Scene[] = [
  {a: 59, b: 119, node: <Stopwatch />},
  {a: 215, b: 254, node: <Halftone a={216} items={[word('table.006'), word('table.007'), word('table.008')]} />},
  clip(334, 366, 'clip09'), clip(366, 398, 'clip10'), clip(398, 418, 'clip11'), clip(418, 446, 'clip12'), clip(446, 490, 'clip13'), clip(490, 514, 'clip14'), clip(514, 537, 'clip15'), clip(537, 562, 'clip16'),
  {a: 931, b: 1039, node: <Pillars a={931} b={1039} mode="rise" />},
  {a: 1039, b: 1156, node: <Pillars a={1039} b={1156} mode="pan" title={false} pan0={0.1} pan1={1} labelsFrom={[1079, 1103, 1127, 1151]} />},
  {a: 1309, b: 1361, node: <Pillars a={1309} b={1361} mode="rise" />},
  {a: 1485, b: 1511, node: <ReportSpread a={1485} b={1511} variant={0} />},
  {a: 1511, b: 1523, node: <ReportSpread a={1511} b={1523} variant={1} />},
  {a: 1523, b: 1535, node: <ReportSpread a={1523} b={1535} variant={2} />},
  {a: 1535, b: 1548, node: <ReportSpread a={1535} b={1548} variant={3} />},
  clip(1596, 1653, 'clip38', 1), clip(1653, 1701, 'clip38', 3), clip(1701, 1839, 'clip42'),
  clip(1930, 1971, 'clip44'), clip(1971, 2016, 'clip45'),
  {a: 2521, b: 2689, node: <ModeToggle a={2521} b={2689} />},
  {a: 4869, b: 5040, node: <AbsoluteFill><GradBg /><PromptTree a={4869} b={5040} root={word('table.030')} rootX={620} leafGap={600} leafSize={64} items={PROMPT_ITEMS(4869)} /></AbsoluteFill>},
  {a: 5437, b: 5604, node: <PartsCard a={5437} b={5604} />},
  {a: 5696, b: 5936, node: <AbsoluteFill><GradBg /><ReactLoop a={5696} b={5936} acts={5720} output={5770} back={5800} title={5876} pulseFrom={5888} /></AbsoluteFill>},
  {a: 10011, b: 10064, node: <Pillars a={10011} b={10064} mode="pan" title={false} pan0={0.32} pan1={0.4} labelsFrom={[10000, 10000]} />},
  {a: 10712, b: 11051, node: <AbsoluteFill><GradBg /><PromptTree a={10712} b={11051} root={word('table.031')} rootX={422} rootY={397} leafGap={534} leafSize={78} subSize={72} rootScale={1.2} subX={240} items={[
    {label: word('table.009'), at: 10720, y: 121, dimFrom: 10870},
    {label: word('table.010'), at: 10740, y: 263, dimFrom: 10870},
    {label: word('table.011'), at: 10760, y: 397, dimFrom: 10870},
    {label: word('table.012'), at: 10782, y: 540},
    {label: word('table.013'), at: 10800, y: 678, dimFrom: 10870},
  ]} shiftAt={10915} shiftX={-340} sub={[{label: word('table.014'), at: 10955, y: 337}, {label: word('table.015'), at: 10985, y: 470}, {label: word('table.016'), at: 11005, y: 600}, {label: word('table.017'), at: 11025, y: 735}]} /></AbsoluteFill>},
  {a: 12269, b: 12295, node: <DeckView a={12269} page="cover" />},
  {a: 12295, b: 12331, node: <DeckView a={12295} page="stat" />},
  {a: 12331, b: 12367, node: <DeckView a={12331} page="blur" />},
  {a: 13580, b: 13752, node: <GrowthCard a={13580} />},
  {a: 13815, b: 13872, node: <DotMap a={13815} />},
  clip(14142, 14223, 'clip168'), clip(14223, 14326, 'clip170'), clip(14721, 14761, 'clip173'), clip(14761, 14862, 'clip174'),
  {a: 15036, b: 15086, node: <Pillars a={15036} b={15086} mode="pan" title={false} pan0={0.6} pan1={0.72} labelsFrom={[15000, 15000, 15060]} />},
  clip(15157, 15193, 'clip180'), clip(15193, 15219, 'clip181'), clip(15219, 15252, 'clip182'), clip(15252, 15284, 'clip183'),
  clip(15408, 15487, 'clip185'), clip(15487, 15556, 'clip186'),
  {a: 15977, b: 16115, node: <Scatter a={15977} />},
  clip(16225, 16344, 'clip196'),
  {a: 17963, b: 18085, node: <FanOut a={17963} />},
  {a: 18926, b: 19022, node: <TwoScopes a={18926} second={18985} />},
  clip(19364, 19519, 'clip227'),
  {a: 27313, b: 27377, node: <><Pillars a={27313} b={27377} mode="row" title={false} /><PillarLabels size={58} h={84} items={[[word('table.018'), 27313, 362, 445], [word('table.019'), 27313, 769, 445], [word('table.020'), 27313, 1153, 445], [word('table.021'), 27313, 1555, 445]]} /></>},
  {a: 25340, b: 25736, node: <PhoneChat a={25340} b={25736} />},
  {a: 27431, b: 27452, node: <DarkPrompt a={27431} b={27452} title={word('table.022')} hint={word('table.023')} rotate={-4} />},
  {a: 27452, b: 27502, node: <DarkPrompt a={27452} b={27502} title={word('table.024')} hint={word('table.025')} rotate={7} />},
  {a: 27928, b: 27953, node: <NewsLine a={27928} b={27953} lines={[[word('table.026'), false], [word('table.027'), true]]} />},
  {a: 27953, b: 27969, node: <NewsLine a={27953} b={27969} serif lines={[[word('table.028'), true], [word('table.029'), false]]} />},
  clip(27502, 27512, 'clip315'), clip(27512, 27566, 'clip316'), clip(27566, 27600, 'clip317'),
  clip(27879, 27904, 'clip321'), clip(27904, 27928, 'clip322'),
  clip(28445, 28523, 'clip326', 0, true), clip(28523, 28612, 'clip328', 0, true),
  clip(28674, 28708, 'clip330'), clip(28708, 28739, 'clip331'), clip(28739, 28772, 'clip332'), clip(28772, 28861, 'clip333'), clip(28861, 28896, 'clip334'),
];

for (const [id, home] of Object.entries(HOMES)) {
  SCENES.push({a: home.a, b: home.b, node: <HomeShot id={id} shot={home} />});
}
const OCR_SERIF = new Set(['82', '83', '97']);
const CUSTOM = new Set(['52', '162', '313', '314', '323', '324']);
for (const [id, page] of Object.entries(PAGES)) {
  if (CUSTOM.has(id)) continue;
  SCENES.push({a: page.a, b: page.b, node: <PageShot shot={page} serif={OCR_SERIF.has(id)} pill={OCR_SERIF.has(id)} />});
}
// The folder window rides on a presenter shot, so it goes in with the a-roll.
SCENES.push({a: 11317, b: 11485, node: <FolderWindow a={11317} b={11485} />});
