export enum EventCategory {
  SCORE = 'score',
  HEADER_NAV = 'headerNav',
  SHARE_LINK = 'shareLink',
  MAIN_MENU = 'mainMenu',
  SETTINGS_MENU = 'settingsMenu',
}

export enum EventAction {
  NEW_RHYTHM = 'newRhythm',
  USED = 'used',
  COPIED = 'copied',
  OPENED = 'opened',
  CLOSED = 'closed',
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
