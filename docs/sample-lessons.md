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
