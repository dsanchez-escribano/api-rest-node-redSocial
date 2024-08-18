//Importar dependencias
const {conection} = require("./database/conection");
const express = require("express");
const cors = require("cors");

//Mensaje de arrancado
console.log("Arrancando el servidor de red social...");

//Conexion a BD
conection();
//Crear servidor Node
const app = express();
const puerto = 3900;

//Configurar Cors
app.use(cors());

// Convertir peticiones body a objetos js
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Cargar conf rutas
const UserRoutes = require("./routes/user");
const PublicationRoutes = require("./routes/publication");
const FollowRoutes = require("./routes/follow");

app.use("/api/user", UserRoutes);
app.use("/api/publication", PublicationRoutes);
app.use("/api/follow", FollowRoutes);

//ruta de prueba
app.get("/ruta-prueba", (req, res) => {
    return res.status(200).json(
       { 
        "mensaje": "Ruta de prueba"
        }
    );
})

// Servidor escuchando peticiones
app.listen(puerto,()=>{

    console.log(`Servidor escuchando en el puerto ${puerto}`);
    
})