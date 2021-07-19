import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import styled from 'styled-components';
import ParsedMarkdown from '../components/ParsedMarkdown';

import { MONTHS } from '../constants';
import CharacterCard from '../components/Staff/CharacterCard';
import RoleCard from '../components/Staff/RoleCard';
import FetchMoreButton from '../components/FetchMoreButton';

interface Staff {
  id: number;
  name: {
    full: string;
    native: string;
    alternative: string[];
  };
  image: {
    large: string;
  };
  description: string;
  favourites: number;
  isFavourite: boolean;
  age: number | null;
  gender: string | null;
  yearsActive: number[];
  homeTown: string;
  primaryOccupations: string[];
  dateOfBirth: {
    year: number | null;
    month: number | null;
    day: number | null;
  };
  dateOfDeath: {
    year: number | null;
    month: number | null;
    day: number | null;
  };
  characterMedia: {
    pageInfo: {
      total: number;
      perPage: number;
      currentPage: number;
      lastPage: number;
      hasNextPage: number;
    };
    edges: {
      id: number;
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
          status:
            | 'CURRENT'
            | 'COMPLETED'
            | 'PLANNING'
            | 'DROPPED'
            | 'PAUSED'
            | 'REPEATING';
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
    }[];
  };
  staffMedia: {
    pageInfo: {
      total: number;
      perPage: number;
      currentPage: number;
      lastPage: number;
      hasNextPage: number;
    };
    edges: {
      id: number;
      staffRole: string;
      node: {
        id: number;
        type: 'ANIME' | 'MANGA';
        title: {
          userPreferred: string;
        };
        coverImage: {
          large: string;
        };
        mediaListEntry: {
          id: number;
          status:
            | 'CURRENT'
            | 'COMPLETED'
            | 'PLANNING'
            | 'DROPPED'
            | 'PAUSED'
            | 'REPEATING';
        } | null;
      };
    }[];
  };
}

interface StaffRole {
  id: number;
  staffRole: string;
  node: {
    id: number;
    type: 'ANIME' | 'MANGA';
    title: {
      userPreferred: string;
    };
    coverImage: {
      large: string;
    };
    mediaListEntry: {
      id: number;
      status: 'CURRENT' | 'COMPLETED' | 'PLANNING' | 'DROPPED' | 'PAUSED' | 'REPEATING';
    } | null;
  };
}

const GET_STAFF = gql`
  query GetStaffPage($id: Int, $onList: Boolean, $page: Int, $sort: [MediaSort]) {
    Staff(id: $id) {
      id
      name {
        full
        native
        alternative
      }
      image {
        # need medium for keyArg, not actually being used
        medium
        large
      }
      description
      favourites
      isFavourite
      age
      gender
      yearsActive
      homeTown
      primaryOccupations
      dateOfBirth {
        year
        month
        day
      }
      dateOfDeath {
        year
        month
        day
      }
      characterMedia(page: $page, sort: $sort, onList: $onList) {
        pageInfo {
          total
          perPage
          currentPage
          lastPage
          hasNextPage
        }
        edges {
          id
          characterRole
          characterName
          node {
            id
            type
            title {
              userPreferred
            }
            coverImage {
              medium
            }
            # startDate {
            #   year
            # }
            mediaListEntry {
              id
              status
            }
          }
          characters {
            id
            name {
              full
            }
            image {
              large
              # need medium for keyArgs. Not actually using it
              medium
            }
          }
        }
      }
      staffMedia(page: $page, sort: $sort, onList: $onList) {
        pageInfo {
          total
          perPage
          currentPage
          lastPage
          hasNextPage
        }
        edges {
          id
          staffRole
          node {
            id
            type
            title {
              userPreferred
            }
            coverImage {
              large
              medium
            }
            mediaListEntry {
              id
              status
            }
          }
        }
      }
    }
  }
`;

const GET_MORE_CHARACTER = gql`
  query GetMoreCharacters($id: Int, $onList: Boolean, $page: Int, $sort: [MediaSort]) {
    Staff(id: $id) {
      id
      characterMedia(page: $page, sort: $sort, onList: $onList) {
        pageInfo {
          total
          perPage
          currentPage
          lastPage
          hasNextPage
        }
        edges {
          id
          characterRole
          characterName
          node {
            id
            type
            title {
              userPreferred
            }
            coverImage {
              medium
            }
            # startDate {
            #   year
            # }
            mediaListEntry {
              id
              status
            }
          }
          characters {
            id
            name {
              full
            }
            image {
              large
              # need medium for keyArgs. Not actually using it
              medium
            }
          }
        }
      }
    }
  }
`;

const GET_MORE_ROLES = gql`
  query GetMoreRoles($id: Int, $onList: Boolean, $page: Int, $sort: [MediaSort]) {
    Staff(id: $id) {
      id
      staffMedia(page: $page, sort: $sort, onList: $onList) {
        pageInfo {
          total
          perPage
          currentPage
          lastPage
          hasNextPage
        }
        edges {
          id
          staffRole
          node {
            id
            type
            title {
              userPreferred
            }
            coverImage {
              large
              medium
            }
            mediaListEntry {
              id
              status
            }
          }
        }
      }
    }
  }
`;

const Staff = () => {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, fetchMore } = useQuery(GET_STAFF, {
    variables: { id, page: 1, sort: 'START_DATE_DESC' }
  });

  if (loading) return <p>Loading...</p>;

  if (error) {
    console.log(error);
    return <p>There was an error</p>;
  }

  const staff: Staff = data.Staff;
  // console.log(staff);

  let names = '';
  if (staff.name.native) {
    if (staff.name.alternative[0] !== '') {
      const altNames = staff.name.alternative.join(', ');
      names = (staff.name.native ? staff.name.native : '') + ', ' + altNames;
    } else names = staff.name.native;
  }

  let dateOfBirth;
  if (staff.dateOfBirth.year && staff.dateOfBirth.month && staff.dateOfBirth.day) {
    dateOfBirth =
      MONTHS[staff.dateOfBirth.month] +
      ' ' +
      staff.dateOfBirth.day +
      ', ' +
      staff.dateOfBirth.year;
  }

  let yearsActive;
  if (staff.yearsActive.length > 0) {
    if (staff.yearsActive.length > 1) {
      yearsActive = staff.yearsActive.join('-');
    } else yearsActive = staff.yearsActive[0] + '-';
  }

  let animeStaffRoles: StaffRole[] = [],
    mangaStaffRoles: StaffRole[] = [];
  if (staff.staffMedia.pageInfo.total !== 0) {
    animeStaffRoles = staff.staffMedia.edges.filter(role => role.node.type === 'ANIME');
    mangaStaffRoles = staff.staffMedia.edges.filter(role => role.node.type === 'MANGA');
  }

  const handleMoreCharacters = () => {
    const page = staff.characterMedia.pageInfo.currentPage + 1;
    fetchMore({
      variables: { page, id, sort: 'START_DATE_DESC' },
      query: GET_MORE_CHARACTER
    });
  };

  const handleMoreRoles = () => {
    const page = staff.staffMedia.pageInfo.currentPage + 1;
    fetchMore({
      variables: { page, id, sort: 'START_DATE_DESC' },
      query: GET_MORE_ROLES
    });
  };

  return (
    <main>
      <Header>
        <h1>{staff.name.full}</h1>
        <Names>{names}</Names>
        <Image src={staff.image.large} alt={`photo of ${staff.name.full}`} />
      </Header>
      <Description>
        {dateOfBirth && (
          <DescRow>
            <strong>Birth:</strong> {dateOfBirth}
          </DescRow>
        )}
        {staff.age && (
          <DescRow>
            <strong>Age:</strong> {staff.age}
          </DescRow>
        )}
        {staff.gender && (
          <DescRow>
            <strong>Gender:</strong> {staff.gender}
          </DescRow>
        )}
        {yearsActive && (
          <DescRow>
            <strong>Years Active:</strong> {yearsActive}
          </DescRow>
        )}
        {staff.homeTown && (
          <DescRow>
            <strong>Hometown:</strong> {staff.homeTown}
          </DescRow>
        )}
        {staff.description && (
          <div style={{ marginTop: '-16px' }}>
            <ParsedMarkdown string={staff.description} />
          </div>
        )}
      </Description>
      {staff.characterMedia.pageInfo.total !== 0 && (
        <CardSection>
          <CardHeading>Character Roles</CardHeading>
          <CardWrapper>
            {staff.characterMedia.edges.map(character => {
              return <CharacterCard character={character} key={character.id} />;
            })}
          </CardWrapper>
          {staff.characterMedia.pageInfo.hasNextPage && (
            <FetchMoreButton onClick={handleMoreCharacters}>
              Show More Characters
            </FetchMoreButton>
          )}
        </CardSection>
      )}

      {staff.staffMedia.pageInfo.total !== 0 && animeStaffRoles.length > 0 && (
        <CardSection>
          <CardHeading>Anime Staff Roles</CardHeading>
          <CardWrapper>
            {animeStaffRoles.map(role => {
              return <RoleCard role={role} key={role.id} />;
            })}
            {/*
              button will look weird if person has anime and manga roles
              because button will be here and bellow, both the same
            */}
          </CardWrapper>
          {staff.staffMedia.pageInfo.hasNextPage && (
            <FetchMoreButton onClick={handleMoreRoles}>Show More Roles</FetchMoreButton>
          )}
        </CardSection>
      )}
      {staff.staffMedia.pageInfo.total !== 0 && mangaStaffRoles.length > 0 && (
        <CardSection>
          <CardHeading>Manga Staff Roles</CardHeading>
          <CardWrapper>
            {mangaStaffRoles.map(role => {
              return <RoleCard role={role} key={role.id} />;
            })}
          </CardWrapper>
          {staff.staffMedia.pageInfo.hasNextPage && (
            <FetchMoreButton onClick={handleMoreRoles}>Show More Roles</FetchMoreButton>
          )}
        </CardSection>
      )}
    </main>
  );
};

export default Staff;

const Header = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin: auto 16px;
`;

const Names = styled.p`
  margin-top: 0;
`;

const Image = styled.img`
  width: 160px;
  box-shadow: 0 0 15px #a2a2a2;
`;

const Description = styled.section`
  margin: 16px 32px;
`;

const DescRow = styled.p`
  margin: 0;
`;

const CardSection = styled.section`
  display: grid;
  margin-bottom: 16px;
`;

const CardHeading = styled.h2`
  margin: 0;
  margin-left: 32px;
  margin-top: 16px;
`;

const CardWrapper = styled.section`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin: 32px;
`;
