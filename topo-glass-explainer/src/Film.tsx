import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {filmFrame, SEGMENTS} from './clock';
import {PLAN, word} from './plan';
import {AROLL, layoutFrame, sceneAt} from './scenes';
import {Stage} from './parts/Stage';
import {STAGE_DEFAULT, STAGE_SHOTS} from './data/stage';
import {SrcFrameContext} from './lib/anim';
import {fontFaces} from './theme';
import {OVERLAYS} from './data/overlays';
import {SCENES} from './scenes/table';
import {ChapterPill} from './parts/Text';
import {Scrim} from './parts/Text';

const isAroll = (f: number) => AROLL.some((s) => f >= s.a && f < s.b);
const OVERLAY_LIST = OVERLAYS as React.ReactElement[];
const SCRIMS = OVERLAY_LIST.filter((e) => e.type === Scrim);
const TOPS = OVERLAY_LIST.filter((e) => e.type !== Scrim);

// The cut-out person sits over the scrims. Clips are stitched at prep time; each span plays from its own offset.
const PersonOver: React.FC<{f: number}> = ({f}) => {
  const span = PLAN.presenter.person_spans.find(([a, b]) => f >= a && f < b);
  if (!span || !PLAN.presenter.person) return null;
  return (
    <Sequence from={filmFrame(span[0])} durationInFrames={span[1] - span[0]} layout="none">
      <AbsoluteFill><OffthreadVideo muted transparent src={staticFile(PLAN.presenter.person)} startFrom={span[2]} style={{width: '100%', height: '100%'}} /></AbsoluteFill>
    </Sequence>
  );
};

// Chapter pill from the plan's chapter layer: the chapter holding the current scene shows anchor chapter.<id> (none or empty: no pill).
const ANCHOR_IDS = new Set(PLAN.anchors.map((x) => x.id));
const CHAPTER_OF = new Map((PLAN.chapters ?? []).flatMap((c) => c.scenes.map((id) => [id, c.id] as const)));
const chapter = (sceneId: string | undefined): string | null => {
  const id = sceneId ? CHAPTER_OF.get(sceneId) : undefined;
  return id && ANCHOR_IDS.has(`chapter.${id}`) ? word(`chapter.${id}`) || null : null;
};

const FilmBody: React.FC = () => {
  const film = useCurrentFrame();
  const f = layoutFrame(film);
  const scene = sceneAt(film);
  const label = chapter(scene?.id);
  const place = scene ? STAGE_SHOTS[scene.id] : undefined;
  const shift = place?.dx || place?.dy ? {transform: `translate(${place.dx ?? 0}px, ${place.dy ?? 0}px)`} : undefined;
  return (
    <SrcFrameContext.Provider value={f}>
      <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
        <style>{fontFaces}</style>
        {SEGMENTS.map(([a, b]) => (
          <Sequence key={a} from={filmFrame(a)} durationInFrames={b - a} layout="none">
            {isAroll(f) && (
              <AbsoluteFill>
                {PLAN.presenter.take ? <OffthreadVideo muted src={staticFile(PLAN.presenter.take)} startFrom={a} style={{width: '100%', height: '100%'}} /> : <AbsoluteFill style={{background: 'linear-gradient(160deg,#1d4a46,#0f2a2c)'}} />}
              </AbsoluteFill>
            )}
          </Sequence>
        ))}
        {!PLAN.presenter.take && isAroll(f) && <Stage emblem={place?.emblem === undefined ? STAGE_DEFAULT : place.emblem} />}
        {SCENES.map((scene, i) => (f >= scene.a && f < scene.b ? <React.Fragment key={i}>{scene.node}</React.Fragment> : null))}
        {SCRIMS}
        <PersonOver f={f} />
        {label && isAroll(f) && <ChapterPill label={label} />}
        {shift ? <AbsoluteFill style={shift}>{TOPS}</AbsoluteFill> : TOPS}
      </AbsoluteFill>
    </SrcFrameContext.Provider>
  );
};

// Music bed at one fixed level: a per-frame volume makes the renderer build one huge audio filter and stall on long films,
// so the ducking under speech is baked into the bed file (scripts/pack/duck_bed.sh); replace the bed, re-run it.
const BED_VOLUME = 1;

export const Film: React.FC<{audio?: boolean}> = ({audio = true}) => (
  <AbsoluteFill>
    {audio && PLAN.audio.narration && <Audio src={staticFile(PLAN.audio.narration)} />}
    {audio && PLAN.audio.bgm && <Audio src={staticFile(PLAN.audio.bgm)} volume={BED_VOLUME} />}
    <FilmBody />
  </AbsoluteFill>
);
