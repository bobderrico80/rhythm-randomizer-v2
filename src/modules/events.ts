import { ScoreSettings } from '../App';
import { MetronomeSettings } from './metronome';

export enum EventCategory {
  SCORE = 'score',
  HEADER_NAV = 'headerNav',
  SHARE_LINK = 'shareLink',
  MAIN_MENU = 'mainMenu',
  SETTINGS_MENU = 'settingsMenu',
  PLAYBACK = 'playback',
  METRONOME = 'metronome',
  LANGUAGE = 'language',
}

export enum EventAction {
  NEW_RHYTHM = 'newRhythm',
  USED = 'used',
  COPIED = 'copied',
  OPENED = 'opened',
  CLOSED = 'closed',
  STARTED = 'started',
  CHANGED = 'changed',
}

export const sendEvent = (
  category: EventCategory,
  action: EventAction,
  label?: string,
  value?: number
) => {
  gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
  });
};

const serializeMetronomeSettings = (metronomeSettings: MetronomeSettings) => {
  let eventLabel = metronomeSettings.active ? 'a' : 'x';

  eventLabel += metronomeSettings.startOfMeasureClick ? 'm' : 'x';
  eventLabel += metronomeSettings.subdivisionClick ? 's' : 'x';
  eventLabel += metronomeSettings.countOffMeasures;

  return eventLabel;
};

export const sendPlaybackEvent = (scoreSettings: ScoreSettings) => {
  let eventLabel = `${scoreSettings.tempo}:`;
  eventLabel += `${scoreSettings.pitch.pitchClass}${scoreSettings.pitch.octave}:`;
  eventLabel += serializeMetronomeSettings(scoreSettings.metronomeSettings);

  sendEvent(EventCategory.PLAYBACK, EventAction.STARTED, eventLabel);
};

export const sendMetronomeEvent = (metronomeSettings: MetronomeSettings) => {
  sendEvent(
    EventCategory.METRONOME,
    EventAction.STARTED,
    serializeMetronomeSettings(metronomeSettings)
  );
};
