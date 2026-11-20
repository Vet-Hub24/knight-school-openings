export const grades = {
  brilliant: {symbol:'!!', label:'Brilliant'},
  best: {symbol:'★', label:'Best'},
  excellent: {symbol:'!', label:'Excellent'},
  good: {symbol:'✓', label:'Good'},
  inaccuracy: {symbol:'?!', label:'Inaccuracy'},
  miss: {symbol:'?', label:'Missed chance'},
  mistake: {symbol:'?', label:'Mistake'},
  blunder: {symbol:'×', label:'Blunder'},
};

export function gradeMove({before, after, top, color, matingSacrifice = false}) {
  const sign = color === 'w' ? 1 : -1;
  if (top) return matingSacrifice ? 'brilliant' : 'best';
  if (!before || !after) return null;
  const beforeMate = before.mateWhite * sign;
  const afterMate = after.mateWhite * sign;
  if (afterMate < 0 && !(beforeMate < 0)) return 'blunder';
  if (beforeMate > 0 && !(afterMate > 0)) return 'miss';
  if (!Number.isFinite(before.scoreWhite) || !Number.isFinite(after.scoreWhite)) return null;
  const loss = (before.scoreWhite - after.scoreWhite) * sign;
  if (loss >= 2) return 'blunder';
  if (loss >= 1) return 'mistake';
  if (loss >= .4) return 'inaccuracy';
  if (loss >= .2) return 'good';
  return 'excellent';
}
