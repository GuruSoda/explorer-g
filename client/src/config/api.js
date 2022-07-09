import { create } from 'axios';

export const apiNavegador = create({
//  baseURL: (process.env.REACT_APP_API_BASE_URL_NAV || window.location.href) + 'navegador',
  baseURL: './navegador',
  timeout: 600000,
});

export const apiNavTools = create({
//    baseURL: (process.env.REACT_APP_API_BASE_URL_TOOLS || window.location.href) + 'navtools',
    baseURL: './navtools',
    timeout: 600000,
});

export const apiFS = create({
      baseURL: './fs',
      timeout: 600000,
});
