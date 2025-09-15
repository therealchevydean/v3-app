'use client';

import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Map from '@/components/Map';
import TokenBalance from '@/components/ui/TokenBalance';
import LogoutButton from '@/components/auth/LogoutButton';
import Revelation from '@/components/Revelation';

export default function Game() {
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [settingDestination, setSettingDestination] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setBalance(docSnap.data().balance);
        } else {
          await setDoc(docRef, { balance: 100 });
          setBalance(100);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <main>
      {user ? (
        <>
          <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1, width: 'calc(100% - 20px)' }}>
            <TokenBalance balance={balance} />
            <LogoutButton />
            <Revelation />
            <button onClick={() => setSettingDestination(!settingDestination)} style={{ background: settingDestination ? 'green' : 'white', marginTop: '10px' }}>
              {settingDestination ? 'Cancel' : 'Set Destination'}
            </button>
            {settingDestination && <p style={{color: 'white', background: 'rgba(0,0,0,0.7)', padding: '5px'}}>Click on the map to set your destination.</p>}
          </div>
          <Map setBalance={setBalance} settingDestination={settingDestination} setSettingDestination={setSettingDestination} />
        </>
      ) : (
        <div>Please log in</div>
      )}
    </main>
  );
}
