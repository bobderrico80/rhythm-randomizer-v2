import React from 'react';
import Spinner from './Spinner';
import './Loading.scss';

const Loading = () => {
  return (
    <div className="c-rr-loading">
      <Spinner />
    </div>
  );
};

export default Loading;
