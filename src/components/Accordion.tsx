import React, { useState, useEffect, useRef } from 'react';
import classnames from 'classnames';
import { buildBemClassName } from '../modules/util';
import caretRightIcon from '../svg/caret-right.svg';
import './Accordion.scss';
import { useTranslation } from 'react-i18next';

export interface AccordionProps {
  renderButtonContents: (open: boolean) => JSX.Element | string | null;
  renderPaneContents: (handleClose: () => void) => JSX.Element | string | null;
  paneLabel: string;
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
  onTransitionComplete?: (open: boolean, id: string) => void;
}

const buildClassName = buildBemClassName('c-rr-accordion');

const Accordion = ({
  renderButtonContents,
  renderPaneContents,
  id,
  isOpen,
  paneLabel,
  buttonClassName = '',
  containerClassName = '',
  openContainerClassName = '',
  closedContainerClassName = '',
  paneClassName = '',
  openPaneClassName = '',
  closedPaneClassName = '',
  onToggleClick,
  onTransitionComplete,
}: AccordionProps) => {
  const { t } = useTranslation();
  const COLLAPSE_TEXT = t('collapse');
  const EXPAND_TEXT = t('expand');

  const [open, setOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [neverOpened, setNeverOpened] = useState(true);

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

  useEffect(() => {
    if (open) {
      setNeverOpened(false);
    }
  }, [open]);

  // Handle expand/collapse animations when `open` changes
  useEffect(() => {
    if (!paneNode.current) {
      return;
    }

    const pane = paneNode.current;

    // Don't run the close transition on first render
    if (!initialized && !open) {
      pane.style.height = '0px';
      pane.style.visibility = 'hidden';
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

          if (!neverOpened) {
            const handleTransition = () => {
              pane.removeEventListener('transitionend', handleTransition);
              pane.style.visibility = 'hidden';

              if (onTransitionComplete) {
                onTransitionComplete(false, id);
              }
            };
            pane.addEventListener('transitionend', handleTransition);
          }
        });
      });
    } else {
      // Expand section
      pane.style.height = `${paneHeight}px`;
      pane.style.visibility = '';

      const handleTransition = () => {
        pane.removeEventListener('transitionend', handleTransition);
        pane.style.height = '';

        if (onTransitionComplete) {
          onTransitionComplete(true, id);
        }
      };

      pane.addEventListener('transitionend', handleTransition);
    }
  }, [open, initialized, id, neverOpened, onTransitionComplete]);

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
      data-testid="accordion__container"
      className={classnames(buildClassName()(), containerClassName, {
        [openContainerClassName]: open,
        [closedContainerClassName]: !open,
        [buildClassName()('open')]: open,
        [buildClassName()('closed')]: !open,
      })}
    >
      <button
        id={`${id}-trigger`}
        className={classnames(buildClassName('button')(), buttonClassName)}
        aria-expanded={open}
        aria-controls={id}
        type="button"
        onClick={handleToggleClick}
      >
        <img
          src={caretRightIcon}
          alt={open ? COLLAPSE_TEXT : EXPAND_TEXT}
          className={classnames(buildClassName('button-caret')(), {
            [buildClassName('button-caret')('open')]: open,
            [buildClassName('button-caret')('closed')]: !open,
          })}
          title={open ? COLLAPSE_TEXT : EXPAND_TEXT}
        />
        {renderButtonContents(open)}
      </button>
      <div
        data-testid="accordion__pane"
        className={classnames(buildClassName('pane')(), paneClassName, {
          [openPaneClassName]: open,
          [closedPaneClassName]: !open,
          [buildClassName('pane')('open')]: open,
          [buildClassName('pane')('closed')]: !open,
        })}
        aria-hidden={!open}
        role="region"
        aria-label={paneLabel}
        ref={paneNode}
        id={id}
      >
        {renderPaneContents(closePane)}
      </div>
    </div>
  );
};

export default Accordion;
