import React from 'react';
import { useQuery, gql } from '@apollo/client';
import styled from 'styled-components';

import CharacterCard from './CharacterCard';

interface Props {
  id: string;
}

interface Characters {
  edges: {
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
  }[];
}

export const GET_CHARACTER_MEDIA = gql`
  query ($id: Int, $page: Int) {
    Media(id: $id) {
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

  if (loading) return <p>Loading</p>;

  if (error) {
    console.log(error);
    return <p>There was an error</p>;
  }

  const characters: Characters = data.Media.characters;

  const loadMore = () => {
    const page = data.Media.characters.pageInfo.currentPage + 1;
    console.log(page);
    fetchMore({ variables: { page } });
    console.log(data);
  };

  return (
    <Wrapper>
      <div>
        {characters.edges.map(character => {
          return <CharacterCard character={character} />;
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
