import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import API from "../API";
import "../App.css";

function ResponsePage() {
  const { formId } = useParams();
  const [responses, setResponses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [formTitle, setFormTitle] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [complexityData, setComplexityData] = useState(null);
  const [selectedUserResponses, setSelectedUserResponses] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
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

  const fetchResponses = async () => {
    try {
      const fetchedResponses = await API.viewResponse(formId);
      const fetchedQuestions = await API.getQuestionByIdForm(formId);
      const fetchedFormDetails = await API.getFormById(formId);
      setResponses(fetchedResponses);
      setQuestions(fetchedQuestions);
      setFormTitle(fetchedFormDetails.title);
    } catch (error) {
      handleError(error);
    }
  };

  const fetchUserResponses = async (userId) => {
    try {
      const fetchedResponses = await API.getResponsesForFormAndUser(
        formId,
        userId
      );
      setSelectedUserResponses(fetchedResponses);
      const questionResponseCount = fetchedResponses
        .flatMap((response) => response.question_details)
        .reduce((acc, detail) => {
          const { question_id } = detail;
          acc[question_id] = (acc[question_id] || 0) + 1;
          return acc;
        }, {});
      const result = Object.entries(questionResponseCount).map(
        ([id, count]) => ({
          questionId: Number(id),
          responseCount: count,
        })
      );
      const completeResult = questions.map((question) => {
        const existing = result.find((res) => res.questionId === question.id);
        return existing || { questionId: question.id, responseCount: 0 };
      });
      const complexityPayload = {
        numberQuestion: questions.length,
        questionResponse: completeResult,
      };
      const authTokenResponse = await API.getAuthToken();
      if (!authTokenResponse || !authTokenResponse.token) {
        throw new Error("Failed to retrieve authentication token.");
      }
      const token = authTokenResponse.token;
      const complexityData = await API.getComplexityScoreViewResponse(
        token,
        complexityPayload
      );
      setComplexityData(complexityData);
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, [formId]);

  const handleUserSelect = (userId) => {
    setSelectedUser(userId);
    fetchUserResponses(userId);
  };

  const renderMatrix = (responses, questions) => {
    if (responses.length === 0) return <p>No data available.</p>;

    return (
      <div>
        {complexityData?.result.finalScore && (
          <div>
            <strong>Form Complexity Score: </strong>
            {complexityData.result.finalScore.toFixed(2)}
          </div>
        )}
        {questions.map((question) => {
          const questionScore = complexityData?.result.questionScores.find(
            (qs) => qs.id === question.id
          );
          const rows = question.headers.filter(
            (header) => header.typ === "row"
          );
          const columns = question.headers.filter(
            (header) => header.typ === "column"
          );
          const isOptional = question.min_selection === 0;

          return (
            <div key={question.id}>
              <h2>{question.title}</h2>
              <em> Min Cells: {question.min_selection}; Max Cells:{question.max_selection}.</em>
              {isOptional && (
                <p className="is-optional"><em>Optional Question</em></p>
              )}
              <div>
                {questionScore ? (
                  <div>
                    <strong>Question Complexity Score:</strong>{" "}
                    {questionScore.score.toFixed(2)}
                  </div>
                ) : (
                  <span>Not Available</span>
                )}
              </div>
              <table>
                <thead>
                  <tr>
                    <th style={{ border: "1px solid black", padding: "5px" }}></th>
                    {columns.map((col) => (
                      <th key={col.id} className="matrix"> {col.val}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="matrix">{row.val}</td>
                      {columns.map((col) => {
                        const isChecked = responses.some((response) =>
                          response.question_details.some(
                            (detail) =>
                              detail.row_id === row.id &&
                              detail.column_id === col.id
                          )
                        );
                        return (
                          <td key={`${row.id}-${col.id}`} className="matrix">
                            <Form.Check type="checkbox" checked={isChecked} disabled/>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Container>
      <Row className="my-3">
        <Col xs={12}>
          <Button variant="secondary" className="back-to-home"
            onClick={() => navigate("/")}>
            Back to Home
          </Button>
          <h1>Responses for Form: <em>{formTitle}</em></h1>
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          {errorMsg && <div className="error-message">{errorMsg}</div>}
          <h2>Submitted Users</h2>
          <div className="table-container">
            {responses.length > 0 ? (
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Submitted at</th>
                    <th>View</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ...new Map(
                      responses.map((item) => [item.user_id, item])
                    ).values(),
                  ].map((response) => (
                    <tr key={response.user_id}>
                      <td>{response.user_username}</td>
                      <td>{new Date(response.submitted_at).toLocaleString()}</td>
                      <td>
                        <Button variant="primary" className="save-button"
                          onClick={() => handleUserSelect(response.user_id)}>
                          View Responses
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No responses found for this form.</p>
            )}
          </div>
        </Col>
      </Row>
  
      {selectedUser && (
        <Row className="mt-4">
          <Col xs={12}  className="new-question">
            <h2>Responses from: <em>
              {responses.find((res) => res.user_id === selectedUser)?.user_username} 
              (ID: {selectedUser})</em></h2>
            {selectedUserResponses.length > 0 ? (
              <>
                <p>
                  <strong>Submitted at: </strong>
                  {new Date(selectedUserResponses[0].submitted_at).toLocaleString()}
                </p>
                {renderMatrix(selectedUserResponses, questions)}
              </>
            ) : (
              <p>No responses found for the selected user.</p>
            )}
          </Col>
        </Row>
      )}
    </Container>
  );
  
}

export default ResponsePage;
