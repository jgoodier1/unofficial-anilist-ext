import React from 'react';
import styled from 'styled-components';

interface Props {
  score: {
    score: number;
    amount: number;
  };
  max: number;
}

interface BarStyleProps {
  height: number;
  score: number;
}

const BAR_COLOURS = {
  10: '#FF0909',
  20: '#FD3E02',
  30: '#FF9900',
  40: '#F5BF00',
  50: '#FFE600',
  60: '#FAFF00',
  70: '#D2F400',
  80: '#ADFF00',
  90: '#8FFF00',
  100: '#62FF02'
};

const GraphBar: React.FC<Props> = ({ score, max }) => {
  return (
    <Wrapper>
      <Paragraph>{score.amount}</Paragraph>
      <Bar height={(score.amount / max) * 75} score={score.score} />
      <Paragraph>{score.score}</Paragraph>
    </Wrapper>
  );
};

export default GraphBar;

const Wrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
`;

const Bar = styled.div<BarStyleProps>`
  max-height: 75px;
  min-height: 17px;
  width: 16px;
  /* ???? */
  /* background-color: black; */
  border-radius: 20px;

  height: ${props => props.height + 'px'};
  background-color: ${props => BAR_COLOURS[props.score]};
`;

const Paragraph = styled.p`
  font-size: 12px;
`;
