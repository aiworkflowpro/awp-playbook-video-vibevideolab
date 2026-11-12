import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, useCurrentFrame} from 'remotion';
import {asset} from '../plan';
import {FPS} from '../clock';
import {THEME} from '../theme';
import {spanAt} from './index';

// A footage slot over the layout window [a, b). The clip plays at its own speed from the start of each plan scene it
// covers, entering at that scene's offset into the window, so it stays continuous across a run of scenes in any order.
// An empty slot draws a dark placeholder with the slot name.
export const Footage: React.FC<{src: string; a: number; b: number; from?: number; gray?: boolean; scale?: number; origin?: string}> = ({src, a, from = 0, gray, scale = 1, origin}) => {
  const film = useCurrentFrame();
  const file = asset('footage', src);
  const span = spanAt(film);
  if (!file) {
    return (
      <AbsoluteFill style={{background: `linear-gradient(160deg, ${THEME.nightMid}, ${THEME.nightDeep})`}}>
        <div style={{position: 'absolute', left: 40, bottom: 34, fontFamily: 'monospace', fontSize: 22, color: 'rgba(255,255,255,.35)'}}>footage.{src}</div>
      </AbsoluteFill>
    );
  }
  const enter = Math.round(from * FPS) + Math.max(0, span.first - a);
  // A clip that starts inside the scene's window starts at the matching film frame.
  const start = span.from + Math.round((Math.max(0, a - span.first) * (span.to - span.from)) / Math.max(1, span.last - span.first));
  return (
    <Sequence from={start} durationInFrames={Math.max(1, span.to - start)} layout="none">
      <AbsoluteFill style={{overflow: 'hidden'}}>
        <OffthreadVideo muted src={file} startFrom={enter} style={{width: '100%', height: '100%', objectFit: 'cover', filter: gray ? 'grayscale(1) contrast(1.15)' : undefined, transform: `scale(${scale})`, transformOrigin: origin}} />
      </AbsoluteFill>
    </Sequence>
  );
};
