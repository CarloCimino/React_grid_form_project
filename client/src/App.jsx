import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage, NotFound } from './components/HomePage.jsx';
import Login from './components/LoginPage.jsx';
import FormDetail from "./components/FormDetailPage.jsx";
import ResponsePage from "./components/ResponsePage.jsx";
import FormCreate from "./components/FormCreatePage.jsx";
import { AuthProvider } from './AuthContext'; 
import API from './API';

function App() {
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState(undefined);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await API.getUser();
        setLoggedIn(true);
        setUser(user); 
        renewToken();
      } catch (err) {
        setLoggedIn(false);
        setUser(null);
      }
    };    
    checkAuth();
  }, []); 

  const doLogOut = async () => {
    try {
      await API.logOut(); 
      setLoggedIn(false);
      setUser(null); 
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const loginSuccessful = (user) => { 
    setUser(user);
    setLoggedIn(true);
  };

  const renewToken = () => {
    API.getAuthToken().then((response) => { setAuthToken(response.token); })
      .catch(err => { console.log("renewToken err: ", err) });
  }

  useEffect(() => {
    if (loggedIn) {
      const interval = setInterval(() => {
        if (authToken) {
          renewToken();
        }
      }, 60000);
    return () => clearInterval(interval);
    }
  }, [authToken, loggedIn]);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage user={user} loggedIn={loggedIn} logout={doLogOut} renewToken={renewToken} />} />
          <Route path="/login" element={loggedIn ? <Navigate replace to="/" /> : <Login loginSuccessful={loginSuccessful} />} />
          <Route path="/form/:formId" element={<FormDetail user={user} loggedIn={loggedIn} />} />
          <Route path="/form/create" element={<FormCreate user={user} loggedIn={loggedIn} />} />
          <Route path="/form/:formId/response" element={<ResponsePage user={user} loggedIn={loggedIn} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
