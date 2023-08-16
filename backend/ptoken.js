import jwt from "jsonwebtoken";
import crypto from "crypto";

const jwt_secret = "demosecretdemosecret";

export function new_token() {
    
    const uuid = crypto.randomUUID();
    return [ jwt.sign({uuid}, jwt_secret), uuid ]
}

export function verify_token(token) {
    try {
        return jwt.verify(token, jwt_secret)
    }
    catch(er) {
        console.log(er)
        return undefined;
    }
}