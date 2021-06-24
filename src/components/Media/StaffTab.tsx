import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import styled from 'styled-components';

import StaffCard from './StaffCard';

interface Props {
  id: string;
}

interface Staff {
  edges: {
    id: number;
    role: string;
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

export const GET_STAFF = gql`
  query ($id: Int, $page: Int) {
    Media(id: $id) {
      staffPreview: staff(page: $page, perPage: 25, sort: [RELEVANCE, ID]) {
        edges {
          id
          role
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

const StaffTab: React.FC<Props> = ({ id }) => {
  const [page, setPage] = useState(1);
  const { data, error, loading, fetchMore } = useQuery(GET_STAFF, {
    variables: { id, page }
  });

  if (loading) return <p>Loading...</p>;

  if (error) {
    console.log(error);
    return <p>There was an error.</p>;
  }

  console.log(data);

  const staff: Staff = data.Media.staffPreview;

  const loadMore = () => {
    console.log('clicked');
    fetchMore({ variables: { page: page + 1 } });
    setPage(page => page++);
  };

  return (
    <Wrapper>
      <div>
        {staff.edges.map(member => {
          return <StaffCard staff={member} />;
        })}
      </div>
      <button onClick={loadMore}>Fetch more</button>
    </Wrapper>
  );
};

export default StaffTab;

const Wrapper = styled.section`
  margin: 16px 32px;
  display: grid;
`;
