const URL = "http://localhost:3001/api";
const URL2 = "http://localhost:3002/api";

async function logIn(credentials) {
  const response = await fetch(URL + `/sessions`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });
  const data = await response.json();
  if (response.ok) {
    return data;
  } else {
    throw new Error(data.message || "Failed to log in");
  }
}

async function logOut() {
  const response = await fetch(URL + `/sessions/current`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to log out");
  }
}

async function getUser() {
  const response = await fetch(URL + "/sessions/current", {
    credentials: "include",
  });
  const data = await response.json();
  if (response.ok) {
    return data;
  } else {
    throw new Error(data.message || "Failed to fetch user");
  }
}

async function getForm() {
  const response = await fetch(URL + `/form-list`);
  const forms = await response.json();
  if (response.ok) {
    return forms;
  } else {
    throw new Error(forms.message || "Failed to fetch forms");
  }
}

async function getFormById(formId) {
  const response = await fetch(URL + `/form/${formId}`);
  const form = await response.json();
  if (response.ok) {
    return form;
  } else {
    throw new Error(form.message || "Failed to fetch form details");
  }
}

async function getQuestionByIdForm(formId) {
  const response = await fetch(URL + `/questions-form/${formId}`);
  const questions = await response.json();
  if (response.ok) {
    return questions;
  } else {
    throw new Error(questions.message || "Failed to fetch question by id form");
  }
}

async function submitFormResponses(data) {
  const response = await fetch(URL + "/form/submitForm", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (response.ok) {
    return result;
  } else {
    throw new Error(result.message || "Failed to submit form");
  }
}

async function publishForm(formData) {
  const response = await fetch(URL + `/form/create`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to publish form!");
  }
}

async function getResponsesForFormAndUser(form_id, user_id) {
  const response = await fetch(
    URL + `/form/getUserResponse/${form_id}/${user_id}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  const responses = await response.json();
  if (response.ok) {
    return responses;
  } else {
    throw new Error(responses.message || "Failed to get responses for form and user");
  }
}

async function viewResponse(formId) {
  const response = await fetch(
    URL + `/form/viewResponse/${formId}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  const result = await response.json();
  if (response.ok) {
    return result;
  } else {
    throw new Error(result.message || "Failed to view response");
  }
}

async function getAuthToken() {
  const response = await fetch(URL + "/auth-token", {
    method: "GET",
    credentials: "include",
  });
  const token = await response.json();
  if (response.ok) {
    return token;
  } else {
    throw new Error(token.message || "Error fetching server2");
  }
}

/*** Server 2 API ***/
async function getComplexityScore(token, questions) {
  const response = await fetch(URL2 + `/form/calculateComplexity`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ questions }),
  });
  const score = await response.json();
  if (response.ok) {
    return score;
  } else {
    throw new Error(score.message || "Failed to calculate complexity score");
  }
}

async function getComplexityScoreViewResponse(token, questions) {
  const response = await fetch(URL2 + `/form/calculateComplexityViewResponse`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ questions }),
  });
  const score = await response.json();
  if (response.ok) {
    return score;
  } else {
    throw new Error(score.message || "Failed to calculate complexity score");
  }
}

const API = {
  logIn,
  logOut,
  getUser,
  getForm,
  getFormById,
  getQuestionByIdForm,
  submitFormResponses,
  publishForm,
  getResponsesForFormAndUser,
  viewResponse,
  getAuthToken,
  getComplexityScore,
  getComplexityScoreViewResponse,
};

export default API;
