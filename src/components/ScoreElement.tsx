import React from 'react';
import classnames from 'classnames';
import { ScoreElementDefinition } from '../modules/score';
import { DimensionData, getScoreElementStyle } from '../modules/dimension';
import './ScoreElement.scss';

export interface ScoreElementProps {
  definition: ScoreElementDefinition<any>;
  dimensionData: DimensionData;
}

const ScoreElement = ({ definition, dimensionData }: ScoreElementProps) => {
  const { svgPath, description, type, widthUnit } = definition;
  const svg = require(`../svg/${svgPath}.svg`);

  return (
    <div
      style={getScoreElementStyle(dimensionData, widthUnit)}
      className={classnames(
        'c-rr-score-element',
        `c-rr-score-element--${type}`
      )}
    >
      <img src={svg} alt={description} className="c-rr-score-element__image" />
    </div>
  );
};

export default ScoreElement;
