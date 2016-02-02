var Currency = require('../models/Currency');
var User = require('../models/Users');
var Promise = require('bluebird');
var jwt = require('jwt-simple');
var _ = require('lodash');

module.exports = {

    get(){
        return new Promise(function (resolve, reject) {

            Currency.get().then(function (model) {
                resolve(model);

            }).catch(function (err) {
                reject(err);
            })

        })

    },

    getBasic(client_id){
        return new Promise(function (resolve, reject) {

            User.getBasicCurrency(client_id).then(function (model) {
                resolve(model);

            }).catch(function (err) {
                reject(err);
            })

        })

    },

    editBasic(data){
        return new Promise(function (resolve, reject) {

            User.editBasicCurrency(data).then(function (model) {
                resolve({basic_currency: model[0]});

            }).catch(function (err) {
                reject(err);
            })

        })

    }
};
