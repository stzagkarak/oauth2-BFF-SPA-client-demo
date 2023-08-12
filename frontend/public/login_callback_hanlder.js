console.log("login callback works")

async function init_callback(queries) {
    console.log(queries)

    // wrap this in try catch in actual production code
    try {
      const res = await upgrade_session(queries);
      console.log(res)
    }
    catch(er) {
      console.log(er)
    }

}

async function upgrade_session(queries) {

  const response = await fetch("http://localhost:8181/session/upgrade", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(queries),
      headers: {
          "Content-Type": "application/json",
      }
    })
  const json = await response.json();
  return json;
}

async function init_logout() {
  
  console.log("Logout clicked")

  const resp = await end_session();
  console.log(resp)
}

async function end_session() {

  const response = await fetch("http://localhost:8181/session/clear", {
      method: "POST",
      credentials: "include"
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