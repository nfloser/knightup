import { useEffect, useState } from "react";
export function useTrainingViewport() {
  const [height, setHeight] = useState(
    () => window.visualViewport?.height ?? window.innerHeight,
  );
  useEffect(() => {
    const resize = () => {
      const h = window.visualViewport?.height ?? window.innerHeight;
      setHeight(h);
      document.documentElement.style.setProperty("--training-height", `${h}px`);
    };
    resize();
    window.addEventListener("resize", resize);
    window.visualViewport?.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      window.visualViewport?.removeEventListener("resize", resize);
      document.documentElement.style.removeProperty("--training-height");
    };
  }, []);
  return height;
}
