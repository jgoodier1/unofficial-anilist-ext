import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import styled from 'styled-components';

import { Character } from './types';
import { GET_CHARACTER, GET_CHARACTER_APPEARANCES } from './queries';
import { MONTHS } from '../../constants';

import ParsedMarkdown from '../../components/ParsedMarkdown';
import AppearanceCard from './components/AppearanceCard';
import FetchMoreButton from '../../components/FetchMoreButton';

const Character = () => {
  const [checked, setChecked] = useState(false);
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, fetchMore, refetch } = useQuery<
    any,
    { id: string; page: number; onList?: boolean }
  >(GET_CHARACTER, {
    variables: { id, page: 1 }
  });

  if (loading) return <p>Loading...</p>;

  if (error) {
    console.log(error);
    return <p>There was an error</p>;
  }

  const character: Character = data.Character;
  // console.log(character);

  let names = '';
  if (character.name.native) {
    if (character.name.alternative[0] !== '') {
      const altNames = character.name.alternative.join(', ');
      names = (character.name.native ? character.name.native : '') + ', ' + altNames;
    } else names = character.name.native;
  }

  let birthday = '';
  if (character.dateOfBirth.month !== null) {
    const birthMonth = MONTHS[character.dateOfBirth.month];
    birthday = character.dateOfBirth.year
      ? `${birthMonth} ${character.dateOfBirth.day}, ${character.dateOfBirth.year} `
      : birthMonth + ' ' + character.dateOfBirth.day;
  }

  const handleOnMyList = () => {
    const oldChecked = checked;

    setChecked(!checked);

    // if checked === true, refetch with onList=true
    if (!oldChecked) {
      refetch({ id, page: 1, onList: true });
    }

    // if checked === false, refetch without onList
    if (oldChecked) {
      refetch({ id, page: 1, onList: undefined });
    }
  };

  const handleMoreAppearances = () => {
    let page = character.media.pageInfo.currentPage + 1;
    if (checked) {
      fetchMore({
        variables: { id, page, onList: true },
        query: GET_CHARACTER_APPEARANCES
      });
    } else {
      fetchMore({
        variables: { id, page, onList: undefined },
        query: GET_CHARACTER_APPEARANCES
      });
    }
  };

  return (
    <main>
      {/* this header is the same in Staff.tsx */}
      <Header>
        <h1>{character.name.full}</h1>
        <Names>{names}</Names>
        <Image src={character.image.large} alt={`image of ${character.name.full}`} />
      </Header>

      <Description>
        {birthday && (
          <DescRow>
            <strong>Birthday:</strong> {birthday}
          </DescRow>
        )}
        {character.age && (
          <DescRow>
            <strong>Age:</strong> {character.age}
          </DescRow>
        )}
        {character.gender && (
          <DescRow>
            <strong>Gender:</strong> {character.gender}
          </DescRow>
        )}
        {character.description && (
          <div style={{ marginTop: '-16px' }}>
            <ParsedMarkdown string={character.description} />
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
        <CardSection>
          <CardHeading>Appearances</CardHeading>
          <CardWrapper>
            {character.media.edges.map(appearance => {
              return <AppearanceCard appearance={appearance} key={appearance.id} />;
            })}
          </CardWrapper>
          {character.media.pageInfo.hasNextPage && (
            <FetchMoreButton onClick={handleMoreAppearances}>
              Show More Appearances
            </FetchMoreButton>
          )}
        </CardSection>
      </div>
    </main>
  );
};

export default Character;

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
