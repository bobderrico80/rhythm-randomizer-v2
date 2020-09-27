import React from 'react';
import { buildBemClassName } from '../modules/util';
import SlideOut from './SlideOut';
import IconButton from './IconButton';
import backArrowIcon from '../svg/back-arrow.svg';
import './MainMenu.scss';

const buildClassName = buildBemClassName('c-rr-main-menu');

export interface MainMenuProps {
  mainMenuOpen: boolean;
  onMainMenuCloseClick: () => void;
}

const MainMenu = ({ mainMenuOpen, onMainMenuCloseClick }: MainMenuProps) => {
  const renderMainMenuPane = (open: boolean, onCloseClick: () => void) => {
    return (
      <section>
        <div className={buildClassName('button-container')()}>
          <IconButton
            className={buildClassName('close-button')()}
            svg={backArrowIcon}
            alt="Close Settings Menu"
            onClick={onCloseClick}
            id="settings-menu-close"
          />
        </div>
        <section className={buildClassName('content')()}>
          main menu stuff goes here
        </section>
      </section>
    );
  };

  return (
    <SlideOut
      open={mainMenuOpen}
      onCloseClick={onMainMenuCloseClick}
      renderPane={renderMainMenuPane}
      paneClassName={buildClassName('pane')()}
      openPaneClassName={buildClassName('pane')('open')}
    />
  );
};

export default MainMenu;
