import React from 'react';
import styled from 'styled-components';

import { COLOURS } from '../constants';

interface Props {
  status: {
    status: number;
    amount: number;
  };
  index: number;
}

interface StylingProps {
  index: number;
}

const StatusCard: React.FC<Props> = ({ status, index }) => {
  return (
    <Wrapper>
      <Status index={index}>{status.status}</Status>
      <AmountWrapper>
        <Amount index={index}>{status.amount}</Amount> Users
      </AmountWrapper>
    </Wrapper>
  );
};

export default StatusCard;

const Wrapper = styled.div`
  display: flex;
  flex-flow: column;
`;

const Status = styled.div<StylingProps>`
  padding: 4px 8px;
  color: white;
  width: max-content;
  border-radius: 8px;

  background-color: ${props => COLOURS[props.index]};
`;

const AmountWrapper = styled.p`
  margin-bottom: 0;
  text-align: center;
`;

const Amount = styled.span<StylingProps>`
  margin-bottom: 0;
  text-align: center;

  color: ${props => COLOURS[props.index]};
`;
