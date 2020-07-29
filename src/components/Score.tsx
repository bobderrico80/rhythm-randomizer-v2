import React from 'react';
import { NoteDefinition } from '../modules/note';
import Staff from './Staff';
import './Score.scss';
import { TimeSignatureDefinition } from '../modules/time-signature';

export interface ScoreProps {
  timeSignature: TimeSignatureDefinition;
  measures: NoteDefinition[][];
  measuresPerStaff: number;
}

const Score = ({ timeSignature, measures, measuresPerStaff }: ScoreProps) => {
  // TODO: Add types for Staff and Measure definitions to avoid ugly 3D array
  let staffMeasures: NoteDefinition[][][] = [];

  measures.forEach((measure) => {
    if (staffMeasures.length === 0) {
      staffMeasures.push([]);
    }

    const currentStaff = staffMeasures[staffMeasures.length - 1];

    if (currentStaff.length < measuresPerStaff) {
      currentStaff.push(measure);
    } else {
      staffMeasures.push([measure]);
    }
  });

  return (
    <div className="c-rr-score">
      {staffMeasures.map((measures, index) => {
        const startingMeasureIndex = index * measuresPerStaff;
        return (
          <Staff
            timeSignature={timeSignature}
            measures={measures}
            startingMeasureIndex={startingMeasureIndex}
            index={index}
            key={index}
            finalStaff={index === staffMeasures.length - 1}
          />
        );
      })}
    </div>
  );
};

export default Score;
