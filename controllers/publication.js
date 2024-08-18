//Acciones de prueba
const pruebaPublication = (req, res) => {
    return res.status(200).send({
        message: "mensaje del controller publication"
    })
} 

//Exportaciones
module.exports = {
    pruebaPublication}