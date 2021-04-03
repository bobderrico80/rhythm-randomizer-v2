import React from 'react';
import classnames from 'classnames';
import { buildBemClassName } from '../modules/util';
import './HeaderNav.scss';
import Player, { PlaybackStateChangeHandler } from './Player';
import { Measure } from '../modules/vex';
import { NoteTriggerHandler, PlaybackState } from '../modules/tone';
import { useTranslation } from 'react-i18next';

const buildClassName = buildBemClassName('c-rr-header-nav');

export interface HeaderNavProps {
  measures: Measure[];
  playbackState: PlaybackState;
  metronomeOn: boolean;
  onPlaybackStateChange: PlaybackStateChangeHandler;
  onNoteTrigger: NoteTriggerHandler;
  onMetronomeClickTrigger: NoteTriggerHandler;
  onRandomizeButtonClick: () => void;
  onMetronomeButtonClick: () => void;
}

const HeaderNav = ({
  measures,
  playbackState,
  metronomeOn,
  onPlaybackStateChange,
  onNoteTrigger,
  onMetronomeClickTrigger,
  onRandomizeButtonClick,
  onMetronomeButtonClick,
}: HeaderNavProps) => {
  const { t } = useTranslation();

  return (
    <nav className={buildClassName()()}>
      <ul className={buildClassName('list')()}>
        <li className={buildClassName('list-item')()}>
          <button
            type="button"
            className={classnames(
              buildClassName('item-link')(),
              'c-rr-button',
              'c-rr-button--dark'
            )}
            onClick={onRandomizeButtonClick}
            disabled={playbackState === PlaybackState.PLAYING || metronomeOn}
          >
            {t('newRhythm')}
          </button>
        </li>
        <li className={buildClassName('list-item')()}>
          <Player
            measures={measures}
            playbackState={playbackState}
            metronomeOn={metronomeOn}
            className={buildClassName('item-link')()}
            onPlaybackStateChange={onPlaybackStateChange}
            onNoteTrigger={onNoteTrigger}
            onMetronomeClickTrigger={onMetronomeClickTrigger}
          />
        </li>
        <li className={buildClassName('list-item')()}>
          <button
            type="button"
            className={classnames(
              buildClassName('item-link')(),
              'c-rr-button',
              'c-rr-button--dark'
            )}
            onClick={onMetronomeButtonClick}
            disabled={playbackState === PlaybackState.PLAYING}
          >
            {metronomeOn ? t('stopMetronome') : t('startMetronome')}
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default HeaderNav;
