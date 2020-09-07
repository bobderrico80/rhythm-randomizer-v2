import React, { useEffect, useRef } from 'react';
import './Score.scss';
import { createScore } from '../modules/vex';
import { ScoreData } from '../modules/score';

export interface ScoreProps {
  scoreData: ScoreData;
  innerWidth: number;
}

const Score = ({ scoreData, innerWidth }: ScoreProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ref = containerRef;

    if (!ref || !ref.current) {
      return;
    }

    if (!scoreData.measures.length) {
      return;
    }

    createScore(ref.current, scoreData, innerWidth);

    return () => {
      if (ref && ref.current) {
        ref.current.innerHTML = '';
      }
    };
  }, [scoreData, innerWidth]);

  return <div className="c-rr-score" id="score" ref={containerRef} />;
};

export default Score;
