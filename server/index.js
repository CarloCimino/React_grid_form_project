"use strict";

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const session = require("express-session");
const { param, validationResult } = require("express-validator");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const jsonwebtoken = require("jsonwebtoken");
const jwtSecret = "6xvL4xkAAbG49hcXf5GIYSvkDICiUAR6EdR5dLdwW7hMzUjjMUe9t6M5kSAYxsvX";
const expireTime = "1h";
const userDao = require("./dao_users");
const formDao = require("./dao_form");
const app = express();
const port = 3001;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
})
);

app.use(morgan("dev"));
app.use(express.json());

passport.use(new LocalStrategy(function(username, password, done) {
    userDao.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, { message: 'Incorrect username or password.' });
      return done(null, user);
    })
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  userDao.getUserById(id)
    .then(user => {
      done(null, user);
    }).catch(err => {
      done(err, null);
    });
});

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ error: "Not authenticated" });
};

app.use(session({
    secret: "smooth-operator",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());


/*** Form APIs ***/
// 1. Retrieve the list of all the available forms
app.get("/api/form-list", async (req, res) => {
  try {
    const form = await formDao.getForm();
    res.json(form);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve form list", details: err.message });
  }
});

// 2. Retrieve a specific form by its ID
app.get("/api/form/:formId", [
  param('formId').isInt().withMessage('formId should be an integer')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const formId = req.params.formId;
  try {
    const form = await formDao.getFormById(formId);
    if (form) {
      res.status(200).json(form);
    } else {
      res.status(404).json({ error: `Form with ID ${formId} not found` });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve form", details: err.message });
  }
});

// 3. Retrieve all questions from specific form ID
app.get("/api/questions-form/:formId", [
  param('formId').isInt().withMessage('formId should be an integer')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const formId = req.params.formId;
  try {
    const questions = await formDao.getQuestionByIdForm(formId);
    if (questions) {
      res.status(200).json(questions);
    } else {
      res.status(404).json({ error: `Questions with Form ID ${formId} not found` });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve questions", details: err.message });
  }
});

// 4. Publish a new form
app.post("/api/form/create", isLoggedIn, async (req, res) => {
  const formData = req.body;
  try {
    await formDao.publishForm(formData);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Failed to publish form", details: err.message });
  }
});

// 5. Submit responses
app.post("/api/form/submitForm", isLoggedIn, async (req, res) => {
  const payload = req.body;
  try {
    await formDao.submitFormResponses(payload);
    res.status(201).json({});
  } catch (err) {
    res.status(500).json({ error: "Failed to submit form responses", details: err.message });
  }
});

// 6. View personal user response in form details page
app.get("/api/form/getUserResponse/:formId/:userId", [
  param('formId').isInt().withMessage('formId should be an integer'),
  param('userId').isInt().withMessage('userId should be an integer')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const user_id = req.params.userId;
  const form_id = req.params.formId;
  try {
    const responses = await formDao.getResponsesForFormAndUser(form_id, user_id);
    if (!responses || responses.length === 0) {
      return res.status(200).json([]);
    }
    res.json(responses);
  } catch (error) {
    console.error("Error fetching responses for formId:", form_id, "and userId:", user_id, error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// 7. View response function for the response page
app.get("/api/form/viewResponse/:formId", async (req, res) => {
  const formId = req.params.formId;
  try {
    const response = await formDao.viewResponse(formId);
    res.json(response);
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve response",
      details: error.message,
    });
  }
});


/*** Users APIs ***/
app.post("/api/sessions", function (req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json(info);
    }
    req.login(user, (err) => {
      if (err) return next(err);
      return res.json(req.user);
    });
  })(req, res, next);
});

app.delete("/api/sessions/current", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: "Failed to log out" });
    res.status(204).end();
  });
});

app.get('/api/sessions/current', (req, res) => {  if(req.isAuthenticated()) {
  res.status(200).json(req.user);}
else
  res.status(401).json({error: 'Unauthenticated user!'});;
});


/*** Token API ***/
app.get("/api/auth-token", isLoggedIn, (req, res) => {
  const payloadToSign = { userId: req.user.id };
  const jwtToken = jsonwebtoken.sign(payloadToSign, jwtSecret, { expiresIn: expireTime });
  res.json({ token: jwtToken });
});

// Activating the server
app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}/`)
);
