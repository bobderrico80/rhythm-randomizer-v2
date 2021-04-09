import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import App from './App';
import * as random from './modules/random';
import * as vex from './modules/vex';
import * as events from './modules/events';
import { getGeneratedNoteGroups } from './modules/note';
import { NoteGroupType } from './modules/note-definition';
import { getTimeSignature, TimeSignatureType } from './modules/time-signature';
import { scoreDimensionConfig } from './components/Score';

jest.mock('./modules/tone');
jest.mock('./modules/events');

const clickByRole = (role: string, name: string) => {
  userEvent.click(screen.getByRole(role, { name }));
};

const mockSendEvent = events.sendEvent as jest.Mock;

describe('The <App /> component', () => {
  let mockCopy: jest.Mock;
  let createScoreSpy: jest.SpyInstance;

  beforeEach(() => {
    random.resetTestRandomMeasureIndex();
    jest.useFakeTimers();

    mockCopy = jest.fn();
    createScoreSpy = jest.spyOn(vex, 'createScore');

    document.execCommand = jest.fn().mockImplementation(() => {
      const activeElement = document.activeElement as HTMLInputElement;
      const selectionStart = activeElement.selectionStart;
      const selectionEnd = activeElement.selectionEnd;

      if (selectionStart !== null && selectionEnd !== null) {
        const selectedText = activeElement.value.substring(
          selectionStart,
          selectionEnd
        );
        mockCopy(selectedText);
      }
    });

    render(<App testMode={true} />);
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
    mockSendEvent.mockReset();
    createScoreSpy.mockRestore();
    localStorage.clear();
  });

  describe('with default behavior', () => {
    describe('menu behavior', () => {
      it('initially renders with both menus closed', () => {
        expect(screen.queryAllByRole('dialog')).toHaveLength(0);
      });

      describe('when opening the main menu', () => {
        let openButton: HTMLButtonElement;

        beforeEach(() => {
          openButton = screen.getByRole('button', {
            name: 'openMainMenu',
          }) as HTMLButtonElement;
          userEvent.click(openButton);
        });

        it('opens the main menu when the main menu button is clicked', () => {
          expect(
            screen.getByRole('dialog', { name: 'mainMenu' })
          ).toBeInTheDocument();
        });

        it('logs an event when the main menu is opened', () => {
          expect(mockSendEvent).toHaveBeenCalledWith(
            events.EventCategory.MAIN_MENU,
            events.EventAction.OPENED
          );
        });

        describe('when closing the main menu', () => {
          beforeEach(() => {
            clickByRole('button', 'closeMainMenu');
          });

          it('closes the main menu when the close button is clicked', () => {
            expect(
              screen.queryByRole('dialog', { name: 'mainMenu' })
            ).not.toBeInTheDocument();
          });

          it('returns focus to the main menu button', () => {
            expect(openButton).toHaveFocus();
          });
        });
      });

      describe('when opening the settings menu', () => {
        let openButton: HTMLButtonElement;

        beforeEach(() => {
          openButton = screen.getByRole('button', {
            name: 'openSettingsMenu',
          }) as HTMLButtonElement;
          userEvent.click(openButton);
        });

        it('opens the settings menu when the settings menu button is clicked', () => {
          expect(
            screen.getByRole('dialog', { name: 'settingsMenu' })
          ).toBeInTheDocument();
        });

        describe('accordion behavior', () => {
          it('opens the note selection accordion by default', () => {
            expect(
              screen.getByRole('region', { name: 'noteSelection' })
            ).toBeInTheDocument();
          });

          describe('when opening another accordion', () => {
            beforeEach(() => {
              clickByRole('button', 'expand playbackSettings');
            });

            it('opens the expected accordion', () => {
              expect(
                screen.getByRole('region', { name: 'playbackSettings' })
              ).toBeInTheDocument();
            });

            it('closes the previous accordion', () => {
              expect(
                screen.queryByRole('region', { name: 'noteSelection' })
              ).not.toBeInTheDocument();
            });
          });
        });

        describe('when clicking the Share Link', () => {
          beforeEach(() => {
            clickByRole('button', 'clickToCopyShareLinkToClipboard');
          });

          it('copies the Share Settings Link to the clipboard', () => {
            expect(mockCopy).toBeCalledWith(
              'http://localhost?s=22208084020001020304050607'
            );
          });

          it('logs an event with the share string', () => {
            expect(mockSendEvent).toHaveBeenCalledWith(
              events.EventCategory.SHARE_LINK,
              events.EventAction.COPIED,
              '22208084020001020304050607'
            );
          });
        });

        describe('when closing the settings menu', () => {
          beforeEach(() => {
            clickByRole('button', 'closeSettingsMenu');
          });

          it('closes the settings menu when the close button is clicked', () => {
            expect(
              screen.queryByRole('dialog', { name: 'settingsMenu' })
            ).not.toBeInTheDocument();
          });

          it('returns focus to the settings menu button', () => {
            expect(openButton).toHaveFocus();
          });
        });
      });
    });

    describe('rhythm generation behavior', () => {
      it('renders the expected score with default note selections, time signature, and measure count', () => {
        expect(createScoreSpy).toHaveBeenCalledWith(
          expect.any(HTMLElement),
          {
            timeSignature: getTimeSignature(TimeSignatureType.SIMPLE_4_4),
            measures: [
              { noteGroups: getGeneratedNoteGroups(NoteGroupType.W) },
              {
                noteGroups: getGeneratedNoteGroups(
                  NoteGroupType.H,
                  NoteGroupType.H
                ),
              },
            ],
          },
          expect.any(Number),
          expect.any(Number),
          scoreDimensionConfig
        );
      });

      describe('when clicking the "New Rhythm" button', () => {
        beforeEach(() => {
          clickByRole('button', 'newRhythm');

          act(() => {
            jest.advanceTimersByTime(500);
          });
        });

        it('renders a new score with the same note selections, time signature, and measure count settings', async () => {
          expect(createScoreSpy).toHaveBeenCalledTimes(2);
          await waitFor(() => {
            expect(createScoreSpy).toHaveBeenLastCalledWith(
              expect.any(HTMLElement),
              {
                timeSignature: getTimeSignature(TimeSignatureType.SIMPLE_4_4),
                measures: [
                  {
                    noteGroups: getGeneratedNoteGroups(
                      NoteGroupType.H,
                      NoteGroupType.H
                    ),
                  },
                  {
                    noteGroups: getGeneratedNoteGroups(
                      NoteGroupType.Q,
                      NoteGroupType.Q,
                      NoteGroupType.Q,
                      NoteGroupType.Q
                    ),
                  },
                ],
              },
              expect.any(Number),
              expect.any(Number),
              scoreDimensionConfig
            );
          });
        });
      });

      describe('when clicking the score', () => {
        beforeEach(() => {
          userEvent.click(screen.getByTestId('score__button'));

          act(() => {
            jest.advanceTimersByTime(500);
          });
        });

        it('renders a new score with the same note selections, time signature, and measure count settings', async () => {
          expect(createScoreSpy).toHaveBeenCalledTimes(2);
          await waitFor(() => {
            expect(createScoreSpy).toHaveBeenLastCalledWith(
              expect.any(HTMLElement),
              {
                timeSignature: getTimeSignature(TimeSignatureType.SIMPLE_4_4),
                measures: [
                  {
                    noteGroups: getGeneratedNoteGroups(
                      NoteGroupType.H,
                      NoteGroupType.H
                    ),
                  },
                  {
                    noteGroups: getGeneratedNoteGroups(
                      NoteGroupType.Q,
                      NoteGroupType.Q,
                      NoteGroupType.Q,
                      NoteGroupType.Q
                    ),
                  },
                ],
              },
              expect.any(Number),
              expect.any(Number),
              scoreDimensionConfig
            );
          });
        });
      });

      describe('after making score setting changes', () => {
        beforeEach(() => {
          clickByRole('button', 'openSettingsMenu');
          clickByRole('button', 'expand timeSignatureSelection');
          clickByRole('radio', '34TimeSignature');
          clickByRole('button', 'expand noteSelection');
          clickByRole('button', 'deselectAll basicNotes');
          clickByRole('button', 'deselectAll basicRests');
          clickByRole('button', 'deselectAll simpleBeamedNotes');
          clickByRole('checkbox', 'aDottedHalfNote');
          clickByRole('button', 'closeSettingsMenu');
          clickByRole('button', 'newRhythm');
        });

        it('renders a new score with the new note selections', async () => {
          expect(createScoreSpy).toHaveBeenCalledTimes(1);
          await waitFor(() => {
            expect(createScoreSpy).toHaveBeenLastCalledWith(
              expect.any(HTMLElement),
              {
                timeSignature: getTimeSignature(TimeSignatureType.SIMPLE_3_4),
                measures: [
                  {
                    noteGroups: getGeneratedNoteGroups(NoteGroupType.HD),
                  },
                  {
                    noteGroups: getGeneratedNoteGroups(NoteGroupType.HD),
                  },
                ],
              },
              expect.any(Number),
              expect.any(Number),
              scoreDimensionConfig
            );
          });
        });
      });
    });
  });
});
