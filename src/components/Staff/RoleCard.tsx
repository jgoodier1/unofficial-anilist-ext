import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

interface Props {
  role: {
    staffRole: string;
    node: {
      id: number;
      type: 'ANIME' | 'MANGA';
      title: {
        userPreferred: string;
      };
      coverImage: {
        large: string;
      };
      mediaListEntry: {
        id: number;
        status: 'CURRENT' | 'COMPLETED' | 'PLANNING' | 'DROPPED' | 'PAUSED' | 'REPEATING';
      } | null;
    };
  };
}

const RoleCard: React.FC<Props> = ({ role }) => {
  return (
    <Wrapper>
      <MediaLink to={`/media/${role.node.id}`}>
        <Image
          src={role.node.coverImage.large}
          alt={`cover image for ${role.node.title.userPreferred}`}
        />
      </MediaLink>
      <TitleLink to={`/media/${role.node.id}`}>
        <Title>{role.node.title.userPreferred}</Title>
        <Role>{role.staffRole}</Role>
      </TitleLink>
    </Wrapper>
  );
};

export default RoleCard;

const Wrapper = styled.div`
  width: 121px;
`;

const MediaLink = styled(Link)`
  width: 121px;
  height: 170px;
  display: block;
  margin-bottom: 8px;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const TitleLink = styled(Link)`
  margin-top: 8px;
  color: inherit;
  text-decoration: none;
`;

const Title = styled.h3`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 0;
`;

const Role = styled.p`
  font-size: 12px;
  margin-top: 0;
`;
