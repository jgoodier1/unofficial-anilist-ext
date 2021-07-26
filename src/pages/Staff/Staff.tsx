import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import styled from 'styled-components';
import ParsedMarkdown from '../../components/ParsedMarkdown';

import { GET_STAFF, GET_MORE_CHARACTER, GET_MORE_ROLES } from './queries';
import { Staff, StaffRole } from './types';
import { MONTHS } from '../../constants';

import CharacterCard from './components/CharacterCard';
import RoleCard from './components/RoleCard';
import FetchMoreButton from '../../components/FetchMoreButton';

const Staff = () => {
  const [checked, setChecked] = useState(false);
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, fetchMore, refetch } = useQuery<
    any,
    { id: string; page: number; sort: string; onList?: boolean }
  >(GET_STAFF, {
    variables: { id, page: 1, sort: 'START_DATE_DESC' }
    // notifyOnNetworkStatusChange: true,
    // fetchPolicy: 'network-only'
  });

  if (loading) return <p>Loading...</p>;

  if (error) {
    console.log(error);
    return <p>There was an error</p>;
  }

  const staff: Staff = data.Staff;
  // console.log(staff);

  const getNames = (staff: Staff) => {
    if (staff.name.native) {
      if (staff.name.alternative[0] !== '') {
        const altNames = staff.name.alternative.join(', ');
        return (staff.name.native ? staff.name.native : '') + ', ' + altNames;
      } else return staff.name.native;
    } else return null;
  };
  const names = getNames(staff);

  const getBirthday = (staff: Staff) => {
    if (staff.dateOfBirth.year && staff.dateOfBirth.month && staff.dateOfBirth.day) {
      return (
        MONTHS[staff.dateOfBirth.month] +
        ' ' +
        staff.dateOfBirth.day +
        ', ' +
        staff.dateOfBirth.year
      );
    } else return null;
  };
  const birthday = getBirthday(staff);

  const getYearsActive = (staff: Staff) => {
    if (staff.yearsActive.length > 0) {
      if (staff.yearsActive.length > 1) {
        return staff.yearsActive.join('-');
      } else return staff.yearsActive[0] + '-';
    } else return null;
  };
  const yearsActive = getYearsActive(staff);

  const getStaffRoles = (staff: Staff) => {
    if (staff.staffMedia.pageInfo.total !== 0) {
      const animeStaffRoles = staff.staffMedia.edges.filter(
        role => role.node.type === 'ANIME'
      );
      const mangaStaffRoles = staff.staffMedia.edges.filter(
        role => role.node.type === 'MANGA'
      );
      return [animeStaffRoles, mangaStaffRoles];
    } else return [[], []];
  };
  const [animeStaffRoles, mangaStaffRoles] = getStaffRoles(staff);

  const handleOnMyList = () => {
    const oldChecked = checked;
    // toggle checked
    setChecked(!checked);

    // call refetch
    // if checked === true, refetch with onList=true
    if (!oldChecked) {
      refetch({ id, page: 1, sort: 'START_DATE_DESC', onList: true });
    }

    // if checked === false, refetch without onList
    if (oldChecked) {
      refetch({ id, page: 1, sort: 'START_DATE_DESC', onList: undefined });
    }
  };

  const handleMoreCharacters = () => {
    const page = staff.characterMedia.pageInfo.currentPage + 1;
    if (checked) {
      fetchMore({
        variables: { page, id, sort: 'START_DATE_DESC', onList: true },
        query: GET_MORE_CHARACTER
      });
    } else {
      fetchMore({
        variables: { page, id, sort: 'START_DATE_DESC', onList: undefined },
        query: GET_MORE_CHARACTER
      });
    }
  };

  const handleMoreRoles = () => {
    const page = staff.staffMedia.pageInfo.currentPage + 1;
    if (checked) {
      fetchMore({
        variables: { page, id, sort: 'START_DATE_DESC', onList: true },
        query: GET_MORE_ROLES
      });
    } else {
      fetchMore({
        variables: { page, id, sort: 'START_DATE_DESC' },
        query: GET_MORE_ROLES
      });
    }
  };

  return (
    <main>
      {/* this header is the same in Character.tsx */}
      <Header>
        <h1>{staff.name.full}</h1>
        <Names>{names}</Names>
        <Image src={staff.image.large} alt={`photo of ${staff.name.full}`} />
      </Header>
      <Description>
        {birthday && (
          <DescRow>
            <strong>Birth:</strong> {birthday}
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

      <div>
        <OnMyListLabel htmlFor='on-my-list'>
          <input
            type='checkbox'
            name='on-my-list'
            id='on-my-list'
            onChange={handleOnMyList}
            checked={checked}
          />
          On My List
        </OnMyListLabel>
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
      </div>
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

const OnMyListLabel = styled.label`
  position: relative;
  left: 324px;
  top: 42px;
  display: flex;
  gap: 8px;
  width: -moz-fit-content;
  width: fit-content;
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
