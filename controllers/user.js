//Importar dependencias
const { normalizeUnits } = require("moment/moment");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const user = require("../models/user");
const jwt = require("../services/jwt");


//Acciones de prueba
const pruebaUser = (req, res) => {
    return res.status(200).send({
        message: "mensaje del controller user",
        usuario: req.user
    })
} 

// Registro de usuario
const register = async (req, res) => {
    // Recoger datos de la petición
    let params = req.body;

    // Comprobar que los datos lleguen correctamente (+validación)
    if (!params.name || !params.surname || !params.email || !params.password || !params.nick) {
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar"
        });
    }

    try {
        // Control de usuarios duplicados
        const userExists = await User.find({
            $or: [
                { email: params.email.toLowerCase() },
                { nick: params.nick.toLowerCase() }
            ]
        }).exec();

        if (userExists && userExists.length >= 1) {
            return res.status(200).json({
                status: "success",
                message: "El usuario ya existe"
            });
        }

        // Cifrar la contraseña
        let pwd = await bcrypt.hash(params.password, 10);
        params.password = pwd;

        // Crear objeto de usuario
        let user_to_save = new User(params);

        // Guardar usuario en la base de datos
        let userStored = await user_to_save.save();

        return res.status(200).json({
            status: "success",
            message: "Usuario guardado correctamente!!",
            user: {
                id: userStored._id,
                name: userStored.name,
                surname: userStored.surname,
                nick: userStored.nick,
                email: userStored.email,
                role: userStored.role,
                image: userStored.image
            }
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error en la consulta de usuarios",
            error: error.message
        });
    }
}


const login = async (req, res) => {
    // Recoger parámetros del body
    let params = req.body;

    // Comprobar si llegan el email y la contraseña
    if (!params.email || !params.password) {
        return res.status(400).send({
            status: "error",
            message: "Faltan datos por enviar"
        });
    }

    try {
        // Buscar si existe en la base de datos
        let searched_user = await User.findOne({ email: params.email }).exec();

        if (!searched_user) {
            return res.status(404).send({
                status: "error",
                message: "El usuario no existe"
            });
        }

        // Comprobar la contraseña
        const pwd = bcrypt.compareSync(params.password, searched_user.password);
        if (!pwd) {
            return res.status(400).send({
                status: "error",
                message: "La contraseña no es correcta"
            });
        }

        // Si la contraseña es correcta, generar token
        const token = jwt.createToken(searched_user);

        if (!token) {
            return res.status(500).send({
                status: "error",
                message: "Error al generar el token"
            });
        }

        // Eliminar la contraseña del objeto usuario antes de enviarlo
        searched_user.password = undefined;

        // Devolver los datos del usuario y el token
        return res.status(200).json({
            status: "success",
            message: "Identificado correctamente",
            user: {
                name: searched_user.name,
                nick: searched_user.nick,
                id: searched_user._id,
                email: searched_user.email,
                role: searched_user.role,
                image: searched_user.image
            },
            token
        });

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error en el proceso de login",
            error: error.message
        });
    }
}

const profile = async (req, res) =>{
    //recibir el parametro del id de usuario por url
    const id = req.params.id;
    //Consulta para datos de usuario
    let userProfile = await User.findById(id)
        .select({ password: 0, role: 0 })
        .exec()
    if (!userProfile) {
        return res.status(404).send({
            status: "error",
            message: "El usuario no existe o hubo un error"
        })
    }
    

    
    //Devolver resultado
    return res.status(200).send({
        status: "Success",
        user: userProfile
    })
}

//Exportaciones
module.exports = {
    pruebaUser,
    register,
    login,
    profile
}