import styles from './HeightBar.module.css';

type HeightBarProps = {
  /** In centimetres. */
  height: number;
  /** The height that fills the whole bar. */
  max: number;
};

export function HeightBar({ height, max }: HeightBarProps) {
  // The width depends on DATA, so it cannot live in a stylesheet: this is the
  // case inline `style` is for. Everything static stays in the module.
  const percent = Math.min(100, Math.round((height / max) * 100));

  return (
    <div className={styles.track}>
      <div
        className={styles.bar}
        role="meter"
        aria-label="Height"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={height}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
