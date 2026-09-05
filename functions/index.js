const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Firestore trigger: keeps each user's Firebase Auth custom claims
 * (`role`, `schoolId`) in sync with their users/{uid} Firestore doc.
 *
 * This is the mechanism the multi-tenant isolation in firestore.rules and
 * storage.rules depends on -- rules read request.auth.token.role and
 * request.auth.token.schoolId directly, with zero Firestore get() calls,
 * so they scale to any query size (see firestore.rules comment for why
 * a get()-based check doesn't).
 *
 * Note: an already-issued ID token won't reflect a claim change until
 * it's refreshed. The client should force-refresh the token
 * (getIdToken(true)) right after sign-in and after any profile-role
 * change, to avoid a stale-claim window.
 */
exports.syncUserClaims = onDocumentWritten('users/{userId}', async (event) => {
  const after = event.data?.after;
  if (!after || !after.exists) return; // doc deleted -- nothing to sync

  const afterData = after.data() || {};
  const before = event.data?.before;
  const beforeData = before?.exists ? before.data() || {} : {};

  const newRole = afterData.role;
  const newSchoolId = afterData.schoolId || null;
  const oldRole = beforeData.role;
  const oldSchoolId = beforeData.schoolId || null;

  if (newRole === oldRole && newSchoolId === oldSchoolId) return; // no change

  try {
    await admin.auth().setCustomUserClaims(event.params.userId, {
      role: newRole,
      schoolId: newSchoolId,
    });
  } catch (err) {
    // Most likely auth/user-not-found -- this Firestore doc's id doesn't
    // match a real Firebase Auth UID.
    console.error(`syncUserClaims: could not set claims for ${event.params.userId}:`, err);
  }
});

/**
 * Callable: createSchool
 * Superadmin-only. Creates a new school doc. Provisioning that school's
 * own admin account is a separate step (provisionUser below), so a
 * school can be created before anyone is assigned to run it.
 */
exports.createSchool = onCall(async (request) => {
  const callerUid = request.auth?.uid;
  if (!callerUid) throw new HttpsError('unauthenticated', 'You must be signed in.');
  if (request.auth.token.role !== 'superadmin') {
    throw new HttpsError('permission-denied', 'Only superadmin can create schools.');
  }

  const name = (request.data?.name || '').trim();
  if (!name) throw new HttpsError('invalid-argument', 'School name is required.');

  const ref = await admin.firestore().collection('schools').add({
    name,
    active: true,
    createdAt: new Date().toISOString(),
  });

  return { id: ref.id, name };
});

/**
 * Callable: setStorageCors
 * Superadmin-only, one-off utility. Firebase Storage's default bucket
 * configuration doesn't allow cross-origin fetches (e.g. loading an
 * uploaded image as a PixiJS/WebGL texture from the app's own domain) --
 * that needs an explicit CORS policy set on the bucket itself, normally
 * done via the gsutil command-line tool. This does the same thing
 * through the Admin SDK instead, so it can be triggered from the
 * dashboard without installing anything extra.
 *
 * origin: ['*'] is intentional and safe here -- CORS only controls which
 * web origins are ALLOWED TO ATTEMPT a request; actual authorization is
 * still fully enforced server-side by storage.rules regardless of this
 * setting. Restricting origin wouldn't add security, only friction every
 * time a new domain (staging, production, a custom domain later) needs
 * access.
 */
exports.setStorageCors = onCall(async (request) => {
  if (request.auth?.token?.role !== 'superadmin') {
    throw new HttpsError('permission-denied', 'Only superadmin can run this.');
  }
  const bucket = admin.storage().bucket('studio-98257600-1107c.firebasestorage.app');
  await bucket.setMetadata({
    cors: [
      {
        origin: ['*'],
        method: ['GET', 'HEAD'],
        responseHeader: ['Content-Type', 'Access-Control-Allow-Origin'],
        maxAgeSeconds: 3600,
      },
    ],
  });
  return { ok: true };
});

/**
 * Callable: provisionUser
 * Creates a Firebase Auth account plus its users/{uid} profile in one
 * step (the client SDK can't create OTHER users' accounts -- that needs
 * the Admin SDK, server-side only).
 *
 * - superadmin: can provision any role, into any school (or none, for
 *   another superadmin).
 * - schoolAdmin: can only provision 'teacher' or 'student' into THEIR
 *   OWN school -- schoolId is taken from the caller's claim, never from
 *   client input, so a school admin can never plant a user into a
 *   different school.
 */
exports.provisionUser = onCall(async (request) => {
  const callerUid = request.auth?.uid;
  if (!callerUid) throw new HttpsError('unauthenticated', 'You must be signed in.');

  const callerRole = request.auth.token.role;
  const { name, email, password, role } = request.data || {};

  if (!name || !email || !password || !role) {
    throw new HttpsError('invalid-argument', 'name, email, password, and role are required.');
  }

  let schoolId;
  if (callerRole === 'superadmin') {
    schoolId = role === 'superadmin' ? null : request.data?.schoolId;
    if (role !== 'superadmin' && !schoolId) {
      throw new HttpsError('invalid-argument', 'schoolId is required for non-superadmin roles.');
    }
  } else if (callerRole === 'schoolAdmin') {
    if (!['teacher', 'student'].includes(role)) {
      throw new HttpsError('permission-denied', 'School admins can only create teacher or student accounts.');
    }
    schoolId = request.auth.token.schoolId; // never trust client input here
  } else {
    throw new HttpsError('permission-denied', 'Only superadmin or a school admin can provision accounts.');
  }

  const userRecord = await admin.auth().createUser({ displayName: name, email, password });

  await admin.firestore().collection('users').doc(userRecord.uid).set({
    id: userRecord.uid,
    name,
    email,
    role,
    ...(schoolId ? { schoolId } : {}),
    createdAt: new Date().toISOString(),
  });
  // syncUserClaims trigger fires on this write and sets the custom claims.

  return { id: userRecord.uid };
});
