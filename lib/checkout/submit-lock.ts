export type SubmitLock = {
  claim: () => boolean;
  release: () => void;
};

export function createSubmitLock(): SubmitLock {
  let held = false;
  return {
    claim(): boolean {
      if (held) return false;
      held = true;
      return true;
    },
    release(): void {
      held = false;
    },
  };
}
