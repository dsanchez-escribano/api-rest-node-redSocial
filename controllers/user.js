//Importar dependencias
const { normalizeUnits } = require("moment/moment");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const user = require("../models/user");
const jwt = require("../services/jwt");
const mongoosePagination = require("mongoose-pagination");


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
        .select({ password: 0, role: 0 }) //para no seleccionar la contraseña ni el rol
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

const list = async (req, res) =>{
    //Controlar la pagina
    let page = 1;
    if(req.params.page){
        page = req.params.page;
    }
    page = parseInt(page);
    
    //Consulta a mongoose pagination
    let itemsPerPage = 5;

    let totalUsers = await User.countDocuments({}).exec();

    let userList = await User.find().sort('_id').paginate(page, itemsPerPage)
    .select({ password: 0, role: 0 }) //para no seleccionar la contraseña ni el rol
    .exec()
    if (!userList){
        return res.status(500).send({
            status: "error",
            message: "Hubo un error en la busqueda"
        })
    }

    //Devolver resultado
    return res.status(200).send({
        status: "Success",
        message: userList,
        itemsPerPage,
        page,
        totalUsers,
        pages: Math.ceil(totalUsers/itemsPerPage)
    })
}

const update = async (req, res) => {
 
    // Recoger info de usuario actualizar
    let userIdentity = req.user;    //para poder sacar la info del usuario cuando la necesite
    let userToUpdate = req.body;
 
    // Eliminar campos sobrantes
    delete userToUpdate.iat;
    delete userToUpdate.exp;
    delete userToUpdate.role;
    delete userToUpdate.image;
 
 
    // Comprobar si el usuario existe
    try {
        const duplicated_user = await User.find({
            $or: [
                { email: userToUpdate.email.toLowerCase() },
                { nick: userToUpdate.nick.toLowerCase() }
            ]
        }).exec();
         
        if (duplicated_user && duplicated_user.length > 0) {
            // Verificar si hay algún usuario que no sea el actual
            const isDuplicate = duplicated_user.some(user => user._id != userIdentity.id);
         
            if (isDuplicate) {
                return res.status(200).send({
                    status: "error",
                    message: "Hay un usuario que esta usando ese nick o email"
                });
            }
        }  
        
    
        // Cifrar contraseña
        if (userToUpdate.password) {
            let pwd = await bcrypt.hash(userToUpdate.password, 10);
            userToUpdate.password = pwd;
        }
        
        // Buscar y actualizar
        let userUpdated = await User.findByIdAndUpdate(userIdentity.id, userToUpdate, {new:true})
    
        // Devolver resultado
        return res.status(200).send({
            status: "success",
            message: "Metodo de actualizar usuarios",
            userUpdated
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al actualizar usuarios"
        });
    }
 
};
//Exportaciones
module.exports = {
    pruebaUser,
    register,
    login,
    profile,
    list,
    update
}