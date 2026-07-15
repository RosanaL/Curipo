export interface CrewAgent {
  id: string;
  name: string;
  avatar_url?: string;
  animation_url?: string;
  poster_url?: string;
  tagline?: string;
  models?: string[];
  price?: string;
  description?: string;
  rating?: number;
}

export interface CrewCategory {
  id: string;
  name: string;
  agentIds: string[];
}

export interface Crew {
  name: string;
  agents: CrewAgent[];
  categories: CrewCategory[];
  createdAt: string;
}

export const CREW_STORAGE_KEY = "curipo-crew";
export const CREW_UPDATED_EVENT = "curipo:crew-updated";
export const DEFAULT_CREW_CATEGORY_ID = "general";

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeCrew(value: unknown): Crew | null {
  const crew = value as Partial<Crew> | null;
  if (!crew?.name || !Array.isArray(crew.agents)) return null;

  const agentIds = crew.agents.map((agent) => agent.id);
  const validAgentIds = new Set(agentIds);
  const seen = new Set<string>();
  const storedCategories = Array.isArray(crew.categories) ? crew.categories : [];

  const categories = storedCategories
    .filter((category) => category?.id && category?.name && Array.isArray(category.agentIds))
    .map((category) => {
      const categoryAgentIds = category.agentIds.filter((agentId) => {
        if (!validAgentIds.has(agentId) || seen.has(agentId)) return false;
        seen.add(agentId);
        return true;
      });

      return {
        id: category.id,
        name: category.name,
        agentIds: categoryAgentIds,
      };
    });

  if (categories.length === 0) {
    categories.push({
      id: DEFAULT_CREW_CATEGORY_ID,
      name: "General",
      agentIds: [],
    });
  }

  const missingAgentIds = agentIds.filter((agentId) => !seen.has(agentId));
  categories[0].agentIds.push(...missingAgentIds);

  return {
    name: crew.name,
    agents: crew.agents,
    categories,
    createdAt: crew.createdAt || new Date().toISOString(),
  };
}

export function readCrew(): Crew | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(CREW_STORAGE_KEY);
    if (!stored) return null;

    return normalizeCrew(JSON.parse(stored));
  } catch {
    return null;
  }
}

export function writeCrew(crew: Crew) {
  const normalized = normalizeCrew(crew);
  window.localStorage.setItem(CREW_STORAGE_KEY, JSON.stringify(normalized || crew));
  window.dispatchEvent(new CustomEvent(CREW_UPDATED_EVENT));
}

export function createCrew(name = "My Crew"): Crew {
  const crew = {
    name: name.trim() || "My Crew",
    agents: [],
    categories: [
      {
        id: DEFAULT_CREW_CATEGORY_ID,
        name: "General",
        agentIds: [],
      },
    ],
    createdAt: new Date().toISOString(),
  };
  writeCrew(crew);
  return crew;
}

export function addAgentToCrew(agent: CrewAgent): Crew {
  const crew = readCrew() || createCrew();
  if (crew.agents.some((member) => member.id === agent.id)) return crew;

  const targetCategory = crew.categories[0] || {
    id: DEFAULT_CREW_CATEGORY_ID,
    name: "General",
    agentIds: [],
  };
  const categories = crew.categories.length > 0 ? crew.categories : [targetCategory];

  const nextCrew = {
    ...crew,
    agents: [...crew.agents, agent],
    categories: categories.map((category, index) =>
      index === 0 ? { ...category, agentIds: [...category.agentIds, agent.id] } : category
    ),
  };
  writeCrew(nextCrew);
  return nextCrew;
}

export function removeAgentFromCrew(agentId: string): Crew | null {
  const crew = readCrew();
  if (!crew) return null;

  const nextCrew = {
    ...crew,
    agents: crew.agents.filter((member) => member.id !== agentId),
    categories: crew.categories.map((category) => ({
      ...category,
      agentIds: category.agentIds.filter((categoryAgentId) => categoryAgentId !== agentId),
    })),
  };
  writeCrew(nextCrew);
  return nextCrew;
}

export function createCrewCategory(name: string): Crew | null {
  const crew = readCrew();
  if (!crew || !name.trim()) return crew;

  const nextCrew = {
    ...crew,
    categories: [
      ...crew.categories,
      {
        id: createId("shelf"),
        name: name.trim(),
        agentIds: [],
      },
    ],
  };
  writeCrew(nextCrew);
  return nextCrew;
}

export function assignAgentToCategory(agentId: string, categoryId: string): Crew | null {
  const crew = readCrew();
  if (!crew) return null;

  const categoryExists = crew.categories.some((category) => category.id === categoryId);
  const agentExists = crew.agents.some((agent) => agent.id === agentId);
  if (!categoryExists || !agentExists) return crew;

  const nextCrew = {
    ...crew,
    categories: crew.categories.map((category) => {
      const withoutAgent = category.agentIds.filter((categoryAgentId) => categoryAgentId !== agentId);
      return category.id === categoryId
        ? { ...category, agentIds: [...withoutAgent, agentId] }
        : { ...category, agentIds: withoutAgent };
    }),
  };
  writeCrew(nextCrew);
  return nextCrew;
}

export function reorderCategoryAgents(categoryId: string, agentIds: string[]): Crew | null {
  const crew = readCrew();
  if (!crew) return null;

  const knownAgentIds = new Set(crew.agents.map((agent) => agent.id));
  const nextCrew = {
    ...crew,
    categories: crew.categories.map((category) =>
      category.id === categoryId
        ? {
            ...category,
            agentIds: agentIds.filter((agentId) => knownAgentIds.has(agentId)),
          }
        : category
    ),
  };
  writeCrew(nextCrew);
  return nextCrew;
}
