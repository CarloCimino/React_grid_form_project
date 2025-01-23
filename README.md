[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/RemxYlak)

# Exam #4: "Grid Form"

## Student: s333916 CIMINO CARLO


## React Client Application Routes

- Route `/`: HomePage, if the user is authenticated, list all the available forms: pressing the button submit will redirect to the route ('/form/:formId'); if the user is an admin, he will be able to see the button for the creation of a new form, being redirected to ('/create'), and if the user is the creator of a form he can view the response submitted for each user, being redirected to ('/form/:formId/response'). If the user is not authenticated, he will be redirected to the route ('/login').
- Route `/form/:formId`: FormDetail, allow the user (admin and user) to submit a form, modifing the previous answer (if already submitted).
- Route `/create`: FormCreate, allow the admin to create new form, choosing the name for the form and for each question, the grid headers and the minumum and maximum responses accepted for each question.
- Route `/form/:formId/response `: ResponsePage, allow the admin and creator of the form to see the responses and details submitted by the users for each form.
- Route `/login`: Login, allows users to login. After a successful login, the user is redirected to the main route ('/').
- Route `/*`: NotFound, page that show up for non existing URLs, with a button Back to home ('/').


## API Server

- GET `/api/form-list`: retrieve the list of all available forms.
  - response body: JSON array with all the forms data and count of responses for each one.
    [
      {"id":1,"title":"Mobile Features","creator_id":1,"responseCount":2},
      {"id":2,"title":"Tech Preferences","creator_id":2,"responseCount":2},
      {"id":3,"title":"Best F1 Pilot","creator_id":1,"responseCount":2},
      {"id":4,"title":"Cybersec Awareness","creator_id":2,"responseCount":3},....
    ]
  - Codes:
    - 200 OK,
    - 500 Internal Server Error.


- GET `/api/form/:form_id`: retrieve a specific form by its ID.
  - request parameters: form ID.
  - response body: JSON object with form data of the specified ID.
      {"id":1,"title":"Mobile Features","creator_id":1}
  - Codes:
    - 200 OK,
    - 404 Not Found,
    - 500 Internal Server Error.


- GET `/api/questions-form/:form_id`: retrieve all questions from a specific form by its ID.
  - request parameters: form ID.
  - response body: JSON array of questions, each containing data of the form's question with an array the headers.
      [{"id":1,"form_id":1,"title":"Mobile Brands vs Features","min_selection":1,"max_selection":5,"headers":[
          {"id":1,"typ":"row","val":"Apple"},
          {"id":2,"typ":"row","val":"Samsung"}, ...,
          {"id":6,"typ":"column","val":"Performance"},
          {"id":7,"typ":"column","val":"Design"}, ...
        ]},
        {"id":2,"form_id":1,"title":"Connectivity Options","min_selection":0,"max_selection":4,"headers":[
          {"id":9,"typ":"row","val":"WiFi"}, ...,
          {"id":12,"typ":"column","val":"Range"}, ...
      ]}]
- Codes:
  - 200 OK,
  - 404 Not Found,
  - 500 Internal Server Error.


- POST `/api/form/create`: publish a new form.
  - request body: JSON object with an array containing the questions with another array for the headers.
      {"title":"Form Name","questions":[
        {"id":"tmp-1737637344636","title":"Q1","headers":[
          {"id":1,"typ":"row","val":"Row1"},
          {"id":2,"typ":"column","val":"Col1"}],
          "min_selection":0,"max_selection":1}
        ],
        "userId":1
      }
  - Codes:
    - 204 No Content,
    - 500 Internal Server Error.


- POST `/api/form/submitForm`: submit responses to a form.
  - request body: JSON object containing the responses for the specific form ID and user ID with an array containing the questions with another array containing the responses.
      {"formId":"1","userId":1,
      "questions":[
        {"questionId":1,"responses":[
          {"rowId":1,"columnId":4},
          {"rowId":2,"columnId":4},
          {"rowId":2,"columnId":6},...
          ]}, ...
      ]}
  - Codes:
    - 201 Created,
    - 500 Internal Server Error.


- GET `/api/form/getUserResponse/:formId/:userId`: retrieve a user's personal responses for a specific form.
  - request parameters: form ID and user ID.
  - response body: JSON array with user responses for each question for a specific form ID and user ID.
      [{"response_id":1,"submitted_at":"2025-01-23 12:21:20","question_details":[
        {"question_id":1,"question_title":"Mobile Brands vs Features","row_id":1,"column_id":4,"header":{"id":1,"typ":"row","val":"Apple"}},
        {"question_id":1,"question_title":"Mobile Brands vs Features","row_id":2,"column_id":5,"header":{"id":2,"typ":"row","val":"Samsung"}}, ...
      ]}]
  - Codes:
    - 200 OK,
    - 400 Bad Request,
    - 500 Internal Server Error.


- GET `/api/form/viewResponse/:formId`: retrieve the responses for a specific form.
  - request parameters: form ID.
  - response body: JSON array with the responses of all users for a specific form ID.
      [{"response_id":1,"form_id":1,"user_id":4,"user_username":"Boo","submitted_at":"2025-01-23 12:21:20","question_id":1,"row_id":1,"column_id":4},
      {"response_id":1,"form_id":1,"user_id":4,"user_username":"Boo","submitted_at":"2025-01-23 12:21:20","question_id":1,"row_id":2,"column_id":5}, ...
      ]
  - Codes:
    - 200 OK,
    - 500 Internal Server Error.


- POST `/api/sessions`: authenticate the user and create a session.
  - request parameters: JSON object with username and password.
  - response body: JSON object with username and password.
      {"id":1,"username":"Bowser","is_admin":1}
  - Codes:
    - 200 OK,
    - 401 Unauthorized.


- DELETE `/api/sessions/current`: Logout the user.
  - Codes:
    - 204 No Content,
    - 500 Internal Server Error.


- GET `/api/sessions/current`: get info of the current user.
  - response body: JSON object with user info.
      {"id":1,"username":"Bowser","is_admin":1}
  - Codes:
    - 200 OK,
    - 401 Unauthenticated user.


- GET `/api/auth-token`: generation of a signed token
  - response body content: JSON object with the token.
      Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTczNzU1NzgwMywiZXhwIjoxNzM3NTYxNDAzfQ.ia5eGEPmEbyG0I1WLMMi_240Muw5jDSicOqmgAzuwHo
  - Codes:
    - 200 OK.


## API Server2

- POST `/api/form/calculateComplexity`, calculate and return the complexity of the form based on the responses to each question.
  - request headers: JWT token required for authentication.
  - request body: JSON object containing the responses for each question, including the response count.
      {"questions":{"numberQuestion":2,"questionResponse":[
        {"questionId":1,"responses":[{"rowId":1,"columnId":4},{"rowId":2,"columnId":4},{"rowId":2,"columnId":6},{"rowId":3,"columnId":7},{"rowId":1,"columnId":5}]}, ...
      ]}}
  - response body: JSON object containing the question scores and the final score.
      {"result":{
        "questionScores":[{"id":1,"score":65.61641284228587}, ] ...,
        "finalScore":65.2084360326201}
      } 
  - Codes:
    - 200 OK,
    - 401 Unauthorized,
    - 400 Bad Request (invalid request body),
    - 500 Internal Server Error.


- POST `/api/form/calculateComplexityViewResponse` Calculate and return the complexity of the form with the count of responses per question.
  - request headers: JWT token required for authentication.
  - request body: JSON object containing the response count for each question.
      {"questions":{"numberQuestion":2,"questionResponse":[
        {"questionId":1,"responseCount":4},
        {"questionId":2,"responseCount":2}]
      }}
  - response body: JSON object containing the question scores and the final score.
      {"result":{
        "questionScores":[{"id":1,"score":36.64836694549773},{"id":2,"score":45.456374859983015}],
        "finalScore":41.05237090274037
      }}
  - Codes:
    - 200 OK,
    - 401 Unauthorized,
    - 400 Bad Request (invalid request body).


## Database Tables

- Table `users` - store all the data of the users, contains:
  - id: Integer (PRIMARY KEY, Autoincrement),
  - username: Text (Unique Not Null),
  - salt: Text,
  - password: Text (Not Null),
  - is_admin: Boolean (Not Null).

- Table `forms` - store all the basic data of the forms, contains:
  - id: Integer (PRIMARY KEY, Autoincrement),
  - title: Text (Not Null),
  - creator_id: Integer (Not Null, Foreign Key references to users(id)).

- Table `questions` - store the data of the questions related to the forms, contains:
  - id: Integer (PRIMARY KEY, Autoincrement),
  - form_id: Integer (Not Null, Foreign Key references to forms(id)),
  - title: Text (Not Null),
  - min_selection: Integer (Not Null),
  - max_selection: Integer (Not Null).

- Table `grid_headers` - store the headers of the matrix related to the questions, contains:
  - id: Integer (PRIMARY KEY, Autoincrement),
  - question_id: Integer (Not Null, Foreign Key references to questions(id)),
  - form_id: Integer (Not Null, Foreign Key references to forms(id)),
  - typ: Text (Not Null) - ('row' or 'column'),
  - val: Text (Not Null).

- Table `responses` - store the basic data after the submission of the forms, contains:
  - id: Integer (PRIMARY KEY, Autoincrement),
  - form_id: Integer (Not Null, Foreign Key references to forms(id)),
  - user_id: Integer (Not Null, Foreign Key references to users(id)),
  - submitted_at: Datetime (Default CURRENT_TIMESTAMP).

- Table `response_details` - store all the data of the user responses for the forms, contains:
  - id: Integer (PRIMARY KEY, Autoincrement),
  - response_id: Integer (Not Null, Foreign Key references to responses(id)),
  - question_id: Integer (Not Null, Foreign Key references to questions(id)),
  - row_id: Integer (Not Null, Foreign Key references to grid_headers(id)),
  - column_id: Integer (Not Null, Foreign Key references to grid_headers(id)).


## Main React Components

- `renderHeadersMatrix` (in `FormCreatePage.jsx`): allow user to creates row and column headers for each question, to interact with text inputs in row/column grid headers when editing the form.
- `saveChanges` (in `FormCreatePage.jsx`): validates and saves changes to questions, ensuring no empty headers, proper minimum and maximum selections, and updates the form correctly. It also ensures that the most recently saved version is displayed if the editing phase is interrupted.
- `handleCheckboxChange` (in `FormDetailPage.jsx`): manages checkbox interactions with each question, checking for selection limits and updating user responses. It ensures that users don’t exceed the maximum allowed selections and prevents invalid choices.
- `fetchData` (in `FormDetailPage.jsx`): loads form data, questions, and, if present in the database, previous user responses, updating the component state to reflect the data. It handles errors and ensures the latest data is displayed to the user.
- `handleUserSelect` (in `ResponsePage.jsx`): manages user selection in the form, fetching the selected user’s responses and updating the displayed data accordingly.


## Screenshot

![Login](./img/Login.png)
![HomePageAdmin](./img/HomePageAdmin.png)
![HomePageUser](./img/HomePageUser.png)
![CreateForm](./img/CreateForm.png)
![FormDetails](./img/FormDetails.png)
![ResponsePage](./img/ResponsePage.png)


## Users Credentials

- username | password | is_admin
-----------|----------|-----------
-  Bowser  |   pwd    |  1 (yes)
-  Waluigi |   pwd    |  1 (yes)
- Tartosso |   pwd    |  0 (no)
-    Boo   |   pwd    |  0 (no)
-   Yoshi  |   pwd    |  0 (no)