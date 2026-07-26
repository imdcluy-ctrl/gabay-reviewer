// Accessible Focus Trap Manager for Phase 2 Modals (§10.2, INV-013)

export function trapFocus(modalElement: HTMLElement): () => void {
  const previousActiveElement = document.activeElement as HTMLElement | null;

  const focusableSelector =
    'a[href], button:not([disabled]), textarea, input, select, [tabindex="0"]:not([tabindex="-1"])';

  const getFocusableElements = (): HTMLElement[] => {
    return Array.from(modalElement.querySelectorAll<HTMLElement>(focusableSelector)).filter(
      el => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement
    );
  };

  const focusables = getFocusableElements();
  if (focusables.length > 0) {
    focusables[0]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key !== 'Tab') return;

    const currentFocusables = getFocusableElements();
    if (currentFocusables.length === 0) return;

    const first = currentFocusables[0];
    const last = currentFocusables[currentFocusables.length - 1];

    if (!first || !last) return;

    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  modalElement.addEventListener('keydown', handleKeyDown);

  return function cleanup() {
    modalElement.removeEventListener('keydown', handleKeyDown);
    if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
      previousActiveElement.focus();
    }
  };
}
