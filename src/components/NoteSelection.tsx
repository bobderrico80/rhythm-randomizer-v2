import React, { useContext } from 'react';
import classnames from 'classnames';
import { buildBemClassName } from '../modules/util';
import {
  CategorizedNoteGroup,
  categorizeNoteGroups,
  getNoteGroups,
  isValidNoteGroupForTimeSignature,
} from '../modules/note';
import NoteCheckboxGroup from './NoteCheckboxGroup';
import { AppContext } from '../App';

const buildClassName = buildBemClassName('c-rr-note-selection');

const NoteSelection = () => {
  const { state } = useContext(AppContext);
  const { timeSignature, noteGroupTypeSelectionMap } = state.scoreSettings;

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
            key={categorizedNoteGroup.category.type}
          />
        );
      })}
    </section>
  );
};

export default NoteSelection;
