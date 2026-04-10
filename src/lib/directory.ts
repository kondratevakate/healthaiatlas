import { domains } from "@/data/domains";

export const directoryDetailDomainIds = new Set(
  domains.filter((domain) => domain.id !== "overview").map((domain) => domain.id),
);

export function normalizeDomainId(id?: string) {
  return id && domains.some((domain) => domain.id === id) ? id : "overview";
}

export function getPlayerDirectoryPath(playerId: string): string {
  const domain = domains.find(
    (d) => d.id !== "overview" && d.playerIds.includes(playerId),
  );
  return domain ? `/directory/${domain.id}` : "/directory";
}
