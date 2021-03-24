import React, { useEffect, useRef, useState } from 'react';
import { buildBemClassName } from '../modules/util';
import IconButton from './IconButton';
import backArrowIcon from '../svg/back-arrow.svg';
import './SettingsMenu.scss';
import SettingsForm from './SettingsForm';
import { TimeSignature } from '../modules/time-signature';
import SlideOut from './SlideOut';
import ShareButton from './ShareButton';

const buildClassName = buildBemClassName('c-rr-settings-menu');

export interface SettingsMenuProps {
  settingsMenuOpen: boolean;
  openAccordion: string;
  timeSignatures: TimeSignature[];
  measureCountOptions: number[];
  errorMessage: string;
  onSettingsMenuCloseClick: () => void;
  onOpenAccordionChange: (openedAccordion: string) => void;
  onShareLinkClick: () => void;
}

const SettingsMenu = ({
  settingsMenuOpen,
  openAccordion,
  timeSignatures,
  measureCountOptions,
  errorMessage,
  onSettingsMenuCloseClick,
  onOpenAccordionChange,
  onShareLinkClick,
}: SettingsMenuProps) => {
  const [lastOpenedAccordion, setLastOpenedAccordion] = useState('');

  const accordionTransitionHandlerRef = useRef<
    (open: boolean, id: string) => void
  >((open: boolean, id: string) => {
    if (open) {
      setLastOpenedAccordion(id);
    }
  });

  // Handle closing menu with escape key
  useEffect(() => {
    const escapePane = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onSettingsMenuCloseClick();
      }
    };

    document.addEventListener('keydown', escapePane);

    return () => {
      document.removeEventListener('keydown', escapePane);
    };
  }, [onSettingsMenuCloseClick]);

  const renderSettingsMenuPane = (open: boolean, onCloseClick: () => void) => {
    return (
      <section>
        <div className={buildClassName('button-container')()}>
          <IconButton
            className={buildClassName('close-button')()}
            svg={backArrowIcon}
            alt="Close Settings Menu"
            onClick={onCloseClick}
            id="settings-menu-close"
          />
          <ShareButton onShareSettingsClick={onShareLinkClick} />
        </div>
        <SettingsForm
          openAccordion={openAccordion}
          timeSignatures={timeSignatures}
          measureCountOptions={measureCountOptions}
          errorMessage={errorMessage}
          onOpenAccordionChange={onOpenAccordionChange}
          onAccordionTransitionComplete={accordionTransitionHandlerRef.current}
        />
      </section>
    );
  };

  return (
    <SlideOut
      open={settingsMenuOpen}
      label="Settings Menu"
      onCloseClick={onSettingsMenuCloseClick}
      renderPane={renderSettingsMenuPane}
      paneClassName={buildClassName('pane')()}
      openPaneClassName={buildClassName('pane')('open')}
      scrollToTop={Boolean(errorMessage)}
      focusDependency={lastOpenedAccordion}
    />
  );
};

export default SettingsMenu;
