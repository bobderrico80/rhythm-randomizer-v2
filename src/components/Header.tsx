import React from 'react';
import classnames from 'classnames';
import { buildBemClassName } from '../modules/util';
import settingsMenuIcon from '../svg/settings.svg';
import mainMenuIcon from '../svg/menu.svg';
import './Header.scss';
import IconButton from './IconButton';
import { FormFactor } from '../App';
import HeaderNav from './HeaderNav';

export interface HeaderProps {
  currentFormFactor: FormFactor;
  onRandomizeButtonClick: () => void;
  onSettingsMenuButtonClick: () => void;
  onMainMenuButtonClick: () => void;
}

const buildClassName = buildBemClassName('c-rr-header');

const Header = ({
  currentFormFactor,
  onRandomizeButtonClick,
  onSettingsMenuButtonClick,
  onMainMenuButtonClick,
}: HeaderProps) => {
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
        {currentFormFactor === FormFactor.DESKTOP && (
          <HeaderNav onRandomizeButtonClick={onRandomizeButtonClick} />
        )}
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
      {currentFormFactor === FormFactor.MOBILE && (
        <div className={buildClassName('mobile-nav-container')()}>
          <HeaderNav onRandomizeButtonClick={onRandomizeButtonClick} />
        </div>
      )}
    </header>
  );
};

export default Header;
