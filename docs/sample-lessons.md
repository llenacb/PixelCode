# Sample lessons

Original PixelCode content (not derived from any third-party curriculum) --
paste each block below into Superadmin \u2192 Content \u2192 the JSON textarea, one
at a time, and click "Publish lesson". They follow the same pacing pattern
we studied from reference material: a short story hook, a one-concept
explanation, then a hands-on challenge or two.

## Lesson 1: Wake Up, Pixel!

```json
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
      { "title": "Say hello", "instructions": "Snap a 'say' block under 'when \u25b6 clicked' and make Pixel say hi." },
      { "title": "Take a step", "instructions": "Add a 'move 10 steps' block before the say block, so Pixel walks forward first." }
    ]
  }
}
```

## Lesson 2: Pixel Takes a Walk

```json
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
      { "title": "Walk across", "instructions": "Use 'repeat' with a 'move' block inside so Pixel walks all the way across the stage." },
      { "title": "Turn around", "instructions": "Add a 'turn 180 degrees' block after the repeat loop, so Pixel turns to face back the way it came." }
    ]
  }
}
```

## Lesson 3: Pixel's Costume Change

```json
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
      { "title": "Add a second look", "instructions": "In the Costumes panel, add one of the built-in robot costumes so Pixel has two to switch between." },
      { "title": "Animate it", "instructions": "Build: when \u25b6 clicked \u2192 forever \u2192 next costume \u2192 wait 0.5 seconds. Run it and watch Pixel switch looks continuously. Click Stop when you're done." }
    ]
  }
}
```

## Lesson 4: Pixel Says Hi For a While

```json
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
      { "title": "Say it for two seconds", "instructions": "Use 'say Hello! for 2 seconds' instead of the plain say block." },
      { "title": "Say two things in a row", "instructions": "Add a second 'say ... for ... seconds' block after the first, with a different message." }
    ]
  }
}
```

## Lesson 5: Pixel Goes Exactly There

```json
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
      { "title": "Go to a corner", "instructions": "Use 'go to x: 150 y: 100' to send Pixel to the upper-right area of the stage." },
      { "title": "Bounce between two spots", "instructions": "Add a 'wait 1 second' then a second 'go to x/y' block sending Pixel somewhere else, so it hops between two positions." }
    ]
  }
}
```

## Lesson 6: Pixel Plays a Sound

```json
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
      { "title": "Play a sound on click", "instructions": "Add a 'play sound' block right after 'when \u25b6 clicked'." },
      { "title": "Upload your own", "instructions": "Upload a short sound file in the Sounds panel, then pick it from the play-sound block's dropdown instead of the beep." }
    ]
  }
}
```

## Lesson 7: Hide and Seek

```json
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
      { "title": "Disappear and return", "instructions": "Build: when \u25b6 clicked \u2192 hide \u2192 wait 1 second \u2192 show." },
      { "title": "Blink three times", "instructions": "Put a hide/wait/show/wait sequence inside a 'repeat 3' block so Pixel blinks three times in a row." }
    ]
  }
}
```

## Lesson 8: Forever Explorer

```json
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
      { "title": "Walk in a square-ish loop", "instructions": "Inside a forever block: move 50 steps, then turn 90 degrees. Run it and watch Pixel trace a loop around the stage." },
      { "title": "Slow it down", "instructions": "Add a 'wait 0.3 seconds' inside the loop so it's easier to watch Pixel move." }
    ]
  }
}
```

## Lesson 9: Add It Up

```json
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
      { "title": "Say a sum", "instructions": "Drag a '+' math block into a 'say' block, set it to 2 + 3, and run it -- Pixel should say '5'." },
      { "title": "Try a bigger calculation", "instructions": "Change the numbers, or nest a second math block inside the first, to calculate something more complex." }
    ]
  }
}
```

## Lesson 10: Pixel's Big Adventure

```json
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
      { "title": "Build a mini story", "instructions": "Using only blocks you already know, make Pixel: say something, walk forward, change costume, play a sound, and say something else. Any order you like." },
      { "title": "Make it loop", "instructions": "Wrap part of your story in a 'repeat' block so some part of it happens more than once." }
    ]
  }
}
```

## Lesson 11: Keeping Score

```json
{
  "title": "Keeping Score",
  "tier": "intermediate",
  "order": 1,
  "suggestedMinutes": 20,
  "published": true,
  "content": {
    "introTitle": "Pixel wants to remember things",
    "introText": "Every block so far ran and then forgot what happened. Today Pixel learns to remember a number using a variable -- like a labeled box that holds a value.",
    "conceptTitle": "Creating and setting a variable",
    "conceptText": "Click Variables \u2192 Make a Variable, name it 'score'. Use 'set score to 0' to give it a starting value, and drag the 'score' block itself into a 'say' block to show what it's holding.",
    "challenges": [
      { "title": "Make a score variable", "instructions": "Create a variable called 'score', set it to 0 when \u25b6 clicked, then say the score." },
      { "title": "Start somewhere else", "instructions": "Change the starting value to something other than 0 and run it again -- notice the say block shows the new number automatically." }
    ]
  }
}
```

## Lesson 12: Counting Up

```json
{
  "title": "Counting Up",
  "tier": "intermediate",
  "order": 2,
  "suggestedMinutes": 20,
  "published": true,
  "content": {
    "introTitle": "A score that only ever starts at zero isn't very useful",
    "introText": "Pixel wants the score to actually go up each time something happens -- not stay stuck at whatever it started at.",
    "conceptTitle": "The change-variable-by block",
    "conceptText": "'Change score by 1' adds 1 to whatever score currently is, instead of overwriting it like 'set' does. Put it inside a loop to watch a number climb.",
    "challenges": [
      { "title": "Count to ten", "instructions": "Set score to 0, then inside a 'repeat 10' block: change score by 1, then say score, then wait 0.3 seconds." },
      { "title": "Count by twos", "instructions": "Change the 'change score by' amount to 2 instead of 1, and see how the counting changes." }
    ]
  }
}
```

## Lesson 13: Higher or Lower

```json
{
  "title": "Higher or Lower",
  "tier": "intermediate",
  "order": 3,
  "suggestedMinutes": 25,
  "published": true,
  "content": {
    "introTitle": "Pixel needs to make a decision",
    "introText": "So far every block always ran, no matter what. Today Pixel learns to check something first, and only do certain blocks if that check is true.",
    "conceptTitle": "The if block and comparisons",
    "conceptText": "The Logic category has a '>' (greater than) block, and Control has an 'if' block with a spot for that comparison. Click the gear/blue icon on the if block to add an 'else' part, so Pixel can do one thing OR another.",
    "challenges": [
      { "title": "Check a score", "instructions": "Set score to 7. Use 'if score > 5' with an else: say 'High score!' in the if part, say 'Keep trying' in the else part." },
      { "title": "Try both paths", "instructions": "Change the starting score to something below 5, run it again, and confirm the other message shows instead." }
    ]
  }
}
```

## Lesson 14: Pixel's Own Move

```json
{
  "title": "Pixel's Own Move",
  "tier": "intermediate",
  "order": 4,
  "suggestedMinutes": 25,
  "published": true,
  "content": {
    "introTitle": "Some things Pixel does again and again",
    "introText": "If a spin-and-say routine happens three times in your project, you'd normally have to build those same blocks three separate times. There's a better way.",
    "conceptTitle": "Defining your own function",
    "conceptText": "Functions \u2192 'define' lets you build a named group of blocks once. Put whatever you want inside it, then use the matching call block anywhere you'd normally repeat that whole sequence.",
    "challenges": [
      { "title": "Define a move", "instructions": "Create a function (name it something like 'spinAndSay'). Inside it: turn 90 degrees, then say 'Whee!' for 1 second." },
      { "title": "Call it three times", "instructions": "Under 'when \u25b6 clicked', use the call block for your function three times in a row (or inside a 'repeat 3' block instead)." }
    ]
  }
}
```

## Lesson 15: Both Must Be True

```json
{
  "title": "Both Must Be True",
  "tier": "intermediate",
  "order": 5,
  "suggestedMinutes": 25,
  "published": true,
  "content": {
    "introTitle": "Sometimes one check isn't enough",
    "introText": "Pixel wants to say 'Perfect score!' only when TWO things are both true at once -- not just one of them.",
    "conceptTitle": "Combining conditions with and / or",
    "conceptText": "The Logic category has 'and' and 'or' blocks that plug two comparisons together. 'and' needs BOTH sides true; 'or' only needs ONE side true. Drop two comparison blocks into an 'and' or 'or' block, then drop that combined result into an if block.",
    "challenges": [
      { "title": "Check two things at once", "instructions": "Make two variables, 'score' and 'lives'. Use if (score > 5) and (lives > 0): say 'Great job!' else say 'Keep going.'" },
      { "title": "Try 'or' instead", "instructions": "Swap the 'and' for an 'or' block and change the numbers until you can see both paths trigger." }
    ]
  }
}
```

## Lesson 16: Mix and Match Text

```json
{
  "title": "Mix and Match Text",
  "tier": "intermediate",
  "order": 6,
  "suggestedMinutes": 20,
  "published": true,
  "content": {
    "introTitle": "Pixel wants to build a sentence out of pieces",
    "introText": "So far, 'say' blocks have shown one whole message at a time. Today Pixel learns to glue pieces of text (and numbers) together into a single message.",
    "conceptTitle": "The join block",
    "conceptText": "The Text category's 'join' block sticks two pieces of text together into one. You can plug a variable (like score) into one side, mixing numbers into a sentence automatically.",
    "challenges": [
      { "title": "Build a sentence", "instructions": "Make a variable 'score' set to 3. Use 'say (join \"Score: \" and score)' so Pixel says 'Score: 3' as one message." },
      { "title": "Join three pieces", "instructions": "Click the join block's gear icon to add a third slot, and build a longer sentence out of three joined pieces." }
    ]
  }
}
```



