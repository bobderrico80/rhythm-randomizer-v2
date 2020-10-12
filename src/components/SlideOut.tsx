import React, { useRef, useEffect } from 'react';
import classnames from 'classnames';
import { buildBemClassName } from '../modules/util';
import './SlideOut.scss';

const FOCUSABLE_ELEMENTS =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const buildClassName = buildBemClassName('c-rr-slide-out');

export interface SlideOutProps {
  open: boolean;
  className?: string;
  openClassName?: string;
  closedClassName?: string;
  paneClassName?: string;
  openPaneClassName?: string;
  closedPaneClassName?: string;
  overlayClassName?: string;
  openOverlayClassName?: string;
  closedOverlayClassName?: string;
  scrollToTop?: boolean;
  focusDependency?: any;
  renderPane: (
    open: boolean,
    onCloseClick: () => void
  ) => JSX.Element | string | null;
  onCloseClick: () => void;
}

const SlideOut = ({
  open,
  className = '',
  openClassName = '',
  closedClassName = '',
  paneClassName = '',
  openPaneClassName = '',
  closedPaneClassName = '',
  overlayClassName = '',
  openOverlayClassName = '',
  closedOverlayClassName = '',
  scrollToTop = false,
  focusDependency,
  renderPane,
  onCloseClick,
}: SlideOutProps) => {
  const paneRef = useRef<HTMLDivElement>(null);

  // Handle closing menu with escape key
  useEffect(() => {
    const escapePane = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseClick();
        document.removeEventListener('keydown', escapePane);
      }
    };

    document.addEventListener('keydown', escapePane);
  }, [onCloseClick]);

  // Trap focus
  useEffect(() => {
    if (!open) {
      return;
    }

    const pane = paneRef.current;

    if (!pane) {
      return;
    }

    const focusableElements = getFocusableElements(pane);
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement =
      focusableElements[focusableElements.length - 1];

    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        return;
      }

      if (event.shiftKey && document.activeElement === firstFocusableElement) {
        event.preventDefault();
        lastFocusableElement.focus();
        return;
      }

      if (document.activeElement === lastFocusableElement) {
        event.preventDefault();
        firstFocusableElement.focus();
      }
    };

    document.addEventListener('keydown', handleTab);

    return () => {
      document.removeEventListener('keydown', handleTab);
    };
  }, [open, focusDependency]);

  // Focus first element when pane opens
  useEffect(() => {
    if (!open) {
      return;
    }

    const pane = paneRef.current;

    if (!pane) {
      return;
    }

    const focusableElements = getFocusableElements(pane);

    const handleTransitionEnd = () => {
      focusableElements[0].focus();
      pane.removeEventListener('transitionend', handleTransitionEnd);
    };

    if (focusableElements.length > 0) {
      pane.addEventListener('transitionend', handleTransitionEnd);
    }
  }, [open]);

  useEffect(() => {
    if (scrollToTop) {
      paneRef.current?.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
    }
  }, [scrollToTop]);

  const getFocusableElements = (pane: HTMLElement) => {
    let focusableElements = [
      ...pane.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS),
    ];

    // Filter out elements that aren't visible on the screen
    // TODO: Make this smarter than just handling `aria-hidden`
    focusableElements = focusableElements.filter((element) => {
      if (element.getAttribute('aria-hidden')) {
        return false;
      }

      if (element.closest('[aria-hidden="true"]')) {
        return false;
      }

      return true;
    });

    return focusableElements;
  };

  return (
    <div
      className={classnames(buildClassName()(), className, {
        [buildClassName()('open')]: open,
        [buildClassName()('closed')]: !open,
        [openClassName]: open,
        [closedClassName]: !open,
      })}
      aria-hidden={!open}
    >
      <div
        ref={paneRef}
        className={classnames(buildClassName('pane')(), paneClassName, {
          [buildClassName('pane')('open')]: open,
          [buildClassName('pane')('closed')]: !open,
          [openPaneClassName]: open,
          [closedPaneClassName]: !open,
        })}
      >
        {renderPane(open, onCloseClick)}
      </div>
      <div
        className={classnames(buildClassName('overlay')(), overlayClassName, {
          [buildClassName('overlay')('open')]: open,
          [buildClassName('overlay')('closed')]: !open,
          [openOverlayClassName]: open,
          [closedOverlayClassName]: !open,
        })}
        onClick={onCloseClick}
      />
    </div>
  );
};

export default SlideOut;
