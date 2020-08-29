import React from 'react';
import './SettingsForm.scss';
import { buildBemClassName } from '../modules/util';
import NoteSelection, { NoteGroupChangeHandler } from './NoteSelection';
import { NoteGroupType, NoteGroupTypeSelectionMap } from '../modules/note';

export interface SettingsFormProps {
  noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap;
  onNoteGroupChange: NoteGroupChangeHandler;
}

const buildClassName = buildBemClassName('c-rr-settings-form');

const SettingsForm = ({
  onNoteGroupChange,
  noteGroupTypeSelectionMap,
}: SettingsFormProps) => {
  return (
    <form className={buildClassName()()}>
      <NoteSelection
        onNoteGroupChange={onNoteGroupChange}
        noteGroupTypeSelectionMap={noteGroupTypeSelectionMap}
      />
    </form>
  );
};

export default SettingsForm;
