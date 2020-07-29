import React from 'react';
import classnames from 'classnames';
import ScoreElement from './ScoreElement';
import { ClefType, getClefDefinition } from '../modules/clef';
import { DimensionData } from '../modules/dimension';
import './Clef.scss';

export interface ClefProps {
  type: ClefType;
  dimensionData: DimensionData;
}

const Clef = ({ type, dimensionData }: ClefProps) => {
  const definition = getClefDefinition(type);

  return (
    <div className={classnames('c-rr-clef', `c-rr-clef-${type}`)}>
      <ScoreElement definition={definition} dimensionData={dimensionData} />
    </div>
  );
};

export default Clef;
