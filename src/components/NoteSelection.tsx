import React from 'react';
import classnames from 'classnames';
import { buildBemClassName } from '../modules/util';
import {
  CategorizedNoteGroup,
  categorizeNoteGroups,
  NoteGroupType,
  NoteGroupTypeSelectionMap,
  getNoteGroups,
} from '../modules/note';
import NoteCheckboxGroup, {
  NoteGroupMultiSelectChangeHandler,
} from './NoteCheckboxGroup';

export type NoteGroupChangeHandler = (
  noteGroupType: NoteGroupType,
  checked: boolean
) => void;

export interface NoteSelectionProps {
  noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap;
  onNoteGroupChange: NoteGroupChangeHandler;
  onNoteGroupMultiSelectChange: NoteGroupMultiSelectChangeHandler;
}

const buildClassName = buildBemClassName('c-rr-note-selection');

const NoteSelection = ({
  noteGroupTypeSelectionMap,
  onNoteGroupChange,
  onNoteGroupMultiSelectChange,
}: NoteSelectionProps) => {
  const categorizedNoteGroups: CategorizedNoteGroup[] = categorizeNoteGroups(
    getNoteGroups(...noteGroupTypeSelectionMap.keys())
  );

  return (
    <section
      className={classnames('c-rr-settings-form__section', buildClassName()())}
    >
      <h3 className="c-rr-settings-form__section-title">Note Selection</h3>
      {categorizedNoteGroups.map((categorizedNoteGroup) => {
        return (
          <NoteCheckboxGroup
            category={categorizedNoteGroup.category}
            noteGroups={categorizedNoteGroup.noteGroups}
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
