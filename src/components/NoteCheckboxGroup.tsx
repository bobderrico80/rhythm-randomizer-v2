import React, { useEffect, useState, MouseEvent, useContext } from 'react';
import classnames from 'classnames';
import { buildBemClassName, TypedItem, findItemOfType } from '../modules/util';
import {
  NoteGroup,
  NoteGroupTypeSelectionMap,
  NoteGroupType,
  NoteGroupCategory,
} from '../modules/note';
import './NoteCheckboxGroup.scss';
import IconButton from './IconButton';
import selectAllIcon from '../svg/select-all.svg';
import selectNoneIcon from '../svg/select-none.svg';
import { AppContext } from '../App';
import { ActionType } from '../modules/reducer';
import Checkbox from './Checkbox';

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
    description: 'Select all',
    icon: selectAllIcon,
  },
  {
    type: MultiSelectStatusType.SELECT_NONE,
    description: 'Deselect all',
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
export interface NoteCheckboxGroupProps {
  category: NoteGroupCategory;
  noteGroups: NoteGroup[];
  noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap;
}

const NoteCheckboxGroup = ({
  category,
  noteGroups,
  noteGroupTypeSelectionMap,
}: NoteCheckboxGroupProps) => {
  const { dispatch } = useContext(AppContext);
  const [allChecked, setAllChecked] = useState(false);

  useEffect(() => {
    setAllChecked(
      noteGroups.every((noteGroup) =>
        noteGroupTypeSelectionMap.get(noteGroup.type)
      )
    );
  }, [noteGroups, noteGroupTypeSelectionMap]);

  const handleNoteGroupChange = (checked: boolean, id: string) => {
    const noteGroupType = id as NoteGroupType;
    dispatch({
      type: ActionType.SET_NOTE_GROUP_SELECTION,
      noteGroupType,
      value: checked,
    });
  };

  const handleMultiSelectClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    dispatch({
      type: ActionType.SET_NOTE_GROUP_SELECTIONS_FOR_CATEGORY,
      category,
      multiSelectStatusType: allChecked
        ? MultiSelectStatusType.SELECT_NONE
        : MultiSelectStatusType.SELECT_ALL,
    });
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
            alt={`${multiSelectStatus.description} ${category.type}`}
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
              <Checkbox
                key={noteGroup.type}
                id={noteGroup.type}
                labelClassName={buildClassName('label')()}
                className={buildClassName('checkbox')()}
                checked={Boolean(checked)}
                onChange={handleNoteGroupChange}
                renderLabel={() => {
                  return (
                    <img
                      src={noteGroup.icon}
                      alt={noteGroup.description}
                      title={noteGroup.description}
                      className={classnames(
                        buildClassName('icon')(),
                        buildClassName('icon')(noteGroup.type)
                      )}
                    />
                  );
                }}
              />
            );
          })}
        </div>
      </div>
    </fieldset>
  );
};

export default NoteCheckboxGroup;
