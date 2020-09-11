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

const FOCUSABLE_ELEMENTS =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

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
      if (event.key === 'Escape') {
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

  // Trap focus
  useEffect(() => {
    if (!settingsMenuOpen) {
      return;
    }

    const pane = paneRef.current;

    if (!pane) {
      return;
    }

    const focusableElements = pane.querySelectorAll<HTMLElement>(
      FOCUSABLE_ELEMENTS
    );
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement =
      focusableElements[focusableElements.length - 1];

    console.log(focusableElements);

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

    // Position 0 is assumed to be close button, so start focus after that
    // TODO: Make this less brittle
    focusableElements[1].focus();

    return () => {
      document.removeEventListener('keydown', handleTab);
    };
  }, [settingsMenuOpen]);

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
          id="settings-menu-close"
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
