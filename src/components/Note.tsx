import React from 'react';
import classnames from 'classnames';
import { getNoteDefinition, NoteType } from '../modules/note';
import './Note.scss';
import ScoreElement from './ScoreElement';
import { DimensionData } from '../modules/dimension';

export interface NoteProps {
  type: NoteType;
  dimensionData: DimensionData;
}

const Note = ({ type, dimensionData }: NoteProps) => {
  const definition = getNoteDefinition(type);

  return (
    <div className={classnames('c-rr-note', `c-rr-note--${type}`)}>
      <ScoreElement definition={definition} dimensionData={dimensionData} />
    </div>
  );
};

export default Note;
