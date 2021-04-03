import React from 'react';
import classnames from 'classnames';
import { buildBemClassName } from '../modules/util';
import TempoControl from './TempoControl';
import './PlaybackSettings.scss';
import PitchControl from './PitchControl';
import MetronomeControl from './MetronomeControl';
import { useTranslation } from 'react-i18next';

const buildClassName = buildBemClassName('c-rr-playback-settings');

const PlaybackSettings = () => {
  const { t } = useTranslation();

  return (
    <section
      className={classnames('c-rr-settings-form__section', buildClassName()())}
    >
      <fieldset className={buildClassName('fieldset')()}>
        <legend>{t('tempoSettings')}</legend>
        <TempoControl />
      </fieldset>
      <fieldset className={buildClassName('fieldset')()}>
        <legend>{t('pitchSettings')}</legend>
        <PitchControl />
      </fieldset>
      <fieldset className={buildClassName('fieldset')()}>
        <legend>{t('metronomeSettings')}</legend>
        <MetronomeControl />
      </fieldset>
    </section>
  );
};

export default PlaybackSettings;
