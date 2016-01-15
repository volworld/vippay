var checkit = require('checkit');
var Promise = require('bluebird');
var bookshelf = require('../db');
var knex = require('../knex_connection');

var Product = bookshelf.Model.extend({

    tableName: 'products',

    hasTimestamps: true,

    initialize: function () {
        this.on('saving', this.validateSave);
        this.on('updating', this.validateSave);
    },

    validateSave: function () {
        return checkit({
            'name': [{
                rule: 'required',
                message: 'Поле "продукт" обязательно для заполнения'
            }],
            'category_id': [{
                rule: 'required',
                message: 'Поле "категория" обязательно для заполнения'
            }]
        }).run(this.attributes);
    }

}, {

    newProduct: Promise.method(function (product) {

        var record = new this(product);
        return record.save();
    }),

    getAllProducts(id){
        return new Promise((resolve, reject) => {
            return knex('products').where({'category_id': id})
            .then((res) => {
                resolve(res);
            }).catch((err) => {
                reject(err);
            })
        })
    },

    getAllByUser(id){
        return new Promise((resolve, reject) => {
            return knex('products').where({'user_id': id, 'available': true})
            .then((res) => {
                resolve(res);
            }).catch((err) => {
                reject(err);
            })
        })
    },

    getCurrentProduct: Promise.method(function (id) {
        return knex.first().from('products').where('id', id);
    }),

    editProduct(product){
        return new Promise((resolve, reject) => {
            knex('products').where({id: product.id}).update(product).then((res) => {
                resolve(product);
            }).catch((err) => {
                reject(err);
            })
        })
    },

    deleteProduct(id){
        return new Promise((resolve, reject) => {

            knex('products').where({id: id}).del().then((res) => {
                resolve({id: id});
            }).catch((err) => {
                reject(err);
            })

        })
    }

})

module.exports = Product;