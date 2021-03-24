import React, { useEffect, useRef } from 'react';
import classnames from 'classnames';
import './Score.scss';
import { createScore } from '../modules/vex';
import { ScoreData, ScoreDimensionConfig } from '../modules/score';
import { buildBemClassName } from '../modules/util';
import { FormFactor } from '../App';

// All measurements below in px, unless otherwise specified
export const scoreDimensionConfig: ScoreDimensionConfig = {
  paddingLeft: 50,
  paddingRight: 50,
  paddingTop: 40,
  paddingBottom: 40,
  maxWidth: 2500,
  systemVerticalOffset: 150,
  defaultMeasureWidth: 300,
  wholeRestCenteringOffset: 0.43, // percent
  wholeRestCenteringFirstMeasureAdditionalOffset: -0.1, // percent
  dottedWholeRestCenteringAdditionalOffset: -0.05, // percent
};

const buildClassName = buildBemClassName('c-rr-score');

export interface ScoreProps {
  scoreData: ScoreData;
  innerWidth: number;
  transitioning: boolean;
  currentFormFactor: FormFactor;
  playingNoteIndex: number | null;
  onScoreClick: () => void;
}

const Score = ({
  scoreData,
  innerWidth,
  transitioning,
  currentFormFactor,
  playingNoteIndex,
  onScoreClick,
}: ScoreProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const noteHeadsRef = useRef<NodeListOf<HTMLElement> | null>(null);

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

    if (containerRef.current) {
      noteHeadsRef.current = containerRef.current.querySelectorAll(
        '.vf-notehead path'
      );
    }

    return () => {
      if (ref && ref.current) {
        ref.current.innerHTML = '';
      }
      noteHeadsRef.current = null;
    };
  }, [scoreData, innerWidth, currentFormFactor]);

  useEffect(() => {
    if (noteHeadsRef.current) {
      if (playingNoteIndex !== null) {
        // Reset previous note
        if (noteHeadsRef.current[playingNoteIndex - 1]) {
          noteHeadsRef.current[playingNoteIndex - 1].style.fill = '';
        }

        // Set current note to red;
        noteHeadsRef.current[playingNoteIndex].style.fill = 'red';
      } else {
        // reset all notes
        [...noteHeadsRef.current].forEach(
          (noteHead) => (noteHead.style.fill = '')
        );
      }
    }
  }, [playingNoteIndex]);

  return (
    <button
      type="button"
      className={classnames(buildClassName()(), {
        [buildClassName()('transitioning')]: transitioning,
      })}
      onClick={onScoreClick}
      aria-hidden="true"
      title="Click for New Rhythm"
      data-testid="score__button"
    >
      <span
        data-testid="score"
        className={buildClassName('container')()}
        id="score"
        ref={containerRef}
      />
    </button>
  );
};

export default Score;
