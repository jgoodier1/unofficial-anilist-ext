import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

interface Relation {
  relation: {
    id: number;
    relationType: string;
    node: {
      id: number;
      type: 'ANIME' | 'MANGA';
      title: {
        userPreferred: string;
      };
      format: string;
      status: string;
      coverImage: {
        medium: string;
      };
    };
  };
}

const RelationCard: React.FC<Relation> = ({ relation }) => {
  return (
    <WrappingLink to={`/media/${relation.node.id}`}>
      <Image src={relation.node.coverImage.medium} alt='' />
      <ContentWrapper>
        <Paragraph>{relation.relationType}</Paragraph>
        <Paragraph>{relation.node.title.userPreferred}</Paragraph>
        <Paragraph>
          {relation.node.format} • {relation.node.status}
        </Paragraph>
      </ContentWrapper>
    </WrappingLink>
  );
};

export default RelationCard;

const WrappingLink = styled(Link)`
  display: grid;
  grid-template-columns: 80px auto;
  padding: 0;
  padding-bottom: 8px;
  background-color: #fafafa;
  height: 108px;
  margin-right: 16px;
  text-decoration: none;
  color: black;
`;

const Image = styled.img`
  height: 108px;
  max-width: 70px;
  object-fit: cover;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-flow: column;
  justify-content: space-around;
  min-width: 250px;
  max-width: 400px;
`;

const Paragraph = styled.p`
  text-align: left;
  font-size: 14px;
  margin: 0;
`;
