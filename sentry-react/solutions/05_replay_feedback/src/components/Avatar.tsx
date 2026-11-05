import { useEffect, useState } from 'react';
import { fetchAvatar } from '../api/client';

/** The initials of a person, from the avatars CDN — a third party, not our API. */
export function Avatar({ login }: { readonly login: string }) {
  const [initials, setInitials] = useState('…');

  useEffect(() => {
    let ignore = false;
    fetchAvatar(login).then((avatar) => {
      if (!ignore) setInitials(avatar.initials);
    });
    return () => {
      ignore = true;
    };
  }, [login]);

  return <span className="avatar">{initials}</span>;
}
