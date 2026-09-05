# PixelCode

A block-based creative coding platform for kids, built to serve multiple
schools from one shared codebase (see `src/types.ts` for the multi-tenant
data model and `firestore.rules` for how school isolation is enforced).

## Status: Weeks 1-2 (Foundation)

Done:
- Multi-tenant data model (`School`, `UserProfile`, `CodingProject`, `Lesson`)
- Firestore + Storage security rules enforcing per-school isolation via
  Auth custom claims (`role`, `schoolId`)
- Cloud Functions: `syncUserClaims` (keeps claims in sync with each
  user's profile doc), `createSchool`, `provisionUser`
- Login screen + a superadmin dashboard (create schools, provision
  accounts)

Not yet built (upcoming phases): the Blockly + PixiJS coding editor,
sprite/asset tools, the lesson runner, and the teacher/school-admin views
(currently just a placeholder screen).

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
