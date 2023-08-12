const OAUTH_ISSUER_URL = "http://127.0.0.1:4444";
const CLIENT_ID = "f641fcc3-38b6-4ffc-a408-eb7e82e7abf7";
const CLIENT_SECRET = "r.oQ2Z1auUK.002ac8kYYwDgIs";
const REDIRECT_URIS = ["http://localhost:8100/oauth_login_callback"]
const POST_LOGOUT_REDIRECT_URIS = ["http://localhost:8100/logout_callback"]

import { Issuer } from 'openid-client';
import { generators } from 'openid-client';
import cryptoRandomString from 'crypto-random-string';

const local_issuer = await Issuer.discover(OAUTH_ISSUER_URL);
//console.log('Discovered issuer %s %O', local_issuer.issuer, local_issuer.metadata);

const client = new local_issuer.Client({
  // id and secret that was created and shared with the client
  client_id: CLIENT_ID,    //CHANGE ME FOR DEMO
  client_secret: CLIENT_SECRET,          //CHANGE ME FOR DEMO

  // where to return to after 1st phase of the flow is complete
  redirect_uris: REDIRECT_URIS, // frontend route

  // type of flow: "code" : Authorization Code
  response_types: ['code'],

  // specifies that client_secret is needed for code exchange
  token_endpoint_auth_method: "client_secret_basic"
}); // => Client

export async function refresh_tokens(tokenSet) {

  const r_tokenSet = await client.refresh(tokenSet.refresh_token);
  return r_tokenSet;

}

export function get_login_redirection_info() {
    
  // PKCE verifier and challenge creation
  const code_verifier = generators.codeVerifier();
  const code_challenge = generators.codeChallenge(code_verifier);
  
  const st = cryptoRandomString({length: 10})
  
  // generate authorization link for end user
  const uri = client.authorizationUrl({
    // scopes to include ( said scopes have been
    // agreed uppon client creation )
    scope: 'openid offline',
  
    code_challenge, // sending the challenge to the server
    code_challenge_method: 'S256',
  
    // example state var
    state: st
  });

  return [uri, st, code_verifier];
}

export function get_logout_redirection_info(state, tokenSet) {

  const uri = client.endSessionUrl({
    client_id: CLIENT_ID,
    state: state,
    id_token_hint: tokenSet.id_token,
    post_logout_redirect_uri: POST_LOGOUT_REDIRECT_URIS
  })

  return uri;
}

export async function revoke_token(token) {
  try {
    return await client.revoke(token);
  }
  catch(er) {
    console.log(er)
    return "error";
  }
}

export async function exchange_code(code_verifier, code, state) {

  const params = { code, state }
  const checks = { code_verifier, state }

  return await client.callback(REDIRECT_URIS[0], 
    params,
    checks
  );
}