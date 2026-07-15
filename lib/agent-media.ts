export interface AgentMediaSource {
  name: string;
  avatar_url?: string;
  animation_url?: string;
  poster_url?: string;
}

const LOCAL_AGENT_ANIMATIONS: Record<string, string> = {
  daemons: "/agents/daemons.webm",
  okara: "/agents/okara.webm",
};

function isVideoUrl(url?: string) {
  return /\.(webm|mp4|mov)(\?.*)?$/i.test(url || "");
}

export function resolveAgentMedia(agent: AgentMediaSource) {
  const localAnimation = LOCAL_AGENT_ANIMATIONS[agent.name.trim().toLowerCase()];
  const animationUrl = agent.animation_url || (isVideoUrl(agent.avatar_url) ? agent.avatar_url : localAnimation);
  const avatarUrl = isVideoUrl(agent.avatar_url) ? undefined : agent.avatar_url;

  return {
    animationUrl,
    avatarUrl,
    posterUrl: agent.poster_url || avatarUrl,
  };
}
