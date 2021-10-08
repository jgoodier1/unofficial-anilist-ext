import React from 'react';
import { useQuery } from '@apollo/client';
import styled from 'styled-components';

import { GET_CHARACTER_MEDIA } from '../queries';
import CharacterCard from './CharacterCard';
import FetchMoreButton from '../../../components/FetchMoreButton';

interface Props {
  id: string;
}

interface Character {
  id: number;
  role: string;
  name: string;
  voiceActors: {
    id: number;
    name: {
      full: string;
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
}

const CharacterTab: React.FC<Props> = ({ id }) => {
  const { data, error, loading, fetchMore } = useQuery(GET_CHARACTER_MEDIA, {
    variables: { id, page: 1 }
  });

  if (loading) return <p>Loading</p>;

  if (error) {
    console.log(error);
    return <p>There was an error fetching the characters</p>;
  }

  const loadMore = () => {
    const page = data.Media.characters.pageInfo.currentPage + 1;
    fetchMore({
      variables: { page }
    });
  };

  return (
    <Wrapper>
      <div>
        {data.Media.characters.edges.map((character: Character) => {
          return <CharacterCard character={character} key={character.id} />;
        })}
      </div>
      {data.Media.characters.pageInfo.hasNextPage && (
        <FetchMoreButton onClick={loadMore}>Show More</FetchMoreButton>
      )}
    </Wrapper>
  );
};

export default CharacterTab;

const Wrapper = styled.section`
  margin: 16px 32px;
  display: grid;
`;
