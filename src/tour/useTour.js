import { useState } from "react";

// Array order is tour order (PLAN §4). Acts are contiguous runs of `body`, so
// the index alone is the whole state machine; `null` means free exploration.
// No test: the plan scopes node --test to projection.js and this is clamping.
export function useTour(stops, guided = false) {
  const [index, setIndex] = useState(guided ? 0 : null);
  const [resumeIndex, setResumeIndex] = useState(guided ? 0 : null);
  const last = stops.length - 1;

  return {
    index,
    current: index === null ? null : stops[index],
    started: resumeIndex !== null,
    start: () => setIndex(resumeIndex ?? 0),
    end: () => {
      if (index !== null) setResumeIndex(index);
      setIndex(null);
    },
    next: () => setIndex((i) => (i === null ? null : Math.min(i + 1, last))),
    prev: () => setIndex((i) => (i === null ? null : Math.max(i - 1, 0))),
  };
}
