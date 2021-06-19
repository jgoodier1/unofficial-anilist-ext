import React from 'react';
import Unauthorized from './Unauthorized';

const Home = ({ authState, submitToken }) => {
  console.log(authState);
  if (authState === 'auth') {
    return <p>You're logged in</p>;
  } else if (authState === 'unauth') {
    return <Unauthorized submitToken={submitToken} />;
  } else if (authState === 'error') {
    // this won't work (and should be changed anyway)
    return (
      <>
        <div>There was an error. Please try again</div>
        <button onClick={() => setAuthState('unauth')}>Dismiss</button>
      </>
    );
  }
  return <div>Something went wrong</div>;
};

export default Home;
