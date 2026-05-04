// Squarified treemap layout (Bruls / Huijing / van Wijk, 1999).
// Given a list of weighted items and a rectangle, lay them out so each cell's
// area is proportional to its weight and aspect ratios stay close to 1.

export interface TreemapInput {
  id: string;
  value: number;
}

export interface TreemapRect {
  id: string;
  value: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Box { x: number; y: number; w: number; h: number; }

export function squarifiedTreemap(
  items: TreemapInput[],
  width: number,
  height: number,
): TreemapRect[] {
  const positive = items.filter((i) => i.value > 0);
  if (positive.length === 0 || width <= 0 || height <= 0) return [];

  const total = positive.reduce((s, i) => s + i.value, 0);
  const area = width * height;
  // Scale weights so their sum equals the rectangle area.
  const scaled = positive
    .map((i) => ({ id: i.id, value: i.value, area: (i.value / total) * area }))
    .sort((a, b) => b.area - a.area);

  const result: TreemapRect[] = [];
  layout(scaled, [], shortestSide({ x: 0, y: 0, w: width, h: height }), { x: 0, y: 0, w: width, h: height }, result);
  return result;
}

function shortestSide(box: Box): number {
  return Math.min(box.w, box.h);
}

interface Item { id: string; value: number; area: number; }

function layout(
  remaining: Item[],
  row: Item[],
  w: number,
  box: Box,
  out: TreemapRect[],
): void {
  if (remaining.length === 0) {
    layoutRow(row, w, box, out);
    return;
  }
  const head = remaining[0];
  const next = [...row, head];
  if (row.length === 0 || worst(row, w) >= worst(next, w)) {
    layout(remaining.slice(1), next, w, box, out);
  } else {
    const newBox = layoutRow(row, w, box, out);
    layout(remaining, [], shortestSide(newBox), newBox, out);
  }
}

function worst(row: Item[], w: number): number {
  if (row.length === 0) return Infinity;
  const s = row.reduce((acc, r) => acc + r.area, 0);
  let rMax = -Infinity;
  let rMin = Infinity;
  for (const r of row) {
    if (r.area > rMax) rMax = r.area;
    if (r.area < rMin) rMin = r.area;
  }
  const w2 = w * w;
  const s2 = s * s;
  return Math.max((w2 * rMax) / s2, s2 / (w2 * rMin));
}

function layoutRow(row: Item[], w: number, box: Box, out: TreemapRect[]): Box {
  if (row.length === 0) return box;
  const sumArea = row.reduce((s, r) => s + r.area, 0);
  const rowThickness = sumArea / w;
  const horizontal = box.w >= box.h; // lay out along the longer axis

  let cursor = horizontal ? box.y : box.x;
  for (const r of row) {
    const sideAlong = r.area / rowThickness;
    if (horizontal) {
      out.push({ id: r.id, value: r.value, x: box.x, y: cursor, w: rowThickness, h: sideAlong });
      cursor += sideAlong;
    } else {
      out.push({ id: r.id, value: r.value, x: cursor, y: box.y, w: sideAlong, h: rowThickness });
      cursor += sideAlong;
    }
  }

  if (horizontal) {
    return { x: box.x + rowThickness, y: box.y, w: box.w - rowThickness, h: box.h };
  }
  return { x: box.x, y: box.y + rowThickness, w: box.w, h: box.h - rowThickness };
}
