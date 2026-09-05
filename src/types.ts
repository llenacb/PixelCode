// ---------------------------------------------------------------------------
// PixelCode data model
//
// TENANCY MODEL: PixelCode serves multiple schools from one shared codebase
// and one Firestore database. Every school-scoped record (users, projects)
// carries a `schoolId`. Isolation between schools is enforced in
// firestore.rules based on a `schoolId` custom claim on the caller's auth
// token (see functions/index.js: syncUserClaims) -- never trust a client-
// supplied schoolId for authorization, only the token's claim.
//
// Curriculum (Lesson / LessonContent) is intentionally NOT school-scoped --
// it's authored once by PixelCode staff (role 'superadmin') and made
// available to every school. Schools don't edit lesson content; a school
// admin can only choose which published lessons are unlocked for their
// grades (see SchoolLessonAssignment, added when the lesson runner is
// built in a later phase).
// ---------------------------------------------------------------------------

/** Platform-wide roles.
 *  - superadmin: PixelCode's own team. Creates schools, authors curriculum,
 *    can see across every school. Not tied to any single schoolId.
 *  - schoolAdmin: runs one school's account -- provisions that school's
 *    teachers/students, cannot see other schools.
 *  - teacher / student: scoped entirely to their own schoolId.
 */
export type UserRole = 'superadmin' | 'schoolAdmin' | 'teacher' | 'student';

export interface School {
  id: string;
  name: string;
  createdAt: string;
  /** Soft-disable a school's access without deleting its data. */
  active: boolean;
}

export interface UserProfile {
  id: string; // Firebase Auth UID
  name: string;
  email: string;
  role: UserRole;
  /** Absent only for role === 'superadmin'. Every other role must have one. */
  schoolId?: string;
  createdAt: string;
  lastActive?: string;
  photoURL?: string;
}

/** One image a sprite can wear. Built-in costumes point at files already in
 *  /public/mascot; uploaded ones point at a Firebase Storage download URL. */
export interface Costume {
  id: string;
  name: string;
  url: string;
}

export interface SoundAsset {
  id: string;
  name: string;
  url: string;
}

/** A student's saved coding project -- the core save/progress unit. */
export interface CodingProject {
  id: string;
  studentId: string;
  schoolId: string;
  title: string;
  /** Serialized Blockly workspace (Blockly.serialization.workspaces.save). */
  blocklyState: object;
  /** Sprite/stage state: costumes, positions, sounds -- shape finalized
   *  alongside the PixiJS runtime in the next build phase. */
  stageState: object;
  costumes: Costume[];
  currentCostumeIndex: number;
  sounds: SoundAsset[];
  lessonId?: string; // set if this project was started from a lesson
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Curriculum types are intentionally minimal here -- fleshed out in the
// Week 8 (lesson runner) phase. Placeholder so Project can reference a
// lessonId with a typed shape ready to extend.
// ---------------------------------------------------------------------------
export interface Lesson {
  id: string;
  title: string;
  tier: 'beginner' | 'intermediate' | 'interaction' | 'advanced';
  order: number;
  published: boolean;
}
