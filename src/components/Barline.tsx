import React from 'react';
import classnames from 'classnames';
import ScoreElement from './ScoreElement';
import { BarlineType, getBarlineDefinition } from '../modules/barline';
import { DimensionData } from '../modules/dimension';
import './Barline.scss';

export interface BarlineProps {
  type: BarlineType;
  dimensionData: DimensionData;
}

const Barline = ({ type, dimensionData }: BarlineProps) => {
  const definition = getBarlineDefinition(type);

  return (
    <div className={classnames('c-rr-barline', `c-rr-barline-${type}`)}>
      <ScoreElement definition={definition} dimensionData={dimensionData} />
    </div>
  );
};

export default Barline;
