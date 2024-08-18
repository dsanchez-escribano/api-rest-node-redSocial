const jwt = require("jwt-simple");
const moment = require("moment");

const libjwt = require("../services/jwt");
const secret = libjwt.secret;


//MIDDLEWARE DE AUTENTIFICACION
exports.auth = (req, res, next) => {
    //Comprobar auth
    if (!req.headers.authorization) {
        return res.status(403).send({
            status:"error",
            message: "No tienes autorización"
            });
        }
    //Decodificar el token
    let token = req.headers.authorization.replace(/['"]+/g,'');

    try{
        let payload = jwt.decode(token, secret);
        if(payload.exp <= moment().unix()){
            return res.status(401).send({
                status:"error",
                message: "El token ha expirado"
                });
            }
        req.user = payload;

    }catch(error){
        return res.status(404).send({
            status:"error",
            message: "El token no es válido",
            error
            });
    }


    next();
}