import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

interface Staff {
  staff: {
    id: number;
    role: string;
    node: {
      id: number;
      name: {
        full: string;
      };
      image: {
        medium: string;
      };
    };
  };
}

const StaffCard: React.FC<Staff> = ({ staff }) => {
  return (
    <WrappingLink to={`/staff/${staff.node.id}`}>
      <Image src={staff.node.image.medium} alt='' />
      <p>{staff.node.name.full}</p>
      <p>{staff.role}</p>
    </WrappingLink>
  );
};

export default StaffCard;

const WrappingLink = styled(Link)`
  padding: 0;
  background-color: #fafafa;
  display: grid;
  grid-template-columns: 55px auto;
  margin-bottom: 16px;
  width: 100%;
  text-align: left;
  grid-gap: 0 10px;
  font-size: 12px;
  text-decoration: none;
  color: black;
`;

const Image = styled.img`
  height: 78px;
  grid-row: 1/3;
  max-width: 55px;
  object-fit: cover;
`;
