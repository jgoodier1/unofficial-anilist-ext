import React from 'react';
import Unauthorized from './Unauthorized';

interface Props {
  authState: 'auth' | 'unauth' | 'error';
  submitToken: (e: React.FormEvent<HTMLFormElement>) => void;
}

const Home: React.FC<Props> = ({ authState, submitToken }) => {
  console.log(authState);
  if (authState === 'auth') {
    return <p>You're logged in</p>;
  } else if (authState === 'unauth') {
    return <Unauthorized submitToken={submitToken} />;
  } else if (authState === 'error') {
    return (
      <>
        <div>There was an error. Please try again</div>
      </>
    );
  }
  return <div>Something went wrong</div>;
};

export default Home;
