// DEMO IMPLEMENTATION. DO NOT USE IN PRODUCTION

import express from 'express';
import bodyParser from 'body-parser';
import { exchange_code, get_login_redirection_info, get_logout_redirection_info, refresh_tokens, revoke_token } from './oauth.js';
import cors from 'cors';
import { new_token, verify_token } from './ptoken.js';
import { get_entry, new_entry, patch_entry, patch_tokenSet, remove_entry } from './db.js';
//import session from 'express-session';
//import memorystore from "memorystore";

const app = express()
const port = 8181

//const mstore = memorystore(session)

app.use(cors({
    //origin: 'http://localhost:8100',
    methods: ["POST", "GET"],
    //credentials: true
}))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// in production, use app.set("trust proxy",1) 
// and cookie.secure == "auto"
//app.use(session({
//    secret: "demosecretdemosecret",
//    cookie: { 
//        maxAge: 86400000,
//        secure: false,
//        sameSite: 'lax'
//    },
//    store: new mstore({
//        checkPeriod: 86400000
//    }),
//    saveUninitialized:false,
//    resave: false
//}));

// REQUEST SESSION URI

app.post('/session/new', async (req, res) => {
    console.log("POST /session/new")

    let entry_info = {}

    // client may have issued tokens, try to refresh them
    if(req.headers.authorization) {
        // case token exists
        const jwt = req.headers.authorization.split(' ')[1];
        const payload = verify_token(jwt);
        entry_info = get_entry(payload.uuid);
        
    }

    if(entry_info && entry_info.status == "tokens" && entry_info.tokenSet) {

        let r_f = false;
        if(entry_info.tokenSet.expired()) {
            console.log("-- try refresh")
            try {
                const new_tokenSet = refresh_tokens(entry_info.tokenSet);
                patch_tokenSet(entry_info.uuid, new_tokenSet)
                console.log("refreshed")
            }
            catch(er) {
                console.log("refresh tokens expired")
                r_f = true;
            }
        }
        if(!r_f) {
            return res.status(200).send({
                redirect_required: false,
                token_valid: true            
            })    
        }
    }

    const [uri, state, code_verifier] = get_login_redirection_info();
    const [token, uuid] = new_token(); // create new jwt to hold uuid
    new_entry(uuid, code_verifier, state); // save uuid info in db

    return res.status(200).send({
        redirect_required: true,
        redirect_to: uri,
        state: state,
        platform_token: token
    })    
    
})

app.post("/session/upgrade", async (req, res) => {
    console.log("POST /session/upgrade")
    //if(req.session.tokenSet) {
    //    
    //}

    if(!req.headers.authorization) {
        return res.status(400).send({reason: "No platform token"});
    }

    
    const jwt = req.headers.authorization.split(' ')[1];
    const jwt_payload = verify_token(jwt);
    const entry_info = get_entry(jwt_payload.uuid);
    
    // check if entry_info is in redirect state
    if(entry_info && entry_info.status == "tokens") {
        return res.status(200).send({
            status: "success"
        })
    }

    const state = entry_info.state;
    const code_verifier = entry_info.code_verifier;

    const body = req.body;
    console.log(body);

    if(!body && !body.code && !body.scope && !body.state) {
        return res.status(400).send({reason: "Invalid Body"})
    }
    if(body.state != state) {
        return res.status(400).send({reason: "State Missmatch"})
    }

    const tokenSet = await exchange_code(
        code_verifier,
        body.code,
        state
    );

    //console.log(tokenSet)
    const claims = tokenSet.claims()
    patch_entry(jwt_payload.uuid, tokenSet, claims.sub);

    return res.send({status: "success"});

    //const tokenSet = 
})

app.post("/session/end", async (req, res) => {

    if(!req.headers.authorization) {
        return res.status(400).send({reason: "No platform token"});
    }

    const jwt = req.headers.authorization.split(' ')[1];
    const jwt_payload = verify_token(jwt);
    const entry_info = get_entry(jwt_payload.uuid);
    
    if(entry_info.status != "tokens") {
        return res.status(400).send({reason: "Not Logged In"});
    }
    
    remove_entry(entry_info.uuid);
    res.send({
        redirect_required: false, 
        invalidate_token: true
    });

})

app.post("/test", async (req, res) => {

    if(!req.headers.authorization) {
        res.status(404).send({reason: "No Platform Token in Authorization Header"})
    }

    const jwt = req.headers.authorization.split(' ')[1]
    const payload = verify_token(jwt)

    if(!payload) {
        //next()
        return res.status(400).send({
            reason: "Invalid Platform Token in Authorization Header", 
            ins: {
                invalidate_token: true,
                redirect_required: true,
                redirect_to: "http://localhost:8100/" // login page
            }
        }) 
    }

    const entry_info = get_entry(payload.uuid);
    console.log(entry_info)
    if(!entry_info || !entry_info.tokenSet) {
        return res.status(400).send({
            reason: "Invalid Session", 
            ins: {
                invalidate_token: true,
                redirect_required: true,
                redirect_to: "http://localhost:8100/" // login page
            }
        })      
    }

    if(entry_info.tokenSet.expired()) {
        return res.status(404).send({
            reason: "Expired Session", 
            ins: {
                invalidate_token: true,
                redirect_required: true,
                redirect_to: "http://localhost:8100/" // login page
            }
        }) 
    }


    return res.status(200).send({bar: "baz"})
})

app.listen(port, () => {
    console.log(`Backend app listening on port ${port}`)
})
  