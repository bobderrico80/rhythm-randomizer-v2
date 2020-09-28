import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { buildBemClassName } from '../modules/util';
import SlideOut from './SlideOut';
import IconButton from './IconButton';
import backArrowIcon from '../svg/back-arrow.svg';
import './MainMenu.scss';
import releaseNotesPath from '../release-notes.md';
import { version } from '../../package.json';

const buildClassName = buildBemClassName('c-rr-main-menu');

export interface MainMenuProps {
  mainMenuOpen: boolean;
  onMainMenuCloseClick: () => void;
}

const MainMenu = ({ mainMenuOpen, onMainMenuCloseClick }: MainMenuProps) => {
  const [releaseNotesSource, setReleaseNotesSource] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const response = await window.fetch(releaseNotesPath);
        const text = await response.text();
        setReleaseNotesSource(text);
      } catch (error) {
        setReleaseNotesSource('Error loading release notes');
      }
    })();
  }, []);
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
          <ReactMarkdown source={releaseNotesSource} linkTarget="_blank" />
          <footer className={buildClassName('footer')()}>
            <p>
              Copyright &copy; {new Date().getFullYear()} Bob D'Errico. All
              Rights Reserved.
            </p>
            <p>
              Version: {version} |{' '}
              <a
                href="https://fb.me/TheRhythmRandomizer"
                target="_blank"
                rel="noopener noreferrer"
              >
                Connect on Facebook
              </a>
            </p>
            <p>
              Prefer the old version? Visit{' '}
              <a
                href="http://v1.rhythmrandomizer.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                http://v1.rhythmrandomizer.com
              </a>
            </p>
          </footer>
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
