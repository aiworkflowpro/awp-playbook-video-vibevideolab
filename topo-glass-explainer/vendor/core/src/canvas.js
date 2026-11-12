import { useVideoConfig } from "remotion";
const useCanvas = () => {
  const { width, height } = useVideoConfig();
  return { cw: width, ch: height };
};
export {
  useCanvas
};
