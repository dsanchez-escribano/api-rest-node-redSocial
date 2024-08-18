//Acciones de prueba
const pruebaFollow = (req, res) => {
    return res.status(200).send({
        message: "mensaje del controller follow"
    })
} 

//Exportaciones
module.exports = {
    pruebaFollow
}