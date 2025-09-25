import { environment } from '../../environments/environment';


export function apiUrl(path = ''): string {
  const base = environment.apiUrl.replace(/\/+$/, '');
  const p = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  return `${base}${p}`;
}
