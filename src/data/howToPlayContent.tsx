import React from 'react';

export interface HowToPlayContent {
  title: string;
  sections: {
    heading: string;
    content: React.ReactNode;
  }[];
}

export const SPLASH_CONTENT: HowToPlayContent = {
  title: "How to Play",
  sections: [
    {
      heading: "General Gameplay",
      content: <p>Guess the ranked player in as few guesses as possible. Each guess will give you a hint. Bad guesses will make you lose faster. Click on howtoplay while in a game for more game-specific info.</p>
    },
    {
      heading: "There are 2 game modes:",
      content: (
        <ul>
          <li><strong>Daily SSBMRank:</strong> You know what daily means. Guess the ssbmrank player from a random top100 (or top50).</li>
          <li><strong>Daily Michigan:</strong> Same as daily ssbmrank but with michigan pr players.</li>
        </ul>
      )
    },
    {
    heading: "Random: ON",
      content: (
        <ul>
          <li><strong>SSBMRank:</strong> Will give you any random ssbmrank puzzle. If you get it right, keep going until you don&apos;t. Points carry over.</li>
          <li><strong>Michigan:</strong> I think you get it just click some buttons.</li>
        </ul>
      )
    },
    {
      heading: "UCF OFF: basically hard mode",
      content: (
        <ul>
          <li>No dashing back! Guessing a player further away from the answer than your previous guess will make you lose the puzzle.</li>
          <li>No overshooting! Once you guess, your next guess must not go past the answer. (This one doesn&apos;t really have anything to do with UCF)</li>
          <li>UCF is ON by default.</li>
        </ul>
      )
    },
  ]
};

export const SSBMRANK_DAILY_CONTENT: HowToPlayContent = {
  title: "How to Play - SSBMRank Daily",
  sections: [
    {
      heading: "Daily Puzzle",
      content: (
        <>
        <ul>
          <li>Everyone gets the same puzzle today. You get one shot.</li>
          <li>2 hints to start: the season (at the top) and the first ranking the answer appeared in</li>
          <li>You get more hints as you guess incorrectly.</li>
        </ul>
        </>
      )
    },
    {
      heading: "Points?",
      content: (
        <>
        <ul>
          <li>Yeah there&apos;s points ok. I guess ties are possible but way less likely this way.</li>
          <li>A correct answer gets you 10000 points.</li>
          <li>Points lost = (abs(guessed rank - answer rank) / pr length) × 10000 / rumble.</li>
          <li>Rumble = 4 (if you guessed once), 3 (..guessed twice), 2 (..guess 3), 1 (..guess 4+)</li>
          <li>If you miss the pr completely you get -2000 (guess 1), -3000 (guess 2), -4000 (guess 3), -5000 (guess 4+).</li>
          <li>You lose the game when you lose 10000 or more points guessing.</li>
        </ul>
        </>
      )
    }
  ]
};

export const SSBMRANK_RANDOM_CONTENT: HowToPlayContent = {
  title: "How to Play - SSBMRank Random",
  sections: [
    {
      heading: "Random SSBMRank",
      content: (
        <>
        <ul>
          <li>Random puzzle. Go until you lose. Play for points and streak.</li>
          <li>2 hints to start: the season (at the top) and the first ranking the answer appeared in</li>
          <li>You get more hints as you guess incorrectly.</li>
          <li>That&apos;s it for hints. Keep guessing until you get it or you lose enough points to go down to 0.</li>
          <li>If you win the puzzle you get +1 streak. Infinite-puzzle Melee.</li>
        </ul>
        </>
      )
    },
    {
      heading: "Points?",
      content: (
        <>
        <ul>
          <li>Yeah there&apos;s points ok. I guess ties are possible but way less likely this way.</li>
          <li>A correct answer gets you 10000 points.</li>
          <li>Points lost = (abs(guessed rank - answer rank) / pr length) × 10000 / rumble.</li>
          <li>Rumble = 4 (if you guessed once), 3 (..guessed twice), 2 (..guess 3), 1 (..guess 4+)</li>
          <li>If you miss the pr completely you get -2000 (guess 1), -3000 (guess 2), -4000 (guess 3), -5000 (guess 4+).</li>
          <li>Points carry over until you lose.</li>
          <li>You lose the game when you lose 10000 or more points guessing on a single puzzle.</li>
        </ul>
        </>
      )
    }
  ]
};

export const MIPRDLE_DAILY_CONTENT: HowToPlayContent = {
  title: "How to Play - Michigan Daily",
  sections: [
    {
      heading: "Daily Michigan",
      content: (
        <>
        <ul>
          <li>Same puzzle for everyone today. You get one try</li>
          <li>1 hint to start: the season at the top.</li>
          <li>Guessing incorrectly will reveal more hints.</li>
          <li>If the answer is HM and you guess a different HM, &quot;=&quot; will appear in the pos. column letting you know the answer is also HM.</li>
          <li>HM is considered exactly one rank above IM for this puzzle. This is only because it needs to be different for points, decided by alphanum. If you guess HM and the answer is IM, the arrow will point down.</li>
        </ul>
        </>
      )
    },
    {
      heading: "Points?",
      content: (
        <>
        <ul>
          <li>Yeah there&apos;s points ok (godspeed butterdonkey)</li>
          <li>A correct answer gets you 10000 points</li>
          <li>Points lost = (abs(guessed rank - answer rank) / pr length) × 10000 / rumble</li>
          <li>Rumble = 4 (if you guessed once), 3 (..guessed twice), 2 (..guess 3), 1 (..guess 4+)</li>
          <li>If you miss the pr completely you get -2000 (guess 1), -3000 (guess 2), -4000 (guess 3), -5000 (guess 4+)</li>
          <li>You will not lose points for guessing the wrong IM if the answer is IM, or HM if the answer is HM.</li>
          <li>You lose the game when you lose 10000 or more points guessing.</li>
        </ul>
        </>
      )
    }
  ]
};

export const MIPRDLE_RANDOM_CONTENT: HowToPlayContent = {
  title: "How to Play - Michigan Random",
  sections: [
    {
      heading: "Random Michigan",
      content: (
        <>
        <ul>
          <li>Play random puzzles until you lose to get points and a streak</li>
          <li>1 hint to start: the season at the top.</li>
          <li>Guessing incorrectly will reveal more hints.</li>
          <li>If the answer is above or below the guess&apos;s rank, an arrow will appear in the pos. column telling you which direction the answer is.</li>
          <li>If the answer is HM and you guess a different HM, &quot;=&quot; will appear in the pos. column letting you know the answer is also HM.</li>
          <li>HM is considered exactly one rank above IM for this puzzle. This is only because it needs to be different for points, decided by alphanum. If you guess HM and the answer is IM, the arrow will point down.</li>
        </ul>
        </>
      )
    },
    {
      heading: "Points?",
      content: (
        <>
        <ul>
          <li>Yeah there&apos;s points ok. (godspeed butterdonkey)</li>
          <li>A correct answer gets you 10000 points</li>
          <li>Points lost = (abs(guessed rank - answer rank) / pr length) × 10000 / rumble</li>
          <li>Rumble = 4 (if you guessed once), 3 (..guessed twice), 2 (..guess 3), 1 (..guess 4+)</li>
          <li>If you miss the pr completely you get -2000 (guess 1), -3000 (guess 2), -4000 (guess 3), -5000 (guess 4+)</li>
          <li>You will not lose points for guessing the wrong IM if the answer is IM, or HM if the answer is HM.</li>
          <li>Points carry over until you lose.</li>
          <li>You lose the game when you lose 10000 or more points guessing on a single puzzle.</li>
        </ul>
        </>
      )
    }
  ]
};
