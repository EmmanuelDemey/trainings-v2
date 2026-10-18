import styles from './HeightBar.module.css';

type HeightBarProps = {
  /** In centimetres. */
  height: number;
  /** The height that fills the whole bar. */
  max: number;
};

export function HeightBar({ height, max }: HeightBarProps) {
  // TODO 4.1: expose the values to assistive technologies — aria-valuemin
  //           (0), aria-valuemax (`max`) and aria-valuenow (`height`).
  // TODO 4.2: set the bar's width INLINE, as a whole percent of `max`,
  //           never above 100%.
  return (
    <div className={styles.track}>
      <div className={styles.bar} role="meter" aria-label="Height" />
    </div>
  );
}
