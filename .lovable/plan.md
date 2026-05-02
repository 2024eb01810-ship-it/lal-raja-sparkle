## Goal

Replace the static 3×3 grid in **Lal Raja Promise** with a horizontal carousel:
- Shows 3 cards on desktop, 2 on tablet, 1 on mobile.
- Auto-advances by 1 card every 2 seconds.
- Smooth slide transition (~600ms ease).
- Pauses on hover/focus and resumes on leave.
- Loops infinitely.
- Small prev/next arrow buttons in the header row, plus dot indicators below.
- Respects `prefers-reduced-motion` (no auto-advance).

## File to edit

`src/components/home/LalRajaPromise.tsx`

## Approach (technical)

- Keep the existing `PROMISES` array and card markup unchanged.
- Track `index` state and a `perView` value (1/2/3) derived from window width via a `matchMedia` listener (mobile <640, tablet <1024, desktop ≥1024).
- Render the track as a flex row inside an `overflow-hidden` viewport. Translate the track by `-(100/perView)*index %` with a `transition-transform duration-600 ease-in-out`.
- Each card wrapper uses `flex: 0 0 (100/perView)%` and a small horizontal padding for the gap.
- `setInterval` every 2000ms advances `index`. To loop without a visible jump, use the standard "clone first `perView` cards at the end" pattern: when reaching the cloned segment, snap back to 0 with transitions disabled for one frame.
- Pause: store a `paused` ref controlled by `onMouseEnter`/`onMouseLeave` and `onFocus`/`onBlur` on the viewport; the interval checks it before advancing.
- Arrows in the heading row call `prev()`/`next()`; dots show real page count `Math.ceil(items.length / perView)` and clicking a dot jumps to that page.
- No new dependencies.

That's the entire change. Approve and I'll implement it.