
async function init_login() {

    const data = await post_new_session();
    if(data.redirect_required) {
        window.location = data.redirect_to;
    } 
}

async function post_new_session() {
    
    const response = await fetch("http://localhost:8181/session/new/", {
        method: "POST",
        credentials: "include"
    })

    const json = await response.json()
    return json;
}

// =========================================

async function test_session() {

    const r = await get_protected_item();
    console.log(r)
    return;
}


async function get_protected_item() {
    
    const response = await fetch("http://localhost:8181/protected_item", {
        method: "GET",
        credentials: "include"
    })

    const json = await response.json()
    return json;
}

//async function test_session2() {
//
//    const r = await POST_TEST_SESSION_2();
//    console.log(r)
//    return;
//}

//async function POST_TEST_SESSION_2() {
// 
//    const response = await fetch("http://localhost:8181/test_session/2", {
//        method: "POST",
//        credentials: "include"
//    })
//
//    const json = await response.json()
//    return json;
//
//}