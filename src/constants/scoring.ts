// Scoring system constants

// Starting score for each puzzle
export const STARTING_SCORE = 10000;

// Speed bonus points awarded for winning quickly
export const SPEED_BONUS = {
  GUESS_1: 2000,  // Jackpot
  GUESS_2: 1500,  // Run Don't Walk
  GUESS_3: 1000,  // Close Call
  GUESS_4: 500,   // Cliff Hanger
} as const;

// Escalating penalty points for guessing players not on the ranking list
export const OUT_OF_SEASON_PENALTY = {
  GUESS_1: 2000,
  GUESS_2: 3000,
  GUESS_3: 4000,
  GUESS_4_PLUS: 5000,
} as const;

// Divisors used to calculate points lost per guess
export const GUESS_DIVISORS = {
  GUESS_1: 4,
  GUESS_2: 3,
  GUESS_3: 2,
  GUESS_4_PLUS: 1,
} as const;
