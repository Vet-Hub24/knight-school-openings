// Original Staunton-inspired outlines, shared by the board and catalog.
const silhouettes = {
  p: '<path d="M32 11a8 8 0 0 1 4 15v4h5v4h-5c1 6 4 12 8 15H20c4-3 7-9 8-15h-5v-4h5v-4a8 8 0 0 1 4-15Z"/>',
  n: '<path d="M19 49c0-11 5-15 14-22l-9 4-7-5 9-10 1-6 7 4c12 2 17 13 15 24l-3 11Z"/><path class="detail" d="M37 19c8 6 9 14 6 23M25 25l-3 1"/><circle class="ink" cx="30" cy="20" r="1.8"/>',
  b: '<path d="M32 7c4 6 12 12 12 21 0 5-4 9-9 10l4 7 6 4H19l6-4 4-7c-5-1-9-5-9-10 0-9 8-15 12-21Z"/><path class="detail" d="m36 15-8 12m-3 9h14m-13 8h12"/>',
  r: '<path d="M16 10h8v7h5v-7h6v7h5v-7h8v14l-7 5v13l5 7H18l5-7V29l-7-5Z"/><path class="detail" d="M17 23h30m-24 6h18m-18 13h18"/>',
  q: '<path d="m14 18 11 10 7-16 7 16 11-10-6 23 2 8H18l2-8Z"/><circle cx="13" cy="15" r="4"/><circle cx="32" cy="9" r="4"/><circle cx="51" cy="15" r="4"/><path class="detail" d="M20 41h24m-25 5h26"/>',
  k: '<path d="M29 5h6v7h7v6h-7v9h-6v-9h-7v-6h7Z"/><path d="M32 28c-9-9-19-6-19 3 0 6 5 12 9 14l-3 4h26l-3-4c4-2 9-8 9-14 0-9-10-12-19-3Z"/><path class="detail" d="M32 28v15m-10 2h20"/>',
};
const pedestal = '<path d="M18 49h28l5 6v4H13v-4Z"/><path class="detail" d="M14 55h36"/>';

export function pieceVisual({color, type}) {
  return `<span class="piece ${color === 'w' ? 'ivory' : 'onyx'}" aria-hidden="true">
    <svg viewBox="0 0 64 64" focusable="false" aria-hidden="true">
      <g stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">${silhouettes[type]}${pedestal}</g>
    </svg></span>`;
}
