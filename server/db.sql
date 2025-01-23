--sqlite3 form.db < db.sql

BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "users" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "username" TEXT UNIQUE NOT NULL,
    "salt"	TEXT,
    "password" TEXT NOT NULL,
    "is_admin" BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS "forms" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "creator_id" INTEGER NOT NULL,
    FOREIGN KEY ("creator_id") REFERENCES "users"("id")
);

CREATE TABLE IF NOT EXISTS "questions" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "form_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "min_selection" INTEGER NOT NULL,
    "max_selection" INTEGER NOT NULL,
    FOREIGN KEY ("form_id") REFERENCES "forms"("id")
);

CREATE TABLE IF NOT EXISTS "grid_headers" ( 
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "question_id" INTEGER NOT NULL,
    "form_id" INTEGER NOT NULL,
    "typ" TEXT NOT NULL,
    "val" TEXT NOT NULL,
    FOREIGN KEY ("form_id") REFERENCES "forms"("id"),
    FOREIGN KEY ("question_id") REFERENCES "questions"("id")
);

CREATE TABLE IF NOT EXISTS "responses" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "form_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "submitted_at" DATETIME DEFAULT CURRENT_TIMESTAMP, 
    FOREIGN KEY ("form_id") REFERENCES "forms"("id"),
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
);

CREATE TABLE IF NOT EXISTS "response_details" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "response_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "row_id" INTEGER NOT NULL,
    "column_id" INTEGER NOT NULL,
    FOREIGN KEY ("response_id") REFERENCES "responses"("id"),
    FOREIGN KEY ("question_id") REFERENCES "questions"("id"),
    FOREIGN KEY ("row_id") REFERENCES "grid_headers"("id"),
    FOREIGN KEY ("column_id") REFERENCES "grid_headers"("id")
);


INSERT INTO "users" ("username", "salt", "password", "is_admin") VALUES 
('Bowser', 'bddfdc9du6', 'b336b540bfad637ee9d0e4991f55808debfb42f5daf3cde3781cf95a37258e29c43f547771e88b09ad28fb62d28485422ad2ff24b86f59c5ac803027efcc2d29', 1), --admin
('Waluigi', '498a8d846e', 'e94339d48d5ba00085d6fc167080be577f3a1da4da93fb53d8dbdc52b33e79d55cc411b794b73faa466f9d11d84c368e8a2b0b65ac6feb6bf079da07638b15bc', 1), --admin
('Tartosso', '09a79c91c4', 'd68da3df8bd0ec8fa0978ae821e024292981e8bc0848874a40253174a5f425418a06eed21650c17913f739178ce03565f5daab9faff47dd924fad3294244dabc', 0), --user
('Boo', '330f9bd2d0', '809be7aacee39b7dd3c272de139c38a90cd6749898c6b7ff3a25adb116c23ef18f3e5351e02f9ca2da3b050543a9fd682a42515eb83395a8d8cebefc1596892d', 0), --user
('Yoshi', 'b4jcbac18d', 'e71291b3db7e1527113ce28d618591dfebfdd8abcf1b97b31a89ac6079b414d55f58690d7613eb2cce7cb9e5f755714a489891210a74b4320e4bfd8efc1c48cf', 0); --user

INSERT INTO "forms" ("title", "creator_id") VALUES 
('Mobile Features', 1),
('Tech Preferences', 2),
('Best F1 Pilot', 1),
('Cybersec Awareness', 2),
('Diet Preferences', 2),
('Training Routines', 1);

INSERT INTO "questions" ("form_id", "title", "min_selection", "max_selection") VALUES 
(1, 'Mobile Brands vs Features', 1, 5),
(1, 'Connectivity Options', 0, 4),
(2, 'Favorite Programming Languages', 1, 6),
(2, 'Cloud Services Usage', 2, 8),
(3, 'Greatest F1 Pilot in History', 1, 10),
(3, 'Best Era of F1 Racing', 1, 3),
(4, 'Common Cybersecurity Threats', 1, 5),
(4, 'Preferred Security Practices', 1, 4),
(5, 'Favorite Types of Diets', 1, 3),
(5, 'Foods to Avoid', 1, 5),
(6, 'Preferred Training Styles', 1, 4),
(6, 'Importance of Rest in Training', 1, 3);

INSERT INTO "grid_headers" ("question_id", "form_id", "typ", "val") VALUES
(1, 1, 'row', 'Apple'),
(1, 1, 'row', 'Samsung'),
(1, 1, 'row', 'Xiaomi'),
(1, 1, 'column', 'Camera'),
(1, 1, 'column', 'Battery Life'),
(1, 1, 'column', 'Performance'),
(1, 1, 'column', 'Design'),
(1, 1, 'column', 'Price'),
(2, 1, 'row', 'WiFi'),
(2, 1, 'row', 'Bluetooth'),
(2, 1, 'row', '5G'),
(2, 1, 'column', 'Range'),
(2, 1, 'column', 'Speed'),
(2, 1, 'column', 'Coverage'),
(2, 1, 'column', 'Stability'),
(3, 2, 'row', 'Python'),
(3, 2, 'row', 'Java'),
(3, 2, 'row', 'JavaScript'),
(3, 2, 'column', 'Popularity'),
(3, 2, 'column', 'Web Development'),
(3, 2, 'column', 'Ease of Use'),
(3, 2, 'column', 'Performance'),
(4, 2, 'row', 'AWS'),
(4, 2, 'row', 'Azure'),
(4, 2, 'row', 'Google Cloud'),
(4, 2, 'column', 'Scalability'),
(4, 2, 'column', 'Pricing'),
(4, 2, 'column', 'Features'),
(5, 3, 'row', 'Senna'),
(5, 3, 'row', 'Prost'),
(5, 3, 'row', 'Leclerc'),
(5, 3, 'row', 'Vettel'),
(5, 3, 'row', 'Alonso'),
(5, 3, 'row', 'Norris'),
(5, 3, 'row', 'Hamilton'),
(5, 3, 'column', 'Skill'),
(5, 3, 'column', 'Speed'),
(5, 3, 'column', 'Consistency'),
(5, 3, 'column', 'Legacy'),
(6, 3, 'row', '1980s'),
(6, 3, 'row', '1990s'),
(6, 3, 'row', 'Modern Era'),
(6, 3, 'column', 'Excitement'),
(6, 3, 'column', 'Skill'),
(6, 3, 'column', 'Technology'),
(7, 4, 'row', 'Phishing'),
(7, 4, 'row', 'Malware'),
(7, 4, 'column', 'Prevention Methods'),
(7, 4, 'column', 'Awareness Level'),
(7, 4, 'column', 'Impact'),
(8, 4, 'row', 'Strong Passwords'),
(8, 4, 'row', 'Multi-Factor Authentication'),
(8, 4, 'column', 'Effectiveness'),
(8, 4, 'column', 'Cost'),
(8, 4, 'column', 'Adoption Rate'),
(8, 4, 'column', 'Ease of Use'),
(9, 5, 'row', 'Vegetarian'),
(9, 5, 'row', 'Carnivore'),
(9, 5, 'row', 'Vegan'),
(9, 5, 'column', 'Nutritional Value'),
(9, 5, 'column', 'Health Benefits'),
(9, 5, 'column', 'Ease of Following'),
(9, 5, 'column', 'Cost'),
(10, 5, 'row', 'Sugar'),
(10, 5, 'row', 'Salt'),
(10, 5, 'row', 'High-Fat Foods'),
(10, 5, 'row', 'Processed Foods'),
(10, 5, 'column', 'Health Impact'),
(10, 5, 'column', 'Taste'),
(10, 5, 'column', 'Availability'),
(11, 6, 'row', 'Strength Training'),
(11, 6, 'row', 'Cardio'),
(11, 6, 'column', 'Effectiveness'),
(11, 6, 'column', 'Time Consuming'),
(11, 6, 'column', 'Enjoyment'),
(11, 6, 'column', 'Time Commitment'),
(12, 6, 'row', 'Yes'),
(12, 6, 'row', 'No'),
(12, 6, 'column', 'Performance'),
(12, 6, 'column', 'Recovery Speed'),
(12, 6, 'column', 'Injury Prevention');


INSERT INTO "responses" ("id", "form_id", "user_id", "submitted_at") VALUES 
(1,1,4,'2025-01-23 12:21:20'),
(2,2,4,'2025-01-23 12:22:47'),
(3,3,4,'2025-01-23 12:23:17'),
(4,4,4,'2025-01-23 12:23:38'),
(5,5,4,'2025-01-23 12:23:56'),
(6,6,4,'2025-01-23 12:24:13'),
(7,4,3,'2025-01-23 12:24:47'),
(8,2,2,'2025-01-23 12:25:55'),
(9,4,2,'2025-01-23 12:26:12'),
(10,5,2,'2025-01-23 12:26:41'),
(11,1,1,'2025-01-23 12:26:59'),
(12,3,1,'2025-01-23 12:27:52'),
(13,6,1,'2025-01-23 12:28:22');

INSERT INTO response_details ("id", "response_id", "question_id", "row_id", "column_id") VALUES
(1,1,1,1,4),
(2,1,1,2,5),
(3,1,1,2,6),
(4,1,1,2,7),
(5,1,2,9,12),
(6,1,2,10,14),
(7,2,3,17,20),
(8,2,3,17,21),
(9,2,4,24,27),
(10,2,4,23,26),
(11,2,4,23,28),
(12,3,5,30,37),
(13,3,6,40,44),
(14,3,6,41,43),
(15,3,6,41,45),
(16,4,7,46,48),
(17,4,7,47,48),
(18,4,7,46,50),
(19,4,8,51,53),
(20,4,8,51,54),
(21,4,8,52,53),
(22,4,8,52,55),
(23,5,9,57,60),
(24,5,9,58,61),
(25,5,9,58,63),
(26,5,10,64,68),
(27,5,10,65,68),
(28,5,10,66,69),
(29,5,10,67,70),
(30,5,10,67,69),
(31,6,11,71,73),
(32,6,11,72,74),
(33,6,11,71,75),
(34,6,11,72,75),
(35,6,12,77,79),
(36,6,12,78,80),
(37,6,12,77,80),
(38,7,7,47,48),
(39,7,7,46,48),
(40,7,7,46,49),
(41,7,7,47,50),
(42,7,7,46,50),
(43,7,8,51,53),
(44,7,8,51,55),
(45,7,8,52,54),
(46,7,8,52,56),
(47,8,3,18,19),
(48,8,3,18,20),
(49,8,3,17,21),
(50,8,3,17,22),
(51,8,4,23,26),
(52,8,4,24,26),
(53,8,4,24,27),
(54,8,4,23,28),
(55,8,4,25,28),
(56,9,7,47,48),
(57,9,7,46,50),
(58,9,8,51,53),
(59,9,8,52,53),
(60,9,8,52,54),
(61,10,9,58,60),
(62,10,9,58,61),
(63,10,9,58,62),
(64,10,10,64,68),
(65,10,10,65,68),
(66,10,10,67,69),
(67,10,10,66,69),
(68,10,10,65,70),
(69,11,1,1,4),
(70,11,1,2,4),
(71,11,1,2,6),
(72,11,1,3,7),
(73,11,1,1,5),
(74,12,5,31,36),
(75,12,6,42,43),
(76,12,6,40,44),
(77,12,6,42,45),
(78,13,11,71,75),
(79,13,11,72,75),
(80,13,11,72,76),
(81,13,11,71,74),
(82,13,12,77,79),
(83,13,12,77,81),
(84,13,12,78,80);

COMMIT;