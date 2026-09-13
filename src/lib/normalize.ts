export function stripAccents(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

export function normalizeSpeech(value: string) {
  return stripAccents(value)
    .toLowerCase()
    .replace(/[¿?¡!.,;:"""']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (let i = 0; i < rows; i += 1) matrix[i][0] = i;
  for (let j = 0; j < cols; j += 1) matrix[0][j] = j;
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  return matrix[a.length][b.length];
}

export function scoreUtterance(heard: string, sample: string, keys: string[]) {
  const h = normalizeSpeech(heard);
  const s = normalizeSpeech(sample);
  if (!h) return 0;
  if (h === s) return 1;
  const distance = levenshtein(h, s);
  const maxLen = Math.max(h.length, s.length, 1);
  const similarity = 1 - distance / maxLen;
  const hits = keys.filter((key) => h.includes(normalizeSpeech(key))).length;
  const coverage = keys.length ? hits / keys.length : 0;
  return Math.max(similarity, coverage * 0.85 + similarity * 0.15);
}

export function isGoodEnough(score: number) {
  return score >= 0.55;
}
