import bodyParser from "body-parser";
import express from "express";

const app = express();
const port = 8100;

app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(express.static('public'))

app.get('/', (req, res) => {
    console.log("GET /")
    res.render('index.pug', {
        title: 'Index Page'
    })
})

//app.post('/', async (req, res) => {
//    console.log("POST /")
//
//    const r = await fetch_session()
//    res.status(200).send(r);
//})

//async function test_session(t) {
//
//    const response = await fetch("http://localhost:8181/" + t, {
//        method: "POST",
//        credentials: 'include',
//    })
//    const json = await response.json();
//    return json;
//}

///async function fetch_session() {
///
///    const response = await fetch("http://localhost:8181/session/new", {
///        method: "POST",
///        credentials: 'include',
///    })
///    const json = await response.json();
///    return json;
///}


app.get("/oauth_login_callback", async (req, res)=> {
    console.log("GET /oauth_login_callback")
    console.log(req.query)

    // something can be rendered here, like a logo
    res.render('login_callback.pug', {
        title: "Login Callback",
        queries: req.query
    })
})

app.get('/logout_callback', (req, res) => {
    console.log("GET /")
    
    res.render('logout_callback.pug', {
        title: 'Logout Callback'
    })
})

app.get('/main', (req, res) => {
    console.log("GET /")
    
    res.render('main.pug', {
        title: 'Main Page'
    })
})

//app.post("/oauth_login_callback", async (req, res) => {
//    console.log("POST /oauth_login_callback")
//    // called when login is called
//    // will send a POST request to the backend server
//    console.log(req.body)
//    const r = await upgrade_session(req.body);
//    res.status(200).send(r)
//})

app.listen(port, () => {
    console.log(`Frontend app listening on port ${port}`)
})