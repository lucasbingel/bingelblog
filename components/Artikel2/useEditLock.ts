// components/Artikel2/useEditLock.ts
"use client";

import { useEffect, useMemo, useState } from "react";

type LockState = {
  lockedByOther: boolean;
  owner: string | null;
  release: () => void;
};

const OWNER_KEY = () =>
  typeof window !== "undefined" ? `editor-owner-${location.origin}` : "editor-owner";

const now = () => Date.now();

// Universelle UUID-Generierung mit Fallback
function safeUUID(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    return (1e7 + -1e3 + -4e3 + -8e3 + -1e11)
      .toString()
      .replace(/[018]/g, (c: any) =>
        (
          Number(c) ^
          (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))
        ).toString(16)
      );
  }
  // letzter Fallback
  return Math.random().toString(36).substring(2, 15);
}


export function useEditLock(articleId: string, ttlMs = 2 * 60 * 1000): LockState {
  const ownerId = useMemo(
    () =>
      typeof window === "undefined"
        ? ""
        : localStorage.getItem(OWNER_KEY()) || safeUUID(),
    []
  );

  const [lockedByOther, setLockedByOther] = useState(false);
  const [owner, setOwner] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // persist owner id
    localStorage.setItem(OWNER_KEY(), ownerId);

    const lockKey = `article-lock:${articleId}`;
    const channel = new BroadcastChannel(lockKey);

    const claim = () => {
      const raw = localStorage.getItem(lockKey);
      if (raw) {
        try {
          const data = JSON.parse(raw) as { owner: string; expires: number };
          if (data.expires > now() && data.owner !== ownerId) {
            setLockedByOther(true);
            setOwner(data.owner);
            return;
          }
        } catch {
          /* ignore */
        }
      }
      const record = { owner: ownerId, expires: now() + ttlMs };
      localStorage.setItem(lockKey, JSON.stringify(record));
      setLockedByOther(false);
      setOwner(ownerId);
      channel.postMessage({ type: "claim" });
    };

    const heartbeat = setInterval(claim, ttlMs * 0.5);

    const onMessage = () => {
      // re-check
      claim();
    };

    channel.addEventListener("message", onMessage);

    // initial claim
    claim();

    const release = () => {
      const raw = localStorage.getItem(lockKey);
      try {
        const data = raw ? JSON.parse(raw) : null;
        if (data?.owner === ownerId) {
          localStorage.removeItem(lockKey);
          channel.postMessage({ type: "release" });
        }
      } catch {
        /* ignore */
      }
      channel.close();
      clearInterval(heartbeat);
    };

    window.addEventListener("beforeunload", release);
    return () => {
      window.removeEventListener("beforeunload", release);
      release();
    };
  }, [articleId, ownerId, ttlMs]);

  return {
    lockedByOther,
    owner,
    release: () => {
      const lockKey = `article-lock:${articleId}`;
      localStorage.removeItem(lockKey);
    },
  };
}
