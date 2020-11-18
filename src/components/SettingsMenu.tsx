import React, { useEffect, useRef, useState } from 'react';
import { buildBemClassName } from '../modules/util';
import IconButton from './IconButton';
import backArrowIcon from '../svg/back-arrow.svg';
import './SettingsMenu.scss';
import SettingsForm from './SettingsForm';
import { NoteGroupTypeSelectionMap } from '../modules/note';
import { NoteGroupChangeHandler } from './NoteSelection';
import { TimeSignature, TimeSignatureType } from '../modules/time-signature';
import { NoteGroupMultiSelectChangeHandler } from './NoteCheckboxGroup';
import SlideOut from './SlideOut';
import ShareButton from './ShareButton';
import { TempoChangeHandler } from './TempoControl';

const buildClassName = buildBemClassName('c-rr-settings-menu');

export interface SettingsMenuProps {
  settingsMenuOpen: boolean;
  openAccordion: string;
  tempo: number;
  noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap;
  timeSignatures: TimeSignature[];
  selectedTimeSignature: TimeSignature;
  measureCountOptions: number[];
  selectedMeasureCount: number;
  errorMessage: string;
  onSettingsMenuCloseClick: () => void;
  onTempoChange: TempoChangeHandler;
  onNoteGroupChange: NoteGroupChangeHandler;
  onNoteGroupMultiSelectChange: NoteGroupMultiSelectChangeHandler;
  onTimeSignatureChange: (newTimeSignature: TimeSignatureType) => void;
  onMeasureCountChange: (measureCount: number) => void;
  onOpenAccordionChange: (openedAccordion: string) => void;
  onShareLinkClick: () => void;
}

const SettingsMenu = ({
  settingsMenuOpen,
  openAccordion,
  tempo,
  noteGroupTypeSelectionMap,
  timeSignatures,
  selectedTimeSignature,
  measureCountOptions,
  selectedMeasureCount,
  errorMessage,
  onSettingsMenuCloseClick,
  onTempoChange,
  onNoteGroupChange,
  onNoteGroupMultiSelectChange,
  onTimeSignatureChange,
  onMeasureCountChange,
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
          tempo={tempo}
          noteGroupTypeSelectionMap={noteGroupTypeSelectionMap}
          timeSignatures={timeSignatures}
          selectedTimeSignature={selectedTimeSignature}
          measureCountOptions={measureCountOptions}
          selectedMeasureCount={selectedMeasureCount}
          errorMessage={errorMessage}
          onTempoChange={onTempoChange}
          onNoteGroupChange={onNoteGroupChange}
          onNoteGroupMultiSelectChange={onNoteGroupMultiSelectChange}
          onTimeSignatureChange={onTimeSignatureChange}
          onMeasureCountChange={onMeasureCountChange}
          onOpenAccordionChange={onOpenAccordionChange}
          onAccordionTransitionComplete={accordionTransitionHandlerRef.current}
        />
      </section>
    );
  };

  return (
    <SlideOut
      open={settingsMenuOpen}
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
