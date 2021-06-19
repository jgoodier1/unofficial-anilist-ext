import React, { useState, useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';
import { getUser } from './queries';
import Home from './components/Home';
import NavBar from './components/NavBar';
import List from './components/List';
import Search from './components/Search';

function App() {
  const [token, setToken] = useState();
  const [authState, setAuthState] = useState('unauth');

  const TokenContext = React.createContext();

  useEffect(async () => {
    // setAuthState('auth');
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
      setAuthState('auth');
      await browser.storage.local.set({ token: newToken });
    } else {
      setAuthState('error');
    }
  };

  const logOut = async () => {
    setAuthState('unauth');
    await browser.storage.local.remove('token');
  };

  const routes = (
    <Switch>
      <Route path='/anime'>
        <List />
      </Route>
      <Route path='/manga'>
        <List />
      </Route>
      <Route path='/search'>
        <Search />
      </Route>
      <Route path='/'>
        <Home authState={authState} submitToken={submitToken} />
      </Route>
    </Switch>
  );

  return (
    <TokenContext.Provider value={token}>
      {authState === 'auth' && <NavBar logOut={logOut} />}
      {routes}
    </TokenContext.Provider>
  );
}

export default App;
