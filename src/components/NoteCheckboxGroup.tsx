import React, { useEffect, useState, MouseEvent } from 'react';
import classnames from 'classnames';
import { buildBemClassName, TypedItem, findItemOfType } from '../modules/util';
import {
  NoteGroup,
  NoteGroupTypeSelectionMap,
  NoteGroupType,
  NoteGroupCategory,
} from '../modules/note';
import { NoteGroupChangeHandler } from './NoteSelection';
import './NoteCheckboxGroup.scss';
import IconButton from './IconButton';
import selectAllIcon from '../svg/select-all.svg';
import selectNoneIcon from '../svg/select-none.svg';

const buildClassName = buildBemClassName('c-rr-note-checkbox-group');

export enum MultiSelectStatusType {
  SELECT_ALL = 'select-all',
  SELECT_NONE = 'select-none',
}

interface MultiSelectStatus extends TypedItem<MultiSelectStatusType> {
  type: MultiSelectStatusType;
  description: string;
  icon: string;
}

const multiSelectStatuses: MultiSelectStatus[] = [
  {
    type: MultiSelectStatusType.SELECT_ALL,
    description: 'Select all in group',
    icon: selectAllIcon,
  },
  {
    type: MultiSelectStatusType.SELECT_NONE,
    description: 'Select none in group',
    icon: selectNoneIcon,
  },
];

const getMultiSelectStatus = (
  type: MultiSelectStatusType
): MultiSelectStatus => {
  return findItemOfType<MultiSelectStatusType, MultiSelectStatus>(
    type,
    multiSelectStatuses
  );
};

export type NoteGroupMultiSelectChangeHandler = (
  category: NoteGroupCategory,
  multiSelectStatusType: MultiSelectStatusType
) => void;

export interface NoteCheckboxGroupProps {
  category: NoteGroupCategory;
  noteGroups: NoteGroup[];
  noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap;
  onNoteGroupChange: NoteGroupChangeHandler;
  onNoteGroupMultiSelectChange: NoteGroupMultiSelectChangeHandler;
}

const NoteCheckboxGroup = ({
  category,
  noteGroups,
  noteGroupTypeSelectionMap,
  onNoteGroupChange,
  onNoteGroupMultiSelectChange,
}: NoteCheckboxGroupProps) => {
  const [allChecked, setAllChecked] = useState(false);

  useEffect(() => {
    setAllChecked(
      noteGroups.every((noteGroup) =>
        noteGroupTypeSelectionMap.get(noteGroup.type)
      )
    );
  }, [noteGroups, noteGroupTypeSelectionMap]);

  const handleNoteGroupChange = (event: React.FormEvent<HTMLInputElement>) => {
    const noteGroupType = event.currentTarget.name as NoteGroupType;
    const checked = event.currentTarget.checked;

    onNoteGroupChange(noteGroupType, checked);
  };

  const handleMultiSelectClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onNoteGroupMultiSelectChange(
      category,
      allChecked
        ? MultiSelectStatusType.SELECT_NONE
        : MultiSelectStatusType.SELECT_ALL
    );
  };

  const multiSelectStatus = getMultiSelectStatus(
    allChecked
      ? MultiSelectStatusType.SELECT_NONE
      : MultiSelectStatusType.SELECT_ALL
  );

  return (
    <fieldset className={buildClassName()()}>
      <legend className={buildClassName('legend')()}>{category.type}</legend>
      <div className={buildClassName('container')()}>
        <div className={buildClassName('multi-select-container')()}>
          <IconButton
            alt={multiSelectStatus.description}
            svg={multiSelectStatus.icon}
            id={multiSelectStatus.type}
            onClick={handleMultiSelectClick}
            className={buildClassName('multi-select-button')()}
          />
        </div>
        <div className={buildClassName('label-container')()}>
          {noteGroups.map((noteGroup) => {
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
      </div>
    </fieldset>
  );
};

export default NoteCheckboxGroup;
