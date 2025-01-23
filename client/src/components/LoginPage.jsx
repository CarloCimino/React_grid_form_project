import { useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import API from "../API";
import '../App.css';

function Login(props) {
  const [username, setUsername] = useState("Bowser");
  const [password, setPassword] = useState("pwd");
  const [errorMsg, setErrorMsg] = useState(""); 
  const navigate = useNavigate();

  const doLogIn = async (credentials) => {
    API.logIn(credentials)
      .then((user) => {
        setErrorMsg("");
        props.loginSuccessful(user);
        navigate("/");
      })
      .catch((error) => {
        let errMsg = "Incorrect username and/or password";
        if (error.errors) {
          if (error.errors[0].msg) errMsg = error.errors[0].msg;
        } else {
          if (error.error) errMsg = error.error;
        }
        setErrorMsg(errMsg);
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault(); 
    setErrorMsg("");
    const credentials = { username, password };
    let valid = true;
    if (username === "" || password === "") valid = false;
    if (valid) {
      doLogIn(credentials);
    } else {
      setErrorMsg("Invalid content in form.");
    }
  };

  return (
    <Container>
      <Row>
        <Col xs={3}></Col>
        <Col xs={6}>
          <h1>Login</h1>
          <Form onSubmit={handleSubmit}>
              {errorMsg && (
                <div className="error-message">{errorMsg}</div>
              )}
            <Form.Group controlId="username">
              <Form.Label>Username:</Form.Label>
              <Form.Control type="text" value={username} 
                onChange={(e) => setUsername(e.target.value)}/>
            </Form.Group>
            <Form.Group controlId="password" style={{ marginTop: "10px" }}>
              <Form.Label>Password:</Form.Label>
              <Form.Control 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </Form.Group>
            <Button type="submit" className="login-button">Login</Button>
          </Form>
        </Col>
        <Col xs={3}></Col>
      </Row>
    </Container>
  );
}

Login.propTypes = {
  loginSuccessful: PropTypes.func.isRequired,
};

export default Login;
