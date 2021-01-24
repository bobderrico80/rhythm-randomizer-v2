import React, { useContext } from 'react';
import classnames from 'classnames';
import { buildBemClassName } from '../modules/util';
import './MeasureCountSelection.scss';
import Select from './Select';
import { AppContext, MeasureCount } from '../App';
import { createDispatchUpdateScoreSettings } from '../modules/reducer';

export interface MeasureCountSelectionProps {
  measureCountOptions: number[];
}

const buildClassName = buildBemClassName('c-rr-measure-count-selection');

const MeasureCountSelection = ({
  measureCountOptions,
}: MeasureCountSelectionProps) => {
  const { state, dispatch } = useContext(AppContext);
  const { measureCount } = state.scoreSettings;
  const dispatchUpdateScoreSettings = createDispatchUpdateScoreSettings(
    dispatch
  );

  const handleMeasureCountChange = (measureCount: string) => {
    dispatchUpdateScoreSettings({
      measureCount: parseInt(measureCount, 10) as MeasureCount,
    });
  };

  return (
    <section
      className={classnames('c-rr-settings-form__section', buildClassName()())}
    >
      <fieldset className={buildClassName('fieldset')()}>
        <Select
          id="measure-count"
          label="Total measures:"
          value={measureCount.toString()}
          onChange={handleMeasureCountChange}
          options={measureCountOptions.map((measureCountOption) => ({
            value: measureCountOption.toString(),
            display: `${measureCountOption} measure${
              measureCountOption > 1 ? 's' : ''
            }`,
          }))}
        />
      </fieldset>
    </section>
  );
};

export default MeasureCountSelection;
