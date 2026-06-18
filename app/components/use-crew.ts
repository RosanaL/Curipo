"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addAgentToCrew,
  createCrew,
  CREW_STORAGE_KEY,
  CREW_UPDATED_EVENT,
  Crew,
  CrewAgent,
  readCrew,
  removeAgentFromCrew,
  writeCrew,
} from "@/lib/crew";

export function useCrew() {
  const [crew, setCrew] = useState<Crew | null>(null);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(() => {
    setCrew(readCrew());
    setLoaded(true);
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(CREW_UPDATED_EVENT, refresh);
    const handleStorage = (event: StorageEvent) => {
      if (event.key === CREW_STORAGE_KEY) refresh();
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(CREW_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", handleStorage);
    };
  }, [refresh]);

  function startCrew(name?: string) {
    const nextCrew = createCrew(name);
    setCrew(nextCrew);
    return nextCrew;
  }

  function renameCrew(name: string) {
    if (!crew || !name.trim()) return;
    const nextCrew = { ...crew, name: name.trim() };
    writeCrew(nextCrew);
    setCrew(nextCrew);
  }

  function addAgent(agent: CrewAgent) {
    const nextCrew = addAgentToCrew(agent);
    setCrew(nextCrew);
  }

  function removeAgent(agentId: string) {
    const nextCrew = removeAgentFromCrew(agentId);
    setCrew(nextCrew);
  }

  return {
    crew,
    loaded,
    startCrew,
    renameCrew,
    addAgent,
    removeAgent,
    hasAgent: (agentId: string) => crew?.agents.some((agent) => agent.id === agentId) || false,
  };
}
