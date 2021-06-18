import React, { useState, useEffect } from 'react';
import { getUser } from './queries';
import Unathorized from './components/Unathorized';

function App() {
  const [token, setToken] = useState();
  const [authState, setAuthState] = useState('unauth');

  const TokenContext = React.createContext();

  useEffect(async () => {
    // await browser.storage.local.set({ token: '8548509834850808308' });
    let result = await browser.storage.local.get('token');
    if (result.token) {
      setToken(result.token);
      setAuthState('auth');
    }
  });

  const submitToken = async e => {
    e.preventDefault();

    let newToken = e.target.token.value;
    newToken.trim();

    const res = await getUser(newToken);
    console.log(res);
    if (typeof res === 'number') {
      setToken(newToken);
      await browser.storage.local.set({ token: newToken });
    } else {
      setAuthState('error');
    }
  };

  const logOut = async () => {
    setAuthState('unauth');
    await browser.storage.local.remove('token');
  };

  let renderedApp = <Unathorized onSubmit={submitToken} />;

  if (authState === 'auth') {
    renderedApp = <button onClick={logOut}>Log out</button>;
  } else if (authState === 'unath') {
    renderedApp = <Unathorized onSubmit={submitToken} />;
  } else if (authState === 'error') {
    renderedApp = (
      <>
        <div>There was an error. Please try again</div>
        <button onClick={() => setAuthState('unauth')}>Dismiss</button>
      </>
    );
  }

  return <TokenContext.Provider value={token}>{renderedApp}</TokenContext.Provider>;
}

export default App;
