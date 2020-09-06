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
import './NoteSelection.scss';

export type NoteGroupChangeHandler = (
  noteGroupType: NoteGroupType,
  checked: boolean
) => void;

export interface NoteSelectionProps {
  noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap;
  onNoteGroupChange: NoteGroupChangeHandler;
}

const buildClassName = buildBemClassName('c-rr-note-selection');

const NoteSelection = ({
  noteGroupTypeSelectionMap,
  onNoteGroupChange,
}: NoteSelectionProps) => {
  const categorizedNoteGroups: CategorizedNoteGroup[] = categorizeNoteGroups(
    getNoteGroups(...noteGroupTypeSelectionMap.keys())
  );

  const handleNoteGroupChange = (event: React.FormEvent<HTMLInputElement>) => {
    const noteGroupType = event.currentTarget.name as NoteGroupType;
    const checked = event.currentTarget.checked;

    onNoteGroupChange(noteGroupType, checked);
  };

  return (
    <section
      className={classnames('c-rr-settings-form__section', buildClassName()())}
    >
      <h3 className="c-rr-settings-form__section-title">Note Selection</h3>
      {categorizedNoteGroups.map((categorizedNoteGroup) => {
        return (
          <fieldset
            className={buildClassName('fieldset')()}
            key={categorizedNoteGroup.category.type}
          >
            <legend className={buildClassName('legend')()}>
              {categorizedNoteGroup.category.type}
            </legend>
            <div className={buildClassName('label-container')()}>
              {categorizedNoteGroup.noteGroups.map((noteGroup) => {
                const checked = noteGroupTypeSelectionMap.get(noteGroup.type);
                return (
                  <label
                    htmlFor={noteGroup.type}
                    key={noteGroup.type}
                    className={buildClassName('label')()}
                  >
                    <input
                      type="checkbox"
                      id={noteGroup.type}
                      name={noteGroup.type}
                      className={buildClassName('checkbox')()}
                      checked={Boolean(checked)}
                      onChange={handleNoteGroupChange}
                    />
                    <img
                      src={noteGroup.icon}
                      alt={noteGroup.description}
                      title={noteGroup.description}
                      className={classnames(
                        buildClassName('icon')(),
                        buildClassName('icon')(noteGroup.type)
                      )}
                    />
                  </label>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </section>
  );
};

export default NoteSelection;
