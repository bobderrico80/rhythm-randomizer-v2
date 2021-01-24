import { ClickType, getClick, getMetronomePlaybackPatterns } from './metronome';
import { PlaybackPattern } from './note';
import { getTimeSignature, TimeSignatureType } from './time-signature';

const expectPlaybackPatternToEqualClick = (
  playbackPattern: PlaybackPattern,
  clickType: ClickType
) => {
  expect({
    type: clickType,
    pitch: playbackPattern.pitch,
    velocity: playbackPattern.velocity,
  }).toEqual(getClick(clickType));
};

describe('The metronome module', () => {
  describe('getMetronomePlaybackPatterns() function', () => {
    let playbackPatterns: PlaybackPattern[] = [];

    describe('with subdivisions on ', () => {
      describe('with simple meters', () => {
        describe('with startOfMeasure click on', () => {
          beforeEach(() => {
            playbackPatterns = getMetronomePlaybackPatterns(
              getTimeSignature(TimeSignatureType.SIMPLE_3_4),
              {
                active: true,
                startOfMeasureClick: true,
                subdivisionClick: true,
                countOffMeasures: 0,
              }
            );
          });

          it('contains playback pattern for each beat and subdivision', () => {
            expect(playbackPatterns.length).toEqual(6);
          });

          it('contains playback patterns equal to 8th notes', () => {
            expect(
              playbackPatterns.every(
                (playbackPattern) => playbackPattern.toneDuration === '8n'
              )
            ).toEqual(true);
          });

          it('contains a measure click as the first playback pattern', () => {
            expectPlaybackPatternToEqualClick(
              playbackPatterns[0],
              ClickType.MEASURE
            );
          });

          it('contains the main playback pattern for the remaining downbeat clicks', () => {
            playbackPatterns.forEach((playbackPattern, index) => {
              // even numbers greater than one for remaining downbeats
              if (index > 1 && index % 2 === 0) {
                expectPlaybackPatternToEqualClick(
                  playbackPattern,
                  ClickType.MAIN
                );
              }
            });
          });

          it('contains the subdivision playback pattern for all upbeat clicks', () => {
            playbackPatterns.forEach((playbackPattern, index) => {
              // odd numbers for upbeats
              if (index % 2 !== 0) {
                expectPlaybackPatternToEqualClick(
                  playbackPattern,
                  ClickType.SUBDIVISION
                );
              }
            });
          });
        });

        describe('with startOfMeasure click off', () => {
          beforeEach(() => {
            playbackPatterns = getMetronomePlaybackPatterns(
              getTimeSignature(TimeSignatureType.SIMPLE_3_4),
              {
                active: true,
                startOfMeasureClick: false,
                subdivisionClick: true,
                countOffMeasures: 0,
              }
            );
          });

          it('contains playback pattern for each beat and subdivision', () => {
            expect(playbackPatterns.length).toEqual(6);
          });

          it('contains playback patterns equal to 8th notes', () => {
            expect(
              playbackPatterns.every(
                (playbackPattern) => playbackPattern.toneDuration === '8n'
              )
            ).toEqual(true);
          });

          it('contains the main playback pattern for all downbeat clicks', () => {
            playbackPatterns.forEach((playbackPattern, index) => {
              // even numbers for downbeats
              if (index % 2 === 0) {
                expectPlaybackPatternToEqualClick(
                  playbackPattern,
                  ClickType.MAIN
                );
              }
            });
          });

          it('contains the subdivision playback pattern for all upbeat clicks', () => {
            playbackPatterns.forEach((playbackPattern, index) => {
              // odd numbers for upbeats
              if (index % 2 !== 0) {
                expectPlaybackPatternToEqualClick(
                  playbackPattern,
                  ClickType.SUBDIVISION
                );
              }
            });
          });
        });
      });

      describe('with compound meters', () => {
        describe('with startOfMeasure click on', () => {
          beforeEach(() => {
            playbackPatterns = getMetronomePlaybackPatterns(
              getTimeSignature(TimeSignatureType.COMPOUND_9_8),
              {
                active: true,
                startOfMeasureClick: true,
                subdivisionClick: true,
                countOffMeasures: 0,
              }
            );
          });

          it('contains playback pattern for each beat and subdivision', () => {
            expect(playbackPatterns.length).toEqual(9);
          });

          it('contains playback patterns equal to 8th note triplets', () => {
            expect(
              playbackPatterns.every(
                (playbackPattern) => playbackPattern.toneDuration === '8t'
              )
            ).toEqual(true);
          });

          it('contains a measure click as the first playback pattern', () => {
            expectPlaybackPatternToEqualClick(
              playbackPatterns[0],
              ClickType.MEASURE
            );
          });

          it('contains the main playback pattern for the remaining downbeat clicks', () => {
            playbackPatterns.forEach((playbackPattern, index) => {
              // numbers evenly divisible by 3 and greater than one for remaining downbeats
              if (index > 1 && index % 3 === 0) {
                expectPlaybackPatternToEqualClick(
                  playbackPattern,
                  ClickType.MAIN
                );
              }
            });
          });

          it('contains the subdivision playback pattern for all upbeat clicks', () => {
            playbackPatterns.forEach((playbackPattern, index) => {
              // numbers not evenly divisible by 3 for upbeats
              if (index % 3 !== 0) {
                expectPlaybackPatternToEqualClick(
                  playbackPattern,
                  ClickType.SUBDIVISION
                );
              }
            });
          });
        });

        describe('with startOfMeasure click off', () => {
          beforeEach(() => {
            playbackPatterns = getMetronomePlaybackPatterns(
              getTimeSignature(TimeSignatureType.COMPOUND_9_8),
              {
                active: true,
                startOfMeasureClick: false,
                subdivisionClick: true,
                countOffMeasures: 0,
              }
            );
          });

          it('contains playback pattern for each beat and subdivision', () => {
            expect(playbackPatterns.length).toEqual(9);
          });

          it('contains playback patterns equal to 8th note triplets', () => {
            expect(
              playbackPatterns.every(
                (playbackPattern) => playbackPattern.toneDuration === '8t'
              )
            ).toEqual(true);
          });

          it('contains the main playback pattern the downbeat clicks', () => {
            playbackPatterns.forEach((playbackPattern, index) => {
              // numbers evenly divisible by 3 for downbeats
              if (index % 3 === 0) {
                expectPlaybackPatternToEqualClick(
                  playbackPattern,
                  ClickType.MAIN
                );
              }
            });
          });

          it('contains the subdivision playback pattern for all upbeat clicks', () => {
            playbackPatterns.forEach((playbackPattern, index) => {
              // numbers not evenly divisible by 3 for upbeats
              if (index % 3 !== 0) {
                expectPlaybackPatternToEqualClick(
                  playbackPattern,
                  ClickType.SUBDIVISION
                );
              }
            });
          });
        });
      });
    });

    describe('with subdivisions off', () => {
      describe('with startOfMeasure click on', () => {
        beforeEach(() => {
          playbackPatterns = getMetronomePlaybackPatterns(
            getTimeSignature(TimeSignatureType.SIMPLE_3_4),
            {
              active: true,
              startOfMeasureClick: true,
              subdivisionClick: false,
              countOffMeasures: 0,
            }
          );
        });

        it('contains playback pattern for each beat', () => {
          expect(playbackPatterns.length).toEqual(3);
        });

        it('contains playback patterns equal to quarter notes', () => {
          expect(
            playbackPatterns.every(
              (playbackPattern) => playbackPattern.toneDuration === '4n'
            )
          ).toEqual(true);
        });

        it('contains a measure click as the first playback pattern', () => {
          expectPlaybackPatternToEqualClick(
            playbackPatterns[0],
            ClickType.MEASURE
          );
        });

        it('contains the main playback pattern for the remaining downbeat clicks', () => {
          playbackPatterns.forEach((playbackPattern, index) => {
            // numbers greater than 0 for remaining downbeats
            if (index > 0) {
              expectPlaybackPatternToEqualClick(
                playbackPattern,
                ClickType.MAIN
              );
            }
          });
        });
      });

      describe('with startOfMeasure click off', () => {
        beforeEach(() => {
          playbackPatterns = getMetronomePlaybackPatterns(
            getTimeSignature(TimeSignatureType.SIMPLE_3_4),
            {
              active: true,
              startOfMeasureClick: false,
              subdivisionClick: false,
              countOffMeasures: 0,
            }
          );
        });

        it('contains playback pattern for each beat', () => {
          expect(playbackPatterns.length).toEqual(3);
        });

        it('contains playback patterns equal to quarter notes', () => {
          expect(
            playbackPatterns.every(
              (playbackPattern) => playbackPattern.toneDuration === '4n'
            )
          ).toEqual(true);
        });

        it('contains the main playback pattern for all downbeat clicks', () => {
          playbackPatterns.forEach((playbackPattern) => {
            expectPlaybackPatternToEqualClick(playbackPattern, ClickType.MAIN);
          });
        });
      });
    });
  });
});
