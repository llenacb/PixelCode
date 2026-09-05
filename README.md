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

Not yet built (upcoming phase): teacher/school-admin views (currently
just a placeholder screen), and wiring a lesson's challenge directly into
starter code in the editor (currently the lesson panel is read-only
instructions alongside the editor, not an auto-loaded starter project).

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
