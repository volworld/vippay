var Customer = require('../models/Customer');
var Promise = require('bluebird');
var jwt = require('jwt-simple');
var _ = require('lodash');


/**
 * Работа с покупателями
 * @type {{add: (function(*=)), push: (function(*=)), get: (function(*=))}}
 */
module.exports = {

    add(data) {
        return new Promise(function (resolve, reject) {

            Customer.add(data).then(function (customer) {
                resolve(customer.attributes)
            }).catch(function (err) {
                reject(err);
            });
        })
    },

    push(data) {
        return new Promise(function (resolve, reject) {

            Customer.get(data.customer_id).then(function (customer) {

                    var arr = customer.partner_product_id.partner_id;

                    if(arr[arr.length - 1] == data.partner_id) {return new Promise((resolve) => {resolve([customer]);})}
                     else {
                        arr.push(data.partner_id);
                        return Customer.edit(data.customer_id, {product_id: customer.partner_product_id.product_id, partner_id: arr})
                    }

                    }) .then((res) => {
                        resolve(res[0]);
                    }).catch((err) => {
                        reject(err);
                    });
        })
    },

    get(id) {
        return new Promise(function (resolve, reject) {

            Customer.get(id).then(function (customer) {
                resolve(customer)
            }).catch(function (err) {
                reject(err);
            });
        })
    }


};