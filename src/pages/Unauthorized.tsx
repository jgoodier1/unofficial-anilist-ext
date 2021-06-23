import React from 'react';
import styled from 'styled-components';

interface Props {
  submitToken: (e: React.FormEvent<HTMLFormElement>) => void;
}

const Unauthorized: React.FC<Props> = ({ submitToken }) => {
  return (
    <Wrapper>
      <Heading>Unofficial AniList Extension</Heading>
      <p>
        Step 1:{' '}
        <Link href='https://anilist.co/api/v2/oauth/authorize?client_id=4953&response_type=token'>
          Authorize on Anilist
        </Link>
      </p>
      <p>
        Step 2: <label htmlFor='token'>Input your token</label>{' '}
      </p>
      <Form onSubmit={submitToken}>
        <TextArea
          name='token'
          rows={15}
          cols={30}
          placeholder='input token'
          required
        ></TextArea>
        <Button type='submit'>Submit</Button>
      </Form>
    </Wrapper>
  );
};

export default Unauthorized;

const Wrapper = styled.main`
  width: 432px;
  padding: 1rem;
  margin: 1rem;
  background: #fafafa;
  border-radius: 2px;
  display: grid;
  place-items: center;
`;

const Heading = styled.h1`
  font-size: 24px;
  margin: 0;
  /* color: var(--colour-text); */
`;

const Link = styled.a`
  color: inherit;
  font-weight: bold;
  text-decoration: underline #4ccefa;
`;

const Form = styled.form`
  display: grid;
  place-items: center;
`;

const TextArea = styled.textarea`
  resize: none;
`;

const Button = styled.button`
  display: block;
  background: #4ccefa;
  border: none;
  cursor: pointer;
  padding: 0.5rem 1rem;
  font-size: 14px;
  font-weight: 600;
  color: white;
  font-family: inherit;
  margin-top: 15px;
  border-radius: 2px;
`;
