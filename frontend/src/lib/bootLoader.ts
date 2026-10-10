import { useEffect } from "react";

// Fades out the #boot-loader overlay from index.html. Called from an effect,
// i.e. after React has committed the first screen, so the overlay never
// uncovers an empty #root.
export function hideBootLoader(doc: Document = document) {
  const el = doc.getElementById("boot-loader");
  if (!el) return;
  el.classList.add("boot-loader--done");
  setTimeout(() => el.remove(), 300);
}

export function useHideBootLoader() {
  useEffect(() => {
    // Wait one frame so the first screen is painted under the overlay.
    const id = requestAnimationFrame(() => hideBootLoader());
    return () => cancelAnimationFrame(id);
  }, []);
}
