import React from 'react';
import styled from 'styled-components';

interface Props {
  onClick: () => void;
  children: React.ReactNode;
}

const FetchMoreButton: React.FC<Props> = ({ children, onClick }) => {
  return <Button onClick={onClick}>{children}</Button>;
};

export default FetchMoreButton;

const Button = styled.button`
  cursor: pointer;
  background-color: #236eff;
  font-size: 18px;
  border: none;
  padding: 16px;
  color: white;
  margin-left: auto;
  margin-right: auto;
`;
