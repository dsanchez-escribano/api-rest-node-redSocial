const mongoose = require("mongoose");
const conection = async() => {

    try {
        await mongoose.connect("mongodb://localhost:27017/mi_redsocial");

        console.log("conectado correctamente a BD: mi_redsocial");
    }
    catch (error) {
        console.log(error);
        throw new Error("Error al conectar a la base de datos");
    }

}

module.exports = {
    conection
}