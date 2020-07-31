import React, { useEffect, useRef } from 'react';
import './Score.scss';
import { createScore, Measure } from '../modules/vex';
import { TimeSignature } from '../modules/time-signature';

export interface ScoreProps {
  timeSignature: TimeSignature;
  measures: Measure[];
}

const Score = ({ timeSignature, measures }: ScoreProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ref = containerRef;

    if (!ref || !ref.current) {
      return;
    }

    createScore(ref.current, measures, timeSignature);

    return () => {
      if (ref && ref.current) {
        ref.current.innerHTML = '';
      }
    };
  }, [timeSignature, measures]);

  return <div id="score" ref={containerRef} />;
};

export default Score;
