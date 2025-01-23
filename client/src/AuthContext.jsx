import { createContext, useState } from 'react';
import PropTypes from 'prop-types';
import API from './API';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const logIn = async (credentials) => {
    try {
      const userData = await API.logIn(credentials);
      setUser(userData);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logOut = async () => {
    try {
      await API.logOut();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  return (
    <AuthContext.Provider value={{ user, logIn, logOut }}> 
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthContext;
