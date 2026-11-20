const DAY = 86400000;

export function scheduleReview(previous, assisted, now = Date.now()) {
  const streak = assisted ? 0 : (previous?.streak ?? 0) + 1;
  const delay = assisted ? 0 : Math.min(30, 2 ** (streak - 1)) * DAY;
  return { streak, due: now + delay };
}
