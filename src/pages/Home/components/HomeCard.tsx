import React, { useState } from 'react';
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

interface MediaInfoStylingProps {
  position: 'left' | 'right';
}

interface EpisodeStylingProps {
  behind: boolean;
}

export const UPDATE_ENTRY = gql`
  mutation updateEntry($id: Int, $status: MediaListStatus, $progress: Int) {
    SaveMediaListEntry(id: $id, status: $status, progress: $progress) {
      id
      status
      progress
      updatedAt
    }
  }
`;

const LEFT_POSITIONS = [1, 2, 5, 6, 9, 10, 13, 14, 17, 18, 21, 22, 25, 26, 29, 30];

const HomeCard: React.FC<HomeCardProps> = ({ entry, index }) => {
  const [progress, setProgress] = useState(entry.progress);
  const [updateEntry, { loading, error }] = useMutation(UPDATE_ENTRY, {
    onCompleted: data => {
      setProgress(data.SaveMediaListEntry.progress);
    }
  });
  const updateHandler = () => {
    if (loading) return;
    setProgress(progress => progress + 1);
    updateEntry({
      variables: { id: entry.id, status: entry.status, progress: progress + 1 }
    });
  };

  const totalContent =
    entry.media.type === 'ANIME' ? entry.media.episodes : entry.media.chapters;

  const getTimeTilNextEpisode = (entry: Entry) => {
    if (entry.media.nextAiringEpisode && entry.media.nextAiringEpisode.timeUntilAiring) {
      const DAY = 86400;
      const HOUR = 3600;
      const MINUTE = 60;
      const days = Math.trunc(entry.media.nextAiringEpisode.timeUntilAiring / DAY);
      const dayRemainder = entry.media.nextAiringEpisode.timeUntilAiring % DAY;
      const hours = Math.trunc(dayRemainder / HOUR);
      const hourRemainder = dayRemainder % HOUR;
      const minutes = Math.trunc(hourRemainder / MINUTE);

      if (days === 0) {
        if (hours === 0) return `${minutes}m`;
        else if (minutes === 0) return `${hours}h`;
        else return `${hours}h ${minutes}m`;
      } else {
        if (hours === 0 && minutes === 0) {
          return `${days}d`;
        } else if (minutes === 0) return `${days}d ${hours}h`;
        else if (hours === 0) return `${days}d ${minutes}m`;
        else return `${days}d ${hours}h ${minutes}m`;
      }
    } else return '';
  };
  const timeTilNextEpisode = getTimeTilNextEpisode(entry);

  const getEpisodesBehind = (
    entry: Entry
  ): { episodesBehind: number | null; episodesBehindBool: boolean } => {
    if (
      entry.media.nextAiringEpisode &&
      entry.media.nextAiringEpisode.episode &&
      entry.media.nextAiringEpisode.episode - entry.progress > 1
    ) {
      return {
        episodesBehind: entry.media.nextAiringEpisode.episode - entry.progress - 1,
        episodesBehindBool: true
      };
    } else return { episodesBehind: null, episodesBehindBool: false };
  };
  const { episodesBehind, episodesBehindBool } = getEpisodesBehind(entry);

  const position = LEFT_POSITIONS.includes(index + 1) ? 'left' : 'right';

  return (
    <CardWrapper>
      <StyledLink
        to={`/media/${entry.media.id}`}
        aria-label={entry.media.title.userPreferred}
        style={{ backgroundImage: `url(${entry.media.coverImage.medium})` }}
      ></StyledLink>
      <Updater role='button' onClick={updateHandler}>
        {loading ? 'Loading...' : progress + ' +'}
      </Updater>
      {entry.media.nextAiringEpisode && entry.media.nextAiringEpisode.episode && (
        <EpisodeWrapper behind={episodesBehindBool}>
          <EpisodeParagraph>Ep: {entry.media.nextAiringEpisode.episode}</EpisodeParagraph>
          <EpisodeParagraph>{timeTilNextEpisode}</EpisodeParagraph>
        </EpisodeWrapper>
      )}
      <MediaInformation position={position}>
        {episodesBehindBool && (
          <EpisodesBehind>{episodesBehind} episode behind</EpisodesBehind>
        )}
        <Title>{entry.media.title.userPreferred}</Title>
        <Progress>
          Progress: {progress} {totalContent && '/ ' + totalContent}
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

const EpisodeWrapper = styled.div<EpisodeStylingProps>`
  opacity: 1;
  border-bottom: 4px #2f2e2ec4;
  height: 45px;

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
  border-bottom: ${props => (props.behind ? '4px solid #ff6d6d' : 'none')};

  ${StyledLink}:hover ~ &,
  ${StyledLink}:focus ~ &,
  ${Updater}:hover ~ &,
  ${Updater}:focus ~ &,
  &:hover {
    opacity: 0;
    height: 0px;
  }
`;

const EpisodeParagraph = styled.p`
  margin: 5px 0;
`;

const MediaInformation = styled.div<MediaInfoStylingProps>`
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

const EpisodesBehind = styled.p`
  color: #005fc4;
  font-size: 12px;
  margin: 0;
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
