import {apiNavegador, apiNavTools } from 'config/api';

export const getList = (path) =>
  apiNavegador.get(path)
    .then(response => {
//      console.log(response.data)
      return response.data
    })
    .catch(function(error) {
      if (error.response) {
        // La respuesta fue hecha y el servidor respondió con un código de estado
        // que esta fuera del rango de 2xx
        return error.response.data
//        return error.response.status
//        return error.response.headers
      } else if (error.request) {
        // La petición fue hecha pero no se recibió respuesta
        // `error.request` es una instancia de XMLHttpRequest en el navegador y una instancia de
        // http.ClientRequest en node.js
        return error.request
      } else {
        // Algo paso al preparar la petición que lanzo un Error
        return error.message
      }
  });
/*
export const getData = endpoint =>
  apiNavegador.get(endpoint).then(response => {
    if (response.ok) {
      return response.data;
    } else if (response.problem) {
      console.log(response.problem);
    }
    return;
  });
*/
export const getSearch = (path, strSearch) => 

  apiNavTools.get('/search' + path + '?s=' + strSearch)
    .then(response => response.data)
    .catch(function (error) {
        if (error.response) {
          // La respuesta fue hecha y el servidor respondió con un código de estado
          // que esta fuera del rango de 2xx
          return error.response.data
    //      return error.response.status
    //      return error.response.headers
        } else if (error.request) {
          // La petición fue hecha pero no se recibió respuesta
          // `error.request` es una instancia de XMLHttpRequest en el navegador y una instancia de
          // http.ClientRequest en node.js
          return error.request
        } else {
          // Algo paso al preparar la petición que lanzo un Error
          return error.message
        }
  }) 

export const getHash = (path) => 

  apiNavTools.get('/hash-md5/' + path)
    .then(response => response.data)
    .catch(function (error) {
        if (error.response) {
          // La respuesta fue hecha y el servidor respondió con un código de estado
          // que esta fuera del rango de 2xx
          return error.response.data
    //      return error.response.status
    //      return error.response.headers
        } else if (error.request) {
          // La petición fue hecha pero no se recibió respuesta
          // `error.request` es una instancia de XMLHttpRequest en el navegador y una instancia de
          // http.ClientRequest en node.js
          return error.request
        } else {
          // Algo paso al preparar la petición que lanzo un Error
          return error.message
        }
  }) 
