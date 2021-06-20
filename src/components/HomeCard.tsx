import React from 'react';
import { Link } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';
import styled from 'styled-components';

interface HomeCardProps {
  entry: Entry;
  index: number;
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
    siteUrl: string;
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

interface StylingProps {
  position: 'left' | 'right';
}

const UPDATE_ENTRY = gql`
  mutation ($id: Int, $status: MediaListStatus, $progress: Int) {
    SaveMediaListEntry(id: $id, status: $status, progress: $progress) {
      id
      status
      progress
    }
  }
`;

const LEFT_POSITIONS = [1, 2, 5, 6, 9, 10, 13, 14, 17, 18, 21, 22, 25, 26, 29, 30];

const HomeCard: React.FC<HomeCardProps> = ({ entry, index }) => {
  const [updateEntry, { data, loading, error }] = useMutation(UPDATE_ENTRY);
  const updateHandler = () => {
    if (loading) return;
    entry.progress++;
    updateEntry({
      variables: { id: entry.id, status: entry.status, progress: entry.progress }
    });
    console.log(data);
  };

  const totalContent =
    entry.media.type === 'ANIME' ? entry.media.episodes : entry.media.chapters;

  const position = LEFT_POSITIONS.includes(index + 1) ? 'left' : 'right';

  return (
    <CardWrapper>
      <StyledLink
        to={`/media?id=${entry.id}`}
        style={{ backgroundImage: `url(${entry.media.coverImage.medium})` }}
      ></StyledLink>
      <Updater onClick={updateHandler}>
        {loading ? 'Loading...' : entry.progress + ' +'}
      </Updater>
      {/* TODO: add time till next episode */}
      <MediaInformation position={position}>
        <Title>{entry.media.title.userPreferred}</Title>
        <Progress>
          Progress: {entry.progress} {totalContent && '/ ' + totalContent}
        </Progress>
      </MediaInformation>
    </CardWrapper>
  );
};

export default HomeCard;

const CardWrapper = styled.div`
  display: flex;
  position: relative;
`;

const StyledLink = styled(Link)`
  /* background-image: url(var(--image)); */
  height: 115px;
  width: 85px;
  cursor: pointer;
  position: relative;
  border-radius: 3px;

  /* COVER */
  background-position: 50%;
  background-repeat: no-repeat;
  background-size: cover;
`;

const Updater = styled.div`
  padding: 8px 0;
  opacity: 0;
  cursor: pointer;

  isolation: isolate;
  position: absolute;
  text-align: center;
  background: #2e2d2dc4;
  width: 85px;
  color: white;
  font-size: 12px;
  transition: 0.2s;
  border-radius: 0 0 3px 3px;
  bottom: 0;
  font-weight: 300;

  ${StyledLink}:hover + &,
  ${StyledLink}:focus + & {
    opacity: 1;
  }
  /* &:focus, */
  &:hover {
    opacity: 1;
  }
`;

const MediaInformation = styled.div<StylingProps>`
  z-index: 5;
  display: none;
  background: #edf1f5;
  padding: 0 0.5rem;
  position: absolute;
  width: 230px;
  height: 118px;
  top: -1px;
  grid-template-rows: auto;
  align-items: center;

  left: ${props => (props.position === 'left' ? '85px' : '')};
  right: ${props => (props.position === 'left' ? '' : '85px')};
  text-align: ${props => (props.position === 'left' ? 'left' : 'right')};
  justify-items: ${props => (props.position === 'left' ? 'start' : 'end')};

  ${StyledLink}:hover ~ &,
  ${StyledLink}:focus ~ &,
  ${Updater}:hover ~ &
  /* ${Updater}:focus ~ &  */ {
    display: grid;
  }
`;

const Title = styled.p`
  font-size: 14px;
  max-height: 80px;
  overflow: hidden;
  margin: 0;
`;

const Progress = styled.p`
  color: #4f4f4f;
  font-size: 12px;
  margin: 0;
`;
