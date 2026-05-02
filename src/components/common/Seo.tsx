import { useEffect } from "react";

interface SeoProps {
  title: string;
  description?: string;
  canonical?: string;
  jsonLd?: Record<string, any>;
}

export function Seo({ title, description, canonical, jsonLd }: SeoProps) {
  useEffect(() => {
    document.title = title;
    if (description) {
      let m = document.querySelector('meta[name="description"]');
      if (!m) { m = document.createElement("meta"); m.setAttribute("name", "description"); document.head.appendChild(m); }
      m.setAttribute("content", description.slice(0, 158));
    }
    if (canonical) {
      let l = document.querySelector('link[rel="canonical"]');
      if (!l) { l = document.createElement("link"); l.setAttribute("rel", "canonical"); document.head.appendChild(l); }
      l.setAttribute("href", canonical);
    }
    let ogT = document.querySelector('meta[property="og:title"]');
    if (!ogT) { ogT = document.createElement("meta"); ogT.setAttribute("property", "og:title"); document.head.appendChild(ogT); }
    ogT.setAttribute("content", title);

    let scriptEl: HTMLScriptElement | null = null;
    if (jsonLd) {
      scriptEl = document.createElement("script");
      scriptEl.type = "application/ld+json";
      scriptEl.text = JSON.stringify(jsonLd);
      document.head.appendChild(scriptEl);
    }
    return () => { if (scriptEl) scriptEl.remove(); };
  }, [title, description, canonical, jsonLd]);
  return null;
}
