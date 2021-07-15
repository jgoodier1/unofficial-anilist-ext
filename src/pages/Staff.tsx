import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import styled from 'styled-components';
import ParsedMarkdown from '../components/ParsedMarkdown';

import { MONTHS } from '../constants';

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
      };
    };
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
    };
  };
}

const GET_STAFF = gql`
  query ($id: Int, $onList: Boolean, $page: Int, $sort: [MediaSort]) {
    Staff(id: $id) {
      id
      name {
        full
        native
        alternative
      }
      image {
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
            startDate {
              year
            }
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
          staffRole
          node {
            id
            type
            title {
              userPreferred
            }
            coverImage {
              large
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
  const { data, loading, error } = useQuery(GET_STAFF, {
    variables: { id, page: 1, sort: 'START_DATE_DESC' },
    // doesn't return data without this, even though you can see it in the network tab
    // probably has to do with unique identifies in the cache
    fetchPolicy: 'no-cache'
  });

  if (loading) return <p>Loading...</p>;

  if (error) {
    console.log(error);
    return <p>There was an error</p>;
  }

  const staff: Staff = data.Staff;
  console.log(staff);

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
