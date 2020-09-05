import React from 'react';
import './SettingsForm.scss';
import { buildBemClassName } from '../modules/util';
import NoteSelection, { NoteGroupChangeHandler } from './NoteSelection';
import { NoteGroupTypeSelectionMap } from '../modules/note';

export interface SettingsFormProps {
  noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap;
  errorMessage: string;
  onNoteGroupChange: NoteGroupChangeHandler;
}

const buildClassName = buildBemClassName('c-rr-settings-form');

const SettingsForm = ({
  onNoteGroupChange,
  errorMessage,
  noteGroupTypeSelectionMap,
}: SettingsFormProps) => {
  return (
    <form className={buildClassName()()}>
      {errorMessage && (
        <p className={buildClassName('error-message')()}>{errorMessage}</p>
      )}
      <NoteSelection
        onNoteGroupChange={onNoteGroupChange}
        noteGroupTypeSelectionMap={noteGroupTypeSelectionMap}
      />
    </form>
  );
};

export default SettingsForm;
