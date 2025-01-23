import { useState } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import API from "../API";
import "../App.css";

function FormCreate({ user }) {
  const [form, setForm] = useState({ title: "" });
  const [questions, setQuestions] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editedHeaders, setEditedHeaders] = useState([]);
  const [newQuestionTitle, setNewQuestionTitle] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [headerCounter, setHeaderCounter] = useState(1);
  const navigate = useNavigate();

  const displayError = (message) => {
    setErrorMsg(message);
    setTimeout(() => setErrorMsg(""), 3000);
  };

  const startEditing = (question) => {
    if (editingQuestion?.startsWith("tmp-")) {
      setQuestions((prevQuestions) =>
        prevQuestions.filter((q) => q.id !== editingQuestion)
      );
    }
    setEditingQuestion(question.id);
    setEditedHeaders([...question.headers]);
  };

  const saveChanges = () => {
    const filteredHeaders = editedHeaders.filter(
      (header) => header.val.trim() !== ""
    );
    const rows = filteredHeaders.filter((header) => header.typ === "row");
    const columns = filteredHeaders.filter((header) => header.typ === "column");
    const nonEmptyCellsCount = rows.length * columns.length;

    if (nonEmptyCellsCount === 0) {
      displayError("You haven't created any possible answers.");
      return;
    }

    const question = questions.find((q) => q.id === editingQuestion);
    if (!question) {
      displayError("Question not found");
      return;
    }
    if (question.min_selection < 0) {
      displayError("Min cells must be >= 0.");
      return;
    }
    if (question.min_selection > nonEmptyCellsCount) {
      displayError(
        `Min cells must be <= the total number of cells (${nonEmptyCellsCount}).`
      );
      return;
    }
    if (question.max_selection > nonEmptyCellsCount) {
      displayError(
        `Max cells must be <= the total number of cells (${nonEmptyCellsCount}).`
      );
      return;
    }
    if (question.max_selection < question.min_selection) {
      displayError("Min cells must be <= than max cells.");
      return;
    }

    setQuestions((prevQuestions) => {
      const updatedQuestions = prevQuestions.map((q) => {
        if (q.id === editingQuestion) {
          return { ...q, headers: filteredHeaders, saved: true };
        }
        return q;
      });
      return updatedQuestions;
    });

    setEditingQuestion(null);
    setEditedHeaders([]);
    setErrorMsg("");
  };

  const handleHeaderChange = (id, field, value) => {
    setEditedHeaders((prev) =>
      prev.map((header) =>
        header.id === id ? { ...header, [field]: value } : header
      )
    );
  };

  const deleteQuestion = (questionId) => {
    setQuestions((prevQuestions) =>
      prevQuestions.filter((q) => q.id !== questionId)
    );
  };

  const addHeader = (typ) => {
    const newHeader = { id: headerCounter, typ, val: "" };
    setHeaderCounter((prev) => prev + 1);
    setEditedHeaders((prev) => {
      const updatedHeaders = [...prev, newHeader];
      return updatedHeaders.sort((a, b) => a.id - b.id);
    });
  };

  const createNewQuestion = () => {
    if (newQuestionTitle.trim() === "") {
      displayError("The question title cannot be empty. Please enter a title.");
      return;
    }
    if (editingQuestion) {
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) => {
          if (q.id === editingQuestion && q.saved) {
            return { ...q, headers: q.headers }; 
          }
          return q;
        }).filter((q) => q.id !== editingQuestion || q.saved)
      );
    }
    const newQuestion = {
      id: `tmp-${Date.now()}`,
      title: newQuestionTitle,
      headers: [
        { id: headerCounter, typ: "row", val: "" },
        { id: headerCounter + 1, typ: "column", val: "" },
      ],
      min_selection: 0,
      max_selection: 1,
      saved: false,
    };
  
    setHeaderCounter((prev) => prev + 2);
    setQuestions((prevQuestions) => [...prevQuestions, newQuestion]);
    setEditingQuestion(newQuestion.id);
    setEditedHeaders(newQuestion.headers);
    setNewQuestionTitle("");
    setErrorMsg("");
  };

  const publishForm = async () => {
    if (!form?.title.trim()) {
      displayError("The form name cannot be empty. Please provide a title.");
      return;
    }

    const savedQuestions = questions.filter((q) => q.saved);
    if (savedQuestions.length === 0) {
      displayError("The form must contain at least one saved question.");
      return;
    }

    const formattedQuestions = savedQuestions.map((question) => ({
      id: question.id,
      title: question.title,
      headers: question.headers
        .map((header) => ({
          id: header.id,
          typ: header.typ,
          val: header.val,
        }))
        .sort((a, b) => a.id - b.id),
      min_selection: question.min_selection,
      max_selection: question.max_selection,
    }));

    const formData = {
      title: form.title,
      questions: formattedQuestions,
      userId: user.id,
    };

    try {
      await API.publishForm(formData);
      navigate("/");
    } catch (error) {
      displayError("Failed to create the form. Please try again.");
    }
  };

  const renderHeadersMatrix = (headers, isEditing, question) => {
    const rows = headers.filter((header) => header.typ === "row").sort((a, b) => a.id - b.id);
    const columns = headers.filter((header) => header.typ === "column").sort((a, b) => a.id - b.id);
    const totalCells = rows.length * columns.length;

    return (
      <div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th></th>
              {columns.map((col) => (
                <th key={col.id} className="matrix">
                  {isEditing ? (
                    <Form.Control type="text" value={col.val} onChange={(e) =>
                        handleHeaderChange(col.id, "val", e.target.value)}
                    />
                  ) : (
                    col.val
                  )}
                </th>
              ))}
              {isEditing && (
                <th>
                  <Button variant="success" className="row-col" onClick={() => addHeader("column")}>
                    + Column
                  </Button>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="matrix">
                  {isEditing ? (
                    <Form.Control
                      type="text"
                      value={row.val}
                      onChange={(e) =>
                        handleHeaderChange(row.id, "val", e.target.value)
                      }
                    />
                  ) : (
                    row.val
                  )}
                </td>
                {columns.map((col) => (
                  <td key={`${row.id}-${col.id}`} className="matrix"></td>
                ))}
              </tr>
            ))}
            {isEditing && (
              <tr>
                <td colSpan={columns.length + 2}>
                  <Button variant="success" className="row-col" onClick={() => addHeader("row")}>
                    + Row
                  </Button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {isEditing && (
          <div style={{ marginTop: "10px" }}>
            <Form.Group>
              <Form.Label>Minimum Cells</Form.Label>
              <Form.Control type="number" min={0} max={totalCells} value={question.min_selection} 
                onChange={(e) => { 
                  const min = parseInt(e.target.value, 10);
                  setQuestions((prevQuestions) =>
                    prevQuestions.map((q) =>
                      q.id === question.id ? { ...q, min_selection: min } : q
                    )
                  );
                }}onKeyDown={(e) => e.preventDefault()}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Maximum Cells</Form.Label>
              <Form.Control type="number" min={0} max={totalCells} value={question.max_selection} 
                onChange={(e) => { 
                  const max = parseInt(e.target.value, 10);
                  setQuestions((prevQuestions) =>
                    prevQuestions.map((q) =>
                      q.id === question.id ? { ...q, max_selection: max } : q
                    )
                  );
                }}onKeyDown={(e) => e.preventDefault()}
              />
            </Form.Group>
          </div>
        )}
      </div>
    );
  };

  return (
    <Container>
      <Row>
        <Col xs={12}>
          <Button className="back-to-home" variant="secondary" onClick={() => navigate("/")}>
            Back to Home
          </Button>
          <h1>Form Create</h1>
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <Form.Control type="text" value={form.title}
            onChange={(e) =>
              setForm((prevForm) => ({ ...prevForm, title: e.target.value }))
            }
            placeholder="Enter form name"
          />
          <Button variant="success" className="top-form-button" onClick={publishForm}>
            Publish Form
          </Button>
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <h2>Questions</h2>
          <Form>
            <Form.Control type="text" placeholder="New question title" value={newQuestionTitle}
              onChange={(e) => setNewQuestionTitle(e.target.value)}
            />
            <Button variant="primary" className="view-response-button" onClick={createNewQuestion}>
              Create Question
            </Button>
          </Form>
          {errorMsg && <div className="error-message">{errorMsg}</div>}
          {questions.map((question) => (
            <div key={question.id} className="new-question">
              <h4>
                {question.title}
                {editingQuestion === question.id ? (
                  <Button variant="primary" className="save-button" onClick={saveChanges}>
                    Save
                  </Button>
                ) : (
                  <Button className="modify-button" onClick={() => startEditing(question)}>
                    Modify
                  </Button>
                )}
                <Button variant="danger" className="delete-button" onClick={() => deleteQuestion(question.id)} >
                  Delete
                </Button>
              </h4>
              <em>Min Cells: {question.min_selection}; Max Cells:{question.max_selection}.</em>
              {renderHeadersMatrix(
                editingQuestion === question.id
                  ? editedHeaders
                  : question.headers,
                editingQuestion === question.id,
                question
              )}
            </div>
          ))}
        </Col>
      </Row>
    </Container>
  );
}

FormCreate.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    id: PropTypes.number,
    is_admin: PropTypes.number.isRequired,
  }),
};

export default FormCreate;
