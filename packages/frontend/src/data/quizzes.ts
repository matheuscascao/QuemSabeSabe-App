import { Quiz } from '../types';

export const quizzes: Quiz[] = [
  {
    id: 'science-basics-easy',
    title: 'Science Basics',
    description: 'Test your knowledge of fundamental scientific concepts.',
    categoryId: 'science',
    difficulty: 'easy',
    questions: [
      {
        id: 'sci-basics-1',
        text: 'What is the chemical symbol for water?',
        options: ['O2', 'CO2', 'H2O', 'N2'],
        correctAnswer: 2,
        explanation: 'H2O is the chemical formula for water, consisting of two hydrogen atoms and one oxygen atom.'
      },
      {
        id: 'sci-basics-2',
        text: 'Which of these is NOT a state of matter?',
        options: ['Solid', 'Liquid', 'Gas', 'Mineral'],
        correctAnswer: 3,
        explanation: 'The three basic states of matter are solid, liquid, and gas. Plasma is often considered the fourth state. Mineral is not a state of matter.'
      },
      {
        id: 'sci-basics-3',
        text: 'What is the closest planet to the Sun?',
        options: ['Venus', 'Earth', 'Mars', 'Mercury'],
        correctAnswer: 3,
        explanation: 'Mercury is the closest planet to the Sun in our Solar System.'
      },
      {
        id: 'sci-basics-4',
        text: 'Which of these animals is not a mammal?',
        options: ['Dolphin', 'Bat', 'Penguin', 'Elephant'],
        correctAnswer: 2,
        explanation: 'Penguins are birds, not mammals. Dolphins, bats, and elephants are all mammals.'
      },
      {
        id: 'sci-basics-5',
        text: 'What is photosynthesis?',
        options: [
          'The process of animal digestion',
          'The process by which plants make their own food using sunlight',
          'The breakdown of rocks by wind and water',
          'The movement of water through plants'
        ],
        correctAnswer: 1,
        explanation: 'Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods with carbon dioxide and water.'
      }
    ],
    timePerQuestion: 15,
    creator: 'system',
    popularity: 95
  },
  {
    id: 'math-basics-easy',
    title: 'Math Fundamentals',
    description: 'Review basic math concepts and operations.',
    categoryId: 'mathematics',
    difficulty: 'easy',
    questions: [
      {
        id: 'math-basics-1',
        text: 'What is 7 × 8?',
        options: ['54', '56', '64', '72'],
        correctAnswer: 1,
        explanation: '7 × 8 = 56'
      },
      {
        id: 'math-basics-2',
        text: 'What is the square root of 81?',
        options: ['8', '9', '10', '12'],
        correctAnswer: 1,
        explanation: 'The square root of 81 is 9 because 9 × 9 = 81.'
      },
      {
        id: 'math-basics-3',
        text: 'If x + 5 = 12, what is x?',
        options: ['5', '7', '8', '17'],
        correctAnswer: 1,
        explanation: 'To solve for x, subtract 5 from both sides: x + 5 - 5 = 12 - 5, which gives x = 7.'
      },
      {
        id: 'math-basics-4',
        text: 'What is 3/4 as a decimal?',
        options: ['0.25', '0.5', '0.75', '0.8'],
        correctAnswer: 2,
        explanation: 'To convert 3/4 to a decimal, divide 3 by 4: 3 ÷ 4 = 0.75'
      },
      {
        id: 'math-basics-5',
        text: 'What is the perimeter of a square with sides of length 6 cm?',
        options: ['12 cm', '18 cm', '24 cm', '36 cm²'],
        correctAnswer: 2,
        explanation: 'The perimeter of a square is calculated as 4 × side length. So, 4 × 6 cm = 24 cm.'
      }
    ],
    timePerQuestion: 20,
    creator: 'system',
    popularity: 90
  },
  {
    id: 'history-world-medium',
    title: 'World History',
    description: 'Explore major events and figures from world history.',
    categoryId: 'history',
    difficulty: 'medium',
    questions: [
      {
        id: 'hist-world-1',
        text: 'In which year did World War II end?',
        options: ['1943', '1945', '1947', '1950'],
        correctAnswer: 1,
        explanation: 'World War II ended in 1945 with the surrender of Japan on September 2, following the atomic bombings of Hiroshima and Nagasaki.'
      },
      {
        id: 'hist-world-2',
        text: 'Who was the first Emperor of Rome?',
        options: ['Julius Caesar', 'Augustus', 'Nero', 'Constantine'],
        correctAnswer: 1,
        explanation: 'Augustus (born Octavian) was the first Emperor of Rome, ruling from 27 BCE to 14 CE. Julius Caesar was never officially emperor.'
      },
      {
        id: 'hist-world-3',
        text: 'The French Revolution began in which year?',
        options: ['1765', '1776', '1789', '1804'],
        correctAnswer: 2,
        explanation: 'The French Revolution began in 1789 with the Storming of the Bastille on July 14.'
      },
      {
        id: 'hist-world-4',
        text: 'Who was the leader of the Soviet Union during most of World War II?',
        options: ['Vladimir Lenin', 'Joseph Stalin', 'Leon Trotsky', 'Nikita Khrushchev'],
        correctAnswer: 1,
        explanation: 'Joseph Stalin was the leader of the Soviet Union during most of World War II, ruling from 1924 to 1953.'
      },
      {
        id: 'hist-world-5',
        text: 'Which civilization built Machu Picchu?',
        options: ['Aztec', 'Maya', 'Inca', 'Olmec'],
        correctAnswer: 2,
        explanation: 'Machu Picchu was built by the Inca civilization in the 15th century in what is now Peru.'
      }
    ],
    timePerQuestion: 20,
    creator: 'system',
    popularity: 85
  }
];

export const getQuizById = (id: string) => {
  return quizzes.find(quiz => quiz.id === id);
};

export const getQuizzesByCategory = (categoryId: string) => {
  return quizzes.filter(quiz => quiz.categoryId === categoryId);
};