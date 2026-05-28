 import { useState, useCallback } from "react";
import type { FocusWarSession } from "../types";

const BASE = "http://localhost:8080/api/war";

export const useWarMode = (userId: string) => {
  const [session, setSession] = useState<FocusWarSession | null>(null);
  const [history, setHistory] = useState<FocusWarSession[]>([]);
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
    const newSession = await res.json();
    setSession(newSession);
    setHistory(prev => [newSession, ...prev]);
  };

  const logDistraction = async () => {
    if (!session) return;
    const res = await fetch(`${BASE}/${session.id}/distraction`, { 
        method: "POST", 
        headers: getHeaders() 
    });
    const updated = await res.json();
    setSession(updated);
    setHistory(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const completeFocusBlock = async (duration: number) => {
    if (!session) return;
    const res = await fetch(
      `${BASE}/${session.id}/focus-block?duration=${duration}`,
      { method: "POST", headers: getHeaders() }
    );
    const updated = await res.json();
    setSession(updated);
    setHistory(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const endWar = async () => {
    if (!session) return;
    const res = await fetch(`${BASE}/${session.id}/end`, { 
        method: "POST", 
        headers: getHeaders() 
    });
    const updated = await res.json();
    setSession(updated);
    setHistory(prev => prev.map(s => s.id === updated.id ? updated : s));
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

  const fetchHistory = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${BASE}/history`, { headers: getHeaders() });
      if (!res.ok) return;
      const data: FocusWarSession[] = await res.json();
      setHistory(data);
    } catch (e) {
      console.error("Failed to fetch history", e);
    }
  }, [userId]);

  const loadActiveSession = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${BASE}/history`, { headers: getHeaders() });
      if (!res.ok) return;
      const data: FocusWarSession[] = await res.json();
      setHistory(data);
      const active = data.find(s => s.warStatus === 'ONGOING');
      if (active) {
          setSession(active);
      }
    } catch (e) {
      console.error("Failed to load war session", e);
    }
  }, [userId]);

  return { session, rank, history, startWar, logDistraction, completeFocusBlock, endWar, fetchRank, loadActiveSession, fetchHistory };
};
