import React, { useEffect, useRef } from 'react';
import classnames from 'classnames';
import './Score.scss';
import { createScore } from '../modules/vex';
import { ScoreData, ScoreDimensionConfig } from '../modules/score';
import { buildBemClassName } from '../modules/util';
import { FormFactor } from '../App';

// All measurements below in px, unless otherwise specified
const scoreDimensionConfig: ScoreDimensionConfig = {
  paddingLeft: 50,
  paddingRight: 50,
  paddingTop: 40,
  paddingBottom: 40,
  maxWidth: 2500,
  systemVerticalOffset: 150,
  defaultMeasureWidth: 300,
  wholeRestCenteringOffset: 0.43, // percent
  wholeRestCenteringFirstMeasureAdditionalOffset: -0.1, // percent
};

const buildClassName = buildBemClassName('c-rr-score');

export interface ScoreProps {
  scoreData: ScoreData;
  innerWidth: number;
  transitioning: boolean;
  currentFormFactor: FormFactor;
  onScoreClick: () => void;
}

const Score = ({
  scoreData,
  innerWidth,
  transitioning,
  currentFormFactor,
  onScoreClick,
}: ScoreProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ref = containerRef;

    if (!ref || !ref.current) {
      return;
    }

    if (!scoreData.measures.length) {
      return;
    }

    const measuresPerSystem = currentFormFactor === FormFactor.DESKTOP ? 4 : 2;

    createScore(
      ref.current,
      scoreData,
      innerWidth,
      measuresPerSystem,
      scoreDimensionConfig
    );

    return () => {
      if (ref && ref.current) {
        ref.current.innerHTML = '';
      }
    };
  }, [scoreData, innerWidth, currentFormFactor]);

  return (
    <button
      className={classnames(buildClassName()(), {
        [buildClassName()('transitioning')]: transitioning,
      })}
      onClick={onScoreClick}
      aria-label="New Rhythm"
      title="Click for New Rhythm"
    >
      <span
        className={buildClassName('container')()}
        id="score"
        ref={containerRef}
      />
    </button>
  );
};

export default Score;
