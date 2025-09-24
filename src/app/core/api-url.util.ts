import { environment } from '../../environments/environment';

export function apiUrl(path: string): string {
  const base = environment.apiUrl.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}
