var checkit = require('checkit');
var Promise = require('bluebird');
//var bcrypt = Promise.promisifyAll(require('bcrypt'));
var bookshelf = require('../db');
var knex = require('../knex_connection');

var User = bookshelf.Model.extend({

    tableName: 'users',

    hasTimestamps: true,

    initialize: function () {
        this.on('saving', this.validateSave);
        this.on('updating', this.validateSave);
    },

    validateSave: function () {
        return checkit({
            //email: ['email', function(val) {
            //    return knex('users').where('email', '=', val).then(function(resp) {
            //        if (resp.length > 0) throw new Error('Такой электронный адрес уже существует')
            //    })
            //}, {
            //    rule: 'email',
            //    message: 'Введите верный email'
            //}],
            name: [{
                rule: 'required',
                message: 'Поле "ФИО" обязательно для заполнения'
            }],
            login: [/*'login', function(val) {
                return knex('users').where('login', '=', val).then(function(resp) {
                    if (resp.length > 0) throw new Error('Такой логин уже существует')
                })
            },*/ {
                rule: 'required',
                message: 'Поле "логин" обязательно для заполнения'
            }],
            password:[{
                rule: 'required',
                message: 'Поле "пароль" обязательно для заполнения'
            }]
        }).run(this.attributes);
    }

}, {


    login(user) {

        return new Promise((resolve, reject) => {
             if (!user.email || !user.password) reject(new Error('Email и пароль обязательны'));

            knex('users')
                .where({email: user.email.toLowerCase().trim()})
                .first('*')
            .then((customer) => {

                 if(customer.password !== user.password)  throw new Error('wrong_password');
                if(customer.type !== 'client')  throw new Error('you_are_not_registered');
                if( !customer.active )  throw new Error('you_are_not_registered');

                resolve({
                    attributes: customer
                });

            }).catch((err) => {
                reject(err);
            })

        })
        /*return new this({email: user.email.toLowerCase().trim()}).fetch({require: true}).tap(function (customer) {
            //return bcrypt.compareAsync(customer.get('password'), password)
            //    .then(function (res) {
            //        if (!res) throw new Error('Неверный пароль');
            //    });
            if(customer.get('password') !== user.password)  throw new Error('wrong_password');
            if(customer.get('type') !== 'client')  throw new Error('you_are_not_registered');
            if( !customer.get('active') )  throw new Error('you_are_not_registered');
        });*/
    },

    register: Promise.method(function (user) {

        var record = new this(user);

        return record.save();
    }),

    get: Promise.method(function (partner_id) {

         return knex.select('*')
                    .from('users')
                    .join('clients-partners', 'clients-partners.client_id', '=', 'users.id')
                    .where('clients-partners.partner_id', '=', +partner_id)
    }),

    getByData(data) {
        return knex('users')
            .select('*')
            .where(data)
            .orderBy('id', 'asc')
    },

    set(obj) {
         return knex('users')
                .update(obj)
                .where('id', '=', obj.id)
                .returning('*')
    },

    getById: function(id) {

        return new Promise((resolve, reject) => {
            knex
            .first()
            .from('users')
            .where('id', '=', id)
            .then((res) => {
                resolve(res)
            }).catch((err) => {
                reject(err)
            })
        })

    },


    getByLogin: Promise.method(function (login) {

        return knex
            .first()
            .from('users')
            .where('login', '=', login)

    }),

    setBasicCurrency: Promise.method(function (data) {

        return knex('users')
            .update({'basic_currency': data.id})
            .where('id', '=', data.user_id)
            .returning('basic_currency')

    }),

    getBasicCurrency: Promise.method(function (data) {

        return knex
            .first()
            .from('users')
            .where('id', '=', data.user_id)

    }),

    setPassword: Promise.method(function (data) {

        return knex('users')
            .update({'password': data.passwords.new_pass})
            .where('id', '=', data.user_id)
            .returning('*')

    }),


    getFee: Promise.method(function (id) {

        return knex('users')
                .first('fee')
                .where('id', '=', id)

    }),

    editFee: Promise.method(function (data) {

        return knex('users')
                .update(data)
                .where('id', '=', data.id)
                .returning(['fee'])
    }),


    activateTariff: Promise.method((id) => {
        return knex('users')
            .update({tariff_payed: true})
            .where('id', '=', id)
            .returning('*').debug()
    }),

    setTariff: Promise.method((data) => {
        return knex('users')
                .update(data)
                .where('id', '=', data.id)
                .returning('*')
    }),

    getTariff: Promise.method((user_id) => {
        return knex('users')
                .first('tariff_duration', 'tariff_name', 'tariff_date', 'tariff_payed', 'created_at', 'id')
                .where('id', '=', user_id)
    }),

    getPayment: Promise.method((user_id) => {
        return knex('users')
                .first('payment')
                .where('id', '=', user_id)
    }),

    putPayment: Promise.method((data) => {
        return knex('users')
                .update({payment: JSON.stringify(data.payment)})
                .where('id', '=', data.user_id)
                .returning('payment')
    }),

    remove(data) {

        return knex('users')
            .where(data)
            .del()
            .returning('*');

    }

});

module.exports = User;

