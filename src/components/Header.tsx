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
import { NoteTriggerHandler, PlaybackState } from '../modules/tone';
import { PlaybackStateChangeHandler } from './Player';
import { useTranslation } from 'react-i18next';

export interface HeaderProps {
  currentFormFactor: FormFactor;
  measures: Measure[];
  playbackState: PlaybackState;
  metronomeOn: boolean;
  onPlaybackStateChange: PlaybackStateChangeHandler;
  onNoteTrigger: NoteTriggerHandler;
  onMetronomeClickTrigger: NoteTriggerHandler;
  onRandomizeButtonClick: () => void;
  onSettingsMenuButtonClick: () => void;
  onMainMenuButtonClick: () => void;
  onMetronomeButtonClick: () => void;
}

const buildClassName = buildBemClassName('c-rr-header');

const Header = ({
  currentFormFactor,
  measures,
  playbackState,
  metronomeOn,
  onPlaybackStateChange,
  onNoteTrigger,
  onMetronomeClickTrigger,
  onRandomizeButtonClick,
  onSettingsMenuButtonClick,
  onMainMenuButtonClick,
  onMetronomeButtonClick,
}: HeaderProps) => {
  const { t } = useTranslation();

  const renderHeaderNav = () => {
    return (
      <HeaderNav
        measures={measures}
        playbackState={playbackState}
        metronomeOn={metronomeOn}
        onPlaybackStateChange={onPlaybackStateChange}
        onNoteTrigger={onNoteTrigger}
        onMetronomeClickTrigger={onMetronomeClickTrigger}
        onRandomizeButtonClick={onRandomizeButtonClick}
        onMetronomeButtonClick={onMetronomeButtonClick}
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
          alt={t('openSettingsMenu')}
          onClick={onSettingsMenuButtonClick}
        />
        <h1 className={buildClassName('title')()}>
          {t('theRhythmRandomizer')}
        </h1>
        {currentFormFactor === FormFactor.DESKTOP && renderHeaderNav()}
        <div className={buildClassName()('right')}>
          <IconButton
            className={classnames(
              buildClassName('menu-button')(),
              buildClassName('menu-button')('main')
            )}
            svg={mainMenuIcon}
            alt={t('openMainMenu')}
            onClick={onMainMenuButtonClick}
          />
        </div>
      </div>
      {currentFormFactor === FormFactor.MOBILE && renderHeaderNav()}
    </header>
  );
};

export default Header;
