import React, { useState, useEffect, useRef } from 'react';
import classnames from 'classnames';
import { buildBemClassName } from '../modules/util';
import caretRightIcon from '../svg/caret-right.svg';
import './Accordion.scss';

export interface AccordionProps {
  renderButtonContents: (open: boolean) => JSX.Element | string | null;
  renderPaneContents: (handleClose: () => void) => JSX.Element | string | null;
  id: string;
  isOpen?: boolean;
  buttonClassName?: string;
  containerClassName?: string;
  openContainerClassName?: string;
  closedContainerClassName?: string;
  paneClassName?: string;
  openPaneClassName?: string;
  closedPaneClassName?: string;
  onToggleClick?: (toggledId: string, nextOpenState: boolean) => void;
}

const buildClassName = buildBemClassName('c-rr-accordion');

const Accordion = ({
  renderButtonContents,
  renderPaneContents,
  id,
  isOpen,
  buttonClassName = '',
  containerClassName = '',
  openContainerClassName = '',
  closedContainerClassName = '',
  paneClassName = '',
  openPaneClassName = '',
  closedPaneClassName = '',
  onToggleClick,
}: AccordionProps) => {
  const [open, setOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const paneNode = useRef<HTMLDivElement>(null);

  // Set component as initialized after first render
  useEffect(() => {
    setInitialized(true);
  }, []);

  // Override internal state if isOpen is passed-in
  useEffect(() => {
    if (typeof isOpen !== 'undefined') {
      setOpen(isOpen);
    }
  }, [isOpen]);

  // Handle expand/collapse animations when `open` changes
  useEffect(() => {
    if (!paneNode.current) {
      return;
    }

    const pane = paneNode.current;

    // Don't run the close transition on first render
    if (!initialized && !open) {
      pane.style.height = '0px';
      return;
    }

    const paneHeight = pane.scrollHeight;

    if (!open) {
      // Collapse section
      const paneTransition = pane.style.transition;

      pane.style.transition = '';

      requestAnimationFrame(() => {
        pane.style.height = `${paneHeight}px`;
        pane.style.transition = paneTransition;

        requestAnimationFrame(() => {
          pane.style.height = '0px';
        });
      });
    } else {
      // Expand section
      pane.style.height = `${paneHeight}px`;

      const handleTransition = () => {
        pane.removeEventListener('transitioned', handleTransition);
        delete pane.style.height;
      };

      pane.addEventListener('transitioned', handleTransition);
    }
  }, [open, initialized]);

  const handleToggleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (onToggleClick) {
      onToggleClick(id, !open);
    } else {
      setOpen((currentlyOpen) => !currentlyOpen);
    }
  };

  const closePane = () => {
    setOpen(false);
  };

  return (
    <div
      className={classnames(buildClassName()(), containerClassName, {
        [openContainerClassName]: open,
        [closedContainerClassName]: !open,
        [buildClassName()('open')]: open,
        [buildClassName()('closed')]: !open,
      })}
    >
      <button
        className={classnames(buildClassName('button')(), buttonClassName)}
        aria-expanded={open}
        type="button"
        onClick={handleToggleClick}
      >
        <img
          src={caretRightIcon}
          alt={open ? 'Collapse' : 'Expand'}
          className={classnames(buildClassName('button-caret')(), {
            [buildClassName('button-caret')('open')]: open,
            [buildClassName('button-caret')('closed')]: !open,
          })}
          title={open ? 'Collapse' : 'Expand'}
        />
        {renderButtonContents(open)}
      </button>
      <div
        className={classnames(buildClassName('pane')(), paneClassName, {
          [openPaneClassName]: open,
          [closedPaneClassName]: !open,
          [buildClassName('pane')('open')]: open,
          [buildClassName('pane')('closed')]: !open,
        })}
        aria-hidden={!open}
        ref={paneNode}
      >
        {renderPaneContents(closePane)}
      </div>
    </div>
  );
};

export default Accordion;
