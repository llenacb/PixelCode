// One-time import/update script for PixelCode's sample lessons.
//
// Safe to re-run: matches existing lessons BY TITLE and updates them in
// place (so re-running after editing a lesson's content, or after adding
// a new field like suggestedMinutes, doesn't create duplicates); lessons
// that don't exist yet get created fresh.
//
// Setup (one-time):
//   1. Firebase console -> Project settings -> Service accounts ->
//      "Generate new private key" -> save the downloaded file as
//      scripts/serviceAccountKey.json (this exact path is gitignored --
//      never commit it, it's a full-admin credential for your project).
//   2. From the project root: npm install   (pulls in firebase-admin,
//      already added to package.json's devDependencies)
//
// Run:
//   node scripts/import-lessons.cjs

const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
let serviceAccount;
try {
  serviceAccount = require(serviceAccountPath);
} catch (err) {
  console.error(
    'Could not find scripts/serviceAccountKey.json.\n' +
    'Download it from Firebase console -> Project settings -> Service accounts -> ' +
    '"Generate new private key", and save it at exactly that path.'
  );
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const lessons = [
  {
    "title": "Wake Up, Pixel!",
    "tier": "beginner",
    "order": 1,
    "suggestedMinutes": 15,
    "published": true,
    "content": {
      "introTitle": "A quiet morning",
      "introText": "Pixel the robot has been asleep all night. When you press the green flag, it's time to wake up and say hello!",
      "conceptTitle": "The when-clicked block",
      "conceptText": "Every script starts with a hat block. The 'when \u25b6 clicked' block runs everything snapped underneath it the moment you press Run.",
      "challenges": [
        {
          "title": "Say hello",
          "instructions": "Snap a 'say' block under 'when \u25b6 clicked' and make Pixel say hi."
        },
        {
          "title": "Take a step",
          "instructions": "Add a 'move 10 steps' block before the say block, so Pixel walks forward first."
        }
      ]
    }
  },
  {
    "title": "Pixel Takes a Walk",
    "tier": "beginner",
    "order": 2,
    "suggestedMinutes": 15,
    "published": true,
    "content": {
      "introTitle": "One step is not enough",
      "introText": "Yesterday Pixel took one step. Today Pixel wants to cross the whole stage \u2014 that means moving many times in a row.",
      "conceptTitle": "The repeat block",
      "conceptText": "Instead of stacking ten 'move' blocks, a 'repeat' block runs whatever is inside it a set number of times. Drag 'move 10 steps' inside a 'repeat 10' block.",
      "challenges": [
        {
          "title": "Walk across",
          "instructions": "Use 'repeat' with a 'move' block inside so Pixel walks all the way across the stage."
        },
        {
          "title": "Turn around",
          "instructions": "Add a 'turn 180 degrees' block after the repeat loop, so Pixel turns to face back the way it came."
        }
      ]
    }
  },
  {
    "title": "Pixel's Costume Change",
    "tier": "beginner",
    "order": 3,
    "suggestedMinutes": 20,
    "published": true,
    "content": {
      "introTitle": "Pixel likes to change outfits",
      "introText": "A sprite isn't stuck looking one way \u2014 it can wear different costumes, and switching between them quickly is how animation works.",
      "conceptTitle": "The next costume block",
      "conceptText": "Add a costume in the Costumes panel on the right, then use the 'next costume' block to switch to it. Doing this inside a 'forever' loop with a short 'wait' between each switch makes Pixel look like it's animating.",
      "challenges": [
        {
          "title": "Add a second look",
          "instructions": "In the Costumes panel, add one of the built-in robot costumes so Pixel has two to switch between."
        },
        {
          "title": "Animate it",
          "instructions": "Build: when \u25b6 clicked \u2192 forever \u2192 next costume \u2192 wait 0.5 seconds. Run it and watch Pixel switch looks continuously. Click Stop when you're done."
        }
      ]
    }
  },
  {
    "title": "Pixel Says Hi For a While",
    "tier": "beginner",
    "order": 4,
    "suggestedMinutes": 20,
    "published": true,
    "content": {
      "introTitle": "A message that doesn't disappear too fast",
      "introText": "Pixel said hello last time, but the speech bubble vanished the instant the next block ran. Today Pixel learns to hold a thought for a little while.",
      "conceptTitle": "The say-for-seconds block",
      "conceptText": "The plain 'say' block shows text forever (until something else changes it). 'Say ... for ... seconds' shows it, waits on its own, then clears it automatically -- no separate wait block needed.",
      "challenges": [
        {
          "title": "Say it for two seconds",
          "instructions": "Use 'say Hello! for 2 seconds' instead of the plain say block."
        },
        {
          "title": "Say two things in a row",
          "instructions": "Add a second 'say ... for ... seconds' block after the first, with a different message."
        }
      ]
    }
  },
  {
    "title": "Pixel Goes Exactly There",
    "tier": "beginner",
    "order": 5,
    "suggestedMinutes": 20,
    "published": true,
    "content": {
      "introTitle": "Moving forward isn't always enough",
      "introText": "Sometimes Pixel doesn't want to just walk forward -- it wants to jump straight to an exact spot on the stage, like teleporting.",
      "conceptTitle": "The go-to x/y block",
      "conceptText": "The stage has a coordinate grid: x=0, y=0 is the very center. Positive x moves right, positive y moves up. 'Go to x: ... y: ...' places Pixel at that exact spot instantly.",
      "challenges": [
        {
          "title": "Go to a corner",
          "instructions": "Use 'go to x: 150 y: 100' to send Pixel to the upper-right area of the stage."
        },
        {
          "title": "Bounce between two spots",
          "instructions": "Add a 'wait 1 second' then a second 'go to x/y' block sending Pixel somewhere else, so it hops between two positions."
        }
      ]
    }
  },
  {
    "title": "Pixel Plays a Sound",
    "tier": "beginner",
    "order": 6,
    "suggestedMinutes": 20,
    "published": true,
    "content": {
      "introTitle": "A quiet stage needs some noise",
      "introText": "Pixel's world has been silent so far. Today, Pixel learns to make a sound whenever the script runs.",
      "conceptTitle": "The play-sound block",
      "conceptText": "Upload a sound file in the Sounds panel on the right first -- it'll show up as a new choice in the 'play sound' block's dropdown. Pick '(beep)' if you don't want to upload your own yet.",
      "challenges": [
        {
          "title": "Play a sound on click",
          "instructions": "Add a 'play sound' block right after 'when \u25b6 clicked'."
        },
        {
          "title": "Upload your own",
          "instructions": "Upload a short sound file in the Sounds panel, then pick it from the play-sound block's dropdown instead of the beep."
        }
      ]
    }
  },
  {
    "title": "Hide and Seek",
    "tier": "beginner",
    "order": 7,
    "suggestedMinutes": 20,
    "published": true,
    "content": {
      "introTitle": "Now you see Pixel, now you don't",
      "introText": "Pixel wants to play a disappearing trick -- vanish for a moment, then pop back into view.",
      "conceptTitle": "The show and hide blocks",
      "conceptText": "'Hide' makes the sprite invisible; 'show' brings it back. Combine them with 'wait' blocks to control the timing of the disappearing act.",
      "challenges": [
        {
          "title": "Disappear and return",
          "instructions": "Build: when \u25b6 clicked \u2192 hide \u2192 wait 1 second \u2192 show."
        },
        {
          "title": "Blink three times",
          "instructions": "Put a hide/wait/show/wait sequence inside a 'repeat 3' block so Pixel blinks three times in a row."
        }
      ]
    }
  },
  {
    "title": "Forever Explorer",
    "tier": "beginner",
    "order": 8,
    "suggestedMinutes": 25,
    "published": true,
    "content": {
      "introTitle": "Pixel never wants to stop patrolling",
      "introText": "Some things should keep happening for as long as the project runs -- like Pixel patrolling back and forth, checking that everything's okay.",
      "conceptTitle": "Combining forever with motion",
      "conceptText": "A 'forever' block with 'move' and 'turn' blocks inside makes Pixel travel in a continuous pattern. Remember: click Stop to end it whenever you like -- forever loops don't stop on their own.",
      "challenges": [
        {
          "title": "Walk in a square-ish loop",
          "instructions": "Inside a forever block: move 50 steps, then turn 90 degrees. Run it and watch Pixel trace a loop around the stage."
        },
        {
          "title": "Slow it down",
          "instructions": "Add a 'wait 0.3 seconds' inside the loop so it's easier to watch Pixel move."
        }
      ]
    }
  },
  {
    "title": "Add It Up",
    "tier": "beginner",
    "order": 9,
    "suggestedMinutes": 25,
    "published": true,
    "content": {
      "introTitle": "Pixel likes numbers too",
      "introText": "Blocks aren't just for movement and sound -- they can do math, and show the answer right on stage.",
      "conceptTitle": "Combining math with say",
      "conceptText": "The Math category has a block for addition, subtraction, and more. Drop one of those blocks into the 'say' block's text slot instead of typing plain words, and Pixel will say the calculated result.",
      "challenges": [
        {
          "title": "Say a sum",
          "instructions": "Drag a '+' math block into a 'say' block, set it to 2 + 3, and run it -- Pixel should say '5'."
        },
        {
          "title": "Try a bigger calculation",
          "instructions": "Change the numbers, or nest a second math block inside the first, to calculate something more complex."
        }
      ]
    }
  },
  {
    "title": "Pixel's Big Adventure",
    "tier": "beginner",
    "order": 10,
    "suggestedMinutes": 40,
    "published": true,
    "content": {
      "introTitle": "Everything Pixel has learned, all in one script",
      "introText": "This is the last Beginner lesson -- time to combine everything: moving, turning, talking, changing costumes, and making sound, all in one project.",
      "conceptTitle": "No new blocks -- just putting it all together",
      "conceptText": "There's nothing new to learn here. The skill this lesson teaches is planning: deciding what order to snap blocks in so the whole script tells a little story from start to finish.",
      "challenges": [
        {
          "title": "Build a mini story",
          "instructions": "Using only blocks you already know, make Pixel: say something, walk forward, change costume, play a sound, and say something else. Any order you like."
        },
        {
          "title": "Make it loop",
          "instructions": "Wrap part of your story in a 'repeat' block so some part of it happens more than once."
        }
      ]
    }
  }
];

async function main() {
  const lessonsRef = db.collection('lessons');
  for (const lesson of lessons) {
    const existing = await lessonsRef.where('title', '==', lesson.title).limit(1).get();
    if (existing.empty) {
      await lessonsRef.add(lesson);
      console.log(`Created: ${lesson.title}`);
    } else {
      await lessonsRef.doc(existing.docs[0].id).set(lesson, { merge: true });
      console.log(`Updated: ${lesson.title}`);
    }
  }
  console.log(`\nDone -- ${lessons.length} lessons processed.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
