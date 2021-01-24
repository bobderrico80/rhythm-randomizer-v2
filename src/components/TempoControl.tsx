import React, {
  FormEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import classnames from 'classnames';
import { buildBemClassName } from '../modules/util';
import './TempoControl.scss';
import Icon from './Icon';
import quarterNote from '../svg/notes/q.svg';
import dottedQuarterNote from '../svg/notes/cqd.svg';
import { TimeSignatureComplexity } from '../modules/time-signature';
import { AppContext } from '../App';
import { createDispatchUpdateScoreSettings } from '../modules/reducer';

const buildClassName = buildBemClassName('c-rr-tempo-control');

export const MIN_TEMPO = 40; // bpm
export const MAX_TEMPO = 300; // bpm

const MOUSE_HOLD_DELAY = 500; // ms
const HOLD_DELAY_INTERVAL = 10; // bpm

const TempoControl = () => {
  const { state, dispatch } = useContext(AppContext);
  const dispatchUpdateScoreSettings = createDispatchUpdateScoreSettings(
    dispatch
  );

  const { timeSignature, tempo } = state.scoreSettings;

  const [displayedTempo, setDisplayedTempo] = useState('');
  const [, setIntervalId] = useState<number | null>(null);
  const [, setHolding] = useState(false);

  const displayedTempoRef = useRef<string | null>(null);
  const isCompoundMeter =
    timeSignature.complexity === TimeSignatureComplexity.COMPOUND;
  const mmMarkingSvg = isCompoundMeter ? dottedQuarterNote : quarterNote;

  useEffect(() => {
    setDisplayedTempo(tempo.toString());
  }, [tempo]);

  const handleButtonClick = (event: FormEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const tempoChange = event.currentTarget.id === 'tempo-increase' ? 1 : -1;
    const nextTempo = tempo + tempoChange;

    if (nextTempo < MIN_TEMPO) {
      dispatchUpdateScoreSettings({ tempo: MIN_TEMPO });
      return;
    }

    if (nextTempo > MAX_TEMPO) {
      dispatchUpdateScoreSettings({ tempo: MAX_TEMPO });
      return;
    }

    dispatchUpdateScoreSettings({ tempo: nextTempo });
  };

  // Handle long press to increment/decrement by tens
  const handleButtonMouseDown = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    event.currentTarget.focus();

    // Handle left-clicks only
    if (event.button !== 0) {
      return;
    }

    const direction = event.currentTarget.id === 'tempo-increase' ? 1 : -1;

    // Handler for when we release the button (to be set on `window`)
    const handleButtonMouseUp = () => {
      // Clear the interval to stop incrementing
      setIntervalId((previousIntervalId) => {
        if (previousIntervalId) {
          window.clearInterval(previousIntervalId);
        }
        return null;
      });

      // If we were in the process of holding the button, capture the `click` event so that we
      // don't increment by one more
      setHolding((previousHolding) => {
        const captureClick = (event: MouseEvent) => {
          event.preventDefault();
          event.stopPropagation();
          window.removeEventListener('click', captureClick, true);
        };

        if (previousHolding) {
          window.addEventListener('click', captureClick, true);
        }

        return false;
      });

      // Update tempo with displayedTempoRef. Can't use displayedTempo state because it hasn't
      // updated yet here.
      if (displayedTempoRef.current) {
        dispatchUpdateScoreSettings({
          tempo: parseInt(displayedTempoRef.current, 10),
        });
        displayedTempoRef.current = null;
      }

      window.removeEventListener('mouseup', handleButtonMouseUp);
    };

    window.addEventListener('mouseup', handleButtonMouseUp);

    // Interval to increment by 10 when holding button down
    const id = window.setInterval(() => {
      // Set a flag so that we know we started the holding process on mouseup
      setHolding(true);

      // Manipulate the displayed tempo and store in a ref. The mouseup handler will handle updating
      // the application state to the new tempo
      setDisplayedTempo((previousDisplayedTempo) => {
        const nextTempo =
          parseInt(previousDisplayedTempo, 10) +
          direction * HOLD_DELAY_INTERVAL;

        let nextDisplayedTempo;

        if (nextTempo > MAX_TEMPO) {
          nextDisplayedTempo = MAX_TEMPO.toString();
        } else if (nextTempo < MIN_TEMPO) {
          nextDisplayedTempo = MIN_TEMPO.toString();
        } else {
          nextDisplayedTempo = nextTempo.toString();
        }

        displayedTempoRef.current = nextDisplayedTempo;

        return nextDisplayedTempo;
      });
    }, MOUSE_HOLD_DELAY);

    setIntervalId(id);
  };

  const handleInputChange = (event: FormEvent<HTMLInputElement>) => {
    setDisplayedTempo(event.currentTarget.value);
  };

  // Sync app tempo state with displayed state on input blur
  const handleInputBlur = () => {
    let nextValue = parseInt(displayedTempo, 10);

    if (isNaN(nextValue)) {
      nextValue = tempo;
    } else if (nextValue > MAX_TEMPO) {
      nextValue = MAX_TEMPO;
    } else if (nextValue < MIN_TEMPO) {
      nextValue = MIN_TEMPO;
    }

    setDisplayedTempo(nextValue.toString());
    dispatchUpdateScoreSettings({ tempo: nextValue });
  };

  return (
    <div className={buildClassName()()}>
      <label htmlFor="tempo" className={buildClassName('label')()}>
        <div className={buildClassName('label-text')()}>Tempo:</div>
        <div className={buildClassName('mm-marking')()}>
          <Icon
            svg={mmMarkingSvg}
            alt={`${isCompoundMeter ? 'dotted ' : ''} quarter note`}
            className={buildClassName('mm-marking-icon')()}
          />
          {' = '}
        </div>
        <div className={buildClassName('container')()}>
          <button
            type="button"
            id="tempo-decrease"
            className={classnames(
              'c-rr-button',
              buildClassName('button')(),
              buildClassName('button')('decrease')
            )}
            onClick={handleButtonClick}
            onMouseDown={handleButtonMouseDown}
          >
            -
          </button>
          <input
            id="tempo"
            name="tempo"
            className={buildClassName('input')()}
            type="text"
            value={displayedTempo}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
          />
          <button
            type="button"
            id="tempo-increase"
            className={classnames(
              'c-rr-button',
              buildClassName('button')(),
              buildClassName('button')('increase')
            )}
            onClick={handleButtonClick}
            onMouseDown={handleButtonMouseDown}
          >
            +
          </button>
        </div>
      </label>
    </div>
  );
};

export default TempoControl;
