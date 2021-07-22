import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import styled from 'styled-components';

import RelationCard from './components/RelationCard';
import CharacterCard from './components/CharacterCard';
import StaffCard from './components/StaffCard';
import StatusCard from './components/StatusCard';
import GraphBar from './components/GraphBar';
import RecommendationCard from './components/RecommendationCard';
import CharacterTab from './components/CharacterTab';
import StaffTab from './components/StaffTab';

import { GET_MEDIA } from './queries';
import { Media } from './types';
import { MONTHS, COLOURS } from '../../constants';

interface CoverImageProps {
  banner: string | undefined;
}

interface StatusPercentBarProps {
  index: number;
  width: number;
}

interface EditKeys {
  [key: string]: {
    [key: string]: string;
  };
}

const EDIT_BUTTON: EditKeys = {
  ANIME: {
    CURRENT: 'Watching',
    PLANNING: 'Planning',
    COMPLETED: 'Completed',
    DROPPED: 'Dropped',
    PAUSED: 'Paused',
    REPEATING: 'Rewatching'
  },
  MANGA: {
    CURRENT: 'Reading',
    PLANNING: 'Planning',
    COMPLETED: 'Completed',
    DROPPED: 'Dropped',
    PAUSED: 'Paused',
    REPEATING: 'Rereading'
  }
};

const Media = () => {
  const [compState, setCompState] = useState<'Overview' | 'Characters' | 'Staff'>(
    'Overview'
  );
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = useQuery(GET_MEDIA, { variables: { id } });

  if (loading) return <p>Loading...</p>;
  if (error) {
    console.log(error);
    return <p>There was an error loading the media</p>;
  }

  const media: Media = data.Media;

  let timeTilEpisode;
  if (media.nextAiringEpisode && media.nextAiringEpisode.timeUntilAiring) {
    const DAY = 86400;
    const HOUR = 3600;
    const MINUTE = 60;
    const days = Math.trunc(media.nextAiringEpisode.timeUntilAiring / DAY);
    const dayRemainder = media.nextAiringEpisode.timeUntilAiring % DAY;
    const hours = Math.trunc(dayRemainder / HOUR);
    const hourRemainder = dayRemainder % HOUR;
    const minutes = Math.trunc(hourRemainder / MINUTE);
    if (days === 0) {
      if (hours === 0) timeTilEpisode = `${minutes}m`;
      else if (minutes === 0) timeTilEpisode = `${hours}h`;
      else timeTilEpisode = `${hours}h ${minutes}m`;
    } else {
      if (hours !== 0 && minutes !== 0) {
        timeTilEpisode = `${days}d ${hours}h ${minutes}m`;
      } else if (minutes === 0) timeTilEpisode = `${days} ${hours}h`;
      else if (hours === 0) timeTilEpisode = `${days}d ${minutes}m`;
      else timeTilEpisode = `${days}d`;
    }
  }
  let studio, producers;
  if (media.type === 'ANIME' && media.studios) {
    const mainStudio = media.studios.edges.filter(studio => studio.isMain);
    if (mainStudio.length > 0) studio = mainStudio[0].node.name;
    const allProducers = media.studios.edges.filter(studio => !studio.isMain);
    const producerName = allProducers.map(prod => prod.node.name);
    producers = producerName.join(', ');
  }

  // apollo didn't like how it was because the array was read-only
  const statuses = [...media.stats.statusDistribution];
  const sortedStatuses = statuses.sort((a, b) => {
    if (a.amount < b.amount) return 1;
    else return -1;
  });

  return (
    <Wrapper>
      {media.bannerImage && <BannerImage src={media.bannerImage} alt='' />}
      <TopSection>
        <CoverImage
          src={media.coverImage.large}
          alt={`${media.title.userPreferred} cover image`}
          banner={media.bannerImage}
        />
        <TopContentWrapper>
          <Title>{media.title.userPreferred}</Title>
          {/* button content should not just be the status */}
          <EditLink to={`/edit/${media.id}`}>
            {media.mediaListEntry
              ? EDIT_BUTTON[media.type][media.mediaListEntry.status]
              : 'Add to List'}
          </EditLink>
        </TopContentWrapper>
      </TopSection>

      <TabButtonWrapper>
        <TabButton onClick={() => setCompState('Overview')}>Overview</TabButton>
        <TabButton onClick={() => setCompState('Characters')}>Characters</TabButton>
        <TabButton onClick={() => setCompState('Staff')}>Staff</TabButton>
      </TabButtonWrapper>

      <DataSection>
        {media.nextAiringEpisode && timeTilEpisode && (
          <DataWrapper>
            <DataTitle>Airing</DataTitle>
            <DataValue>
              Ep: {media.nextAiringEpisode.episode}: {timeTilEpisode}
            </DataValue>
          </DataWrapper>
        )}
        <DataWrapper>
          <DataTitle>Format</DataTitle>
          <DataValue>{media.format}</DataValue>
        </DataWrapper>
        {media.type === 'ANIME' && media.episodes && (
          <DataWrapper>
            <DataTitle>Episodes</DataTitle>
            <DataValue>{media.episodes}</DataValue>
          </DataWrapper>
        )}
        {media.type === 'ANIME' && media.duration && (
          <DataWrapper>
            <DataTitle>Duration</DataTitle>
            <DataValue>{media.duration}</DataValue>
          </DataWrapper>
        )}
        {media.type === 'MANGA' && media.chapters && (
          <DataWrapper>
            <DataTitle>Chapters</DataTitle>
            <DataValue>{media.chapters}</DataValue>
          </DataWrapper>
        )}
        {media.type === 'MANGA' && media.volumes && (
          <DataWrapper>
            <DataTitle>Volumes</DataTitle>
            <DataValue>{media.volumes}</DataValue>
          </DataWrapper>
        )}
        <DataWrapper>
          <DataTitle>Status</DataTitle>
          <DataValue>{media.status}</DataValue>
        </DataWrapper>
        {media.startDate.day && media.startDate.month && (
          <DataWrapper>
            <DataTitle>Start Date</DataTitle>
            <DataValue>
              {MONTHS[media.startDate.month]} {media.startDate.day},{' '}
              {media.startDate.year}
            </DataValue>
          </DataWrapper>
        )}
        {media.endDate.day && media.endDate.month && (
          <DataWrapper>
            <DataTitle>End Date</DataTitle>
            <DataValue>
              {MONTHS[media.endDate.month]} {media.endDate.day}, {media.endDate.year}
            </DataValue>
          </DataWrapper>
        )}
        {media.type === 'ANIME' && media.season && media.seasonYear && (
          <DataWrapper>
            <DataTitle>Season</DataTitle>
            <DataValue>
              {media.season} {media.seasonYear}
            </DataValue>
          </DataWrapper>
        )}
        {media.averageScore && (
          <DataWrapper>
            <DataTitle>Average Score</DataTitle>
            <DataValue>{media.averageScore}%</DataValue>
          </DataWrapper>
        )}
        {media.meanScore && (
          <DataWrapper>
            <DataTitle>Mean Score</DataTitle>
            <DataValue>{media.meanScore}%</DataValue>
          </DataWrapper>
        )}
        <DataWrapper>
          <DataTitle>Popularity</DataTitle>
          <DataValue>{media.popularity}</DataValue>
        </DataWrapper>
        <DataWrapper>
          <DataTitle>Favourites</DataTitle>
          <DataValue>{media.favourites}</DataValue>
        </DataWrapper>
        {studio && (
          <DataWrapper>
            <DataTitle>Studio</DataTitle>
            <DataValue>{studio}</DataValue>
          </DataWrapper>
        )}
        {producers && (
          <DataWrapper>
            <DataTitle>Producers</DataTitle>
            <DataValue>{producers}</DataValue>
          </DataWrapper>
        )}
        <DataWrapper>
          <DataTitle>Source</DataTitle>
          <DataValue>{media.source}</DataValue>
        </DataWrapper>
        {media.hashtag && (
          <DataWrapper>
            <DataTitle>Hashtag</DataTitle>
            <DataValue>{media.hashtag}</DataValue>
          </DataWrapper>
        )}
        {media.genres && media.genres.length > 0 && (
          <DataWrapper>
            <DataTitle>Genres</DataTitle>
            <DataValue>{media.genres.join(', ')}</DataValue>
          </DataWrapper>
        )}
        {media.title.romaji && (
          <DataWrapper>
            <DataTitle>Romaji</DataTitle>
            <DataValue>{media.title.romaji}</DataValue>
          </DataWrapper>
        )}
        {media.title.english && (
          <DataWrapper>
            <DataTitle>English</DataTitle>
            <DataValue>{media.title.english}</DataValue>
          </DataWrapper>
        )}
        {media.title.native && (
          <DataWrapper>
            <DataTitle>Native</DataTitle>
            <DataValue>{media.title.native}</DataValue>
          </DataWrapper>
        )}
        {media.synonyms && media.synonyms.length > 0 && (
          <DataWrapper>
            <DataTitle>Synonyms</DataTitle>
            <DataValue>{media.synonyms.join(', ')}</DataValue>
          </DataWrapper>
        )}
      </DataSection>

      {/* overview */}
      {compState === 'Overview' && (
        <div>
          <Section>
            <Heading>Description</Heading>
            {/* not displaying properly. There are html elements in the string */}
            <Description
              dangerouslySetInnerHTML={{ __html: media.description }}
            ></Description>
          </Section>

          {media.relations.edges.length > 0 && (
            <Section>
              <Heading>Relations</Heading>
              <Carousel>
                {media.relations.edges.map(relation => {
                  return <RelationCard relation={relation} key={relation.id} />;
                })}
              </Carousel>
            </Section>
          )}

          {media.characters.edges.length > 0 && (
            <Section>
              <Heading>Characters</Heading>
              {media.characters.edges.map(character => {
                return <CharacterCard character={character} key={character.id} />;
              })}
            </Section>
          )}

          {media.staffPreview.edges.length > 0 && (
            <Section>
              <Heading>Staff</Heading>
              {media.staffPreview.edges.map(staff => {
                if (staff.id === 127053) console.log('staff', staff);
                return <StaffCard staff={staff} key={staff.id} />;
              })}
            </Section>
          )}

          {sortedStatuses.length > 0 && (
            <Section>
              <Heading>Status Distribution</Heading>
              <StatusWrapper>
                {sortedStatuses.map((status, i) => {
                  return <StatusCard status={status} index={i} key={status.status} />;
                })}
                <StatusPercentBarWrapper>
                  {sortedStatuses.map((status, i) => {
                    return (
                      <StatusPercentBar
                        width={(status.amount / media.popularity) * 400}
                        index={i}
                        key={status.status}
                      />
                    );
                  })}
                </StatusPercentBarWrapper>
              </StatusWrapper>
            </Section>
          )}

          {media.stats.scoreDistribution.length > 0 && (
            <Section>
              <Heading>Score Distribution</Heading>
              <ScoreWrapper>
                {media.stats.scoreDistribution.map(score => {
                  return (
                    <GraphBar
                      score={score}
                      max={
                        media.stats.scoreDistribution.reduce((max, score) => {
                          return max.amount > score.amount ? max : score;
                        }).amount
                      }
                      key={score.score}
                    />
                  );
                })}
              </ScoreWrapper>
            </Section>
          )}

          {media.recommendations.nodes.length > 0 && (
            <Section>
              <Heading>Recommendations</Heading>
              <Carousel>
                {media.recommendations.nodes.map(recommendation => {
                  return (
                    <RecommendationCard
                      recommendation={recommendation}
                      key={recommendation.id}
                    />
                  );
                })}
              </Carousel>
            </Section>
          )}
        </div>
      )}

      {compState === 'Characters' && <CharacterTab id={id} />}

      {compState === 'Staff' && <StaffTab id={id} />}
    </Wrapper>
  );
};

export default Media;

const Wrapper = styled.main`
  width: 464px;
  min-height: 200px;
`;

const BannerImage = styled.img`
  width: 100%;
  position: relative;
  top: 0;
  height: 150px;
  object-fit: cover;
`;

const TopSection = styled.section`
  margin: 0 16px;
  display: grid;
  grid-template-columns: 120px auto;
  grid-gap: 10px;
`;

const CoverImage = styled.img<CoverImageProps>`
  width: 120px;
  position: relative;
  margin-top: ${props => (props.banner ? '-50px' : '16px')};
  box-shadow: 0 0 15px #a2a2a2;
`;

const TopContentWrapper = styled.div`
  display: grid;
  grid-template-rows: 90px;
`;

const Title = styled.h1`
  font-size: 22px;
  margin: 0;
  grid-row: 1;
  justify-self: start;
  align-self: center;
  width: -moz-fit-content;
  width: fit-content;
`;

const EditLink = styled(Link)`
  grid-row: 2;
  width: -moz-fit-content;
  height: -moz-fit-content;
  font-size: 16px;
  background-color: #02b2d9;
  padding: 5px 12px;
  color: white;
  cursor: pointer;
  border-radius: 8px;
  text-decoration: none;
`;

const DataSection = styled.section`
  display: flex;
  overflow-x: auto;
  width: 400px;
  margin: 16px 32px;
  padding: 8px 16px;
  padding-bottom: 16px;
  gap: 5px;
  background-color: #fafafa;
`;

const DataWrapper = styled.div`
  margin-right: 16px;
`;

const DataTitle = styled.p`
  width: max-content;
  font-size: 14px;
`;

const DataValue = styled.div`
  width: max-content;
  font-size: 14px;
  font-weight: 600;
`;

const TabButtonWrapper = styled.section`
  display: flex;
  justify-content: space-between;
  margin: 16px 32px;
  padding: 8px;
  background-color: #fafafa;
`;

const TabButton = styled.button`
  border: none;
  background: inherit;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
`;

const TabWrapper = styled.div`
  margin: 16px 32px;
  display: grid;
`;

const Section = styled.section`
  margin: 0 32px;
`;

const Heading = styled.h2`
  font-size: 16px;
`;

const Description = styled.p`
  background-color: #fafafa;
  padding: 16px;
`;

const Carousel = styled.div`
  margin-bottom: 16px;
  display: flex;
  overflow-x: scroll;
`;

const StatusWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  background-color: #fafafa;
  gap: 16px;
  justify-content: center;
  padding: 16px;
  padding-bottom: 0;
`;

const StatusPercentBarWrapper = styled.div`
  display: flex;
`;
const StatusPercentBar = styled.span<StatusPercentBarProps>`
  height: 10px;
  width: ${props => props.width + 'px'};
  background-color: ${props => COLOURS[props.index]};
`;

const ScoreWrapper = styled.div`
  background-color: #fafafa;
  display: flex;
  justify-content: space-around;
  align-items: end;
`;
