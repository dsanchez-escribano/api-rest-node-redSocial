const jwt = require("jwt-simple");
const moment = require("moment");

//Clave secreta
const secret = "clave";

//Funcion que genera el token
const createToken = (user) => {
    const payload = {
        id: user._id,
        name: user.name,
        surname: user.surname,
        bio: user.bio,
        nick: user.nick,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, "days").unix
    };
    return jwt.encode(payload, secret);

}

module.exports = {
    secret,
    createToken
}