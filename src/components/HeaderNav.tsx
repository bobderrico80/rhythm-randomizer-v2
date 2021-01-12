import React from 'react';
import classnames from 'classnames';
import { buildBemClassName } from '../modules/util';
import './HeaderNav.scss';
import Player, { PlaybackStateChangeHandler } from './Player';
import { Measure } from '../modules/vex';
import { NoteTriggerHandler, Pitch, PlaybackState } from '../modules/tone';
import { TimeSignature } from '../modules/time-signature';

const buildClassName = buildBemClassName('c-rr-header-nav');

export interface HeaderNavProps {
  measures: Measure[];
  playbackState: PlaybackState;
  tempo: number;
  pitch: Pitch;
  timeSignature: TimeSignature;
  onPlaybackStateChange: PlaybackStateChangeHandler;
  onNoteTrigger: NoteTriggerHandler;
  onRandomizeButtonClick: () => void;
}

const HeaderNav = ({
  measures,
  playbackState,
  tempo,
  pitch,
  timeSignature,
  onPlaybackStateChange,
  onNoteTrigger,
  onRandomizeButtonClick,
}: HeaderNavProps) => {
  return (
    <nav className={buildClassName()()}>
      <ul className={buildClassName('list')()}>
        <li className={buildClassName('list-item')()}>
          <button
            type="button"
            className={classnames('c-rr-button', 'c-rr-button--dark')}
            onClick={onRandomizeButtonClick}
            disabled={playbackState === PlaybackState.PLAYING}
          >
            New Rhythm
          </button>
        </li>
        <li className={buildClassName('list-item')()}>
          <Player
            measures={measures}
            playbackState={playbackState}
            tempo={tempo}
            pitch={pitch}
            timeSignature={timeSignature}
            onPlaybackStateChange={onPlaybackStateChange}
            onNoteTrigger={onNoteTrigger}
          />
        </li>
      </ul>
    </nav>
  );
};

export default HeaderNav;
