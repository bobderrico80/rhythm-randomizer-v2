import React from 'react';
import classnames from 'classnames';
import { buildBemClassName } from '../modules/util';
import TempoControl from './TempoControl';
import './PlaybackSettings.scss';
import PitchControl from './PitchControl';
import MetronomeControl from './MetronomeControl';

const buildClassName = buildBemClassName('c-rr-playback-settings');

const PlaybackSettings = () => {
  return (
    <section
      className={classnames('c-rr-settings-form__section', buildClassName()())}
    >
      <fieldset className={buildClassName('fieldset')()}>
        <legend>Tempo Settings</legend>
        <TempoControl />
      </fieldset>
      <fieldset className={buildClassName('fieldset')()}>
        <legend>Pitch Settings</legend>
        <PitchControl />
      </fieldset>
      <fieldset className={buildClassName('fieldset')()}>
        <legend>Metronome Settings</legend>
        <MetronomeControl />
      </fieldset>
    </section>
  );
};

export default PlaybackSettings;
