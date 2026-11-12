import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';
// Topo Glass palette and type: pine night, glacier, amber. One place for every colour and face.
export const THEME = {
  sans: 'Space Grotesk',
  serif: 'Fraunces',
  ui: 'IBM Plex Sans',
  white: '#ffffff',
  // night map
  night: '#0f2a2c',
  nightMid: '#1d4a46',
  nightDeep: '#08171b',
  glacier: '#a9d6e5',
  ink: '#10201f',
  // marks and states
  accent: '#f2a541',
  signal: '#e8f0c2',
  moss: '#3f7f78',
  rust: '#c8553d',
  // console
  paper: '#eef2f1',
  paperDark: '#e1e8e6',
  uiInk: '#16302e',
  uiMuted: '#56706d',
  uiLine: '#cfdcd9',
  send: '#d98a1e',
  // frosted glass over the night map
  glassFill: 'rgba(169,214,229,.14)',
  glassLine: 'rgba(233,245,247,.28)',
};
const FACES: Array<[family: string, file: string, weight: string, stretch?: string]> = [
  ['Space Grotesk', 'fonts/SpaceGrotesk-var.ttf', '300 700'],
  ['Fraunces', 'fonts/Fraunces-var.ttf', '100 900'],
  ['IBM Plex Sans', 'fonts/IBMPlexSans-var.ttf', '100 700', '85% 100%'],
];
// Each face is loaded before the first frame is captured, so stills never fall back to a system font.
if (typeof document !== 'undefined' && typeof FontFace !== 'undefined') {
  for (const [family, file, weight, stretch] of FACES) {
    const handle = delayRender(`font ${family}`);
    new FontFace(family, `url('${staticFile(file)}') format('truetype')`, {weight, ...(stretch ? {stretch} : {})})
      .load()
      .then((face) => {
        document.fonts.add(face);
        continueRender(handle);
      })
      .catch((err: unknown) => cancelRender(err));
  }
}
export const fontFaces = FACES.map(([family, file, weight, stretch]) => `@font-face{font-family:'${family}';src:url('${staticFile(file)}') format('truetype');font-weight:${weight};${stretch ? `font-stretch:${stretch};` : ''}}`).join('\n');
