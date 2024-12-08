import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

const PrivateRoute = ({ component: Component, role, ...rest }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (role && user.role !== role) {
    return <Redirect to="/" />;
  }

  return <Route {...rest} render={(props) => <Component {...props} />} />;
};

export default PrivateRoute;
