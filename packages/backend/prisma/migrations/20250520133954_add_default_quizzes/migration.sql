-- Create a system user to own the quizzes
INSERT INTO "User" (id, email, username, "passwordHash", level, xp, "createdAt", "updatedAt")
VALUES ('system', 'system@quizmaster.com', 'system', 'system', 100, 999999, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create default categories
INSERT INTO "Category" (id, name, description, color, icon, "createdAt", "updatedAt")
VALUES
  ('cat_math', 'Mathematics', 'Test your math skills with these challenging questions', '#FF6B6B', 'calculator', NOW(), NOW()),
  ('cat_science', 'Science', 'Explore various scientific concepts and discoveries', '#4ECDC4', 'flask', NOW(), NOW()),
  ('cat_history', 'History', 'Journey through time with historical events and figures', '#FFD93D', 'landmark', NOW(), NOW()),
  ('cat_tech', 'Technology', 'Test your knowledge of computers and technology', '#95E1D3', 'laptop', NOW(), NOW());

-- Create default quizzes
INSERT INTO "Quiz" (id, title, description, "categoryId", "creatorId", difficulty, "createdAt", "updatedAt")
VALUES
  ('quiz_math_basics', 'Basic Mathematics', 'Test your fundamental math skills', 'cat_math', 'system', 'EASY', NOW(), NOW()),
  ('quiz_science_physics', 'Physics Fundamentals', 'Basic concepts in physics', 'cat_science', 'system', 'MEDIUM', NOW(), NOW()),
  ('quiz_history_world', 'World History', 'Major events in world history', 'cat_history', 'system', 'MEDIUM', NOW(), NOW()),
  ('quiz_tech_computers', 'Computer Basics', 'Essential computer knowledge', 'cat_tech', 'system', 'EASY', NOW(), NOW());

-- Create questions for Basic Mathematics quiz
INSERT INTO "Question" (id, "quizId", text, options, correct, "timeLimit", "order")
VALUES
  ('q_math_1', 'quiz_math_basics', 'What is 2 + 2?', '["3", "4", "5", "6"]', 1, 30, 1),
  ('q_math_2', 'quiz_math_basics', 'What is 5 × 5?', '["20", "25", "30", "35"]', 1, 30, 2),
  ('q_math_3', 'quiz_math_basics', 'What is 10 ÷ 2?', '["3", "4", "5", "6"]', 2, 30, 3),
  ('q_math_4', 'quiz_math_basics', 'What is 15 - 7?', '["6", "7", "8", "9"]', 2, 30, 4),
  ('q_math_5', 'quiz_math_basics', 'What is 3²?', '["6", "8", "9", "12"]', 2, 30, 5);

-- Create questions for Physics Fundamentals quiz
INSERT INTO "Question" (id, "quizId", text, options, correct, "timeLimit", "order")
VALUES
  ('q_physics_1', 'quiz_science_physics', 'What is the SI unit of force?', '["Joule", "Newton", "Watt", "Pascal"]', 1, 45, 1),
  ('q_physics_2', 'quiz_science_physics', 'What is the formula for kinetic energy?', '["mgh", "1/2mv²", "Fd", "ma"]', 1, 45, 2),
  ('q_physics_3', 'quiz_science_physics', 'What is the speed of light in vacuum?', '["299,792,458 m/s", "300,000,000 m/s", "299,792 km/s", "300,000 km/s"]', 0, 45, 3),
  ('q_physics_4', 'quiz_science_physics', 'What is Newton''s First Law also known as?', '["Law of Motion", "Law of Inertia", "Law of Action-Reaction", "Law of Acceleration"]', 1, 45, 4),
  ('q_physics_5', 'quiz_science_physics', 'What is the unit of electric current?', '["Volt", "Ampere", "Ohm", "Watt"]', 1, 45, 5);

-- Create questions for World History quiz
INSERT INTO "Question" (id, "quizId", text, options, correct, "timeLimit", "order")
VALUES
  ('q_history_1', 'quiz_history_world', 'In which year did World War II end?', '["1943", "1944", "1945", "1946"]', 2, 45, 1),
  ('q_history_2', 'quiz_history_world', 'Who was the first President of the United States?', '["Thomas Jefferson", "John Adams", "George Washington", "Benjamin Franklin"]', 2, 45, 2),
  ('q_history_3', 'quiz_history_world', 'The Great Wall of China was built during which dynasty?', '["Han", "Ming", "Qin", "Tang"]', 2, 45, 3),
  ('q_history_4', 'quiz_history_world', 'The Renaissance began in which country?', '["France", "Germany", "Italy", "Spain"]', 2, 45, 4),
  ('q_history_5', 'quiz_history_world', 'The Industrial Revolution started in which country?', '["France", "Germany", "United States", "United Kingdom"]', 3, 45, 5);

-- Create questions for Computer Basics quiz
INSERT INTO "Question" (id, "quizId", text, options, correct, "timeLimit", "order")
VALUES
  ('q_tech_1', 'quiz_tech_computers', 'What does CPU stand for?', '["Central Processing Unit", "Computer Processing Unit", "Central Process Unit", "Computer Process Unit"]', 0, 30, 1),
  ('q_tech_2', 'quiz_tech_computers', 'Which of these is a programming language?', '["HTML", "CSS", "Python", "XML"]', 2, 30, 2),
  ('q_tech_3', 'quiz_tech_computers', 'What is the main function of RAM?', '["Long-term storage", "Temporary storage", "Processing data", "Displaying graphics"]', 1, 30, 3),
  ('q_tech_4', 'quiz_tech_computers', 'Which company created the Windows operating system?', '["Apple", "Google", "Microsoft", "IBM"]', 2, 30, 4),
  ('q_tech_5', 'quiz_tech_computers', 'What does URL stand for?', '["Uniform Resource Locator", "Universal Resource Link", "Uniform Resource Link", "Universal Resource Locator"]', 0, 30, 5); 