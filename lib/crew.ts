export interface CrewAgent {
  id: string;
  name: string;
  avatar_url?: string;
  tagline?: string;
  models?: string[];
  price?: string;
  description?: string;
  rating?: number;
}

export interface Crew {
  name: string;
  agents: CrewAgent[];
  createdAt: string;
}

export const CREW_STORAGE_KEY = "curipo-crew";
export const CREW_UPDATED_EVENT = "curipo:crew-updated";

export function readCrew(): Crew | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(CREW_STORAGE_KEY);
    if (!stored) return null;

    const crew = JSON.parse(stored) as Crew;
    if (!crew?.name || !Array.isArray(crew.agents)) return null;
    return crew;
  } catch {
    return null;
  }
}

export function writeCrew(crew: Crew) {
  window.localStorage.setItem(CREW_STORAGE_KEY, JSON.stringify(crew));
  window.dispatchEvent(new CustomEvent(CREW_UPDATED_EVENT));
}

export function createCrew(name = "My Crew"): Crew {
  const crew = {
    name: name.trim() || "My Crew",
    agents: [],
    createdAt: new Date().toISOString(),
  };
  writeCrew(crew);
  return crew;
}

export function addAgentToCrew(agent: CrewAgent): Crew {
  const crew = readCrew() || createCrew();
  if (crew.agents.some((member) => member.id === agent.id)) return crew;

  const nextCrew = { ...crew, agents: [...crew.agents, agent] };
  writeCrew(nextCrew);
  return nextCrew;
}

export function removeAgentFromCrew(agentId: string): Crew | null {
  const crew = readCrew();
  if (!crew) return null;

  const nextCrew = {
    ...crew,
    agents: crew.agents.filter((member) => member.id !== agentId),
  };
  writeCrew(nextCrew);
  return nextCrew;
}
