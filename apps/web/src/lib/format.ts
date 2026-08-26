export function hostnameDe(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function faviconUrl(url: string): string {
  try {
    const dominio = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${dominio}&sz=32`;
  } catch {
    return "";
  }
}

export function dataCurta(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}
