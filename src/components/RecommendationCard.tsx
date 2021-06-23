import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

interface Props {
  recommendation: {
    id: number;
    rating: number;
    mediaRecommendation: {
      id: number;
      title: {
        userPreferred: string;
      };
      coverImage: {
        medium: string;
      };
      type: 'ANIME' | 'MANGA';
    };
  };
}

const RecommendationCard: React.FC<Props> = ({ recommendation }) => {
  return (
    <WrappingLink to={`/media/${recommendation.mediaRecommendation.id}`}>
      <Image src={recommendation.mediaRecommendation.coverImage.medium} alt='' />
      <Title>{recommendation.mediaRecommendation.title.userPreferred}</Title>
    </WrappingLink>
  );
};

export default RecommendationCard;

const WrappingLink = styled(Link)`
  margin-right: 16px;
  display: flex;
  flex-flow: column;
  justify-content: start;
  max-width: 70px;
  padding: 0;
  text-align: center;
  text-decoration: none;
  color: black;
`;

const Image = styled.img`
  height: 100px;
  max-width: 70px;
  object-fit: cover;
`;

const Title = styled.p`
  font-size: 12px;
`;
