// Controllable clock. Everything time-based reads from here, so tests can jump
// forward and the demo can run at ×N speed (a year of compounding in a minute).
// Contracts do this with vm.warp; the frontend gets the same power.
let speed = 1;
let anchorReal = 0; // real ms at last speed change
let anchorVirtual = 0; // virtual ms at last speed change

function now(): number {
  return performance.now();
}

export const TimeProvider = {
  /** virtual milliseconds elapsed, scaled by speed */
  virtualNow(): number {
    if (anchorReal === 0) {
      anchorReal = now();
      anchorVirtual = 0;
    }
    return anchorVirtual + (now() - anchorReal) * speed;
  },
  setSpeed(next: number) {
    // re-anchor so the virtual timeline stays continuous across speed changes
    anchorVirtual = this.virtualNow();
    anchorReal = now();
    speed = next;
  },
  getSpeed(): number {
    return speed;
  },
};
