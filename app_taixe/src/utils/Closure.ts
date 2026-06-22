export default class Closure {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private timerTap: ReturnType<typeof setTimeout> | null = null;

  debounce = (fn: () => void, ms: number) => {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(fn, ms);
  };

  // Handle tap event make double tap detection
  handleTap = (onSingle: () => void, onDouble: () => void) => {
    if (this.timerTap) {
      clearTimeout(this.timerTap);
      this.timerTap = null;
      onDouble();
    } else {
      this.timerTap = setTimeout(() => {
        this.timerTap = null;
        onSingle();
      }, 300);
    }
  };

  // Delay execution and cancel previous delay if called again
  delay = (fn: () => void, ms: number) => {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.timer = null;
      fn();
    }, ms);
  };

  // Cleanup all timers
  cleanup = () => {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.timerTap) {
      clearTimeout(this.timerTap);
      this.timerTap = null;
    }
  };
}