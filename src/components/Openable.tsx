import React, { useState, useRef, useEffect } from 'react';
import classnames from 'classnames';

const PANE_CLOSE_DELAY = 1000;

export interface OpenableProps {
  renderButtonContents: (open: boolean) => JSX.Element | string | null;
  renderPaneContents: (handleClose: () => void) => JSX.Element | string | null;
  buttonClassName?: string;
  containerClassName?: string;
  openContainerClassName?: string;
  closedContainerClassName?: string;
  paneClassName?: string;
  openPaneClassName?: string;
  closedPaneClassName?: string;
  autoClose?: boolean;
}

const Openable = ({
  renderButtonContents,
  renderPaneContents,
  buttonClassName = '',
  containerClassName = '',
  openContainerClassName = '',
  closedContainerClassName = '',
  paneClassName = '',
  openPaneClassName = '',
  closedPaneClassName = '',
  autoClose = true,
}: OpenableProps) => {
  const [open, setOpen] = useState(false);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  const node = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.addEventListener('mousedown', closeNonTargetPane);
    document.addEventListener('keydown', escapePane);

    return () => {
      document.removeEventListener('mousedown', closeNonTargetPane);
      document.removeEventListener('keydown', escapePane);
    };
  });

  const escapePane = (event: KeyboardEvent) => {
    // If escape key is pressed...
    if (event.keyCode === 27) {
      closePane();
    }
  };

  const closeNonTargetPane = (event: MouseEvent) => {
    const target = event.target as HTMLElement;

    if (node?.current?.contains(target)) {
      return;
    }

    closePane();
  };

  const togglePane = () => {
    setOpen((open) => !open);
  };

  const closePane = () => {
    setOpen(false);
  };

  const closePaneOnDelay = () => {
    if (!autoClose) {
      return;
    }

    const id = window.setTimeout(() => {
      closePane();
    }, PANE_CLOSE_DELAY);

    setTimeoutId(id);
  };

  const clearTimeoutOnMouseOver = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };

  return (
    <div
      className={classnames(containerClassName, {
        [openContainerClassName]: open,
        [closedContainerClassName]: !open,
      })}
      ref={node}
    >
      <button
        className={classnames('e-rr-button', buttonClassName)}
        aria-expanded={open}
        type="button"
        onClick={togglePane}
        onMouseOver={clearTimeoutOnMouseOver}
        onMouseLeave={closePaneOnDelay}
      >
        {renderButtonContents(open)}
      </button>
      <div
        className={classnames(paneClassName, {
          [openPaneClassName]: open,
          [closedPaneClassName]: !open,
        })}
        onMouseOver={clearTimeoutOnMouseOver}
        onMouseLeave={closePaneOnDelay}
        aria-hidden={!open}
      >
        {renderPaneContents(closePane)}
      </div>
    </div>
  );
};

export default Openable;
