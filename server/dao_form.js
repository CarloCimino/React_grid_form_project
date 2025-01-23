"use strict";

const sqlite3 = require("sqlite3").verbose();
const dayjs = require("dayjs");

const db = new sqlite3.Database("form.db");

exports.getForm = () => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT f.id, f.title, f.creator_id, COUNT(r.id) as responseCount
      FROM forms f LEFT JOIN responses r ON r.form_id = f.id
      GROUP BY f.id ORDER BY f.id ASC`;
    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const forms = rows.map((e) => ({
        id: e.id,
        title: e.title,
        creator_id: e.creator_id,
        responseCount: e.responseCount,
      }));
      resolve(forms);
    });
  });
};

exports.getFormById = (formId) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM forms WHERE id = ? ORDER BY id ASC`;
    db.get(sql, [formId], (err, row) => {
      if (err) {
        reject(new Error("Database error: " + err.message));
        return;
      } else {
        const form = {id: row.id, title: row.title, creator_id: row.creator_id,};
        resolve(form);
      }
    });
  });
};

exports.publishForm = (formData) => {
  return new Promise((resolve, reject) => {
    const { title, questions, userId } = formData;
    const insertFormSQL = `INSERT INTO forms (title, creator_id) VALUES (?, ?)`;
    db.run(insertFormSQL, [title, userId], function (err) {
      if (err) {
        return reject(new Error("Failed to insert form: " + err.message));
      }
      const formId = this.lastID;
      const insertQuestionsSQL =
        `INSERT INTO questions (form_id, title, min_selection, max_selection) VALUES (?, ?, ?, ?)`;
      const insertQuestionsPromises = questions.map((question) => {
        return new Promise((resolve, reject) => {
          db.run(insertQuestionsSQL,[formId, question.title, question.min_selection, question.max_selection,],
            function (err) {
              if (err) {
                console.error("Error inserting question:", err.message);
                return reject(err);
              }
              resolve(this.lastID);
            }
          );
        });
      });
      Promise.all(insertQuestionsPromises)
        .then((questionIds) => {
          const insertHeadersSQL =
            `INSERT INTO grid_headers (question_id, form_id, typ, val) VALUES (?, ?, ?, ?)`;
          const insertHeadersSequentially = async () => {
            for (let i = 0; i < questions.length; i++) {
              const question = questions[i];
              const sortedHeaders = question.headers.sort(
                (a, b) => a.id - b.id
              );

              for (let header of sortedHeaders) {
                await new Promise((resolve, reject) => {
                  db.run(insertHeadersSQL,[questionIds[i], formId, header.typ, header.val,],
                    function (err) {
                      if (err) {
                        return reject(new Error("Error inserting grid header: " + err.message));
                      }
                      resolve();
                    }
                  );
                });
              }
            }
          };
          return insertHeadersSequentially();
        })
        .then(() => resolve())
        .catch((err) => {
          console.error("Error processing form:", err.message);
          reject(new Error("Failed to process form: " + err.message));
        });
    });
  });
};

exports.getQuestionByIdForm = (formId) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT q.id AS question_id, q.form_id, q.title, q.min_selection, q.max_selection, g.id AS header_id, g.typ, g.val 
        FROM questions q LEFT JOIN grid_headers g ON q.id = g.question_id WHERE q.form_id = ? ORDER BY g.id`;
    db.all(sql, [formId], (err, rows) => {
      if (err) {
        return reject(new Error("Error getting question by ID: " + err.message));
      }
      const questions = rows.reduce((acc, row) => {
        let question = acc.find((q) => q.id === row.question_id);
        if (!question) {
          question = {id: row.question_id, form_id: row.form_id, title: row.title, min_selection: row.min_selection,max_selection: row.max_selection, headers: [], };
          acc.push(question);
        }
        if (row.header_id) {
          question.headers.push({id: row.header_id, typ: row.typ, val: row.val,});
        }
        return acc;
      }, []);
      resolve(questions);
    });
  });
};

exports.submitFormResponses = async (payload) => {
  const { formId, questions, userId } = payload;
  try {
    await db.run("DELETE FROM responses WHERE form_id = ? AND user_id = ?", [formId, userId,]);
    const now = dayjs();
    const formattedDate = now.format("YYYY-MM-DD HH:mm:ss");
    const newResponse = await new Promise((resolve, reject) => {
      db.run(`INSERT INTO responses (form_id, user_id, submitted_at) VALUES (?,?,?)`,[formId, userId, formattedDate], 
        function (err) {
          if (err) {
            return reject(new Error("Error inserting response: " + err.message));
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
    const insertDetails =
      `INSERT INTO response_details (response_id, question_id, row_id, column_id) VALUES `;
    const placeholders = [];
    const params = [];
    for (const question of questions) {
      question.responses.forEach(({ rowId, columnId }) => {
        placeholders.push("(?, ?, ?, ?)");
        params.push(newResponse, question.questionId, rowId, columnId);
      });
    }
    if (placeholders.length > 0) {
      const fullQuery = insertDetails + placeholders.join(",");
      await new Promise((resolve, reject) => {
        db.run(fullQuery, params, (err) => {
          if (err) {
            reject(new Error("Error inserting response details: " + err.message));
          } else {
            resolve();
          }
        });
      });
    }
    return {
      success: true,
      message: "Form responses saved successfully.",
    };
  } catch (error) {
    console.error("Error saving form responses:", error);
    throw new Error("Failed to save form responses.");
  }
};

exports.getResponsesForFormAndUser = (formId, userId) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT rd.id AS response_detail_id, rd.response_id, rd.question_id, rd.row_id, rd.column_id, r.submitted_at, q.title AS question_title, COALESCE(g.id, NULL) AS header_id, COALESCE(g.typ, NULL) AS header_type, COALESCE(g.val, NULL) AS header_value, r.form_id
      FROM response_details rd JOIN responses r ON rd.response_id = r.id JOIN questions q ON rd.question_id = q.id
      LEFT JOIN grid_headers g ON (rd.row_id = g.id OR rd.column_id = g.id) AND r.form_id = g.form_id
      WHERE r.form_id = ? AND r.user_id = ?
      GROUP BY rd.id, rd.response_id, rd.question_id, rd.row_id, rd.column_id, r.submitted_at, q.title, r.form_id`;
    db.all(sql, [formId, userId], (err, rows) => {
      if (err) {
        return reject(new Error("Error getting responses for form and user: " + err.message));
        
      }
      const responses = rows.reduce((acc, row) => {
        let response = acc.find((r) => r.response_id === row.response_id);
        if (!response) {
          response = {response_id: row.response_id, submitted_at: row.submitted_at, question_details: [],};
          acc.push(response);
        }
        response.question_details.push({
          question_id: row.question_id,
          question_title: row.question_title,
          row_id: row.row_id,
          column_id: row.column_id,
          header: row.header_id
            ? { id: row.header_id, typ: row.header_type, val: row.header_value }
            : null,
        });
        return acc;
      }, []);
      resolve(responses);
    });
  });
};

exports.viewResponse = (formId) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT r.id AS response_id, r.form_id, r.user_id, u.username AS user_username, r.submitted_at, rd.question_id, rd.row_id, rd.column_id
      FROM responses r JOIN response_details rd ON r.id = rd.response_id JOIN users u ON r.user_id = u.id
      WHERE r.form_id = ?;`;
    db.all(sql, [formId], (err, rows) => {
      if (err) {
        return reject(new Error("Database error: " + err.message));
      }
      if (rows.length === 0) {
        resolve([]);
        return;
      }
      resolve(rows);
    });
  });
};