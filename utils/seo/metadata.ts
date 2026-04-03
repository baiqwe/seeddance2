export function buildLocaleAlternates(pathname: string) {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  return {
    canonical: normalizedPath,
    languages: {
      en: normalizedPath.replace(/^\/(en|zh)(?=\/|$)/, "/en"),
      zh: normalizedPath.replace(/^\/(en|zh)(?=\/|$)/, "/zh"),
      "x-default": normalizedPath.replace(/^\/(en|zh)(?=\/|$)/, "/en"),
    },
  };
}
