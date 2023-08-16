console.log("login callback works")

async function init_callback(queries) {
    console.log(queries)

    const s_state = localStorage.getItem("state")
    const jwt = localStorage.getItem("platform_token")
    if(!s_state && s_state != queries.state) {
        console.log("Invalid State")
        window.location = "http://localhost:8100/login_error?reason=invalid_state";
    }

    // wrap this in try catch in actual production code
    try {
      const res = await upgrade_session(queries, jwt);
      document.getElementById("login_status").innerText = "Login Status: Logged In";
      document.getElementById("token_info").innerText = "Platform Token " + jwt;
    }
    catch(er) {
      console.log(er)
    }

}

async function upgrade_session(queries, jwt) {

  const response = await fetch("http://localhost:8181/session/upgrade", {
      method: "POST",
      body: JSON.stringify(queries),
      headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + jwt
      }
    })
  const json = await response.json();
  return json;
}

async function init_logout() {
  console.log("Logout clicked")

  const jwt = localStorage.getItem("platform_token")
  try {
    localStorage.removeItem("platform_token");
    localStorage.removeItem("state");
    const res = await end_session(jwt);
    window.location = "http://localhost:8100/"
  
  }catch(er) {
    console.log(er)
  }

}

async function end_session(jwt) {

  const response = await fetch("http://localhost:8181/session/end", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + jwt
      }
    })
  const json = await response.json();
  return json;
}


//async function upgrade_session(queries) {
//
//    const response = await fetch("http://localhost:8100/oauth_login_callback", {
//        method: "POST",
//        body: JSON.stringify(queries),
//        headers: {
//          "Content-Type": "application/json",
//        }
//      })
//    const json = await response.json();
//    return json;
//}