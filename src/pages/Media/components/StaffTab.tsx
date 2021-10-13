import React from 'react';
import { useQuery } from '@apollo/client';
import styled from 'styled-components';

import { GET_STAFF } from '../queries';
import StaffCard from './StaffCard';
import FetchMoreButton from '../../../components/FetchMoreButton';

interface Props {
  id: string;
}

interface Staff {
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
        {data.Media.staffPreview.edges.map((member: Staff) => {
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
