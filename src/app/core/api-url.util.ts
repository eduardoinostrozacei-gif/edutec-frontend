
import { environment } from '../../environments/environment';

export function apiUrl(path: string): string {
  if (!path) return environment.api;
  if (/^https?:\/\//i.test(path)) return path;

  const base = environment.api.replace(/\/+$/, '');
  const tail = path.replace(/^\/+/, '');
  return `${base}/${tail}`;
}
