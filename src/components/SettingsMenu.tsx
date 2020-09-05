import React, { useEffect } from 'react';
import classnames from 'classnames';
import { buildBemClassName } from '../modules/util';
import IconButton from './IconButton';
import backArrowIcon from '../svg/back-arrow.svg';
import './SettingsMenu.scss';
import SettingsForm from './SettingsForm';
import { NoteGroupTypeSelectionMap } from '../modules/note';
import { NoteGroupChangeHandler } from './NoteSelection';

const buildClassName = buildBemClassName('c-rr-settings-menu');
const buildPaneClassName = buildClassName('pane');
const buildOverlayClassName = buildClassName('overlay');

export interface SettingsMenuProps {
  settingsMenuOpen: boolean;
  noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap;
  errorMessage: string;
  onSettingsMenuCloseClick: () => void;
  onNoteGroupChange: NoteGroupChangeHandler;
}

const SettingsMenu = ({
  settingsMenuOpen,
  noteGroupTypeSelectionMap,
  errorMessage,
  onSettingsMenuCloseClick,
  onNoteGroupChange,
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
          errorMessage={errorMessage}
          onNoteGroupChange={onNoteGroupChange}
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
