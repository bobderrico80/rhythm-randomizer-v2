import React, { useEffect, useRef } from 'react';
import classnames from 'classnames';
import { buildBemClassName } from '../modules/util';
import IconButton from './IconButton';
import backArrowIcon from '../svg/back-arrow.svg';
import './SettingsMenu.scss';
import SettingsForm from './SettingsForm';
import { NoteGroupTypeSelectionMap } from '../modules/note';
import { NoteGroupChangeHandler } from './NoteSelection';
import { TimeSignature, TimeSignatureType } from '../modules/time-signature';

const buildClassName = buildBemClassName('c-rr-settings-menu');
const buildPaneClassName = buildClassName('pane');
const buildOverlayClassName = buildClassName('overlay');

export interface SettingsMenuProps {
  settingsMenuOpen: boolean;
  noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap;
  timeSignatures: TimeSignature[];
  selectedTimeSignature: TimeSignature;
  measureCountOptions: number[];
  selectedMeasureCount: number;
  errorMessage: string;
  onSettingsMenuCloseClick: () => void;
  onNoteGroupChange: NoteGroupChangeHandler;
  onTimeSignatureChange: (newTimeSignature: TimeSignatureType) => void;
  onMeasureCountChange: (measureCount: number) => void;
}

const SettingsMenu = ({
  settingsMenuOpen,
  noteGroupTypeSelectionMap,
  timeSignatures,
  selectedTimeSignature,
  measureCountOptions,
  selectedMeasureCount,
  errorMessage,
  onSettingsMenuCloseClick,
  onNoteGroupChange,
  onTimeSignatureChange,
  onMeasureCountChange,
}: SettingsMenuProps) => {
  const paneRef = useRef<HTMLDivElement>(null);

  // Handle closing menu with escape key
  useEffect(() => {
    const escapePane = (event: KeyboardEvent) => {
      // If escape key is pressed...
      if (event.keyCode === 27) {
        onSettingsMenuCloseClick();
      }
    };

    document.addEventListener('keydown', escapePane);

    return () => {
      document.removeEventListener('keydown', escapePane);
    };
  }, [onSettingsMenuCloseClick]);

  // Scroll pane to top when error message appears
  useEffect(() => {
    if (errorMessage) {
      paneRef.current?.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
    }
  }, [errorMessage]);

  return (
    <div
      className={classnames(buildClassName()(), {
        [buildClassName()('open')]: settingsMenuOpen,
      })}
      aria-hidden={!settingsMenuOpen}
    >
      <section
        className={classnames(buildPaneClassName(), {
          [buildPaneClassName('open')]: settingsMenuOpen,
        })}
        ref={paneRef}
      >
        <IconButton
          className={buildClassName('close-button')()}
          svg={backArrowIcon}
          alt="Close Settings Menu"
          onClick={onSettingsMenuCloseClick}
        />
        <SettingsForm
          noteGroupTypeSelectionMap={noteGroupTypeSelectionMap}
          timeSignatures={timeSignatures}
          selectedTimeSignature={selectedTimeSignature}
          measureCountOptions={measureCountOptions}
          selectedMeasureCount={selectedMeasureCount}
          errorMessage={errorMessage}
          onNoteGroupChange={onNoteGroupChange}
          onTimeSignatureChange={onTimeSignatureChange}
          onMeasureCountChange={onMeasureCountChange}
        />
      </section>
      <div
        className={classnames(buildOverlayClassName(), {
          [buildOverlayClassName('open')]: settingsMenuOpen,
        })}
        onClick={onSettingsMenuCloseClick}
      />
    </div>
  );
};

export default SettingsMenu;
