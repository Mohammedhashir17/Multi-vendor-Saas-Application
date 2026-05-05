import map from '../data/localImageMap.json';

/** Resolve Stitch remote URL to downloaded /images/* path when available. */
export function img(href) {
  if (!href) return '';
  return map[href] || href;
}
