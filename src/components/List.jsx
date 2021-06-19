import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const List = () => {
  const location = useLocation();

  return (
    <div>
      <Link to='/'>Home</Link>
      <h1>List</h1>
    </div>
  );
};

export default List;
