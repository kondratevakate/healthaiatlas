import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// tailwind-merge resolves conflicting Tailwind classes (last one wins). It must
// know the project's own utilities from index.css, otherwise it guesses: it
// read `text-body` as a text *colour*, so cn("text-body", "text-muted-foreground")
// silently dropped the font size. Register every custom `text-*` size here.
export const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["body", "body-sm", "small"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
