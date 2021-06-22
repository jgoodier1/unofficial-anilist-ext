import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

interface Character {
  character: {
    id: number;
    role: string;
    name: string;
    voiceActors: {
      id: string;
      name: {
        full: number;
      };
      language: string;
      image: {
        medium: string;
      };
    }[];
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

const CharacterCard: React.FC<Character> = ({ character }) => {
  return (
    <Wrapper>
      <CharacterLink to={`/character/${character.node.id}`}>
        <Image src={character.node.image.medium} alt='' />
        <Paragraph>{character.node.name.full}</Paragraph>
        <Paragraph>{character.role}</Paragraph>
      </CharacterLink>
      {character.voiceActors.length > 0 && (
        <ActorLink to={`/staff/${character.voiceActors[0].id}`}>
          <Paragraph>{character.voiceActors[0].name.full}</Paragraph>
          <Paragraph>{character.voiceActors[0].language}</Paragraph>
          <ActorImage src={character.voiceActors[0].image.medium} alt='' />
        </ActorLink>
      )}
    </Wrapper>
  );
};

export default CharacterCard;

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 200px 200px;
  border: none;
  background-color: #fafafa;
  width: 100%;
  margin-bottom: 16px;
  padding: 0;
`;

const CharacterLink = styled(Link)`
  display: grid;
  padding: 0;
  grid-template-columns: 70px auto;
  justify-items: start;
  text-decoration: none;
  color: black;
`;

const ActorLink = styled(Link)`
  display: grid;
  padding: 0;
  grid-template-columns: auto 70px;
  justify-items: end;
  text-decoration: none;
  color: black;
`;

const Image = styled.img`
  height: 100px;
  grid-row: 1/3;
  max-width: 60px;
  object-fit: cover;
`;

const ActorImage = styled(Image)`
  grid-column: 2;
`;

const Paragraph = styled.p`
  align-self: center;
  font-size: 14px;
  text-align: left;
`;
