//Importar modelo
const Follow = require("../models/follow");
const User = require("../models/user");
const mongoosePaginate = require("mongoose-pagination");
const followService = require("../services/followUsersId")


//Acciones de prueba
const pruebaFollow = (req, res) => {
    return res.status(200).send({
        message: "mensaje del controller follow"
    })
} 
//Accion guardar un follow (seguir)
const save = async (req = request, res = response) => {
    // Obtener usuario a seguir
    const followed = req.body.followed;
   
    // obtener datos de usuario que sigue
    const user = req.user.id;
   
    try {
      // Verificando si ya se sigue al usuario
      const validarFollow = await Follow.find({ user, followed });
   
      if (validarFollow.length > 0)
        return res.status(400).json({
          status: "error",
          msg: `Bad Request | Ya se sigue al usuario ${followed}`,
        });
   
      // crear el objeto que se va a guardar con el modelo
      const seguimiento = {
        followed,
        user,
      };
   
      // Preparando instancia del modelo
      const follows = new Follow(seguimiento);
   
      // guardando en DDBB
      await follows.save();
   
      res.json({
        status: "success",
        msg: "Accion de salvar follow",
        identity: req.user,
        follows,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "error",
        msg: "Ha ocurrido un error en el guardado",
      });
    }
  };

//Borrar un follow
const unfollow = async (req, res)=>{
    //recoger el id del usuario identificado
    const userId = req.user.id;
    //recoger el id del usuario que sigo y quiero dejar de seguir
    const followedId = req.params.id;
    //find de las coincidencias y hacer un remove
    try {
        let unFollowUser = await Follow.find({
            "user": userId,
            "followed":followedId
        }).deleteOne()
        return res.status(200).send({
            status:"successs",
            message:"Follow eliminado correctamente",
            unFollowUser
        });
    } catch (error) {
        if (error || !followDeleted) {
            return res.status(500).send({
                status:"error",
                message:"no has dejado de seguir a nadie"
            })
        }
    }
}
//Accion listado de follows de un usuario
const following = (req, res) => {
    // Get user ID from the request object or URL params
    let userID = req.user.id;
    if (req.params.id) userID = req.params.id;

    // Pagination setup
    let page = req.params.page ? parseInt(req.params.page) : 1;
    const itemsPerPage = 5;

    // Fetch following users
    Follow.find({ user: userID })
        .populate("followed", "-password -role -__v") // Populate followed user info
        .skip((page - 1) * itemsPerPage) // Skip for pagination
        .limit(itemsPerPage) // Limit number of items per page
        .then(async (follows) => {
            let followUserId = await followService.followUsersId(req.user.id);
            res.status(200).send({
                status: "success",
                page,
                follows,
                user_following: followUserId.following,
                user_follow_me: followUserId.followers
            });
        })
        .catch((err) => {
            res.status(500).send({
                status: "error",
                message: "Error al obtener los follows",
                error: err
            });
        });
};


//Accion listado de usuarios q te siguen
const followers = (req, res) => {
    let userID = req.user.id;
    if (req.params.id) userID = req.params.id;

    // Pagination setup
    let page = req.params.page ? parseInt(req.params.page) : 1;
    const itemsPerPage = 5;

    Follow.find({ followed: userID })
        .populate("user followed", "-password -role -__v") // Populate followed user info
        .skip((page - 1) * itemsPerPage) // Skip for pagination
        .limit(itemsPerPage) // Limit number of items per page
        .then(async (follows) => {
            let followUserId = await followService.followUsersId(req.user.id);
            res.status(200).send({
                status: "success",
                page,
                follows,
                user_following: followUserId.following,
                user_follow_me: followUserId.followers
            });
        })
        .catch((err) => {
            res.status(500).send({
                status: "error",
                message: "Error al obtener los follows",
                error: err
            });
        });
}

//Exportaciones
module.exports = {
    pruebaFollow,
    save,
    unfollow,
    following,
    followers,

}