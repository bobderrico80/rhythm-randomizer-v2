import React from 'react';
import classnames from 'classnames';
import { buildBemClassName } from '../modules/util';
import {
  CategorizedNoteGroup,
  categorizeNoteGroups,
  NoteGroupType,
  NoteGroupTypeSelectionMap,
  getNoteGroups,
  isValidNoteGroupForTimeSignature,
} from '../modules/note';
import NoteCheckboxGroup, {
  NoteGroupMultiSelectChangeHandler,
} from './NoteCheckboxGroup';
import { TimeSignature } from '../modules/time-signature';

export type NoteGroupChangeHandler = (
  noteGroupType: NoteGroupType,
  checked: boolean
) => void;

export interface NoteSelectionProps {
  noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap;
  timeSignature: TimeSignature;
  onNoteGroupChange: NoteGroupChangeHandler;
  onNoteGroupMultiSelectChange: NoteGroupMultiSelectChangeHandler;
}

const buildClassName = buildBemClassName('c-rr-note-selection');

const NoteSelection = ({
  noteGroupTypeSelectionMap,
  timeSignature,
  onNoteGroupChange,
  onNoteGroupMultiSelectChange,
}: NoteSelectionProps) => {
  let noteGroups = getNoteGroups(...noteGroupTypeSelectionMap.keys());

  // Filter note groups that don't match the time signature
  noteGroups = noteGroups.filter((noteGroup) =>
    isValidNoteGroupForTimeSignature(noteGroup, timeSignature)
  );

  const categorizedNoteGroups: CategorizedNoteGroup[] = categorizeNoteGroups(
    noteGroups
  );

  return (
    <section
      className={classnames('c-rr-settings-form__section', buildClassName()())}
    >
      {categorizedNoteGroups.map((categorizedNoteGroup) => {
        return (
          <NoteCheckboxGroup
            category={categorizedNoteGroup.category}
            noteGroups={categorizedNoteGroup.items}
            noteGroupTypeSelectionMap={noteGroupTypeSelectionMap}
            onNoteGroupChange={onNoteGroupChange}
            onNoteGroupMultiSelectChange={onNoteGroupMultiSelectChange}
            key={categorizedNoteGroup.category.type}
          />
        );
      })}
    </section>
  );
};

export default NoteSelection;
