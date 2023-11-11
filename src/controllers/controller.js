const { User, Role, Config, Nodes, Edges}    = require('../models/models.js');
const { content, Lang } = require('../index.js');
const bcrypt            = require('bcrypt');
const { Op, Sequelize, QueryTypes} = require("sequelize");
const sequelize         = require('../db');
//const jwt            = require('jsonwebtoken');

// const generateJwt = (id, login, role) => {
//     return jwt.sign(
//         {id, login, role},
//         process.env.SECRET_KEY,
//         {expiresIn: '24h'}
//     )
// }

// exports.check = (req, res, next) => {
//     const token = generateJwt(req.user.id, req.user.login, req.user.role)
//     return res.json({token})
// }

async function hashPassword(password, saltRounds = 10) {
    try {
        // Generate a salt
        const salt =  await bcrypt.genSalt(saltRounds)

        // Hash password
        const hash =  await bcrypt.hash(password, salt)
        console.log('hash: ', hash)
        return hash;
    } catch(err) {
        console.log(err);
    }
}
exports.Lang = function(req,res) {
    if (!req.body) return res.sendStatus(400);
    const {lang} = req.body;
    //Lang = 'rus';
}
exports.Auth = function(req,res) {
    content.logged = false;
    res.render('index.twig', content);
}
exports.Signin = async function(req,res,next) {

    if (!req.body) return res.sendStatus(400);

    console.log('body: ', req.body);

    const username = req.body.username;
    const password = req.body.password;

    const result    = await User.count();
    const roleCount = await Role.count();
    console.log('User count: ', result);

    if (result === 0) { 
        if (roleCount === 0) {
            await Role.create({Name: 'Administrator'}); 
        }
        if (!username) {
            content.logged    = true;            
            content.username  = '';
            content.firstname = '';
            await res.render('index.twig', content);     
        } else {       
            content.logged = false; 
        }
        
    } else {
        content.logged = false;
    }

    if (!username) {
        content.logged = false;
        res.render('index.twig', content);
    } else {
        const Users = await User.findOne({where: {Name: username}})
        if (!Users) {
            content.logged = false;
            console.log(Users);
            res.render('index.twig', content);
        } else {
            if (username === Users.Name) {
                console.log('true user name : ', Users.Name);
                if (Users.Password && Users.Password) {
                    console.log('user password: ', password);
                    console.log('hash password: ', Users.Password);
                    const comparePassword = await bcrypt.compare(password, Users.Password)
                    console.log(comparePassword)
                    if (!comparePassword) {
                        content.logged = false;
                        console.log('Wrong password!');
                    } else {
                        content.logged    = true;
                        content.username  = Users.Name;
                        content.firstname = Users.Descr;
                        console.log('Good password!');
                    }
                    res.render('index.twig', content);
                } else {
                    content.logged    = true;
                    content.username  = Users.Name;
                    content.firstname = Users.Descr;
                    console.log('Empty password');
                    res.render('index.twig', content);
                }
            } else {
                content.logged = false;
            }
        }
    }
}
exports.getUsers = async function(req, res, next) {
    try {
        // const data = await User.findAll({raw:true})
        // await res.send(data);
        const data = await sequelize.query(
            'SELECT "Users"."id", "Users"."Name", "Users"."Descr", "Users"."EAuth", "Users"."Show", "Users"."Password", "Users"."email", "Users"."AdmRole", "Users"."RoleId", "N"."Name" as "Role" '
            +'FROM "Users"'
            +'LEFT JOIN "Roles" as "N"'
            +'on "Users"."RoleId" = "N"."id";'
        );
        await res.send(data[0]); 
        next();
    } catch(err) {
        console.log(err);
    }
}
exports.getOne = async function(req, res, next) {

    if (!req.body) return res.sendStatus(400);

    // console.log(req);

    const {id} = req.body;
    try {
        // const data = await User.findAll({raw:true})
        // await res.send(data);
        const data = await sequelize.query(
            'SELECT "Users"."id", "Users"."Name", "Users"."Descr", "Users"."EAuth", "Users"."Show", "Users"."Password", "Users"."email", "Users"."AdmRole", "Users"."RoleId", "N"."id" as "RoleId", "N"."Name" as "Role" '
            +'FROM "Users"'
            +'LEFT JOIN "Roles" as "N"'
            +'on "Users"."RoleId" = "N"."id"'
            +'where "Users"."id" = '+ id +';'
        );
        return await res.send(data[0]); 
        next();
    } catch(err) {
        console.log(err);
    }
}
exports.createUser = async function(req, res) {
    console.log('>>CreateUser...');

    if (!req.body) return res.sendStatus(400);
    console.log(req.body);
    const {Name, Descr, Password, RoleId, EAuth, Show} = req.body;

    const hash = await hashPassword(Password,10);

    try {                
        const result = await User.count();
        console.log('User count: ',result);
        if (result === 0) {            
            await User.create({
                Name    : Name,
                Descr   : Descr,
                Password : hash,
                RoleId  : 1,
                EAuth   : true,
                Show    : true,
                AdmRole : true
            });
        } else {
            try {
                const user = await User.create({
                    Name    : Name,
                    Descr   : Descr,
                    Password : hash,
                    RoleId  : RoleId,
                    EAuth   : EAuth,
                    Show    : Show,
                    AdmRole : false
                })
                console.log(user);
                return await res.json("Success");
            } catch(err) {
                console.log(err);
            }
        }
    } catch (err){
        console.log(err);
    }
}
exports.updateUser = async function(req, res, next) {
    console.log('>>Update...');
    
    if (!req.body) return res.sendStatus(400);     

    let { id, Name, Descr, email, Password, EAuth, Show, RoleId}  = req.body;  

    const hash = await hashPassword(Password,10);

    try {
        const data = await User.update({ 
            Name     : Name, 
            Descr    : Descr,
            email    : email,
            Password : hash,
            EAuth    : EAuth,
            Show     : Show,
            RoleId   : RoleId
        }, {
            where: {id: id}
        })
        // console.log(data);
        return await res.json(data); 
    } catch(err) {
        console.log(err); 
    }   
}
exports.deleteUser = async function(req, res) {
    console.log('>>deleteUser...');
    try {
        if (!req.body) return res.sendStatus(400);

        const {id} = req.body;
        const data = await User.destroy({where: {id: id, AdmRole: false}});

        return await res.json(data);
    } catch(err) {
        console.log(err);
    }
}
exports.getRoles = async function(req, res, next) {
    try {
        const data = await Role.findAll({raw:true})
        await res.send(data);
        next();
    } catch(err) {
        console.log(err);
    }
}
exports.createRole = async function(req, res) {
    console.log('>>CreateRole...');

    if (!req.body) return res.sendStatus(400);
    const { Name } = req.body;
    
    try {                     
        let data =           
            await Role.create({
                Name    : Name 
            });

        return await res.json(data);   
    } catch (err){
        console.log(err);
    }
}
exports.deleteRole = async function(req, res) {
    console.log('>>deleteRole...');
    try {
        if (!req.body) return res.sendStatus(400);

        const {id} = req.body;
        const data = await Role.destroy({where: {id: id}});

        return await res.json(data);
    } catch(err) {
        console.log(err);
    }
}

///////////////////////////////////////////////////////////////
exports.AddNode = async (req, res) => {
    console.log('AddNode', req.body);
    
    if (!req.body) return res.sendStatus(400);     

    let { name, parent, lat, lon, classes, descr }  = req.body;  

    let id = 0;
    try {
        id = await Nodes.max('id')                 
    } catch(err) {
        console.log(err); 
    } 

    if (name==='') {
        name = classes.substring(0,1).concat(id+1);
    }
 
    try {
        const data = await Nodes.create({                 
            name     : name, 
            parent   : parent,             
            classes  : classes,
            descr    : descr,
            lat      : lat,
            lon      : lon
        })
        //console.log(data);
        return await res.json(data); 
    } catch(err) {
        console.log(err); 
    }         
} 
exports.DeleteNode = async (req, res) => {   
    console.log('DeleteNode', req.body);

    if (!req.body) return res.sendStatus(400);     

    const { id } = req.body;

    let nodes;
    try {
        nodes = await Nodes.findAll({where: { parent: id }});             
    } catch(err) {
        console.log(err); 
    } 

    let result;
    try {                                   
        result = await Nodes.destroy({where: { [Op.or]: [{ id: id }, { parent: id }] } });                
        console.log(result);
    } catch(err) {
        console.log(err);        
    }

    try {                                     
        await Edges.destroy({where: { [Op.or]: [{ source: id }, { target: id }] } });        
    } catch(err) {
        console.log(err);
    }

    for (let elem of nodes) {
        try {                                     
            await Edges.destroy({where: { [Op.or]: [{ source: elem.id }, { target: elem.id }] } });            
        } catch(err) {
            console.log(err);
        }
    }   

    return await res.json(result);  
} 
exports.UpdateNode = async (req, res) => {
    console.log('UpdateNode', req.body);
    
    if (!req.body) return res.sendStatus(400);     

    let { id, x, y}  = req.body;  

    try {
        const node = await Nodes.update({ 
            x: Math.round(x), 
            y: Math.round(y) 
        }, {
            where: {id: id}
        })
        //console.log(node);
        return await res.json(node); 
    } catch(err) {
        console.log(err); 
    }         
}
exports.ModNode = async (req, res) => {
    console.log('ModNode', req.body);
    
    if (!req.body) return res.sendStatus(400);     

    let { id, kod, parent, name, descr}  = req.body;  

    try {
        const data = await Nodes.update({ 
            kod: kod,
            parent: parent,
            name: name,             
            descr: descr
        }, {
            where: {id: id}
        })
        // console.log(data);
        return await res.json(data); 
    } catch(err) {
        console.log(err); 
    }         
} 
exports.GetNodes = async (req, res, next) => {
    try {
        const nodes = await Nodes.findAll({raw:true})
        await res.send(nodes);       
        next();
    } catch(err) {
        console.log(err); 
    }     
}
///////////////////////////////////////////////////////////////
exports.AddEdge = async (req, res) => {
    console.log('>>AddEdge', req.body);
    
    if (!req.body) return res.sendStatus(400);     

    const {source, target, classes, name, fiber, length, descr} = req.body;  
 
    try {
        const data = await Edges.create({   
            id      : source+'_'+target,               
            source  : source,  
            target  : target,
            classes : classes,
            name    : name,
            fiber   : fiber,
            length  : length,         
            descr   : descr
        })
        //console.log(edge);
        return await res.json(data); 
    } catch(err) {
        console.log(err); 
    }         
} 
exports.DeleteEdge = async (req, res) => {   
    console.log('>>DeleteEdge', req.body);

    if (!req.body) return res.sendStatus(400);     
        
    const {id} = req.body;    

    let data;
    try {         
        // data = await Edges.destroy({where: {source: source_id, target: target_id}});                      
        // data = await Edges.destroy({where: {source: target_id, target: source_id}});                      
        data = await Edges.destroy({where: {id: id}});  
        
        return await res.json(data);  
    } catch(err) {
        console.log(err);
    }
}  
exports.GetEdges = async (req, res, next) => {
    try {
        const data = await Edges.findAll({raw:true})
        await res.send(data);       
        next();
    } catch(err) {
        console.log(err); 
    }     
}
exports.ModEdge = async (req, res) => {
    console.log('ModEdge', req.body);
    
    if (!req.body) return res.sendStatus(400);     

    let { source, target, fiber, length, descr}  = req.body;  

    try {
        const data = await Edges.update({ 
            fiber : fiber, 
            length: length,
            descr : descr
        }, {
            where: {id: source+'_'+target}
        })
        console.log(data);
        return await res.json(data); 
    } catch(err) {
        console.log(err); 
    }         
} 
exports.EditEdge = async (req, res) => {
    console.log('EditEdge', req.body);
    
    if (!req.body) return res.sendStatus(400);     

    let { id, length, descr, fiber, name, source, target, status, signal}  = req.body;  

    if (length==='') { length=0 }
    if (fiber==='') { fiber=0 }

    try {
        const data = await Edges.update({     
            name  : name,
            descr : descr,
            fiber : fiber,
            length: length,
            source: source,
            target: target
        }, {
            where: {id: id}
        })
        console.log(data);
        return await res.json(data); 
    } catch(err) {
        console.log(err); 
    }         
} 
///////////////////////////////////////////////////////////////
exports.GetObjects = async (req, res, next) => { 

    try {        
        const data = await Nodes.findAll({where: { classes: 'building' } })
        await res.send(data);       
        next();
    } catch(err) {
        console.log(err); 
    }     
}
exports.GetUnits = async (req, res, next) => { 

    try {        
        // const data = await Nodes.findAll({where: { classes: 'unit' } })
        // await res.send(data);       
        const data = await sequelize.query(
            'SELECT "Nodes"."id",  "Nodes"."kod", "Nodes"."name", "Nodes"."classes", "Nodes"."descr", "N"."name" as "parent", "Nodes"."parent" as "parentid"'
            +'FROM "Nodes"'
            +'LEFT JOIN "Nodes" as "N"'
            +'on "Nodes"."parent" = "N"."id" where "Nodes"."classes" = '+"'unit'"+';'
        );
        await res.send(data[0]); 
        next();
    } catch(err) {
        console.log(err); 
    }     
}
///////////////////////////////////////////////////////////////  
exports.upload = async function(req, res) {
    console.log('>>upload...');

    if (!req.body) return res.sendStatus(400);
    console.log(req.body);
    const data = req.body.data;    
    // console.log(data);       
    // console.log(JSON.stringify(data));  
    if (data === null) {
        return await res.json("Error data!"); 
    }
    
    try {
        const result = await Config.create({
            data    : JSON.stringify(data)
        })
        console.log(result);
        return await res.json("Success!");
    } catch(err) {        
        console.log(err);
        return await res.json("Error!");
    }            
}
exports.getConfig = async function(req, res, next) {

    if (!req.body) return res.sendStatus(400);     
    let { startId, endId }  = req.body;  

    let N = 0; 
    try {
        N = await Config.max('id')
        await res.send(data);
        next();
    } catch(err) {
        console.log(err);
    }

     if (startId===undefined||endId===undefined) {
        if (N > 500) {
            startId = N-500;
        } else {
            startId = 1;
        }
        endId   = N;     
     }

    try {
        const data = await Config.findAll(
            {where: { id: {[Op.between]: [startId, endId]} }},
            {order: [['createdAt', 'ASC']]}
            )
        await res.send(data);
        next();
    } catch(err) {
        console.log(err);
    }
}
exports.createConfig = async function(req, res) {
    console.log('>>createConfig...');

    if (!req.body) return res.sendStatus(400);
    const { data } = req.body;
    
    try {                     
        let result =           
            await Config.create({
                data    : data
            });

        return await res.json(result);   
    } catch (err){
        console.log(err);
    }
}
exports.deleteConfig = async function(req, res) {
    console.log('>>deleteConfig...');
    try {
        if (!req.body) return res.sendStatus(400);

        const {id} = req.body;
        const data = await Config.destroy({where: {id: id}});

        return await res.json(data);
    } catch(err) {
        console.log(err);
    }
}

exports.getData = async function(req, res, next) {

    if (!req.body) return res.sendStatus(400);     
    let { startTime, endTime }  = req.body;  

    try {
        const data = await Config.findAll(
            {where: { createdAt: {[Op.between]: [startTime, endTime]} }},            
            {order: [['id', 'ASC']]}
        )
        await res.send(data);
        next();
    } catch(err) {
        console.log(err);
    }
}