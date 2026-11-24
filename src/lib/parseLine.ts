/**
 * Parses one line of a pasted shopping list into a quantity and a search text.
 * Accepts "2 x milk", "2 milk", "milk x2", "milk 2". A trailing size such as
 * "milk 2L" is not treated as a quantity.
 */
export function parseLine(line: string): { qty: number; text: string } | null {
  const s = line.trim().replace(/\s+/g, " ");
  if (!s) return null;
  let m = s.match(/^(\d{1,2})\s*[x×]?\s+(.+)$/i);
  if (m) return { qty: Number(m[1]), text: m[2] };
  m = s.match(/^(.+?)\s*[x×]\s*(\d{1,2})$/i);
  if (m) return { qty: Number(m[2]), text: m[1] };
  m = s.match(/^(.+?)\s+(\d{1,2})$/);
  if (m) return { qty: Number(m[2]), text: m[1] };
  return { qty: 1, text: s };
}
