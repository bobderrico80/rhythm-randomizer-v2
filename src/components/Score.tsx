import React, { useEffect, useRef } from 'react';
import './Score.scss';
import { createScore, Measure } from '../modules/vex';
import { TimeSignature } from '../modules/time-signature';

export interface ScoreProps {
  timeSignature: TimeSignature;
  measures: Measure[];
  innerWidth: number;
}

const Score = ({ timeSignature, measures, innerWidth }: ScoreProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ref = containerRef;

    if (!ref || !ref.current) {
      return;
    }

    createScore(ref.current, measures, timeSignature, innerWidth);

    return () => {
      if (ref && ref.current) {
        ref.current.innerHTML = '';
      }
    };
  }, [timeSignature, measures, innerWidth]);

  return <div className="c-rr-score" id="score" ref={containerRef} />;
};

export default Score;
