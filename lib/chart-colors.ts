import { ZAKAT_CATEGORY_NAME } from "@/lib/constants";

/** Accessible categorical palette (brand-adjacent, distinct hues). */
const PALETTE = [
  "#07835A", // brand jade
  "#2E90FA", // info blue
  "#F79009", // warning amber
  "#7A5AF8", // violet
  "#EE46BC", // pink
  "#0E9F6E", // green
  "#667085", // gray
  "#F63D68", // rose
  "#15B79E", // teal
  "#4E5BA6", // indigo
];

/** Map category names to stable colors. Zakat → gold, debt → red. */
export function generateCategoryColors(names: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  let i = 0;
  for (const name of names) {
    if (name === ZAKAT_CATEGORY_NAME) {
      map[name] = "#D6900F"; // Barakah gold
    } else if (/hutang|cicilan/i.test(name)) {
      map[name] = "#F04438"; // error red
    } else {
      map[name] = PALETTE[i % PALETTE.length];
      i++;
    }
  }
  return map;
}
