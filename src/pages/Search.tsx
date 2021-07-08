import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useQuery, gql, DocumentNode } from '@apollo/client';
import { Link } from 'react-router-dom';

interface Props {
  value: string;
  type: 'Anime' | 'Manga' | 'Character' | 'Staff';
}

interface Media {
  id: number;
  title: {
    userPreferred: string;
  };
  startDate: {
    year: number;
  };
  format: string;
  coverImage: {
    medium: string;
  };
}

interface Person {
  id: number;
  name: {
    full: string;
  };
  image: {
    medium: string;
  };
}

interface PersonProps extends Person {
  type: 'Character' | 'Staff';
}

const SEARCH_ANIME = gql`
  query SearchAnime($search: String) {
    Page(perPage: 6) {
      media(search: $search, type: ANIME, isAdult: false) {
        id
        type
        title {
          userPreferred
        }
        startDate {
          year
        }
        format
        coverImage {
          medium
        }
      }
    }
  }
`;
const SEARCH_MANGA = gql`
  query SearchManga($search: String) {
    Page(perPage: 6) {
      media(search: $search, type: MANGA, isAdult: false) {
        id
        type
        title {
          userPreferred
        }
        startDate {
          year
        }
        format
        coverImage {
          medium
        }
      }
    }
  }
`;

const SEACH_CHARACTER = gql`
  query SearchCharacter($search: String) {
    Page(perPage: 6) {
      characters(search: $search) {
        id
        name {
          full
        }
        image {
          medium
        }
      }
    }
  }
`;

const SEACH_STAFF = gql`
  query SearchStaff($search: String) {
    Page(perPage: 6) {
      staff(search: $search) {
        id
        name {
          full
        }
        image {
          medium
        }
      }
    }
  }
`;

const MediaResult: React.FC<Media> = ({ id, title, startDate, coverImage, format }) => {
  return (
    <MediaResultWrapper>
      <Row to={`/media/${id}`}>
        <Image src={coverImage.medium} alt='' />
        <ResultHeading>{title.userPreferred}</ResultHeading>
        <YearAndType>
          {startDate.year} {format}
        </YearAndType>
      </Row>
      <EditLink to={`/edit/${id}`}>
        <EditSvg
          version='1.1'
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 -1 401.52289 401'
          fill='black'
        >
          <path d='m370.589844 250.972656c-5.523438 0-10 4.476563-10 10v88.789063c-.019532 16.5625-13.4375 29.984375-30 30h-280.589844c-16.5625-.015625-29.980469-13.4375-30-30v-260.589844c.019531-16.558594 13.4375-29.980469 30-30h88.789062c5.523438 0 10-4.476563 10-10 0-5.519531-4.476562-10-10-10h-88.789062c-27.601562.03125-49.96875 22.398437-50 50v260.59375c.03125 27.601563 22.398438 49.96875 50 50h280.589844c27.601562-.03125 49.96875-22.398437 50-50v-88.792969c0-5.523437-4.476563-10-10-10zm0 0' />
          <path d='m376.628906 13.441406c-17.574218-17.574218-46.066406-17.574218-63.640625 0l-178.40625 178.40625c-1.222656 1.222656-2.105469 2.738282-2.566406 4.402344l-23.460937 84.699219c-.964844 3.472656.015624 7.191406 2.5625 9.742187 2.550781 2.546875 6.269531 3.527344 9.742187 2.566406l84.699219-23.464843c1.664062-.460938 3.179687-1.34375 4.402344-2.566407l178.402343-178.410156c17.546875-17.585937 17.546875-46.054687 0-63.640625zm-220.257812 184.90625 146.011718-146.015625 47.089844 47.089844-146.015625 146.015625zm-9.40625 18.875 37.621094 37.625-52.039063 14.417969zm227.257812-142.546875-10.605468 10.605469-47.09375-47.09375 10.609374-10.605469c9.761719-9.761719 25.589844-9.761719 35.351563 0l11.738281 11.734375c9.746094 9.773438 9.746094 25.589844 0 35.359375zm0 0' />
        </EditSvg>
      </EditLink>
    </MediaResultWrapper>
  );
};

const MediaResultWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Row = styled(Link)`
  display: grid;
  grid-template-columns: 50px 334px 30px;
  grid-gap: 0 10px;
  align-items: center;
  background-color: inherit;
  padding: 8px 10px;
  width: 100%;
  color: inherit;
  text-decoration: none;
`;

const Image = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  grid-row: 1/3;
`;

const ResultHeading = styled.h3`
  grid-column: 2;
  grid-row: 1;
  font-weight: 400;
  font-size: 18px;
  margin: 0;
  cursor: pointer;
`;

const YearAndType = styled.p`
  grid-column: 2;
  grid-row: 2;
  margin: 0;
  font-size: 14px;
`;

const EditLink = styled(Link)`
  display: block;
  grid-column: 3;
  grid-row: 1/3;
  background-color: inherit;
  border: none;
  padding: 0;
  width: 30px;
  height: 30px;
  cursor: pointer;
  position: absolute;
  right: 0px;
  display: grid;
  place-items: center;
`;

const EditSvg = styled.svg`
  width: 20px;
  height: 20px;
`;

const PersonResult: React.FC<PersonProps> = ({ id, name, image, type }) => {
  const link = type === 'Character' ? `/character/${id}` : `/staff/${id}`;
  return (
    <Row to={link}>
      <Image src={image.medium} alt='' />
      <PersonHeading>{name.full}</PersonHeading>
    </Row>
  );
};

const PersonHeading = styled(ResultHeading)`
  grid-row: 1/3;
`;

const SearchSection: React.FC<Props> = ({ value, type }) => {
  if (value === '') return <div></div>;
  let query;
  if (type === 'Anime') query = SEARCH_ANIME;
  else if (type === 'Manga') query = SEARCH_MANGA;
  else if (type === 'Character') query = SEACH_CHARACTER;
  else if (type === 'Staff') query = SEACH_STAFF;

  const { data, loading, error } = useQuery(query as DocumentNode, {
    variables: { search: value }
  });

  if (loading) return <p>Loading...</p>;
  if (error) {
    console.log(error);
    return <p>There was an error loading the media</p>;
  }

  if ((type === 'Anime' || type === 'Manga') && data && data.Page.media.length === 0) {
    return <div></div>;
  } else if (type === 'Character' && data && data.Page.characters.length === 0) {
    return <div></div>;
  } else if (type === 'Staff' && data && data.Page.staff.length === 0) {
    return <div></div>;
  }

  return (
    <section>
      <Heading>{type}</Heading>
      <ResultsWrapper>
        {(type === 'Anime' || type === 'Manga') &&
          data.Page.media.map((media: Media) => {
            return (
              <MediaResult
                id={media.id}
                key={media.id}
                title={media.title}
                coverImage={media.coverImage}
                startDate={media.startDate}
                format={media.format}
              />
            );
          })}
        {type === 'Character' &&
          data.Page.characters.map((person: Person) => {
            return (
              <PersonResult
                id={person.id}
                name={person.name}
                image={person.image}
                type='Character'
                key={person.id}
              />
            );
          })}
        {type === 'Staff' &&
          data.Page.staff.map((person: Person) => {
            return (
              <PersonResult
                id={person.id}
                name={person.name}
                image={person.image}
                type='Staff'
                key={person.id}
              />
            );
          })}
      </ResultsWrapper>
    </section>
  );
};

const Heading = styled.h2`
  margin: 24px;
`;

const ResultsWrapper = styled.div`
  background-color: #fafafa;
  padding: 8px;
`;

const Search = () => {
  const [searchValue, setSearchValue] = useState('');
  const [passedValue, setPassedValue] = useState('');
  const [timeout, setTimeout] = useState<number>();
  const searchInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchInput && searchInput.current && searchInput.current.focus();
  }, []);

  const search = (e: React.FocusEvent<HTMLInputElement>) => {
    clearTimeout(timeout);
    let localValue = e.currentTarget.value;
    setSearchValue(localValue);
    setTimeout(
      window.setTimeout(() => {
        setPassedValue(localValue);
      }, 500)
    );
  };

  return (
    <main>
      <SearchBar>
        <SearchInput
          type='search'
          placeholder='Search Anilist'
          ref={searchInput}
          value={searchValue}
          onChange={search}
        />
        <SearchButton>
          <Svg
            version='1.1'
            xmlns='http://www.w3.org/2000/svg'
            x='0px'
            y='0px'
            viewBox='0 0 512.005 512.005'
          >
            <g>
              <g>
                <path
                  fill='currentColor'
                  d='M505.749,475.587l-145.6-145.6c28.203-34.837,45.184-79.104,45.184-127.317c0-111.744-90.923-202.667-202.667-202.667
         S0,90.925,0,202.669s90.923,202.667,202.667,202.667c48.213,0,92.48-16.981,127.317-45.184l145.6,145.6
         c4.16,4.16,9.621,6.251,15.083,6.251s10.923-2.091,15.083-6.251C514.091,497.411,514.091,483.928,505.749,475.587z
          M202.667,362.669c-88.235,0-160-71.765-160-160s71.765-160,160-160s160,71.765,160,160S290.901,362.669,202.667,362.669z'
                />
              </g>
            </g>
          </Svg>
        </SearchButton>
      </SearchBar>
      <SearchSection value={passedValue} type='Anime' />
      <SearchSection value={passedValue} type='Manga' />
      <SearchSection value={passedValue} type='Character' />
      <SearchSection value={passedValue} type='Staff' />
    </main>
  );
};

export default Search;

const SearchBar = styled.div`
  margin: 16px;
  padding: 16px;
  display: flex;
  background-color: #fafafa;
`;

const SearchInput = styled.input`
  width: 93%;
  border: none;
  background-color: inherit;
  font-size: 18px;
`;

const SearchButton = styled.button`
  width: -moz-fit-content;
  width: fit-content;
  padding: 0;
  background: inherit;
  border: none;
  margin-left: 5px;
  cursor: pointer;
`;

const Svg = styled.svg`
  width: 25px;
  height: 25px;
`;
