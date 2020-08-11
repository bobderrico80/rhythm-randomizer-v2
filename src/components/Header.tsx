import React from 'react';
import classnames from 'classnames';
import SettingsMenu from './SettingsMenu';
import { buildBemClassName } from '../modules/util';
import './Header.scss';

export interface HeaderProps {
  handleRandomizeClick: () => void;
}

const buildClassName = buildBemClassName('c-rr-header');

const Header = ({ handleRandomizeClick }: HeaderProps) => {
  return (
    <header className={buildClassName()()}>
      <SettingsMenu />
      <h1 className={buildClassName('title')()}>The Rhythm Randomizer</h1>
      <nav className={buildClassName('nav')()}>
        <ul>
          <li className={buildClassName('nav-item')()}>
            <button
              className={classnames(
                'e-rr-button',
                buildClassName('nav-item-link')()
              )}
              onClick={handleRandomizeClick}
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
