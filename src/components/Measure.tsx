import React from 'react';
import classnames from 'classnames';
import { NoteDefinition } from '../modules/note';
import Note from './Note';
import './Measure.scss';
import { BarlineType } from '../modules/barline';
import Barline from './Barline';
import { DimensionData } from '../modules/dimension';

export interface MeasureProps {
  noteDefinitions: NoteDefinition[];
  index: number;
  finalMeasure: boolean;
  dimensionData: DimensionData;
}

const Measure = ({
  noteDefinitions,
  index,
  finalMeasure,
  dimensionData,
}: MeasureProps) => {
  return (
    <div className={classnames('c-rr-measure', `c-rr-measure--index-${index}`)}>
      {noteDefinitions.map((noteDefinition, index) => {
        return (
          <Note
            type={noteDefinition.type}
            key={index}
            dimensionData={dimensionData}
          />
        );
      })}
      <Barline
        type={finalMeasure ? BarlineType.FINAL : BarlineType.SINGLE}
        dimensionData={dimensionData}
      />
    </div>
  );
};

export default Measure;
