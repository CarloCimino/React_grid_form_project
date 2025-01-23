"use strict";

const express = require("express");
const morgan = require('morgan'); 
const cors = require("cors");
const { expressjwt: jwt } = require("express-jwt");
const { body, validationResult } = require("express-validator");
const jwtSecret = "6xvL4xkAAbG49hcXf5GIYSvkDICiUAR6EdR5dLdwW7hMzUjjMUe9t6M5kSAYxsvX"; 
const app = express();
const port = 3002;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
  })
);

app.use(morgan('dev'));
app.use(express.json());

app.use(jwt({
    secret: jwtSecret,
    algorithms: ["HS256"],
  })
);

const validateComplexity = [
  body("questions").exists()
    .withMessage("Questions field is required"),
  body("questions.questionResponse").isArray()
    .withMessage("QuestionResponse must be an array"),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

app.post("/api/form/calculateComplexity", validateComplexity, handleValidationErrors, (req, res) => {
  
  try {
    const { questions } = req.body;
    const questionScores = questions.questionResponse.map((question) => {
      const responseCount = question.responses.length;
      const randomValue = Math.random()  * 80;
      return {
        id: question.questionId,
        score: responseCount + randomValue,
      };
    });
    const result = {
      questionScores: questionScores,
      finalScore: questionScores.reduce((sum, item) => sum + item.score,0) / questions.questionResponse.length,
    };
    res.json({ result });
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(400).json({ error: "Invalid token", details: err.message });
    }
    return res.status(500).json({ error: "Server error", details: err.message });
  }
});

app.post("/api/form/calculateComplexityViewResponse", validateComplexity, handleValidationErrors, (req, res) => {
  try {
    const { questions } = req.body;
    const questionScores = questions.questionResponse.map((question) => {
      const responseCount = question.responseCount;
      const randomValue = Math.random()  * 80;
      return {
        id: question.questionId,
        score: responseCount + randomValue,
      };
    });
    const result = {
      questionScores: questionScores,
      finalScore: questionScores.reduce((sum, item) => sum + item.score,0) / questions.questionResponse.length,
    };
    res.json({ result });
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(400).json({ error: "Invalid token", details: err.message });
    }
    return res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Starting the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
