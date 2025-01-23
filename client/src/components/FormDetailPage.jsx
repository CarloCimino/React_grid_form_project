import { useState, useEffect } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import API from "../API";
import "../App.css";

function FormDetail({ user }) {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [userResponses, setUserResponses] = useState({});
  const [complexityMsg, setComplexityMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState({});
  const navigate = useNavigate();

  const showErrorWithTimer = (message, questionId) => {
    setErrorMsg((prev) => ({ ...prev, [questionId]: message }));
    setTimeout(() => {
      setErrorMsg((prev) => {
        const newErrorMsg = { ...prev };
        delete newErrorMsg[questionId];
        return newErrorMsg;});
    }, 3000);
  };

  const handleError = (error) => {
    console.error("handleError: ", error);
    let errMsg = "Unknown error";
    if (error.errors) {
      if (error.errors[0].msg) errMsg = error.errors[0].msg;
    } else if (error.error) {
      errMsg = error.error;
    }
    showErrorWithTimer(errMsg, "global");
  };


  const fetchData = async () => {
    try {
      const fetchedForm = await API.getFormById(formId);
      const fetchedQuestions = await API.getQuestionByIdForm(formId);
      const fetchedResponses = await API.getResponsesForFormAndUser(formId, user.id);
      setForm(fetchedForm || null);
      setQuestions(fetchedQuestions || []);

      const userResponses = fetchedQuestions.reduce((acc, question) => {
        const responsesForQuestion = fetchedResponses.filter((response) =>
          response.question_details.some((detail) => detail.question_id === question.id));
        acc[question.id] =
          responsesForQuestion.length > 0
            ? responsesForQuestion.flatMap((response) =>
                response.question_details
                  .filter((detail) => detail.question_id === question.id)
                  .map((detail) => ({ row: detail.row_id, column: detail.column_id, }))
              )
            : [];
        return acc;
      }, {});
      setUserResponses(userResponses);
    } catch (error) {
      handleError(error);
    }
  };

  const submitForm = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    let totalSelections = 0;

    try {
      for (const question of questions) {
        const selectedCombinations = userResponses[question.id] || [];
        totalSelections += selectedCombinations.length;
        if (selectedCombinations.length < question.min_selection) {
          setIsSubmitting(false);
          showErrorWithTimer(
            `The question "${question.title}" requires at least ${question.min_selection} selections.`,
            question.id);
          return;
        }
      }

      if (totalSelections === 0) {
        setIsSubmitting(false);
        showErrorWithTimer("Impossible to submit an empty form! Use the button to go back", "global");
        return;
      }

      const formattedResponses = questions.map((question) => {
        const selectedCombinations = userResponses[question.id] || [];
        return {
          questionId: question.id,
          responses: selectedCombinations.map(({ row, column }) => ({
            rowId: row,
            columnId: column,
          })),
        };
      });

      const payload = {
        formId: formId,
        userId: user.id,
        questions: formattedResponses,
      };
      await API.submitFormResponses(payload);

      const complexityPayload = {
        numberQuestion: questions.length,
        questionResponse: formattedResponses,
      };

      const authTokenResponse = await API.getAuthToken();
      if (!authTokenResponse || !authTokenResponse.token) {
        throw new Error("Failed to retrieve authentication token.");
      }

      const complexityData = await API.getComplexityScore(authTokenResponse.token, complexityPayload);
      if (complexityData && complexityData.result.finalScore !== undefined) {
        setComplexityMsg("Your form complexity score is: " + complexityData.result.finalScore.toFixed(2));
        setTimeout(() => navigate("/"), 3000);
      } else {
        console.error("Error: Complexity scores are missing.");
      }
    } catch (error) {
      setIsSubmitting(false);
      handleError(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [formId, user.id]);

  const handleCheckboxChange = (event, row, column, questionId) => {
    const { checked } = event.target;
    const question = questions.find((q) => q.id === questionId);

    if (!question) return;
    const updatedResponses = { ...userResponses };
    let questionResponse = updatedResponses[questionId] || [];

    if (checked) {
      if (questionResponse.length >= question.max_selection) {
        showErrorWithTimer(`You can select up to ${question.max_selection} cells.`, questionId);
        event.target.checked = false;
        return;
      }
      questionResponse = [...questionResponse, { row, column }];
    } else {
      questionResponse = questionResponse.filter(
        (resp) => !(resp.row === row && resp.column === column)
      );
    }
    updatedResponses[questionId] = questionResponse;
    setUserResponses(updatedResponses);
  };

  const renderHeadersMatrix = (headers, question) => {
    const rows = headers.filter((header) => header.typ === "row");
    const columns = headers.filter((header) => header.typ === "column");
    const isOptional = question.min_selection === 0;

    return (
      <div>
        <p className="is-optional"> {isOptional && <em>Optional Question</em>}</p>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid black", padding: "5px" }}></th>
              {columns.map((col) => (
                <th key={col.id} className="matrix"> {col.val} </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="matrix">{row.val}</td>
                {columns.map((col) => {
                  const checkboxId = `checkbox-${row.id}-${col.id}`;
                  const isChecked = userResponses[question.id]?.some(
                    (response) => response.row === row.id && response.column === col.id);
                  return (
                    <td key={`${row.id}-${col.id}`} style={{ border: "1px solid black", padding: "5px" }}>
                      <Form.Check type="checkbox"
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", }}
                        id={checkboxId} checked={isChecked}
                        onChange={(event) => handleCheckboxChange(event, row.id, col.id, question.id)}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Container>
      <Row>
        <Col xs={12}>
          {form && (
            <div>
              <h1>Form Details: <em>{form.title}</em></h1>
              <p> <strong>Form ID:</strong> {form.id}, <strong>Creator ID: </strong>{form.creator_id}
                <Button variant="primary" className="top-form-button" onClick={submitForm} >
                  Submit Form
                </Button>
                <Button variant="secondary" className="back-to-home-easy" onClick={() => navigate("/")}>
                  Back to Home
                </Button>
              </p>
              {complexityMsg && (<div className="complexity-score"><p>{complexityMsg}</p></div>)}
              {isSubmitting && <div className="non-clickable-overlay" />}
              {errorMsg['global'] && (<div className="error-message"> {errorMsg['global']}</div>)}
            </div>
          )}
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <h2><em>Questions</em></h2>
          {questions.map((question) => (
            <div key={question.id} className="new-question">
              <h2>{question.title}</h2>
              {errorMsg[question.id] && (
                <div className="error-message">{errorMsg[question.id]}</div>
              )}
              <em>Min Cells: {question.min_selection}; Max Cells:{question.max_selection}.</em>
              {renderHeadersMatrix(question.headers, question)}
            </div>
          ))}
        </Col>
      </Row>
    </Container>
  );
}

FormDetail.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    id: PropTypes.number,
    is_admin: PropTypes.number.isRequired,
  }),
};

export default FormDetail;
