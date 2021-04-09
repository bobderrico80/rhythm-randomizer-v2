import { render, RenderResult, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { FormFactor } from '../App';
import { getGeneratedNoteGroups } from '../modules/note';
import { NoteGroupType } from '../modules/note-definition';
import { getTimeSignature, TimeSignatureType } from '../modules/time-signature';
import * as vex from '../modules/vex';
import Score, { scoreDimensionConfig } from './Score';

describe('The <Score /> component', () => {
  let scoreClickHandler: jest.Mock;
  let createScoreSpy: jest.SpyInstance;

  const scoreData = {
    measures: [
      { noteGroups: getGeneratedNoteGroups(NoteGroupType.H, NoteGroupType.H) },
    ],
    timeSignature: getTimeSignature(TimeSignatureType.SIMPLE_4_4),
  };

  beforeEach(() => {
    scoreClickHandler = jest.fn();
    createScoreSpy = jest.spyOn(vex, 'createScore');
  });

  afterEach(() => {
    createScoreSpy.mockRestore();
  });

  describe('button behavior', () => {
    beforeEach(() => {
      render(
        <Score
          scoreData={scoreData}
          innerWidth={1200}
          transitioning={false}
          currentFormFactor={FormFactor.DESKTOP}
          playingNoteIndex={null}
          onScoreClick={scoreClickHandler}
        />
      );
    });

    it('renders a non-accessible button', () => {
      expect(screen.getByTestId('score__button')).toBeInTheDocument();
    });

    it('calls `onScoreClick` when the button is clicked', () => {
      userEvent.click(screen.getByTestId('score__button'));
      expect(scoreClickHandler).toHaveBeenCalled();
    });
  });

  describe('on DESKTOP form factors', () => {
    beforeEach(() => {
      render(
        <Score
          scoreData={scoreData}
          innerWidth={1200}
          transitioning={false}
          currentFormFactor={FormFactor.DESKTOP}
          playingNoteIndex={null}
          onScoreClick={scoreClickHandler}
        />
      );
    });

    it('calls `vex.createScore()` with expected data', () => {
      const container = screen.getByTestId('score');
      expect(createScoreSpy).toHaveBeenCalledWith(
        container,
        scoreData,
        1200,
        4,
        scoreDimensionConfig
      );
    });
  });

  describe('on MOBILE form factors', () => {
    beforeEach(() => {
      render(
        <Score
          scoreData={scoreData}
          innerWidth={1200}
          transitioning={false}
          currentFormFactor={FormFactor.MOBILE}
          playingNoteIndex={null}
          onScoreClick={scoreClickHandler}
        />
      );
    });

    it('calls `vex.createScore()` with expected data', () => {
      const container = screen.getByTestId('score');
      expect(createScoreSpy).toHaveBeenCalledWith(
        container,
        scoreData,
        1200,
        2,
        scoreDimensionConfig
      );
    });

    it('renders score elements in the container', () => {
      expect(screen.getByTestId('score')).not.toBeEmptyDOMElement();
    });
  });

  describe('while transitioning', () => {
    beforeEach(() => {
      render(
        <Score
          scoreData={scoreData}
          innerWidth={1200}
          transitioning={true}
          currentFormFactor={FormFactor.MOBILE}
          playingNoteIndex={null}
          onScoreClick={scoreClickHandler}
        />
      );
    });

    it('adds the expected CSS class to the button', () => {
      expect(screen.getByTestId('score__button')).toHaveClass(
        'c-rr-score--transitioning'
      );
    });
  });

  describe('with a `playingNoteIndex` passed in', () => {
    let renderResult: RenderResult;

    beforeEach(() => {
      renderResult = render(
        <Score
          scoreData={scoreData}
          innerWidth={1200}
          transitioning={false}
          currentFormFactor={FormFactor.MOBILE}
          playingNoteIndex={0}
          onScoreClick={scoreClickHandler}
        />
      );
    });

    it('colors the playing note red', () => {
      const container = screen.getByTestId('score');
      const notes = container.querySelectorAll('.vf-notehead path');
      expect(notes[0]).toHaveStyle('fill: red');
    });

    it('ensures that previous red notes have the color removed when the `playingNoteIndex` changes', () => {
      renderResult.rerender(
        <Score
          scoreData={scoreData}
          innerWidth={1200}
          transitioning={false}
          currentFormFactor={FormFactor.MOBILE}
          playingNoteIndex={1}
          onScoreClick={scoreClickHandler}
        />
      );
      const container = screen.getByTestId('score');
      const notes = container.querySelectorAll('.vf-notehead path');
      expect(notes[0]).not.toHaveStyle('fill: red');
      expect(notes[1]).toHaveStyle('fill: red');
    });

    it('ensures that no notes are colored of `playingNoteIndex` is null', () => {
      renderResult.rerender(
        <Score
          scoreData={scoreData}
          innerWidth={1200}
          transitioning={false}
          currentFormFactor={FormFactor.MOBILE}
          playingNoteIndex={null}
          onScoreClick={scoreClickHandler}
        />
      );
      const container = screen.getByTestId('score');
      const notes = container.querySelectorAll('.vf-notehead path');
      expect(notes[0]).not.toHaveStyle('fill: red');
      expect(notes[1]).not.toHaveStyle('fill: red');
    });
  });

  describe('when there are no measures to render', () => {
    beforeEach(() => {
      render(
        <Score
          scoreData={{
            timeSignature: getTimeSignature(TimeSignatureType.SIMPLE_4_4),
            measures: [],
          }}
          innerWidth={1200}
          transitioning={false}
          currentFormFactor={FormFactor.MOBILE}
          playingNoteIndex={null}
          onScoreClick={scoreClickHandler}
        />
      );
    });

    it('does not create the score', () => {
      expect(vex.createScore).not.toHaveBeenCalled();
    });

    it('does not render score elements in the container', () => {
      expect(screen.getByTestId('score')).toBeEmptyDOMElement();
    });
  });
});
