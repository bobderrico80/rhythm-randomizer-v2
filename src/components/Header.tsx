import React from 'react';
import classnames from 'classnames';
import { buildBemClassName } from '../modules/util';
import menuIcon from '../svg/menu.svg';
import './Header.scss';
import IconButton from './IconButton';

export interface HeaderProps {
  onRandomizeButtonClick: () => void;
  onSettingsMenuButtonClick: () => void;
}

const buildClassName = buildBemClassName('c-rr-header');

const Header = ({
  onRandomizeButtonClick,
  onSettingsMenuButtonClick,
}: HeaderProps) => {
  return (
    <header className={buildClassName()()}>
      <IconButton
        className={buildClassName('settings-menu-button')()}
        svg={menuIcon}
        alt="Open Settings Menu"
        onClick={onSettingsMenuButtonClick}
      />
      <h1 className={buildClassName('title')()}>The Rhythm Randomizer</h1>
      <nav className={buildClassName('nav')()}>
        <ul>
          <li className={buildClassName('nav-item')()}>
            <button
              className={classnames(
                'e-rr-button',
                buildClassName('nav-item-link')()
              )}
              onClick={onRandomizeButtonClick}
            >
              New Rhythm
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
