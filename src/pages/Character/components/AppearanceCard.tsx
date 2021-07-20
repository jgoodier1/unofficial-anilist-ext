import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

interface Props {
  appearance: {
    id: number;
    characterRole: string;
    voiceActorRoles: {
      voiceActor: {
        id: number;
        name: {
          full: string;
        };
        image: {
          medium: string;
        };
        language: string;
      };
    }[];
    node: {
      id: number;
      type: 'ANIME' | 'MANGA';
      title: {
        userPreferred: string;
      };
      coverImage: {
        large: string;
      };
      startDate: {
        year: number;
      };
      mediaListEntry: {
        id: number;
        status: 'CURRENT' | 'COMPLETED' | 'PLANNING' | 'DROPPED' | 'PAUSED' | 'REPEATING';
      } | null;
    };
  };
}

const AppearanceCard: React.FC<Props> = ({ appearance }) => {
  return (
    <Wrapper>
      <MediaLink to={`/media/${appearance.node.id}`}>
        <Image
          src={appearance.node.coverImage.large}
          alt={`cover image for ${appearance.node.title.userPreferred}`}
        />
      </MediaLink>
      <UnstyledLink to={`/media/${appearance.node.id}`}>
        <Title>{appearance.node.title.userPreferred}</Title>
      </UnstyledLink>

      {appearance.voiceActorRoles.length > 0 && (
        <>
          <UnstyledLink to={`/staff/${appearance.voiceActorRoles[0].voiceActor.id}`}>
            <Name>{appearance.voiceActorRoles[0].voiceActor.name.full}</Name>
          </UnstyledLink>
          <ActorLink to={`/staff/${appearance.voiceActorRoles[0].voiceActor.id}`}>
            <Image
              src={appearance.voiceActorRoles[0].voiceActor.image.medium}
              alt={`image of ${appearance.voiceActorRoles[0].voiceActor.name.full}`}
            />
          </ActorLink>
        </>
      )}
    </Wrapper>
  );
};

export default AppearanceCard;

const Wrapper = styled.div`
  position: relative;
  width: 121px;
`;

const MediaLink = styled(Link)`
  width: 121px;
  height: 170px;
  display: block;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const UnstyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`;

const Title = styled.h3`
  font-size: 14px;
  font-weight: 600;
  margin-top: 8px;
  margin-bottom: 0;
`;

const Name = styled.p`
  font-size: 12px;
  margin-top: 0;
`;

const ActorLink = styled(Link)`
  position: absolute;
  top: 0;
  right: 0;
  width: 40px;
  height: 55px;
  border: 1px solid white;
`;
