import React, { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfile } from '@/types';
import { LoginView } from '@/components/LoginView';
import { SuperadminDashboard } from '@/components/SuperadminDashboard';
import { PlaceholderDashboard } from '@/components/PlaceholderDashboard';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  // Firebase can fire onAuthStateChanged more than once for the same user
  // on one page load (cached session, then server revalidation) -- guard
  // against re-subscribing to the same profile doc twice.
  const loadedUidRef = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        loadedUidRef.current = null;
        setIsChecking(false);
        return;
      }
      if (loadedUidRef.current === u.uid) return;
      loadedUidRef.current = u.uid;

      // TEMPORARY DEBUG: prints the actual custom claims Firebase is
      // sending back, so we can see directly whether role/schoolId ever
      // made it onto this token. Remove once the claims issue is fixed.
      const tokenResult = await u.getIdTokenResult(true);
      console.log('PixelCode debug — ID token claims:', tokenResult.claims);

      const unsubscribeProfile = onSnapshot(doc(db, 'users', u.uid), (snap) => {
        setProfile(snap.exists() ? (snap.data() as UserProfile) : null);
        setIsChecking(false);
      });
      return unsubscribeProfile;
    });
    return unsubscribeAuth;
  }, []);

  if (isChecking) {
    return <div style={{ padding: 40, color: 'var(--ink-muted)' }}>Loading\u2026</div>;
  }

  if (!user || !profile) {
    return <LoginView />;
  }

  if (profile.role === 'superadmin') {
    return <SuperadminDashboard />;
  }

  return <PlaceholderDashboard profile={profile} />;
};

export default App;
