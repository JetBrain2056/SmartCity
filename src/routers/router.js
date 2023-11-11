const Router = require('express');
const router = new Router();
const controller = require('../controllers/controller.js');

//Get index data  
router.get('/', controller.Auth);

//Post index data  
router.post('/', controller.Signin);

//Post index data    
router.post('/lang', controller.Lang);

router.get('/users', controller.getUsers);
router.post('/getone', controller.getOne);
router.post('/createuser', controller.createUser);
router.post('/updateuser', controller.updateUser);
router.post('/deluser', controller.deleteUser);

router.get('/roles', controller.getRoles);
router.post('/createrole', controller.createRole);
router.post('/delrole', controller.deleteRole);

router.post('/addnode',controller.AddNode)
router.post('/delnode',controller.DeleteNode)
router.post('/updatenode',controller.UpdateNode)
router.post('/modnode',controller.ModNode)
router.get('/getnodes',controller.GetNodes)

router.post('/addedge',controller.AddEdge)
router.post('/deledge',controller.DeleteEdge)
router.get('/getedges',controller.GetEdges)
router.post('/modedge',controller.ModEdge)
router.post('/editedge',controller.EditEdge)

router.get('/getobjects',controller.GetObjects)
router.get('/getunits',controller.GetUnits)

router.post('/upload', controller.upload);
router.post('/config', controller.getConfig);
router.post('/createconf', controller.createConfig);
router.post('/delconf', controller.deleteConfig);

router.post('/getdata', controller.getData);

module.exports = { router }                                                  