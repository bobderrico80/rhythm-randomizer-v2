import React from 'react';
import { useTranslation } from 'react-i18next';
import { EventAction, EventCategory, sendEvent } from '../modules/events';
import { buildBemClassName } from '../modules/util';
import './LanguageSwitcher.scss';

export interface LanguageSwitchProps {
  supportedLanguageCodes: string[];
}

const buildClassName = buildBemClassName('c-rr-language-switcher');

const LanguageSwitcher = ({ supportedLanguageCodes }: LanguageSwitchProps) => {
  const { t, i18n } = useTranslation();

  const currentLanguageCode = i18n.language.substr(0, 2);
  const alternateLanguageCodes = supportedLanguageCodes.filter(
    (lang) => lang !== currentLanguageCode
  );

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    document.documentElement.setAttribute('lang', lang);
    sendEvent(EventCategory.LANGUAGE, EventAction.CHANGED, lang);
  };

  return (
    <p className={buildClassName()()}>
      <span data-testid="language-switcher__current-language">
        {t('currentLanguage')}: {t(currentLanguageCode)}.
      </span>
      {alternateLanguageCodes.length > 0 && (
        <span data-testid="language-switcher__alt-languages">
          {' '}
          {t('translateTo')}:{' '}
          {alternateLanguageCodes.map((lang, index) => {
            return (
              <React.Fragment key={lang}>
                <button
                  key={lang}
                  className={buildClassName('link')()}
                  onClick={() => handleLanguageChange(lang)}
                >
                  {t(lang)}
                </button>
                {index < alternateLanguageCodes.length - 1 && <>{' | '}</>}
              </React.Fragment>
            );
          })}
        </span>
      )}
    </p>
  );
};

export default LanguageSwitcher;
