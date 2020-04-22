import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Div = styled.div`
  display: flex;
`;

const Transport = ({ onPlay, onExport, setBpm, bpm }) => {
  return (
    <Div>
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
    </Div>
  );
};

Transport.propTypes = {};

export default Transport;
