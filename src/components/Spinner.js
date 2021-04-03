import React from 'react';
import './Spinner.scss';

const Spinner = () => {
  return (
    <div className="c-rr-spinner" aria-label="loading">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

export default Spinner;
