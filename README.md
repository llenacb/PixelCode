# PixelCode

A block-based creative coding platform for kids, built to serve multiple
schools from one shared codebase (see `src/types.ts` for the multi-tenant
data model and `firestore.rules` for how school isolation is enforced).

## Status: Weeks 1-8 (Foundation + Core editor + Sprite/sound tools + Lessons)

Done:
- Multi-tenant data model (`School`, `UserProfile`, `CodingProject`,
  `Costume`, `SoundAsset`, `Lesson`)
- Firestore + Storage security rules enforcing per-school isolation via
  Auth custom claims (`role`, `schoolId`)
- Cloud Functions: `syncUserClaims` (keeps claims in sync with each
  user's profile doc), `createSchool`, `provisionUser`
- Login screen + a superadmin dashboard (create schools, provision
  accounts, publish lesson content)
- Core coding editor (`src/components/CodingEditor.tsx`): a Blockly
  workspace (`src/lib/blocklyBlocks.ts` -- Events, Motion, Looks, Control,
  Sound blocks) driving a PixiJS stage (`src/components/Stage.tsx`), with
  Run/Stop (`src/lib/interpreter.ts`) and Save/Load of a student's project
  to Firestore. Lazy-loaded (`React.lazy`) so its ~1MB of dependencies
  (Blockly + PixiJS) only load for students, not every role.
- Sprite & sound tools (`src/components/AssetPanel.tsx`): upload a custom
  costume image or pick from 3 built-in mascot costumes, switch between
  them (also reachable from a `next costume` block), and upload sounds
  that appear as live options in the `play sound` block's dropdown.
  Uploads go to Firebase Storage at
  `submissions/{schoolId}/{studentUid}/default/{kind}-{timestamp}-{filename}`
  ('default' stands in for a real per-project path until multi-project
  support exists) -- this path shape must stay in sync with the pattern
  in `storage.rules` or uploads silently fail with permission-denied.
- Lesson content system: `lessons` is a global (not per-school)
  Firestore collection, authored once by superadmin and visible to every
  school's students. `src/components/LessonPanel.tsx` is a slide-over
  panel (toggled from the editor header) listing published lessons by
  tier, showing each one's intro/concept/challenge content -- the same
  hook-concept-challenge pacing pattern found in reference curricula, but
  with entirely original PixelCode content and characters. Superadmin
  publishes lessons via a JSON-paste importer in the dashboard's new
  Content section; `docs/sample-lessons.md` has 3 ready-to-paste original
  Beginner-tier lessons to seed real content for testing.
- Guided tour (`src/components/GuidedTour.tsx`): an interactive
  welcome-then-step-by-step walkthrough (own original design, not a copy
  of any reference tool's onboarding) shown automatically to a first-time
  student. It watches the live Blockly workspace via a change listener
  and auto-advances each step the instant the right block actually gets
  dragged in -- not just static text. Currently hardcoded to the "Wake Up,
  Pixel!" lesson's exact block sequence; generalizing it to walk through
  any lesson is good follow-up work. Replayable anytime via the "🎯
  Tutorial" header button.

## Block library expansion (post-Week 9)

Beyond the original 12-week plan, the block set has grown significantly
past the Week 3-5 starter set, benchmarked against a competing platform's
full documented block library (not copied -- see commit history for the
IP boundary this was built against):

- **Data/Functions (mostly free via Blockly's built-ins):** Variables,
  Lists, Functions (with a custom async-aware code generator override --
  see the comment above `procedures_defnoreturn` in `blocklyBlocks.ts`,
  since every PixelCode block uses `await` and Blockly's default
  procedure codegen is synchronous), Logic (compare/and/or/not),
  extended Math (round/modulo/random), extended Text
  (join/length/substring/indexOf/charAt), and `controls_if`.
- **Event-driven runtime (`src/lib/interpreter.ts`):** this was a real
  architecture change, not just new blocks. Previously Run flattened
  every script into one linear sequence that ran once. Now each
  top-level hat block (`when \u25b6 clicked` or the new `when [key] pressed`)
  is compiled and run as an INDEPENDENT script; key-press scripts
  register a real `keydown` listener and can re-trigger repeatedly for as
  long as the program is running, with per-script overlap protection
  (won't stack up a new run if the previous press's script is still
  mid-execution). A program with only flag scripts still auto-finishes
  when they're done (like before); a program with any key scripts stays
  "running" until Stop is clicked, matching how an interactive/game
  project needs to keep listening.
- **Sensing category:** key-pressed (state check, distinct from the
  event-triggering version), mouse down/x/y, touching-edge -- all
  synchronous getters on `Stage.tsx`'s new `getMouseState()` /
  `isTouchingEdge()`, since sensing values are read inside conditions,
  not awaited like action blocks.
- **Branded naming dialog** (`src/lib/blocklyDialogs.tsx`): overrides
  Blockly's default `window.prompt()` for naming variables/lists/
  functions with a styled modal matching the rest of the app.
- **Fixed a real locale bug:** Blockly's English message strings weren't
  being loaded at all, which silently broke the Variables/Lists/
  Functions flyouts (buttons rendered literal placeholder text like
  `%{BKY_NEW_VARIABLE}` instead of "Make a Variable"). Fixed in
  `blocklyBlocks.ts` -- worth knowing if a similar-looking "flyout shows
  broken text" bug ever reappears.

**Not yet built from the wiki comparison:** a proper "Make a List" UX
(currently lists are just regular variables holding a `lists_create_with`
result -- workable but not as clean as Scratch/Kitten's dedicated list
creation flow), Pen (needs a real drawing layer on the PixiJS stage), and
multi-sprite/cloning (the Stage currently supports exactly one sprite).

## Weeks 1-9 status

Everything above through the guided tour is done. Also done:
- Teacher/school-admin dashboard (`src/components/TeacherDashboard.tsx`):
  a roster of the signed-in staff member's own school's students (via the
  same `isStaffOfSchool` Firestore rule from the foundation phase -- no
  new rules needed), each with their latest saved project and when it was
  updated. `src/components/ProjectViewer.tsx` opens a read-only look at a
  student's actual blocks (Blockly in `readOnly` mode) and sprite --
  staff can see exactly what a student built, not just that they saved
  something. Lazy-loaded like the student editor, and Vite automatically
  shares one Blockly/PixiJS bundle between both roles rather than
  downloading it twice.

## Setup

**1. Create a Firebase project** (if you haven't yet):
   https://console.firebase.google.com \u2192 Add project.
   Enable: Authentication (Email/Password provider), Firestore, Storage,
   and Functions (Functions requires the Blaze pay-as-you-go plan).

**2. Get your web app config**: Project settings \u2192 General \u2192
   "Your apps" \u2192 add a Web app. Copy the config values into a new
   `.env.local` file (copy `.env.example` as a starting point).

**3. Install dependencies:**
   ```
   npm install
   cd functions && npm install && cd ..
   ```

**4. Link this folder to your Firebase project:**
   ```
   npx firebase-tools login
   npx firebase-tools use --add
   ```

**5. Deploy rules and functions:**
   ```
   npx firebase-tools deploy --only firestore:rules,storage:rules,functions
   ```

**6. Create the first superadmin account.** There's no self-signup by
   design (see `provisionUser` in `functions/index.js`) \u2014 so the very
   first account has to be created directly in the Firebase console:
   - Authentication \u2192 Add user (set an email + password)
   - Firestore \u2192 `users` collection \u2192 add a document with that
     user's Auth UID as the document ID, containing:
     ```json
     { "id": "<uid>", "name": "Your name", "email": "<email>",
       "role": "superadmin", "createdAt": "<ISO date>" }
     ```
   - The `syncUserClaims` function sets the custom claim automatically
     once that document is written. Sign in \u2014 you'll land on the
     superadmin dashboard, which can create schools and every other
     account from there on.

**7. Run locally:**
   ```
   npm run dev
   ```
