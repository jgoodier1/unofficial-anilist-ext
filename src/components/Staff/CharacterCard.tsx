import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

interface Props {
  character: {
    characterRole: 'MAIN' | 'SUPPORTING' | 'BACKGROUND';
    characterName: string | null;
    node: {
      id: number;
      type: 'ANIME' | 'MANGA';
      title: {
        userPreferred: string;
      };
      coverImage: {
        medium: string;
      };
      startDate: {
        year: number;
      };
      mediaListEntry: {
        id: number;
        status: 'CURRENT' | 'COMPLETED' | 'PLANNING' | 'DROPPED' | 'PAUSED' | 'REPEATING';
      } | null;
    };
    characters: {
      id: number;
      name: {
        full: string;
      };
      image: {
        large: string;
      };
    }[];
  };
}

const CharacterCard: React.FC<Props> = ({ character }) => {
  return (
    <Wrapper>
      <CharacterLink to={`/character/${character.characters[0].id}`}>
        <Image
          src={character.characters[0].image.large}
          alt={`image of ${character.characters[0].name}`}
        />
      </CharacterLink>
      <MediaLink to={`/media/${character.node.id}`}>
        <Image
          src={character.node.coverImage.medium}
          alt={`cover image for ${character.node.title.userPreferred}`}
        />
      </MediaLink>
      <NameLink to={`/character/${character.characters[0].id}`}>
        <Name>{character.characters[0].name.full}</Name>{' '}
        {character.characterRole === 'MAIN' && <Role>Main</Role>}
      </NameLink>
      <TitleLink to={`/media/${character.node.id}`}>
        <Title>{character.node.title.userPreferred}</Title>
      </TitleLink>
    </Wrapper>
  );
};

export default CharacterCard;

const Wrapper = styled.div`
  position: relative;
  width: 121px;
`;

const CharacterLink = styled(Link)`
  width: 121px;
  height: 170px;
  display: block;
  margin-bottom: 8px;
`;

const MediaLink = styled(Link)`
  top: 0;
  position: absolute;
  right: 0;
  width: 40px;
  height: 55px;
  border: 1px solid white;
  display: block;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const NameLink = styled(Link)`
  font-size: 14px;
  font-weight: 400;
  color: inherit;
  margin-top: 8px;
  text-decoration: none;
`;

const Name = styled.h3`
  display: inline;
  margin-bottom: 0;
`;

const Role = styled.p`
  display: inline;
  margin-bottom: 0;
`;

const TitleLink = styled(Link)`
  font-size: 12px;
  color: inherit;
  text-decoration: none;
`;

const Title = styled.p`
  margin-top: 0;
`;
