/**
 * The personal mark: a single letter Q.
 *
 * ONE letter, not the VAQ monogram the wordmark used to spell out. The mark has
 * to survive a 16px favicon, and three letters at that size are a smudge — the
 * only thing that reads is a shape with one counter and one distinguishing
 * move. Q has both.
 *
 * The geometry follows the design system rather than a typeface:
 *
 *  - The bowl is an ELLIPSE, markedly wider than it is tall, echoing the display
 *    face's `wdth 125` axis (see `.font-display` in styles/globals.css). A
 *    circle would have been the obvious choice and would have said nothing
 *    about this site. It also settles a real failure: at a narrower bowl and a
 *    heavier stroke the counter closed up and the mark read as a magnifying
 *    glass rather than a letter.
 *  - The tail starts inside the counter and breaks past the outer edge. That
 *    crossing is the whole identity of the letter; a tail that merely touches
 *    the bowl reads as an O with a scratch next to it.
 *  - Butt caps, no rounding. The shape rule in globals.css is that surfaces and
 *    media are sharp and only interactive controls are pill, and this is a
 *    surface.
 *
 * Drawn with `currentColor` so one component serves every context it appears
 * in — fg in the header, ember on the footer, and knocked out of ember on the
 * favicon tile. No fill, no hardcoded hex, no network request.
 *
 * The same geometry is rasterised for the favicon and touch icon by
 * scripts/generate-brand-assets.mjs. If the numbers below change, that script's
 * constants have to change with them or the mark on the tab stops matching the
 * mark on the page.
 */
export default function Mark({
  size = 24,
  className,
  title,
}: {
  size?: number;
  className?: string;
  /** Only pass this when the mark is not accompanied by a text label. */
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : "true"}
      aria-label={title}
      fill="none"
      /*
       * Stroke geometry rather than filled outlines: it keeps the shape one set
       * of readable numbers instead of a path of bezier coordinates, so the
       * raster generator can reproduce it from the same values.
       */
      stroke="currentColor"
      strokeWidth={4.2}
    >
      <ellipse cx="14" cy="13.8" rx="10" ry="8.6" />
      <line x1="17" y1="16" x2="27" y2="25" />
    </svg>
  );
}
