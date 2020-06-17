import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import actions from '../../actions';
import { scales } from '../../constants/theory';

const ScaleContainer = styled.div`
  display: flex;
`;
const Mode = styled.div`
  border: 1px solid rgb(33, 37, 43);
  padding: 2px 13px;
  width: 50px;
  height: 33px;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-left: 0;
  border-bottom: 0;
  ${({ selected }) =>
    (selected ? 'color: rgb(41, 110, 215);' : 'rgb(141,152,169);')} background: rgb(33,37,43);
  transition: all 0.2s ease;
  justify-content: center;
  text-align: center;
  flex: 1;
  user-select: none;
  &:hover {
    background: rgb(33, 37, 43);
    color: white;
    cursor: pointer;
    transform: scale(1.1);
    box-shadow: 3px 3px 20px 1px #ccc;
  }
  &:active {
    color: rgb(33, 37, 43);
    width: 44px;
    transform: scale(1.4);
    height: 27px;
    border: 3px solid rgb(33, 37, 43);
    background: rgb(216, 0, 0);
  }
`;

const Container = styled.div`
  border-bottom: 1px solid rgb(33, 37, 43);
  margin-bottom: 3px;
`;

const ModeRow = ({ scale, selectedModes, onModeClick }) => (
  <ScaleContainer>
    {scales[scale].modes.map((mode, idx) => (
      <Mode
        key={idx}
        selected={selectedModes[idx + 1]}
        onClick={() => onModeClick(scale, idx + 1)}
      >
        {mode}
      </Mode>
      ))}
  </ScaleContainer>
);

class ModeSelect extends React.Component {
  render() {
    return (
      <Container>
        {['major', 'harmonicMinor', 'melodicMinor'].map((scale, idx) => (
          <ModeRow
            key={idx}
            scale={scale}
            selectedModes={this.props.modeRows[scale]}
            onModeClick={this.props.onModeClick}
          />
        ))}
      </Container>
    );
  }
}

const mapStateToProps = ({ modeRows }) => ({
  modeRows
});

const mapDispatchToProps = dispatch => ({
  onModeClick: (scale, mode) => dispatch(actions.TOGGLE_MODE({ scale, mode }))
});

export default connect(mapStateToProps, mapDispatchToProps)(ModeSelect);
