import { useEffect } from 'react';

export interface KeyboardShortcutsHandlers {
  onSelectOption?: (option: 'A' | 'B' | 'C' | 'D') => void;
  onConfirm?: () => void;
  onNextQuestion?: () => void;
  onPrevQuestion?: () => void;
  onToggleFlag?: () => void;
  onTogglePalette?: () => void;
  onPauseOrEscape?: () => void;
  isModalOpen?: boolean;
}

export function useAccessibilityKeyboard(handlers: KeyboardShortcutsHandlers) {
  const {
    onSelectOption,
    onConfirm,
    onNextQuestion,
    onPrevQuestion,
    onToggleFlag,
    onTogglePalette,
    onPauseOrEscape,
    isModalOpen = false,
  } = handlers;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isModalOpen) return;

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return; // Suppress shortcuts when focused inside form inputs
      }

      const key = event.key;

      if (key === 'a' || key === 'A') {
        if (onSelectOption) { event.preventDefault(); onSelectOption('A'); }
      } else if (key === 'b' || key === 'B') {
        if (onSelectOption) { event.preventDefault(); onSelectOption('B'); }
      } else if (key === 'c' || key === 'C') {
        if (onSelectOption) { event.preventDefault(); onSelectOption('C'); }
      } else if (key === 'd' || key === 'D') {
        if (onSelectOption) { event.preventDefault(); onSelectOption('D'); }
      } else if (key === 'ArrowRight') {
        if (onNextQuestion) { event.preventDefault(); onNextQuestion(); }
      } else if (key === 'ArrowLeft') {
        if (onPrevQuestion) { event.preventDefault(); onPrevQuestion(); }
      } else if (key === 'f' || key === 'F') {
        if (onToggleFlag) { event.preventDefault(); onToggleFlag(); }
      } else if (key === 'p' || key === 'P') {
        if (onTogglePalette) { event.preventDefault(); onTogglePalette(); }
      } else if (key === 'Escape') {
        if (onPauseOrEscape) { event.preventDefault(); onPauseOrEscape(); }
      } else if (key === 'Enter' || key === ' ') {
        if (onConfirm && target?.tagName === 'BUTTON') {
          // Allow default button click
        } else if (onConfirm) {
          event.preventDefault();
          onConfirm();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    onSelectOption,
    onConfirm,
    onNextQuestion,
    onPrevQuestion,
    onToggleFlag,
    onTogglePalette,
    onPauseOrEscape,
    isModalOpen,
  ]);
}
