import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { buildBemClassName } from '../modules/util';
import SlideOut from './SlideOut';
import IconButton from './IconButton';
import backArrowIcon from '../svg/back-arrow.svg';
import './MainMenu.scss';
import releaseNotesPath from '../release-notes.md';
import { version } from '../../package.json';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const buildClassName = buildBemClassName('c-rr-main-menu');

export interface MainMenuProps {
  mainMenuOpen: boolean;
  onMainMenuCloseClick: () => void;
}

const MainMenu = ({ mainMenuOpen, onMainMenuCloseClick }: MainMenuProps) => {
  const [releaseNotesSource, setReleaseNotesSource] = useState('');
  const { t } = useTranslation();

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
            alt={t('closeMainMenu')}
            onClick={onCloseClick}
            id="main-menu-close"
          />
        </div>
        <section className={buildClassName('content')()}>
          <section lang="en">
            <ReactMarkdown source={releaseNotesSource} linkTarget="_blank" />
          </section>
          <footer className={buildClassName('footer')()}>
            <p>
              {t('copyrightBefore')} &copy; {new Date().getFullYear()}{' '}
              {t('copyrightAfter')}
            </p>
            <p>
              {t('version')}: {version} |{' '}
              <a
                href="https://fb.me/TheRhythmRandomizer"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('connectOnFacebook')}
              </a>{' '}
              | {t('viewCodeOn')}{' '}
              <a
                href="https://github.com/bobderrico80/rhythm-randomizer-v2"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('gitHub')}
              </a>
            </p>
            <LanguageSwitcher supportedLanguageCodes={['en', 'de']} />
            <p>
              {t('preferOldVersion')}{' '}
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
      label={t('mainMenu')}
      onCloseClick={onMainMenuCloseClick}
      renderPane={renderMainMenuPane}
      paneClassName={buildClassName('pane')()}
      openPaneClassName={buildClassName('pane')('open')}
    />
  );
};

export default MainMenu;
