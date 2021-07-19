import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import styled from 'styled-components';

import StaffCard from './StaffCard';
import FetchMoreButton from '../FetchMoreButton';

interface Props {
  id: string;
}

export interface Staff {
  edges: StaffEdge[];
  pageInfo: {
    total: number;
    currentPage: number;
    hasNextPage: number;
  };
}

export interface StaffEdge {
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
}

export const GET_STAFF = gql`
  query GetStaffTab($id: Int, $page: Int) {
    Media(id: $id) {
      id
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
  const { data, error, loading, fetchMore } = useQuery(GET_STAFF, {
    variables: { id }
  });

  if (loading) return <p>Loading...</p>;

  if (error) {
    console.log(error);
    return <p>There was an error.</p>;
  }

  const loadMore = () => {
    const page = data.Media.staffPreview.pageInfo.currentPage + 1;
    fetchMore({ variables: { page: page } });
  };

  return (
    <Wrapper>
      <div>
        {data.Media.staffPreview.edges.map((member: StaffEdge) => {
          return <StaffCard staff={member} key={member.id} />;
        })}
      </div>
      {data.Media.staffPreview.pageInfo.hasNextPage && (
        <FetchMoreButton onClick={loadMore}>Show more</FetchMoreButton>
      )}
    </Wrapper>
  );
};

export default StaffTab;

const Wrapper = styled.section`
  margin: 16px 32px;
  display: grid;
`;
