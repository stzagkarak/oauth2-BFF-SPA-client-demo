document.addEventListener("DOMContentLoaded", () => {
    
    const st = document.getElementById("status_text");

    if(localStorage.getItem("platform_token")) {
        st.innerText = "Platform Token in storage";
    }
    else {
        st.innerText = "No token in stogage"
    }

})

async function try_get_resource() {

    const jwt = localStorage.getItem("platform_token");
    fetch_res(jwt)
        .then(res => {
            console.log(res);
            document.getElementById('resp_text').innerText 
                = JSON.stringify(res);
        })
        .catch(er => {
            console.log(er)
            document.getElementById('resp_text').innerText 
            = JSON.stringify(er);
        })

}

async function fetch_res(jwt) {
    if(!jwt) return fetch_res_no_jwt();

    const options = {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + jwt
        }
    };

    return new Promise((resolve, reject) => {
    
        fetch('http://localhost:8181/test', options)
        .then(async response => {
            const data = await response.json();

            // check for error response
            if (!response.ok) {
                // get error message from body or default to response status
                const status = response.status;
                const message = data.reason;
                reject({status, message});
            }

            resolve(data);
        })
        .catch(er => {
            reject(er);
        })
    })
}

async function fetch_res_no_jwt() {

    const options = {
        method: "POST",
    };

    return new Promise((resolve, reject) => {
    
        fetch('http://localhost:8181/test', options)
        .then(async response => {
            const data = await response.json();

            // check for error response
            if (!response.ok) {
                // get error message from body or default to response status
                const status = response.status;
                const message = data.reason;
                reject({status, message});
            }

            resolve(data);
        })
        .catch(er => {
            reject(er);
        })
    })
}