import React from 'react';
import { NoteDefinition } from '../modules/note';
import Measure from './Measure';
import './Staff.scss';
import { ScoreElementDefinition } from '../modules/score';
import { ClefType, getClefDefinition } from '../modules/clef';
import { TimeSignatureDefinition } from '../modules/time-signature';
import { getBarlineDefinition, BarlineType } from '../modules/barline';
import {
  getTotalWidthUnits,
  getStaffDimensionData,
  getStaffStyle,
} from '../modules/dimension';
import Clef from './Clef';
import TimeSignature from './TimeSignature';

export interface StaffProps {
  measures: NoteDefinition[][];
  timeSignature: TimeSignatureDefinition;
  index: number;
  startingMeasureIndex: number;
  finalStaff: boolean;
}

const getStaffTotalWidthUnits = (
  timeSignature: TimeSignatureDefinition,
  measures: NoteDefinition[][],
  firstStaff: boolean,
  finalStaff: boolean
) => {
  // Count the clef
  const definitions: ScoreElementDefinition<any>[] = [
    getClefDefinition(ClefType.PERCUSSION),
  ];

  // If first staff, count the time signature
  if (firstStaff) {
    definitions.push(timeSignature);
  }

  // If final staff, count single barlines for each non-final measure, plus the
  // final barline. For non-final staff, count a barline for each measure
  if (finalStaff) {
    for (let i = 0; i < measures.length - 1; i++) {
      definitions.push(getBarlineDefinition(BarlineType.SINGLE));
    }
    definitions.push(getBarlineDefinition(BarlineType.FINAL));
  } else {
    for (let i = 0; i < measures.length; i++) {
      definitions.push(getBarlineDefinition(BarlineType.SINGLE));
    }
  }

  // Count each note in each measure
  measures.forEach((measure) => {
    measure.forEach((noteDefinition) => {
      definitions.push(noteDefinition);
    });
  });

  return getTotalWidthUnits(definitions);
};

const Staff = ({
  measures,
  timeSignature,
  startingMeasureIndex,
  index,
  finalStaff,
}: StaffProps) => {
  const firstStaff = index === 0;
  const totalWidthUnits = getStaffTotalWidthUnits(
    timeSignature,
    measures,
    firstStaff,
    finalStaff
  );

  const dimensionData = getStaffDimensionData(
    window.innerWidth,
    measures.length,
    totalWidthUnits
  );

  return (
    <div className="c-rr-staff" style={getStaffStyle(dimensionData)}>
      <Clef type={ClefType.PERCUSSION} dimensionData={dimensionData} />
      {index === 0 && (
        <TimeSignature
          type={timeSignature.type}
          dimensionData={dimensionData}
        />
      )}
      {measures.map((measure, index) => {
        const measureIndex = startingMeasureIndex + index;
        return (
          <Measure
            noteDefinitions={measure}
            key={measureIndex}
            index={measureIndex}
            finalMeasure={finalStaff && index === measures.length - 1}
            dimensionData={dimensionData}
          />
        );
      })}
    </div>
  );
};

export default Staff;
