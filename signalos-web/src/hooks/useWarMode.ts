 import { useState, useCallback } from "react";
import type { FocusWarSession } from "../types";

const BASE = "http://localhost:8080/api/war";

export const useWarMode = (userId: string) => {
  const [session, setSession] = useState<FocusWarSession | null>(null);
  const [rank, setRank] = useState<string>("");

  const getHeaders = () => ({
    "Content-Type": "application/json",
    "X-User-Id": userId,
  });

  const startWar = async () => {
    const res = await fetch(`${BASE}/start`, { 
        method: "POST", 
        headers: getHeaders() 
    });
    setSession(await res.json());
  };

  const logDistraction = async () => {
    if (!session) return;
    const res = await fetch(`${BASE}/${session.id}/distraction`, { 
        method: "POST", 
        headers: getHeaders() 
    });
    setSession(await res.json());
  };

  const completeFocusBlock = async (duration: number) => {
    if (!session) return;
    const res = await fetch(
      `${BASE}/${session.id}/focus-block?duration=${duration}`,
      { method: "POST", headers: getHeaders() }
    );
    setSession(await res.json());
  };

  const endWar = async () => {
    if (!session) return;
    const res = await fetch(`${BASE}/${session.id}/end`, { 
        method: "POST", 
        headers: getHeaders() 
    });
    setSession(await res.json());
  };

  const fetchRank = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${BASE}/rank`, { headers: getHeaders() });
      if (!res.ok) {
        console.warn("Rank fetch failed with status", res.status);
        return;
      }
      const text = await res.text();
      setRank(text || "Intern");
    } catch (e) {
      console.error("Failed to fetch rank", e);
    }
  }, [userId]);

  const loadActiveSession = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${BASE}/history`, { headers: getHeaders() });
      if (!res.ok) return;
      const history: FocusWarSession[] = await res.json();
      const active = history.find(s => s.warStatus === 'ONGOING');
      if (active) {
          setSession(active);
      }
    } catch (e) {
      console.error("Failed to load war session", e);
    }
  }, [userId]);

  return { session, rank, startWar, logDistraction, completeFocusBlock, endWar, fetchRank, loadActiveSession };
};
