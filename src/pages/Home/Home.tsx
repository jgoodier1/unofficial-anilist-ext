import React, { useContext } from 'react';
import { useQuery } from '@apollo/client';
import styled from 'styled-components';
import { UserIdContext } from '../../context';
import { GET_LISTS } from '../../queries';

import HomeCard from './components/HomeCard';

interface Props {
  type: 'ANIME' | 'MANGA';
}

interface List {
  entries: Entry[];
}

// figure out how to extract this
interface Entry {
  id: number;
  status: 'CURRENT' | 'REPEATING' | 'PAUSED' | 'DROPPED' | 'PLANNING' | 'COMPLETED';
  progress: number;
  updatedAt: number;
  media: {
    id: number;
    title: {
      userPreferred: string;
    };
    episodes: number | undefined;
    chapters: number | undefined;
    coverImage: {
      medium: string;
    };
    status: string;
    type: 'ANIME' | 'MANGA';
    nextAiringEpisode: {
      airingAt: number | undefined;
      timeUntilAiring: number | undefined;
      episode: number | undefined;
    };
  };
}

const HomeSection: React.FC<Props> = ({ type }) => {
  const userId = useContext(UserIdContext);

  if (userId === 0) return <p>Loading...</p>;
  const { loading, error, data } = useQuery(GET_LISTS, {
    variables: {
      userId,
      type
    }
  });
  if (loading) {
    return <p>Loading...</p>;
  }
  if (error) {
    console.log(error);
    return <p>There was an error fetching your list</p>;
  }
  const currentList: Entry[] = [];
  data.MediaListCollection.lists.forEach((list: List) => {
    if (list.entries[0].status === 'CURRENT' || list.entries[0].status === 'REPEATING') {
      list.entries.forEach(entry => {
        currentList.push(entry);
      });
    }
  });

  const currentlyAiring = currentList.filter(
    entry => entry.media.nextAiringEpisode !== null
  );
  currentlyAiring.sort((a, b) => {
    if (
      a.media.nextAiringEpisode.timeUntilAiring &&
      b.media.nextAiringEpisode.timeUntilAiring
    ) {
      if (
        a.media.nextAiringEpisode.timeUntilAiring >
        b.media.nextAiringEpisode.timeUntilAiring
      ) {
        return 1;
      } else return -1;
    } else return -1;
  });
  const finishedAiring = currentList.filter(
    entry => entry.media.nextAiringEpisode === null
  );
  finishedAiring.sort((a, b) => {
    if (a.updatedAt < b.updatedAt) return 1;
    else return -1;
  });

  const sortedEntries = [...currentlyAiring, ...finishedAiring];

  const homeCards = sortedEntries.map((entry, i) => {
    return <HomeCard entry={entry} key={entry.id} index={i} />;
  });

  return (
    <>
      <Heading>{type === 'ANIME' ? 'Anime in Progress' : 'Manga in Progress'}</Heading>
      <CardsWrapper>{homeCards}</CardsWrapper>
    </>
  );
};

const Heading = styled.h2`
  margin-left: 2rem;
  margin-bottom: 0;
  font-size: 16px;
`;

const CardsWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 20px;
  margin: 1rem;
  margin-top: 0.5rem;
  padding: 1rem;
  background: #fafafa;
  width: 27rem;
  isolation: isolate;
`;

const Home: React.FC = () => {
  return (
    <Wrapper>
      <HomeSection type='ANIME' />
      <HomeSection type='MANGA' />
    </Wrapper>
  );
};

const Wrapper = styled.main`
  width: 464px;
  min-height: 200px;
`;

export default Home;
