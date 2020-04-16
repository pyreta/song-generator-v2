import React from 'react';
import PropTypes from 'prop-types';

const Transport = ({ onPlay, onExport, setBpm, bpm }) => {
  return (
    <>
      <button onClick={onPlay} type="submit">
        PLAY
      </button>
      <button onClick={onExport} type="submit">
        EXPORT
      </button>
      <div>
        <input
          type="range"
          min={50}
          max={250}
          onChange={e => setBpm(parseInt(e.target.value, 10))}
          value={bpm}
        />
        {`bpm: ${bpm}`}
      </div>
    </>
  );
};

Transport.propTypes = {};

export default Transport;
