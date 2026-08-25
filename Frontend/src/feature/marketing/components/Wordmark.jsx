import { cx } from "../../../shared/lib/cx";

/**
 * The oversized outlined RECALLIX that closes the page.
 *
 * At rest the glyphs are transparent with a hairline stroke; on hover the fill
 * sweeps in letter by letter. `color` is an animatable property, so the fill
 * genuinely transitions rather than snapping — the stroke stays put underneath.
 *
 * Decorative: "Recallix" is already in the footer brand above, so this is
 * aria-hidden rather than read out a second time. The per-letter delay is
 * neutralised by the global prefers-reduced-motion block in theme.css, which
 * collapses transition-duration; the delay is cleared explicitly below because
 * that block does not touch transition-delay.
 */
const Wordmark = ({ text = "Recallix", className }) => (
  <div
    aria-hidden="true"
    className={cx("rx-wordmark select-none overflow-hidden", className)}
  >
    <span className="rx-wordmark__inner">
      {[...text].map((char, i) => (
        <span
          key={`${char}-${i}`}
          className="rx-wordmark__letter"
          style={{ transitionDelay: `${i * 45}ms` }}
        >
          {char}
        </span>
      ))}
    </span>
  </div>
);

export default Wordmark;
