import React from 'react';
import { useQuery, gql } from '@apollo/client';
import styled from 'styled-components';

import CharacterCard from './CharacterCard';

interface Props {
  id: string;
}

export interface Characters {
  edges: Character[];
  pageInfo: {
    total: number;
    currentPage: number;
    hasNextPage: boolean;
  };
}

export interface Character {
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

export const GET_CHARACTER_MEDIA = gql`
  query GetCharacters($id: Int, $page: Int) {
    Media(id: $id) {
      id
      characters(page: $page, perPage: 25, sort: [ROLE, RELEVANCE, ID]) {
        edges {
          id
          role
          name
          voiceActors(language: JAPANESE, sort: [RELEVANCE, ID]) {
            id
            name {
              full
            }
            language: languageV2
            image {
              medium
            }
          }
          node {
            id
            name {
              full
            }
            image {
              medium
            }
          }
        }
        pageInfo {
          total
          currentPage
          hasNextPage
        }
      }
    }
  }
`;

const CharacterTab: React.FC<Props> = ({ id }) => {
  const { data, error, loading, fetchMore } = useQuery(GET_CHARACTER_MEDIA, {
    variables: { id, page: 1 }
  });

  console.log(data);

  if (loading) return <p>Loading</p>;

  if (error) {
    console.log(error);
    return <p>There was an error</p>;
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
        <button onClick={loadMore}>Fetch more</button>
      )}
    </Wrapper>
  );
};

export default CharacterTab;

const Wrapper = styled.section`
  margin: 16px 32px;
  display: grid;
`;
