import { grades } from './practice-grades.js';

const pieces = {p:'pawn',n:'knight',b:'bishop',r:'rook',q:'queen',k:'king'};

export function describeMove(move, record) {
  if (!record?.grade) return 'Stockfish did not return enough information to grade this move.';
  const {grade, before, after} = record;
  const sign = move.color === 'w' ? 1 : -1;
  const reasons = [];
  if (move.captured) reasons.push(`It captures a ${pieces[move.captured]} on ${move.to}.`);
  if (move.san.endsWith('#')) reasons.push('It delivers checkmate.');
  else if (move.san.endsWith('+')) reasons.push('It gives check, so the opponent must respond.');
  if (move.san.startsWith('O-O')) reasons.push('Castling moves the king and brings a rook into play.');
  if (grade === 'brilliant') reasons.push('Stockfish’s line gives up material to force mate.');
  else if (grade === 'best') reasons.push('This was Stockfish’s first choice.');
  else if (before?.mateWhite * sign > 0 && !(after?.mateWhite * sign > 0)) {
    reasons.push('The original search found a mating line that the search after this move did not find.');
  } else if (after?.mateWhite * sign < 0 && !(before?.mateWhite * sign < 0)) {
    reasons.push('The resulting position gives the opponent a mating line in this search.');
  } else if (Number.isFinite(before?.scoreWhite) && Number.isFinite(after?.scoreWhite)) {
    const loss = (before.scoreWhite - after.scoreWhite) * sign;
    reasons.push(loss > 0
      ? `Stockfish estimates a drop of ${loss.toFixed(2)} pawn units for your side.`
      : 'The two searches found no drop in the evaluation for your side.');
  }
  if (record.alternative) reasons.push(`Stockfish preferred ${record.alternative}.`);
  if (after?.san?.[0]) reasons.push(`Its suggested reply to your move was ${after.san[0]}.`);
  else if (before?.san?.[1] && !record.alternative) reasons.push(`Its sample reply was ${before.san[1]}.`);
  return reasons.join(' ');
}

export function gameReview(moves, records, human, openingLength, finished) {
  const own = moves.flatMap((move, index) => move.color === human
    ? [{move, ply:index + 1, record:records.get(index + 1)}] : []);
  const graded = own.filter(({record}) => record?.grade);
  const counts = Object.fromEntries(Object.keys(grades).map(id =>
    [id, graded.filter(({record}) => record.grade === id).length]));
  return `<section class="panel postgame" id="game-review" aria-label="Game review">
    <h2>${finished ? 'Postgame review' : 'Practice review'}</h2>
    <p>${own.length} moves you played · ${graded.length} graded · ${own.length - graded.length} ungraded</p>
    <div class="postgame-counts">${Object.entries(grades).map(([id, grade]) =>
      `<span class="grade-${id}">${grade.symbol} ${grade.label} <strong>${counts[id]}</strong></span>`).join('')}</div>
    <p class="tag">Short Stockfish searches give approximate grades for your practice moves. The opening you started from is available in Move history.</p>
    ${own.length ? `<ol class="postgame-moves">${own.map(({move, ply, record}) => {
      const grade = grades[record?.grade];
      const number = move.before.split(' ')[5];
      return `<li><button data-history-ply="${openingLength + ply}" data-review-jump>${number}${move.color==='w'?'.':'…'} ${move.san}</button>
        <div><strong class="${grade ? 'grade-' + record.grade : ''}">${grade ? grade.symbol + ' ' + grade.label : 'Ungraded'}</strong>
        <p>${describeMove(move, record)}</p>
        ${record?.alternative && record.before?.san?.length > 1
          ? `<p class="tag">Sample with ${record.alternative}: ${record.before.san.slice(0,5).join(' ')}</p>` : ''}</div></li>`;
    }).join('')}</ol>` : '<p>Play a move to see it here.</p>'}
  </section>`;
}
