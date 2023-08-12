// DEMO IMPLEMENTATION. DO NOT USE IN PRODUCTION

import express from 'express';
import bodyParser from 'body-parser';
import { exchange_code, get_login_redirection_info, get_logout_redirection_info, refresh_tokens, revoke_token } from './oauth.js';
import cors from 'cors';
import session from 'express-session';
import createMemoryStore from "memorystore";
import { TokenSet } from 'openid-client';

const app = express()
const port = 8181

const mstore = createMemoryStore(session)

app.use(cors({
    origin: 'http://localhost:8100',
    //methods: ["POST", "GET"],
    credentials: true
}))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// in production, use app.set("trust proxy",1) 
// and cookie.secure == "auto"
app.use(session({
    secret: "demosecretdemosecret",
    name: "demo",
    resave: false,
    saveUninitialized:false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax'
    },
    store: new mstore()
}));

// REQUEST SESSION URI

app.post("/session/new", async (req, res) => {

    console.log("POST on /session/new")
    console.log(req.session.tokenSet);

    if(req.session.tokenSet) {
        
        const tokenSet = new TokenSet(req.session.tokenSet);

        if(tokenSet.expired()) {
            
            const resp = await try_refresh_session(req, res);
            req.session.tokenSet = resp; // may be undefined but it is desired
            
            if(resp == 1) return res.status(200).send({
                redirect_required: false
            })            
        }
        else {
            // session is valid
            return res.status(200).send({
                redirect_required: false
            });
        }
    }

    const [red_uri, state, ch_ver ] = get_login_redirection_info()

    req.session.ch_ver = ch_ver;
    req.session.state = state;

    return res.status(200).send({
        redirect_required: true,
        redirect_to: red_uri
    })
})

async function try_refresh_session(req, res) {
    console.log("Try Refresh tokenSet")
    const new_tokenSet = await refresh_tokens(req.session.tokenSet);

    if(new_tokenSet == undefined) {
        console.log("Could not refresh tokenSet")
        return undefined;
    }    
    
    console.log("Tokens Refreshed");
    return new_tokenSet;
}

app.post("/session/upgrade", async (req, res) => {

    console.log("POST on /session/upgrade");

    if(req.session.ch_ver && req.session.state 
        && req.body && req.body.code && req.body.scope 
            && req.body.state && req.body.state == req.session.state) {
        
        const tokenSet = await exchange_code(req.body.code, 
            req.session.ch_ver, req.session.state )
        
        const id_claims = tokenSet.claims();

        req.session.tokenSet = tokenSet;
        req.session.sub = id_claims.sub;

        return res.send({state: "success"})
    }

    return res.status(400).send({state: "error", reason: "Invalid Body"});

})

app.get("/protected_item", async (req, res) => {

    console.log("GET /protected_item")

    if(req.session.sub && req.session.tokenSet) {

        const tokenSet = new TokenSet(req.session.tokenSet);

        if(tokenSet.expired()) {
            // refresh 
            const resp = await try_refresh_session(req, res);
            req.session.tokenSet = resp; // may be undefined but it is desired
            if(resp == undefined) return res.status(404).send({state: "Expired Session"})
        }
        
        return res.send({sub: req.session.sub});
    }

    return res.status(404).send({state: "No Active Session"});
})

app.post("/session/clear", async (req, res) => {

    console.log("POST on /session/clear");

    req.session.destroy(function(err) {
        console.log(err)
        console.log("Cleared Session")
    })
    
    return res.status(200).send({status: "success"});
})

app.post("/test_session", (req, res) => {

    req.session.counter++;
    console.log("F1 " + req.session.counter)
    return res.send({status: "1"});
})

//app.post("/test_session/2", (req, res) => {
//
//    req.session.counter++;
//    console.log("F2 " + req.session.counter)
//    return res.send({status: "2"});
//})

app.listen(port, () => {
    console.log(`Backend app listening on port ${port}`)
})
  