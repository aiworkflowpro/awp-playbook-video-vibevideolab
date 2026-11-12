import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {FPS, HEIGHT, TOTAL_FRAMES, WIDTH} from './clock';
import {Film} from './Film';

declare const require: {context: (dir: string, deep: boolean, re: RegExp) => {keys: () => string[]; (key: string): Record<string, React.FC>}};
// Internal comparison (src/internal/, not shipped in forks): context on src/ so the bundle still resolves when the folder is absent.
const INTERNAL = require.context('.', true, /^\.\/internal\/[^/]+\.tsx$/);
const Compare = INTERNAL.keys().length ? INTERNAL(INTERNAL.keys()[0]).FilmCompare : null;

const Root: React.FC = () => (
  <>
    <Composition id="Film" component={Film} width={WIDTH} height={HEIGHT} fps={FPS} durationInFrames={TOTAL_FRAMES} />
    {Compare ? <Composition id="FilmCompare" component={Compare} width={WIDTH * 2} height={HEIGHT} fps={FPS} durationInFrames={TOTAL_FRAMES} /> : null}
  </>
);
registerRoot(Root);
