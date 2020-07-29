import React from 'react';
import classnames from 'classnames';
import ScoreElement from './ScoreElement';
import {
  TimeSignatureType,
  getTimeSignatureDefinition,
} from '../modules/time-signature';
import { DimensionData } from '../modules/dimension';

export interface TimeSignatureProps {
  type: TimeSignatureType;
  dimensionData: DimensionData;
}

const TimeSignature = ({ type, dimensionData }: TimeSignatureProps) => {
  const definition = getTimeSignatureDefinition(type);

  return (
    <div
      className={classnames(
        'c-rr-time-signature',
        `c-rr-time-signature-${type}`
      )}
    >
      <ScoreElement definition={definition} dimensionData={dimensionData} />
    </div>
  );
};

export default TimeSignature;
