console.log("hanlder script loaded")

async function initLogin() {
    console.log("clicked login button")

    const jwt = localStorage.getItem("platform_token");
    const res_body = await fetch_session(jwt);
    console.log(res_body)

    if(res_body.redirect_required) {
        localStorage.setItem('state', res_body.state);
        localStorage.setItem('platform_token', res_body.platform_token);
        window.location = res_body.redirect_to;
        //temp
        //localStorage.setItem('state', "caravi");
        //window.location = "http://localhost:8100/oauth_login_callback"
    }
    else if(res_body.token_valid) {
        document.getElementById("token_valid_text")
            .innerText = "Platform token is valid, no need to execute authorization flow";
        document.getElementById("main_page_button")
            .style.visibility = "visible";
    }
}

async function fetch_session(jwt) {

    let response = {};
    if(jwt) {
        response = await fetch("http://localhost:8181/session/new", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + jwt
        }
    })
    } 
    else {
        response = await fetch("http://localhost:8181/session/new", {
            method: "POST",
        }) 
    }

    const json = await response.json();
    return json;
}

async function test_session() {

    console.log("Testing Session")

    const res = await fetch_session();
    console.log(res)
}

async function fetch_session() {
    
    const response = await fetch("http://localhost:8181/test_session", {
        method: "POST",
        credentials: "include"
    })

    const json = await response.json()
    return json;
}


//async function fetch_session() {
//
//    const response = await fetch("http://localhost:8100/", {
//        method: "POST",
//    })
//    const json = await response.json();
//    return json;
//}