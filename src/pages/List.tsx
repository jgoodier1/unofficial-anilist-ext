import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import styled from 'styled-components';
import { UserIdContext } from '../context';
import { GET_LISTS } from '../queries';

interface List {
  entries: {
    id: number;
    status: 'CURRENT' | 'COMPLETED' | 'REPEATING' | 'DROPPED' | 'PLANNING' | 'PAUSED';
    score: number;
    progress: number;
    updatedAt: number;
    media: {
      id: number;
      title: {
        userPreferred: string;
      };
      coverImage: {
        medium: string;
      };
      type: 'ANIME' | 'MANGA';
      status: string;
      // probably don't need these 3
      episodes: number | undefined;
      chapters: number | undefined;
      nextAiringEpisode:
        | {
            airingAt: number;
            timeUntilAiring: number;
            episode: number;
          }
        | undefined;
    };
  }[];
}

interface ListSectionProps {
  list: {
    entries: {
      id: number;
      status: 'CURRENT' | 'COMPLETED' | 'REPEATING' | 'DROPPED' | 'PLANNING' | 'PAUSED';
      score: number;
      progress: number;
      updatedAt: number;
      media: {
        id: number;
        title: {
          userPreferred: string;
        };
        coverImage: {
          medium: string;
        };
        type: 'ANIME' | 'MANGA';
        status: string;
        // probably don't need these 3
        episodes: number | undefined;
        chapters: number | undefined;
        nextAiringEpisode:
          | {
              airingAt: number;
              timeUntilAiring: number;
              episode: number;
            }
          | undefined;
      };
    }[];
  }[];
  status: 'Current' | 'Completed' | 'Repeating' | 'Dropped' | 'Planning' | 'Paused';
}

interface ListRowProps {
  entry: {
    id: number;
    status: 'CURRENT' | 'COMPLETED' | 'REPEATING' | 'DROPPED' | 'PLANNING' | 'PAUSED';
    score: number;
    progress: number;
    updatedAt: number;
    media: {
      id: number;
      title: {
        userPreferred: string;
      };
      coverImage: {
        medium: string;
      };
      type: 'ANIME' | 'MANGA';
      status: string;
      // probably don't need these 3
      episodes: number | undefined;
      chapters: number | undefined;
      nextAiringEpisode:
        | {
            airingAt: number;
            timeUntilAiring: number;
            episode: number;
          }
        | undefined;
    };
  };
}

const List = () => {
  const location = useLocation();
  let type = '';
  if (location.pathname === '/anime') type = 'ANIME';
  else if (location.pathname === '/manga') type = 'MANGA';

  const userId = useContext(UserIdContext);

  const { data, error, loading } = useQuery(GET_LISTS, {
    variables: { type, userId }
  });

  if (loading) return <p>Loading...</p>;

  if (error) {
    console.log(error);
    return <p>There was an error</p>;
  }

  const current = data.MediaListCollection.lists.filter((list: List) => {
    return list.entries[0].status === 'CURRENT';
  });
  const completed = data.MediaListCollection.lists.filter((list: List) => {
    return list.entries[0].status === 'COMPLETED';
  });
  const planning = data.MediaListCollection.lists.filter((list: List) => {
    return list.entries[0].status === 'PLANNING';
  });
  const dropped = data.MediaListCollection.lists.filter((list: List) => {
    return list.entries[0].status === 'DROPPED';
  });
  const paused = data.MediaListCollection.lists.filter((list: List) => {
    return list.entries[0].status === 'PAUSED';
  });
  const repeating = data.MediaListCollection.lists.filter((list: List) => {
    return list.entries[0].status === 'REPEATING';
  });

  return (
    <main>
      <ListSection status='Current' list={current} />
      <ListSection status='Repeating' list={repeating} />
      <ListSection status='Completed' list={completed} />
      <ListSection status='Paused' list={paused} />
      <ListSection status='Dropped' list={dropped} />
      <ListSection status='Planning' list={planning} />
    </main>
  );
};

export default List;

const ListSection: React.FC<ListSectionProps> = ({ status, list }) => {
  if (list.length === 0) return <div></div>;
  return (
    <section>
      <Heading>{status}</Heading>
      <Header>
        <TitleHeader>Title</TitleHeader>
        <ScoreHeader>Score</ScoreHeader>
        <ProgressHeader>Progress</ProgressHeader>
      </Header>
      {list.map(list => {
        // the field is read-only
        const entries = [...list.entries];
        entries.sort((a, b) => {
          if (a.media.title.userPreferred > b.media.title.userPreferred) return 1;
          else return -1;
        });
        return entries.map(entry => {
          return <ListRow entry={entry} key={entry.id} />;
        });
      })}
    </section>
  );
};

const ListRow: React.FC<ListRowProps> = ({ entry }) => {
  let score = entry.score.toString();
  if (entry.score === 0) score = '';

  return (
    <Row>
      <Image src={entry.media.coverImage.medium} alt='' />
      <EditLink to={`/edit/${entry.media.id}`}>
        <Svg
          version='1.1'
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 -1 401.52289 401'
          fill='white'
        >
          <path d='m370.589844 250.972656c-5.523438 0-10 4.476563-10 10v88.789063c-.019532 16.5625-13.4375 29.984375-30 30h-280.589844c-16.5625-.015625-29.980469-13.4375-30-30v-260.589844c.019531-16.558594 13.4375-29.980469 30-30h88.789062c5.523438 0 10-4.476563 10-10 0-5.519531-4.476562-10-10-10h-88.789062c-27.601562.03125-49.96875 22.398437-50 50v260.59375c.03125 27.601563 22.398438 49.96875 50 50h280.589844c27.601562-.03125 49.96875-22.398437 50-50v-88.792969c0-5.523437-4.476563-10-10-10zm0 0' />
          <path d='m376.628906 13.441406c-17.574218-17.574218-46.066406-17.574218-63.640625 0l-178.40625 178.40625c-1.222656 1.222656-2.105469 2.738282-2.566406 4.402344l-23.460937 84.699219c-.964844 3.472656.015624 7.191406 2.5625 9.742187 2.550781 2.546875 6.269531 3.527344 9.742187 2.566406l84.699219-23.464843c1.664062-.460938 3.179687-1.34375 4.402344-2.566407l178.402343-178.410156c17.546875-17.585937 17.546875-46.054687 0-63.640625zm-220.257812 184.90625 146.011718-146.015625 47.089844 47.089844-146.015625 146.015625zm-9.40625 18.875 37.621094 37.625-52.039063 14.417969zm227.257812-142.546875-10.605468 10.605469-47.09375-47.09375 10.609374-10.605469c9.761719-9.761719 25.589844-9.761719 35.351563 0l11.738281 11.734375c9.746094 9.773438 9.746094 25.589844 0 35.359375zm0 0' />
        </Svg>
      </EditLink>
      <Title to={`/media/${entry.media.id}`}>{entry.media.title.userPreferred}</Title>
      <P>{score}</P>
      <P>{entry.progress}</P>
    </Row>
  );
};

const Heading = styled.h2`
  margin-left: 24px;
`;

// maybe styled.header ? not sure about semantics
const Header = styled.div`
  display: grid;
  grid-template-columns: 50px 245px 55px 80px;
  grid-gap: 5px;
  align-items: center;
  background-color: #fafafa;
  padding: 0 10px;
  width: 100%;
`;

const HeaderItem = styled.p`
  font-weight: bold;
`;

const TitleHeader = styled(HeaderItem)`
  grid-column: 2;
`;

const ScoreHeader = styled(HeaderItem)`
  grid-column: 3;
  text-align: center;
`;

const ProgressHeader = styled(HeaderItem)`
  grid-column: 4;
  text-align: center;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 50px 245px 55px 80px;
  grid-gap: 5px;
  align-items: center;
  background-color: #fafafa;
  padding: 0 10px;
  width: 100%;
`;

const Image = styled.img`
  width: 40px;
  height: 40px;
  object-fit: cover;
  position: relative;
  grid-column: 1;
  grid-row: 1;
  place-self: center;
`;

const EditLink = styled(Link)`
  background: #1f263199;
  width: 40px;
  height: 40px;
  grid-column: 1;
  grid-row: 1;
  place-self: center;
  isolation: isolate;
  opacity: 0;
  transition: 0.2s;
  display: grid;
  place-items: center;

  &:hover,
  &:focus {
    opacity: 1;
  }
`;

const Svg = styled.svg`
  width: 30px;
  height: 30px;
`;

const Title = styled(Link)`
  font-weight: normal;
  text-align: left;
  margin: 0;
  font-size: 16px;
  color: inherit;
  text-decoration: none;
`;

const P = styled.p`
  font-size: 16px;
  text-align: center;
`;
