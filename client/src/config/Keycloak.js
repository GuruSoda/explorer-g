import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
 url: "https://www.planetaguru.com.ar/auth",
 realm: "ExplorerG",
 clientId: "explorer-client"
});

export default keycloak;
