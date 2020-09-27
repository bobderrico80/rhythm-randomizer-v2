import React, { useEffect, useRef } from 'react';
import classnames from 'classnames';
import './Score.scss';
import { createScore } from '../modules/vex';
import { ScoreData } from '../modules/score';
import { buildBemClassName } from '../modules/util';
import { FormFactor } from '../App';

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

    createScore(ref.current, scoreData, innerWidth, measuresPerSystem);

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
