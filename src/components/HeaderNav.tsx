import React from 'react';
import classnames from 'classnames';
import { buildBemClassName } from '../modules/util';
import './HeaderNav.scss';
import Player, { PlaybackStateChangeHandler } from './Player';
import { Measure } from '../modules/vex';
import { PlaybackState } from '../modules/tone';

const buildClassName = buildBemClassName('c-rr-header-nav');

export interface HeaderNavProps {
  measures: Measure[];
  playbackState: PlaybackState;
  tempo: number;
  onPlaybackStateChange: PlaybackStateChangeHandler;
  onRandomizeButtonClick: () => void;
}

const HeaderNav = ({
  measures,
  playbackState,
  tempo,
  onPlaybackStateChange,
  onRandomizeButtonClick,
}: HeaderNavProps) => {
  return (
    <nav className={buildClassName()()}>
      <ul className={buildClassName('list')()}>
        <li className={buildClassName('list-item')()}>
          <button
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
            onPlaybackStateChange={onPlaybackStateChange}
          />
        </li>
      </ul>
    </nav>
  );
};

export default HeaderNav;
