import React, { useEffect } from 'react';
import classnames from 'classnames';
import { NoteTriggerHandler, Pitch, PlaybackState } from '../modules/tone';
import { Measure } from '../modules/vex';
import {
  Transport,
  startPlayback,
  stopPlayback,
  scheduleMeasures,
  setTempo,
} from '../modules/tone';
import { buildBemClassName } from '../modules/util';
import { TimeSignature } from '../modules/time-signature';

export interface PlayerProps {
  measures: Measure[];
  playbackState: PlaybackState;
  tempo: number;
  pitch: Pitch;
  timeSignature: TimeSignature;
  onPlaybackStateChange: PlaybackStateChangeHandler;
  onNoteTrigger: NoteTriggerHandler;
}

export type PlaybackStateChangeHandler = (playbackState: PlaybackState) => void;

const buildClassName = buildBemClassName('c-rr-player');

const Player = ({
  measures,
  playbackState,
  tempo,
  pitch,
  timeSignature,
  onPlaybackStateChange,
  onNoteTrigger,
}: PlayerProps) => {
  // Set up transport event listeners
  useEffect(() => {
    const startHandler = () => {
      onPlaybackStateChange(PlaybackState.PLAYING);
    };

    const stopHandler = () => {
      onPlaybackStateChange(PlaybackState.STOPPED);
    };

    Transport.on('start', startHandler);
    Transport.on('stop', stopHandler);

    return () => {
      Transport.off('start', startHandler);
      Transport.off('stop', stopHandler);
    };
  }, [onPlaybackStateChange]);

  // Schedule measures when they change
  useEffect(() => {
    if (playbackState === PlaybackState.STOPPED) {
      scheduleMeasures(measures, pitch, timeSignature, onNoteTrigger);
    }
  }, [playbackState, measures, pitch, timeSignature, onNoteTrigger]);

  // Set tempo when it changes
  useEffect(() => {
    setTempo(tempo);
  }, [tempo]);

  const handlePlayToggle = () => {
    if (playbackState === PlaybackState.STOPPED) {
      startPlayback();
    } else {
      stopPlayback();
    }
  };

  return (
    <div className={buildClassName()()}>
      <button
        type="button"
        className={classnames(
          'c-rr-button',
          'c-rr-button--dark',
          buildClassName('play-toggle')()
        )}
        onClick={handlePlayToggle}
      >
        {playbackState === PlaybackState.PLAYING ? 'Stop' : 'Play'}
      </button>
    </div>
  );
};

export default Player;
