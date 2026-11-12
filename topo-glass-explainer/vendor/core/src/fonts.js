import { continueRender, delayRender, staticFile } from "remotion";
const FACES = [
  ["Lib Sans SC", "fonts/NotoSansSC-VF.woff2", "100 900"],
  ["Inter Tight", "fonts/InterTight-VF-latin.woff2", "100 900"],
  ["IBM Plex Mono", "fonts/IBMPlexMono-400-latin.woff2", "400"],
  ["IBM Plex Mono", "fonts/IBMPlexMono-500-latin.woff2", "500"],
  ["IBM Plex Mono", "fonts/IBMPlexMono-600-latin.woff2", "600"]
];
let loaded = false;
const ensureFonts = () => {
  if (loaded || typeof document === "undefined") return;
  loaded = true;
  const handle = delayRender("fonts");
  Promise.all(FACES.map(([family, file, weight]) => new FontFace(family, `url(${staticFile(file)}) format('woff2')`, { weight }).load())).then((fs) => {
    fs.forEach((f) => document.fonts.add(f));
    return document.fonts.ready;
  }).then(() => continueRender(handle)).catch((e) => {
    console.error(e);
    continueRender(handle);
  });
};
export {
  ensureFonts
};
