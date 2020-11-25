import React from 'react';
import classnames from 'classnames';
import { buildBemClassName } from '../modules/util';
import settingsMenuIcon from '../svg/settings.svg';
import mainMenuIcon from '../svg/menu.svg';
import './Header.scss';
import IconButton from './IconButton';
import { FormFactor } from '../App';
import HeaderNav from './HeaderNav';
import { Measure } from '../modules/vex';
import { NoteTriggerHandler, Pitch, PlaybackState } from '../modules/tone';
import { PlaybackStateChangeHandler } from './Player';

export interface HeaderProps {
  currentFormFactor: FormFactor;
  measures: Measure[];
  playbackState: PlaybackState;
  tempo: number;
  pitch: Pitch;
  onPlaybackStateChange: PlaybackStateChangeHandler;
  onNoteTrigger: NoteTriggerHandler;
  onRandomizeButtonClick: () => void;
  onSettingsMenuButtonClick: () => void;
  onMainMenuButtonClick: () => void;
}

const buildClassName = buildBemClassName('c-rr-header');

const Header = ({
  currentFormFactor,
  measures,
  playbackState,
  tempo,
  pitch,
  onPlaybackStateChange,
  onNoteTrigger,
  onRandomizeButtonClick,
  onSettingsMenuButtonClick,
  onMainMenuButtonClick,
}: HeaderProps) => {
  const renderHeaderNav = () => {
    return (
      <HeaderNav
        measures={measures}
        playbackState={playbackState}
        tempo={tempo}
        pitch={pitch}
        onPlaybackStateChange={onPlaybackStateChange}
        onNoteTrigger={onNoteTrigger}
        onRandomizeButtonClick={onRandomizeButtonClick}
      />
    );
  };

  return (
    <header
      className={classnames(buildClassName()(), {
        [buildClassName()('mobile')]: currentFormFactor === FormFactor.MOBILE,
      })}
    >
      <div className={buildClassName('container')()}>
        <IconButton
          className={classnames(
            buildClassName('menu-button')(),
            buildClassName('menu-button')('settings')
          )}
          svg={settingsMenuIcon}
          alt="Open Settings Menu"
          onClick={onSettingsMenuButtonClick}
        />
        <h1 className={buildClassName('title')()}>The Rhythm Randomizer</h1>
        {currentFormFactor === FormFactor.DESKTOP && renderHeaderNav()}
        <div className={buildClassName()('right')}>
          <IconButton
            className={classnames(
              buildClassName('menu-button')(),
              buildClassName('menu-button')('main')
            )}
            svg={mainMenuIcon}
            alt="Open Main Menu"
            onClick={onMainMenuButtonClick}
          />
        </div>
      </div>
      {currentFormFactor === FormFactor.MOBILE && renderHeaderNav()}
    </header>
  );
};

export default Header;
