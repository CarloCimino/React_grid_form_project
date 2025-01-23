import { useEffect, useState } from "react";
import { Container, Row, Button, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import API from "../API";
import "../App.css";

function HomePage({ user, logout }) {
  const [forms, setForms] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [showOnlyMyForms, setShowOnlyMyForms] = useState(false); 
  const navigate = useNavigate();


  const handleError = (error) => {
    console.error("handleError: ", error);
    let errMsg = "Unknown error";
    if (error.errors) {
      if (error.errors[0].msg) errMsg = error.errors[0].msg;
    } else if (error.error) {
      errMsg = error.error;
    }
    setTimeout(() => setErrorMsg(errMsg), 3000);
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogoutClick = () => {
    logout();
  };

  useEffect(() => {
    async function fetchForms() {
      try {
        const forms = await API.getForm();
        setForms(forms);
      } catch (error) {
        handleError(error);
      }
    }
    if (user) {
      fetchForms();
    }
  }, [user]);

  const handleToggleForms = () => {
    setShowOnlyMyForms((prevState) => !prevState);
  };

  const filteredForms = showOnlyMyForms
    ? forms.filter((form) => form.creator_id === user.id) : forms;

  return (
    <Container>
      <Col xs={3}></Col>
      <Col xs={6}></Col>
      <Row className="justify-content-center">
        <div className="forms-page">
          {user ? (
            <div>
              <h1>
                <Button className="logout-button" onClick={handleLogoutClick} style={{ fontSize: "1rem" }}>
                  Logout
                </Button>
                Available Forms: <em>{user?.username} </em>
                <em style={{ fontWeight: 100 }}>{user?.is_admin ? "(Admin)" : "(User)"}</em>
                {user.is_admin === 1 && (
                  <>
                    <Button className="top-form-button" style={{ fontSize: "1rem" }}>
                      <Link to="/form/create">Create Form</Link>
                    </Button>
                    <Button className="view-response-button" onClick={handleToggleForms} style={{ fontSize: "1rem" }}>
                      {showOnlyMyForms ? "Show All Forms" : "My Forms"}
                    </Button>
                  </>
                )}
              </h1>
              <ul className="form-list">
                {filteredForms.length > 0 ? (
                  filteredForms.map((form) => (
                    <li key={form.id} className="form-item">
                      <h2 className="form-title">
                        <strong>{form.title}</strong>
                      </h2>
                      <p className="form-details">
                        Form ID: {form.id}, Creator ID: {form.creator_id}
                        {user.id === form.creator_id && (
                          <>, Responses: {form.responseCount}</>
                        )}
                      </p>
                      <button className="view-form-button">
                        <Link to={`/form/${form.id}`}>Submit Form</Link>
                      </button>
                      {user.id === form.creator_id && (
                          <button className="view-response-button"
                            onClick={() => navigate(`/form/${form.id}/response`)}>
                            View Response
                          </button>
                      )}
                    </li>
                  ))
                ) : (
                  <p>No forms available for now.</p>
                )}
              </ul>
              {errorMsg && <div className="error-message">{errorMsg}</div>}
            </div>
          ) : null}
        </div>
      </Row>
      <Col xs={3}></Col>
    </Container>
  );
}

HomePage.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    is_admin: PropTypes.number.isRequired,
  }),
  logout: PropTypes.func.isRequired,
};


function NotFound() {
  const navigate = useNavigate();
  
  return (
    <div>
      <h1>404 - Not Found</h1>
      <Button variant="secondary" className="back-to-home" onClick={() => navigate("/")}>
        Back to Home
      </Button>
    </div>
  );
}

export { HomePage, NotFound };
