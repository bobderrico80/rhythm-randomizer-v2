import React, { useContext, useEffect } from 'react';
import classnames from 'classnames';
import { NoteTriggerHandler, PlaybackState } from '../modules/tone';
import { Measure } from '../modules/vex';
import {
  Transport,
  startPlayback,
  stopPlayback,
  updateTempo,
} from '../modules/tone';
import { buildBemClassName } from '../modules/util';
import { AppContext } from '../App';

export interface PlayerProps {
  measures: Measure[];
  playbackState: PlaybackState;
  metronomeOn: boolean;
  className?: string;
  onPlaybackStateChange: PlaybackStateChangeHandler;
  onNoteTrigger: NoteTriggerHandler;
  onMetronomeClickTrigger: NoteTriggerHandler;
}

export type PlaybackStateChangeHandler = (playbackState: PlaybackState) => void;

const buildClassName = buildBemClassName('c-rr-player');

const Player = ({
  measures,
  playbackState,
  metronomeOn,
  className = '',
  onPlaybackStateChange,
  onNoteTrigger,
  onMetronomeClickTrigger,
}: PlayerProps) => {
  const { state } = useContext(AppContext);

  const {
    tempo,
    pitch,
    timeSignature,
    metronomeSettings,
  } = state.scoreSettings;

  const stopHandler = () => {
    onPlaybackStateChange(PlaybackState.STOPPED);
    Transport.off('stop', stopHandler);
  };

  // Set tempo when it changes
  useEffect(() => {
    updateTempo(tempo);
  }, [tempo]);

  const handlePlayToggle = () => {
    if (playbackState === PlaybackState.STOPPED) {
      startPlayback(
        measures,
        pitch,
        timeSignature,
        metronomeSettings,
        onNoteTrigger,
        onMetronomeClickTrigger
      );
      onPlaybackStateChange(PlaybackState.PLAYING);
      Transport.on('stop', stopHandler);
    } else {
      stopPlayback();
    }
  };

  return (
    <div className={buildClassName()()}>
      <button
        type="button"
        className={classnames(
          className,
          'c-rr-button',
          'c-rr-button--dark',
          buildClassName('play-toggle')()
        )}
        onClick={handlePlayToggle}
        disabled={metronomeOn}
      >
        {playbackState === PlaybackState.PLAYING
          ? 'Stop Playback'
          : 'Start Playback'}
      </button>
    </div>
  );
};

export default Player;
