import { gameReview, describeMove } from './game-review.js';
import { gradeMove, grades } from './practice-grades.js';
import { Chess } from './vendor/chess.js';
import { searchPosition } from './engine.js';

const skillLevels = { gentle: 2, balanced: 8, strong: 18 };
const sideName = side => side === 'w' ? 'White' : 'Black';

export function createPractice({app, board, finish}) {
  let game, course, human, baseline;
  let fromStart = false, showOpening = false;
  let task, result, generation = 0;
  let busy = false, hint = false, selected = '', pendingPromotion = null;
  let message = '', best = '', difficulty = 'balanced';
  let turns = [];
  let reviewPly = null;
  const gradeByPly = new Map();
  let reviewOpen = false;
  let openingHistory = [];
  const pieceValue = {p:1,n:3,b:3,r:5,q:9,k:0};

  function cancel() {
    generation++;
    task?.terminate();
    task = null; result = null; busy = false;
  }
  function stop() {
    cancel();
    game = null;
  }
  function start(startPosition, lesson, history = [], options = {}) {
    stop();
    game = new Chess(startPosition.fen());
    course = lesson;
    fromStart = options.fromStart === true;
    openingHistory = history;
    human = lesson.side;
    baseline = game.fen();
    difficulty = 'balanced';
    reset();
  }
  function reset() {
    cancel();
    game = new Chess(baseline);
    hint = false; showOpening = false; selected = ''; pendingPromotion = null;
    message = ''; best = ''; turns = []; reviewPly = null; reviewOpen = false; gradeByPly.clear();
    startTurn();
  }
  function openingMove() {
    const history = game.history();
    if (!fromStart || !history.every((san, index) => san === course.moves[index])) return null;
    return game.moves({verbose:true}).find(move => move.san === course.moves[history.length]);
  }
  function render(focus) {
    const practiceMoves = game.history({verbose:true});
    const history = [...openingHistory, ...practiceMoves];
    const at = reviewPly ?? history.length;
    const reviewing = reviewPly !== null;
    const movesShown = history.slice(0, at);
    const lastHuman = movesShown.findLast(move => move.color === human);
    const lastEngine = movesShown.findLast(move => move.color !== human);
    const lastHumanIndex = lastHuman ? movesShown.lastIndexOf(lastHuman) + 1 : -1;
    const grade = gradeByPly.get(lastHumanIndex - openingHistory.length)?.grade;
    const view = reviewing ? new Chess(at ? history[at-1].after : history[0]?.before ?? baseline) : game;
    const scroll = app.querySelector('.practice-history')?.scrollTop;
    const yourTurn = game.turn() === human;
    const bookMove = !reviewing && yourTurn ? openingMove() : null;
    const suggested = !reviewing && yourTurn
      ? (showOpening ? bookMove : hint && result ? toMove(result.bestMove) : null)
      : null;
    const finished = game.isGameOver() && !busy;
    const inspected = reviewing && at > openingHistory.length ? history[at-1] : null;
    const reviewNote = inspected?.color === human
      ? describeMove(inspected, gradeByPly.get(at-openingHistory.length)) : '';
    const heading = game.isCheckmate() ? `Checkmate · ${sideName(game.turn() === 'w' ? 'b' : 'w')} wins`
      : game.isGameOver() ? 'Game drawn' : yourTurn ? `Your move · ${sideName(human)}` : 'Stockfish to move';
    app.innerHTML = `<div class="row toolbar"><button data-action="finish-practice">${fromStart ? 'All openings' : 'Back to lesson'}</button></div>
      <div class="study"><section class="board-column"><article class="lesson-current">
        <span class="eyebrow">${fromStart ? 'Play from start' : 'Play the middlegame'}</span><h2>${reviewing ? 'Reviewing move history' : heading}</h2>
        <p role="status">${reviewing ? (at ? `${sideName(history[at-1].color)} played ${history[at-1].san} · ${history[at-1].from} to ${history[at-1].to}` : 'Starting position') : message || (busy ? 'Stockfish is thinking…' : 'Play a move or ask for an arrow.')}</p>
        ${reviewNote ? `<p>${reviewNote}</p>` : ''}</article>
        ${board(view,human,true,{selected:reviewing?'':selected,suggested,marker:lastHuman && grade ? {square:lastHuman.to,grade} : null,lastHuman,lastEngine})}
        <div class="lesson-nav"><button data-action="undo-practice" ${turns.length&&!reviewing?'':'disabled'}>Undo my move</button>
          <button class="primary" data-action="practice-hint" ${reviewing||!yourTurn||game.isGameOver()||pendingPromotion?'disabled':''}>Show best move</button></div>
        ${fromStart && !reviewing && !game.isGameOver() ? `<div class="row toolbar">
          ${bookMove && !pendingPromotion ? '<button data-action="opening-hint">Show opening move</button>' : ''}
          <span class="tag">${practiceMoves.length >= course.moves.length && practiceMoves.slice(0,course.moves.length).every((move,i)=>move.san===course.moves[i])
            ? 'Lesson line complete. Keep playing the middlegame.'
            : practiceMoves.every((move,i)=>move.san===course.moves[i])
              ? 'Still following the lesson line.'
              : 'The game has left the lesson line. Use an engine hint if you get stuck.'}</span>
        </div>` : ''}
        ${pendingPromotion && !reviewing ? '<div class="row toolbar" aria-label="Choose promotion"><button data-promotion="q">Queen</button><button data-promotion="r">Rook</button><button data-promotion="b">Bishop</button><button data-promotion="n">Knight</button><button data-action="cancel-promotion">Cancel</button></div>' : ''}
        <div class="row toolbar"><button data-action="open-game-review">${finished ? 'View postgame review' : 'Review my moves'}</button></div>
        <section class="practice-moves"><h3>Move history</h3>
        <div class="row history-controls"><button data-action="history-back" ${at ? '' : 'disabled'}>Previous</button>
          <button data-action="history-next" ${reviewing && at < history.length ? '' : 'disabled'}>Next</button>
          <button data-action="history-live" ${reviewing ? '' : 'disabled'}>Live board</button></div>
        ${lastHuman || lastEngine ? `<p class="tag"><span class="you-key">Your side</span> ${lastHuman ? `${lastHuman.san} (${lastHuman.from} → ${lastHuman.to})` : '—'}
          · <span class="engine-key">Other side</span> ${lastEngine ? `${lastEngine.san} (${lastEngine.from} → ${lastEngine.to})` : '—'}</p>` : ''}
        <div class="row practice-history">${history.map((move,index) => {
          const badge = gradeByPly.get(index + 1 - openingHistory.length)?.grade;
          const number = move.before.split(' ')[5];
          return `<button data-history-ply="${index+1}" ${index+1===at?'aria-current="step"':''} aria-label="${number} ${sideName(move.color)} ${move.san}${badge ? ', '+grades[badge].label : ''}">${number}${move.color==='w'?'.':'…'} ${move.san}${badge ? ' '+grades[badge].symbol : ''}</button>`;
        }).join('')}</div></section></section>
        <aside class="panel lesson-panel"><span class="eyebrow">Stockfish practice</span><h1>${course.name}</h1>
        <label>Difficulty <select id="practice-difficulty">${Object.keys(skillLevels).map(level=>`<option value="${level}" ${level===difficulty?'selected':''}>${level[0].toUpperCase()+level.slice(1)}</option>`).join('')}</select></label>
        <p>Suggested alternative for your last move: ${best || '—'}</p>
        <details><summary>Move grade key</summary><p>${Object.entries(grades).map(([id, grade]) =>
          `<span class="grade-key grade-${id}">${grade.symbol} ${grade.label}</span>`).join(' · ')}</p>
          <p>Grades are estimates from short Stockfish searches. Brilliant is reserved for a top move whose sample line gives up material to force mate.</p></details>
        <p>Undo takes back your last move and Stockfish’s reply, so you can try a different plan.</p>
        <button data-action="restart-practice">Restart from this position</button>
        ${!yourTurn && !busy && !game.isGameOver() ? '<button data-action="retry-engine">Retry Stockfish</button>' : ''}
        </aside></div>
      ${reviewOpen || finished ? gameReview(practiceMoves,gradeByPly,human,openingHistory.length,finished) : ''}`;
    if (scroll !== undefined) app.querySelector('.practice-history').scrollTop = scroll;
    if (focus) app.querySelector(focus)?.focus({preventScroll:true});
  }
  function toMove(uci) {
    return game.moves({verbose:true}).find(move =>
      move.from + move.to + (move.promotion ?? '') === uci);
  }
  function analyze(forOpponent) {
    const current = generation;
    try {
      task = searchPosition(game.fen(), {time:forOpponent?380:500, multipv:1,
        skill:forOpponent?skillLevels[difficulty]:null});
      return task.promise.then(value => generation===current ? value : null).catch(() => null);
    } catch {
      return Promise.resolve(null);
    }
  }
  let pending;
  function startTurn() {
    hint = false; showOpening = false; selected = ''; pendingPromotion = null;
    if (game.isGameOver()) { render(); return; }
    const opponent = game.turn() !== human;
    const current = generation;
    busy = opponent;
    pending = analyze(opponent);
    pending.then(value => {
      if (current!==generation || !game) return;
      task = null;
      if (opponent) {
        busy = false;
        const move = value && toMove(value.bestMove);
        if (move) {
          game.move(move);
          message += (message ? ' ' : '') + `Stockfish played ${move.san}.`;
          startTurn();
        } else {
          message = 'Stockfish couldn’t reply. Retry or undo your move.';
          render();
        }
      } else {
        result = value;
        if (hint) {
          message = value ? `Stockfish suggests ${toMove(value.bestMove)?.san ?? 'no move'}.` : 'Analysis didn’t load. Tap Show best move to retry.';
          render();
        }
      }
    });
    render();
  }
  function play(move) {
    const current = generation;
    const analysis = pending;

    turns.push(game.history().length);
    game.move(move);
    selected = ''; pendingPromotion = null; hint = false; showOpening = false;
    busy = true; message = 'Comparing your move with Stockfish…';
    render();
    analysis.then(async value => {
      if (current!==generation || !game) return;
      const uci = move.from + move.to + (move.promotion ?? '');
      const before = value?.lines[0];
      const top = value?.bestMove === uci;
      best = top ? '' : before?.san[0] ?? '';
      let after;
      if (!top && before) {
        if (game.isCheckmate()) after = {mateWhite:move.color === 'w' ? 1 : -1};
        else if (game.isGameOver()) after = {mateWhite:null,scoreWhite:0};
        else after = (await analyze(false))?.lines[0];
      }
      if (current!==generation || !game) return;
      const replyUci = before?.uci[1];
      const reply = replyUci && toMove(replyUci);
      const matingSacrifice = top && before?.mateWhite * (move.color==='w'?1:-1)>0
        && reply?.to===move.to && reply.captured
        && pieceValue[reply.captured] > (pieceValue[move.captured] ?? 0);
      const grade = gradeMove({before,after,top,color:move.color,matingSacrifice});
      gradeByPly.set(game.history().length, {grade, before, after, alternative:best});
      const badge = grades[grade];
      message = `${badge ? badge.symbol+' '+badge.label+' · ' : ''}You played ${move.san}.`
        + (best ? ` Stockfish preferred ${best}. Use Undo to try it.` : '');
      cancel();
      startTurn();
    });
  }

  function click({action,square,promotion,historyPly,reviewJump}) {
    if (action==='finish-practice') { stop(); finish(); return; }
    if (action==='open-game-review') {
      reviewOpen = true;
      render();
      app.querySelector('#game-review')?.scrollIntoView({block:'start'});
      return;
    }
    if (historyPly !== undefined || ['history-back','history-next','history-live'].includes(action)) {
      const end = openingHistory.length + game.history().length;
      const at = reviewPly ?? end;
      const requested = historyPly !== undefined ? Number(historyPly)
        : action==='history-back' ? at-1 : action==='history-next' ? at+1 : end;
      reviewPly = requested>=end && reviewJump === undefined ? null : Math.min(end,Math.max(0,requested));
      selected = '';
      render(historyPly !== undefined ? `[data-history-ply="${historyPly}"]` : `[data-action="${action}"]:not(:disabled)`);
      if (reviewJump !== undefined) app.querySelector('.board-column')?.scrollIntoView({block:'start'});
      return;
    }
    if (action==='restart-practice') { reset(); return; }
    if (reviewPly !== null) return;
    if (action==='undo-practice' && turns.length) {
      const plies = turns.pop();
      cancel();
      while (game.history().length > plies) game.undo();
      for (const ply of gradeByPly.keys()) if (ply > plies) gradeByPly.delete(ply);
      message = 'Try a different move from this position.'; best = '';
      startTurn();
      return;
    }
    if (action==='retry-engine' && !busy && game.turn()!==human) { cancel(); startTurn(); return; }
    if (action==='opening-hint' && !busy && !pendingPromotion) {
      const move = openingMove();
      if (move) {
        hint = false; showOpening = true;
        message = `The lesson plays ${move.san} here.`;
        render('[data-action="opening-hint"]');
      }
      return;
    }
    if (action==='practice-hint' && !busy && !game.isGameOver()) {
      if (!task && !result) { cancel(); startTurn(); }
      hint = true; showOpening = false;
      message = result ? `Stockfish suggests ${toMove(result.bestMove)?.san ?? 'no move'}.` : 'Finding the best move…';
      render('[data-action="practice-hint"]');
      return;
    }
    if (action==='cancel-promotion') { pendingPromotion = null; selected = ''; render(); return; }
    if (promotion && pendingPromotion) { play(pendingPromotion.find(move=>move.promotion===promotion)); return; }
    if (!square || busy || game.turn()!==human || game.isGameOver() || pendingPromotion) return;
    const piece = game.get(square);
    if (piece?.color===human) selected = selected===square ? '' : square;
    else if (selected) {
      const choices = game.moves({square:selected,verbose:true}).filter(move=>move.to===square);
      if (choices.length>1) pendingPromotion = choices;
      else if (choices.length===1) { play(choices[0]); return; }
      else selected = '';
    }
    render(`[data-square="${square}"]`);
  }
  return {start,stop,click,active:()=>!!game,
    setDifficulty(value) { if (value in skillLevels) difficulty = value; }};
}
