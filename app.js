import { grades } from './practice-grades.js';
import { createPractice } from './practice.js';
import { Chess } from './vendor/chess.js';
import { families } from './content.js';
import { advancedLines } from './advanced-lines.js';
import { newVariations } from './new-variations.js';
import { openingTheory } from './opening-theory.js';
import { middlegameExamples as existingMiddlegames } from './middlegame.js';
import { scheduleReview } from './review.js';
import { pieceVisual } from './pieces.js';

const app = document.querySelector('#app');
const blackCourses = new Set([2,3,4,5,6,7,8,13,14,15,16,17,22,23,24,25,26]);
const baseCourses = families.map((entry, index) => ({
  ...entry, side: blackCourses.has(index) ? 'b' : 'w', moves: entry.line.split(' '),
}));
const advancedCourses = [...newVariations, ...advancedLines].map(variation => {
  const parent = baseCourses.find(course => course.id === variation.parent);
  const setupLength = variation.setupPly ?? parent.moves.length;
  return {
    ...parent,
    ...variation,
    setupLength,
    moves: [...parent.moves.slice(0,setupLength), ...variation.line.map(([san]) => san)],
    plan: `White: ${variation.white} Black: ${variation.black}`,
    theory: { ...variation, notes: [
      ...openingTheory[parent.key].notes.slice(0,setupLength),
      ...variation.line.map(([, note]) => note),
    ] },
  };
});
const courses = [...advancedCourses, ...baseCourses];
const middlegameExamples = {...existingMiddlegames};
for (const variation of newVariations) {
  middlegameExamples[variation.id] = {lines:[{
    moves: variation.bridge.map(([san]) => san).join(' '),
    notes: variation.bridge.map(([, note]) => note),
  }]};
}
const key = 'knight-opening-lab-progress-v1';
let saved = {};
try { saved = JSON.parse(localStorage.getItem(key)) || {}; } catch {}
saved.pins ??= [];
saved.reviews ??= {};
let filter = 'all';
let planAnswer = null;
let exampleIndex = null;
let examplePly = 0;
let nextBranch;
let query = '';
let selected = '';
let showHint = false;
let status = '';
let position;
let cursor;
let state;
const color = (side) => side === 'w' ? 'White' : 'Black';
const names = { p:'pawn', n:'knight', b:'bishop', r:'rook', q:'queen', k:'king' };

function board(game, side, interactive, practiceView) {
  const selectedSquare = practiceView ? practiceView.selected : selected;
  const squares = game.board().flat();
  if (side === 'b') squares.reverse();
  const targets = selectedSquare && interactive ? game.moves({square:selectedSquare, verbose:true}).map(move => move.to) : [];
  const hint = !practiceView && interactive && (showHint || state.mode === 'learn') && state.course.moves[cursor];
  const suggested = practiceView?.suggested ?? (hint && game.moves({verbose:true}).find(move => move.san === hint));
  return '<div class="board"' + (interactive ? ' aria-label="Chessboard"' : ' aria-hidden="true"') + '>' +
    squares.map((piece, index) => {
      const file = index % 8, rank = Math.floor(index / 8);
      const square = side === 'w' ? 'abcdefgh'[file] + (8-rank) : 'hgfedcba'[file] + (rank+1);
      const marker = practiceView?.marker?.square === square ? practiceView.marker.grade : null;
      const yourTrail = practiceView?.lastHuman;
      const otherTrail = practiceView?.lastEngine;
      const classes = ['sq', [yourTrail?.from,yourTrail?.to].includes(square) && 'you-trail',
        [otherTrail?.from,otherTrail?.to].includes(square) && 'engine-trail', (file+rank)%2 && 'dark', interactive && square===selectedSquare && 'selected',
        targets.includes(square) && 'target', suggested && [suggested.from,suggested.to].includes(square) && 'hint'].filter(Boolean).join(' ');
      const label = piece ? square + ' ' + color(piece.color) + ' ' + names[piece.type] : square;
      const coordinates = (file===0 ? `<span class="rank-label">${square[1]}</span>` : '')
        + (rank===7 ? `<span class="file-label">${square[0]}</span>` : '');
      return interactive
        ? `<button class="${classes}" data-square="${square}" aria-label="${label}${marker ? ', '+grades[marker].label : ''}">${piece ? pieceVisual(piece) : ''}<span aria-hidden="true">${coordinates}</span>${marker ? `<span class="move-grade grade-${marker}" aria-hidden="true">${grades[marker].symbol}</span>` : ''}</button>`
        : `<span class="${classes}">${piece ? pieceVisual(piece) : ''}</span>`;
    }).join('') + (suggested ? moveArrow(suggested,side) : '') + '</div>';
}

function moveArrow(move, side) {
  function center(square) {
    const x = square.charCodeAt(0) - 97;
    const y = 8 - Number(square[1]);
    return side === 'w' ? [x+.5,y+.5] : [7.5-x,7.5-y];
  }
  const [x1,y1] = center(move.from), [x2,y2] = center(move.to);
  const length = Math.hypot(x2-x1,y2-y1);
  const x = x2 - .18*(x2-x1)/length, y = y2 - .18*(y2-y1)/length;
  return `<svg class="move-arrow" viewBox="0 0 8 8" aria-hidden="true">
    <defs><marker id="arrow-head" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="3" markerHeight="3" orient="auto">
      <path d="M0 0L10 5L0 10Z" fill="currentColor"/></marker></defs>
    <path d="M${x1} ${y1}L${x} ${y}" stroke="currentColor" stroke-width=".16" stroke-linecap="round" marker-end="url(#arrow-head)"/>
  </svg>`;
}

const najdorfBranches = ['advanced-najdorf','advanced-najdorf-bg5','advanced-najdorf-be2'];

function dueReviews() {
  return Object.entries(saved.reviews)
    .filter(([, card]) => card.due <= Date.now())
    .sort(([, a], [, b]) => a.due - b.due);
}

function practiceHome() {
  const due = dueReviews();
  const pins = courses.filter(course => saved.pins.includes(course.id));
  return `<section class="panel practice-home"><h2>My Repertoire</h2>
    <div class="row"><a class="button primary" href="#review">Review Due · ${due.length}</a>
    <a class="button" href="#mix">Mix up the Najdorf</a></div>
    ${['w','b'].map(side => `<div class="pin-group"><h3>${color(side)}</h3>
      ${pins.filter(course => course.side === side).map(course =>
        `<a class="button" href="#drill/${course.id}">${course.name}</a>`).join('')
        || '<p>Pin a line from the library to keep it here.</p>'}</div>`).join('')}
    <p>Missed moves and hints go into Review Due. Recall a move unaided to space out its next review.</p></section>`;
}

function catalogCards() {
  const filtered = courses.filter(course => (filter === 'all' || (filter === 'advanced' ? course.parent : course.side === filter))
    && course.name.toLowerCase().includes(query.trim().toLowerCase()));
  document.querySelector('#cards').innerHTML = filtered.map(course => {
    const game = new Chess();
    course.moves.slice(0, course.setupLength ? course.setupLength + 1 : 6).forEach(move => game.move(move));
    const count = saved[course.id] || 0;
    return `<article class="card"><div class="card-top"><div class="mini">${board(game,course.side,false)}</div>
      <div><span class="tag">${color(course.side)} · ${course.parent ? 'Advanced' : 'Foundation'}${count ? ' · ' + count + ' completed' : ''}</span><h3>${course.name}</h3></div></div>
      <p>${course.title}</p><div class="row"><a class="button" href="#learn/${course.id}">Learn</a>
      <a class="button primary" href="#drill/${course.id}">Drill</a>
      <a class="button" href="#play/${course.id}">Play from start</a>
      <button data-pin="${course.id}" aria-pressed="${saved.pins.includes(course.id)}">${saved.pins.includes(course.id) ? 'Unpin' : 'Pin'}</button>
      </div></article>`;
  }).join('') || '<p>No openings match your search.</p>';
}
function catalog() {
  const resume = courses.find(course => course.id === saved.last) || baseCourses[0];
  app.innerHTML = `<section class="hero"><span class="eyebrow">Knight School Openings</span><h1>Learn the idea.<br>Play the moves.</h1>
    <p>Study an opening, then play your side from memory.</p>
    <p class="resume-title">${resume.name}</p>
    <a class="button primary resume-button" href="#learn/${resume.id}">${saved.last ? 'Continue lesson' : 'Start lesson'}</a></section>
    ${practiceHome()}<h2>Opening library</h2><div class="row toolbar">
    ${[['all','All'],['advanced','Advanced'],['w','White'],['b','Black']].map(([id,label]) => `<button data-filter="${id}" aria-pressed="${id===filter}">${label}</button>`).join('')}
    <input id="search" type="search" placeholder="Search openings" aria-label="Search openings"></div><div id="cards" class="grid"></div>`;
  document.querySelector('#search').value = query;
  catalogCards();
}
function persist() { try { localStorage.setItem(key, JSON.stringify(saved)); } catch {} }
function advance() {
  position.move(state.course.moves[cursor++]);
}
function reply() {
  while (cursor < state.course.moves.length && position.turn() !== state.course.side) advance();
  if (cursor === state.course.moves.length) {
    saved[state.course.id] = (saved[state.course.id] || 0) + 1;
    persist();
    status = 'Line complete. Repeat it or choose another opening.';
  }
}
function route() {
  practice.stop();
  const [mode,id] = location.hash.slice(1).split('/');
  const course = courses.find(item => item.id===id);
  if (mode === 'review' || mode === 'review-next') {
    const [entry] = dueReviews();
    if (!entry) {
      state = null;
      app.innerHTML = '<section class="panel"><h1>You’re caught up</h1><p>Miss a move or use a hint in Drill to add that position to your reviews.</p><a class="button" href="#">Back to my repertoire</a></section>';
      return;
    }
    const [reviewKey, card] = entry;
    const reviewCourse = courses.find(item => item.id === card.courseId);
    state = {mode:'review', course:reviewCourse, start:card.cursor, reviewKey};
    reset();
    return;
  }
  if (mode === 'mix' || mode === 'branch') {
    const choices = najdorfBranches.filter(branch => branch !== nextBranch);
    nextBranch = choices[Math.floor(Math.random() * choices.length)];
    const branch = courses.find(item => item.id === nextBranch);
    state = {mode:'mix', course:branch, start:branch.setupLength + 1};
    reset();
    return;
  }
  if (mode === 'play' && course) {
    state = null;
    practice.start(new Chess(), course, [], {fromStart:true});
    window.scrollTo(0, 0);
    return;
  }
  if (!course || !['learn','drill'].includes(mode)) { state = null; catalog(); return; }
  state = {mode,course};
  saved.last = id; persist();
  reset();
}
function reset() {
  position = new Chess();
  cursor = 0; selected = ''; showHint = false; status = '';
  planAnswer = null;
  exampleIndex = null; examplePly = 0;
  state.assisted = false;
  state.solved = false;
  while (cursor < (state.start ?? 0)) advance();
  if (state.mode === 'drill') reply();
  renderStudy();
}
function rememberMiss() {
  state.assisted = true;
  const reviewKey = state.reviewKey ?? `${state.course.id}:${cursor}`;
  saved.reviews[reviewKey] = {
    courseId: state.course.id, cursor, ...scheduleReview(null, true),
  };
  persist();
}

function renderStudy(focusSquare) {
  const {course,mode} = state;
  const drill = mode !== 'learn';
  const review = mode === 'review', mixed = mode === 'mix';
  const done = review ? state.solved : cursor >= course.moves.length;
  const theory = course.theory ?? openingTheory[course.key];
  const related = advancedCourses.filter(variation => variation.parent === course.id);
  const next = !done && position.moves({verbose:true}).find(move => move.san === course.moves[cursor]);
  const nextLabel = next && (next.san.startsWith('O-O')
    ? (next.san.startsWith('O-O-O') ? 'Castle queenside' : 'Castle kingside')
    : `Move the ${names[next.piece]} from ${next.from} to ${next.to}`);
  const number = index => `${Math.floor(index / 2) + 1}${index % 2 ? '…' : '.'}`;
  const lastIndex = cursor - 1;
  const lastMove = lastIndex >= 0 ? `<details class="last-move"><summary>Previous move · ${number(lastIndex)} ${course.moves[lastIndex]}</summary><p>${theory.notes[lastIndex]}</p></details>` : '';
  const bridge = middlegameExamples[course.id];
  const activeExample = done && !review && bridge?.lines[exampleIndex];
  const displayBoard = activeExample ? new Chess(position.fen()) : position;
  const exampleMoves = activeExample ? activeExample.moves.split(' ') : [];
  exampleMoves.slice(0,examplePly).forEach(san => displayBoard.move(san));
  app.innerHTML = `<div class="row toolbar"><a class="button" href="#">All openings</a>
    <a class="button ${drill?'':'primary'}" href="#learn/${course.id}" ${drill?'':'aria-current="page"'}>Learn</a>
    <a class="button ${drill?'primary':''}" href="#drill/${course.id}" ${drill?'aria-current="page"':''}>Drill</a></div>
    <div class="study"><section class="board-column">
    <article class="lesson-current">
      <span class="eyebrow">${activeExample ? 'Middlegame example' : done ? 'Complete' : drill ? 'From memory' : `${number(cursor)} · ${color(position.turn())} to move`}</span>
      <h2>${activeExample ? `Move ${examplePly} of ${exampleMoves.length}` : done ? 'Line complete' : drill ? 'Find the next move' : nextLabel}</h2>
      <p>${activeExample ? (activeExample.notes?.[examplePly - 1] ?? activeExample.why ?? bridge.idea) : done ? (review ? theory.notes[state.start] : course.plan) : drill ? (review ? 'Find the move from your opening line.' : 'Play the move you studied. The board will play the other side.') : theory.notes[cursor]}</p>
      <div aria-live="polite" class="status">${status}</div>
    </article>
    <div class="board-caption"><span>${color(displayBoard.turn())} to move</span><span>${color(course.side)} at the bottom</span></div>
    ${board(displayBoard,course.side,true)}
    ${activeExample ? `<div class="lesson-nav">
      <button data-action="example-back" ${examplePly ? '' : 'disabled'}>Previous example move</button>
      <button class="primary" data-action="example-next" ${examplePly < exampleMoves.length ? '' : 'disabled'}>Next example move</button>
    </div><p class="moves">Example · ${exampleMoves.slice(0,examplePly).join(' ')}</p><button data-action="close-example">Return to opening end</button>` : ''}
    ${!drill && !activeExample ? `<div class="lesson-nav" aria-label="Lesson navigation">
      <button data-action="back" ${cursor?'':'disabled'}>Previous</button>
      ${done ? `<a class="button primary" data-finish href="#drill/${course.id}">Drill this line</a>` :
        '<button class="primary" data-action="next">Next</button>'}
    </div>` : ''}
    ${done && !review ? '<button class="primary practice-launch" data-action="start-practice">Play this position vs. Stockfish</button>' : ''}
    <div class="moves" aria-label="Moves played">${position.history().map((san,index)=>`<span>${index%2===0 ? number(index)+' ' : ''}${san}</span>`).join('')}</div>
    </section><section class="panel lesson-panel">
    <span class="eyebrow">${course.parent ? 'Advanced · ' : ''}${color(course.side)} repertoire</span><h1>${review ? 'Review a missed move' : mixed && !done ? 'Najdorf reply practice' : course.name}</h1>
    <label class="tag" for="line-progress">${cursor} of ${course.moves.length} moves played</label>
    <progress id="line-progress" max="${course.moves.length}" value="${cursor}"></progress>
    ${!drill && !done ? '<p class="lesson-tip">Tap Next to play the move, or try it on the board.</p>' : ''}
    <div class="row">${drill ? `<button data-action="hint" ${done?'disabled':''}>Show hint</button>` : ''}
      ${!(review && done) ? '<button data-action="reset">Restart</button>' : ''}</div>
    ${!drill && course.parent && cursor < course.setupLength ? '<button class="skip-setup" data-action="skip-setup">Jump to the variation</button>' : ''}
    ${related.length && (!drill || done) ? `<div class="related-lines"><h2>Go deeper</h2>
      ${related.map(variation => `<a href="#learn/${variation.id}">${variation.name}</a>`).join('')}</div>` : ''}
    ${review && done ? `<div class="related-lines"><a class="button primary" href="${location.hash === '#review-next' ? '#review' : '#review-next'}">Next review</a></div>` : ''}
    ${mixed ? `<div class="related-lines"><a class="button" href="${location.hash === '#branch' ? '#mix' : '#branch'}">Try a different reply</a></div>` : ''}
    ${done && !review ? `<section class="related-lines middlegame"><h2>Into the middlegame</h2>
      <h3>White’s next plan</h3><p>${theory.white}</p>
      <h3>Black’s next plan</h3><p>${theory.black}</p>
      <h3>${bridge?.lines.length > 1 ? 'What if they play something else?' : 'Play a sample continuation'}</h3>
      <p>${bridge?.idea ?? 'An example from this exact position. If your opponent varies, check what they threaten and which plan still fits.'}</p>
      ${bridge ? `<div class="row">${bridge.lines.map((line,index) =>
        `<button data-example="${index}" aria-pressed="${exampleIndex===index}">${line.moves}</button>`).join('')}</div>
        ` : ''}
      <h3>What would you do next?</h3><p>${theory.question}</p>
      ${planAnswer ? `<p>${theory.answer}</p>` : '<button data-action="show-plan">Reveal the plan</button>'}</section>` : ''}
    ${lastMove}
    ${!drill || done ? `<details class="theory"><summary>Opening theory and plans for both sides</summary>
      <h3>White’s plan</h3><p>${theory.white}</p><h3>Black’s plan</h3><p>${theory.black}</p>
      <h3>Pawn structure</h3><p>${theory.structure}</p><h3>Common mistake</h3><p>${course.trap}</p>
      <details><summary>${theory.question}</summary><p>${theory.answer}</p></details></details>` : ''}
    </section></div>`;

  if (focusSquare) app.querySelector(`[data-square="${focusSquare}"]`)?.focus({preventScroll:true});
}
const practice = createPractice({app, board, finish:() => { if (state) renderStudy(); else location.hash = ''; }});
app.addEventListener('change', event => {
  if (event.target.id === 'practice-difficulty') practice.setDifficulty(event.target.value);
});
app.addEventListener('input', event => {
  if (event.target.id === 'search') { query = event.target.value; catalogCards(); }
});
app.addEventListener('click', event => {
  const {filter:nextFilter,action,square,pin,example,promotion,historyPly,reviewJump} = event.target.closest('button')?.dataset || {};
  if (practice.active()) { practice.click({action,square,promotion,historyPly,reviewJump}); return; }
  if (nextFilter) {
    filter = nextFilter;
    app.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', button.dataset.filter===filter));
    catalogCards(); return;
  }
  if (pin) {
    saved.pins = saved.pins.includes(pin) ? saved.pins.filter(id => id !== pin) : [...saved.pins, pin];
    persist();
    catalog();
    app.querySelector(`[data-pin="${pin}"]`)?.focus({preventScroll:true});
    return;
  }
  if (!state) return;
  if (action === 'start-practice') {
    const start = new Chess(position.fen());
    const line = middlegameExamples[state.course.id]?.lines[exampleIndex];
    line?.moves.split(' ').slice(0, examplePly).forEach(san => start.move(san));
    practice.start(start, state.course, [...position.history({verbose:true}), ...start.history({verbose:true})]);
    app.querySelector('.board-column')?.scrollIntoView({block:'start'});
    return;
  }
  if (example !== undefined) {
    exampleIndex = Number(example); examplePly = 1;
    renderStudy();
    app.querySelector('[data-action="example-next"]')?.focus({preventScroll:true});
    app.querySelector('.board-column')?.scrollIntoView({block:'start'});
    return;
  }
  if (action === 'reset') { reset(); return; }
  if (action === 'example-next') examplePly++;
  if (action === 'example-back') examplePly--;
  if (action === 'close-example') { exampleIndex = null; examplePly = 0; }
  if (action === 'show-plan') planAnswer = true;
  if (action === 'hint') { rememberMiss(); showHint = true; status = 'Try ' + state.course.moves[cursor] + '.'; }
  if (action === 'skip-setup' && state.mode === 'learn') {
    while (cursor < state.course.setupLength) advance();
    status = '';
  }
  if (action === 'next' && cursor < state.course.moves.length) { advance(); status = ''; }
  if (action === 'back' && cursor) { position.undo(); cursor--; status = ''; exampleIndex = null; }
  if (action) {
    selected = '';
    renderStudy();
    const control = app.querySelector(`[data-action="${action}"]:not(:disabled)`);
    (control ?? app.querySelector('[data-finish], [data-action="next"]'))?.focus({preventScroll:true});
    return;
  }
  if (!square || state.solved || cursor === state.course.moves.length) return;
  const piece = position.get(square);
  if (piece?.color === position.turn()) {
    selected = selected === square ? '' : square;
  } else if (selected) {
    const candidate = position.moves({square:selected,verbose:true}).find(move => move.to===square);
    if (candidate?.san === state.course.moves[cursor]) {
      advance(); status = state.mode==='drill' ? 'That’s the move.' : ''; showHint = false;
      if (state.mode === 'review') {
        const card = saved.reviews[state.reviewKey];
        Object.assign(card, scheduleReview(card, state.assisted));
        persist();
        state.solved = true;
        status = state.assisted ? 'Saved for another try today.' : 'Recalled without help. Scheduled for a later review.';
      } else if (state.mode !== 'learn') {
        state.assisted = false;
        reply();
      }
    } else {
      if (candidate && state.mode !== 'learn') rememberMiss();
      status = candidate ? 'That move is legal. Try the move from this line.' : 'That piece can’t move there.';
    }
    selected = '';
  }
  renderStudy(square);
});
window.addEventListener('hashchange',route);
route();
