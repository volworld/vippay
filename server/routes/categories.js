var CategoryController = require('../controllers/Category')
var express = require('express');
var router = express.Router();


router.get('/category/:id', function(req, res){
    console.log(req.params.id)
    CategoryController.getCurrentCategories(req.params.id).then(function(category){
        res.send(category)
    }).catch(function(err){
        res.status(400).send(err.errors)
    })

});

router.get('/category', function(req, res){

    CategoryController.getAllCategories({}).then(function(categories){
        res.send(categories)
    }).catch(function(err){
        res.status(400).send(err.errors)
    })

});


router.put('/category', function(req, res){

    Object.keys(req.body).map((k) => {
        if(req.body[k] === '') req.body[k] = null
    })

    CategoryController.newCategory({
        name: req.body.category.name,
        user_id: req.user.id.id
    }).then(function(category){
        res.send(category)
    }).catch(function(err){
        res.status(400).send(err.errors)
    })

});

router.post('/category/:id', function(req, res) {

    Object.keys(req.body).map((k) => {
        if (req.body[k] === '') req.body[k] = null
    })

    CategoryController.editCategory({
        categoryObj: req.body.categoryObj,
    }).then(function (category) {
        res.send(category)
    }).catch(function (err) {
        res.status(400).send(err.errors)
    })
});

router.delete('/category/:id', function(req, res){

    Object.keys(req.body).map((k) => {
        if(req.body[k] === '') req.body[k] = null
    })

    CategoryController.deleteCategory({
        id: req.params.id,
    }).then(function(category){
        res.send(category)
    }).catch(function(err){
        res.status(400).send(err.errors)
    })

});


module.exports = router;
