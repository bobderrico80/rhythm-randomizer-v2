import React, { useEffect } from 'react';
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
  errorMessage: string;
  onSettingsMenuCloseClick: () => void;
  onNoteGroupChange: NoteGroupChangeHandler;
  onTimeSignatureChange: (newTimeSignature: TimeSignatureType) => void;
}

const SettingsMenu = ({
  settingsMenuOpen,
  noteGroupTypeSelectionMap,
  timeSignatures,
  selectedTimeSignature,
  errorMessage,
  onSettingsMenuCloseClick,
  onNoteGroupChange,
  onTimeSignatureChange,
}: SettingsMenuProps) => {
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
          errorMessage={errorMessage}
          onNoteGroupChange={onNoteGroupChange}
          onTimeSignatureChange={onTimeSignatureChange}
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
