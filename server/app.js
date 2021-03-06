var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var morgan = require('morgan');
var config = require('./config');
var _ = require('lodash');
var User = require('./models/Users');
var email = require('./utils/email');
var jwt = require('jwt-simple');
var moment = require('moment');

var app = express();
var http = require('http').Server(app);

var getSubdomain = require('./middlewares/getSubdomain');
var getClientObj = require('./middlewares/getClientObj');
var getUserId = require('./middlewares/getUserId');
var getPartnerObj = require('./middlewares/getPartnerObj');
var getStaffObj = require('./middlewares/getStaffObj');
var getInterkassaId = require('./middlewares/getInterkassaId');
var checkError = require('./middlewares/checkError');
var checkStaffAccess = require('./middlewares/checkStaffAccess');
var redirect = require('./middlewares/redirect');
var isAdmin = require('./middlewares/admin');
var crossDomainQueries = require('./middlewares/crossDomainQueries');
var pendingModule = require('./modules/pending');
var basketModule = require('./modules/basket');
var paymentModule = require('./modules/payment');
var getAdminData = require('./modules/admin');
var getTariffData = require('./modules/getTariffData');

app.use(morgan('combined'));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(cookieParser());
app.set('view engine', 'jade');
app.set('views', path.join(__dirname, 'templates'));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(methodOverride('_method'));

app.use(crossDomainQueries);
app.use(isAdmin);
app.use(getSubdomain);
app.use(getUserId);
app.use(getClientObj);
app.use(getPartnerObj);
app.use(getStaffObj);
app.use(getInterkassaId);
app.use(checkStaffAccess);
app.use(redirect);

var timestamp = Date.now();
var designClass = config.get('designClass');

app.use(require('./routes/log'));

/**
 * Отрисовка страницы админа
 */
app.get('/admin', getAdminData, function(req, res) {

    if(! req.admin) res.render('admin/login', {designClass: designClass, timestamp: timestamp});

    else {
        var data = _.assign(req.adminData, {designClass: designClass}, {timestamp: timestamp});
        res.render('admin/page', data);
    }

});

/**
 * Отрисовка страницы оплаты тарифа
 */
app.get('/checkout', getTariffData, function(req, res) {

    var data = _.assign(req.tariffData, {designClass: designClass}, {timestamp: timestamp});
    res.render('paymentTariff', data);

});

/**
 * Отрисовка страницы успеха (н.п.: успешная оплата)
 */
app.get('/success', function(req, res) {

    res.render('success', {timestamp: timestamp, text: 'Оплата прошла успешно'});

});


/**
 * Отрисовка страницы восстановления пароля
 */
app.get('/password/recover', function(req, res) {

    res.render('recover', {timestamp: timestamp, designClass: designClass, action: `http://${req.subdomain}.${req.postdomain}/recover`});

});

app.post('/recover', function(req, res) {

    User.getByData({email: req.body.email, active: true}).then((u) => {
        var user = u[0];

       if(!user) {

           res.render('success', {timestamp: timestamp, text: 'Такого пользователя не найденно'});

       } else {

           var recoverLink = ` http://${req.subdomain}.${req.postdomain}/new_password?link=${jwt.encode({id: user.id, password: user.password, date: moment()}, 'secret')}`;

           email.send(req.body.email, 'Восстановление пароля', `Ссылка на восстановление пароля:${recoverLink}. Она будет активна в течении 24 часов.`);

           res.render('success', {timestamp: timestamp, text: 'Ссылка для восстановления пароля отправлена вам на почту. Она будет активна в течении 24 часов.'});

       }

    });


});

app.get('/new_password', function(req, res, next) {

    var data = jwt.decode(req.query.link, 'secret');

     var today = moment();
    var end_time = moment(data.date).add(1, 'day');

    if(moment.max(today, end_time) == end_time) { //ссылка все еще активна

        User.getByData({id: data.id, password: data.password}).then((u) => {

            var user = u[0];

            if(!user) {

                res.render('success', {timestamp: timestamp, text: 'Ссылка на восстановление пароля уже не активна.'});

            } else {

                res.render('newPassword',  {timestamp: timestamp, designClass: designClass, action: `http://${req.subdomain}.${req.postdomain}${req.originalUrl}`});

            }



        }).catch((err) => {
            next(err);
        })

    } else {

        res.render('success', {timestamp: timestamp, text: 'Ссылка на восстановление пароля уже не активна.'});

    }

});

app.post('/new_password', function(req, res, next) {

    var data = jwt.decode(req.query.link, 'secret');

    if(req.body.confirmPass === req.body.pass) {

        User.set({id: data.id, password: req.body.pass}).then((result) => {

          res.render('success', {timestamp: timestamp, text: 'Новый пароль установлен.'});

        }).catch((err) => {

            next(err);

        })

    } else {

        res.render('success', {timestamp: timestamp, text: 'Пароли не совпадают.'});

    }

});

/**
 * Отрисовка страницы клиента
 */
app.get('/', redirect, function(req, res){

    if(req.user.role && (req.user.role != 'staff' && req.user.role != 'client')) {
        res.redirect(`http://auth.${req.postdomain}`);
        return;
    }

    var payment = req.clientObj ? _.findWhere(req.clientObj.payment, {name: 'interkassa'}) : {};
    payment = payment || {};
    var id_confirm = payment.fields ? payment.fields.id_confirm : payment.fields;

   res.render('client', {timestamp: timestamp, designClass: designClass, id_confirm: id_confirm})


});

app.use(require('./routes/api'));

app.use(require('./routes/redirect'));

/**
 * Отрисовка страницы корзины
 */
app.get('/basket/:id*',basketModule, function(req, res){

    res.render('basket', {basketItems: req.basketItems, currency: req.currency, redirectBack: req.headers.referer, designClass: designClass, timestamp: timestamp});
});

/**
 * Отрисовка страницы оформления заказа по корзине
 */
app.get('/order/basket/:id*', basketModule, function(req, res){

    res.render('basketPending', {basketItems: req.basketItems, currency: req.currency, designClass: designClass, timestamp: timestamp});

});

/**
 *Отрисовка страницы оплаты заказа
 */
app.get('/order/payment/:order_id*', paymentModule, function(req, res){

    var data = _.assign(req.payment, {designClass: designClass}, {timestamp: timestamp});
    res.render('paymentOrder', data);

});

/**
 * Отрисовка страницы оформления заказа по единичному продукту
 */
app.get('/order/:id*', pendingModule, function(req, res){

    var data = _.assign(req.pending, {designClass: designClass}, {timestamp: timestamp});
    res.render('pending', data);

});


/**
 * Отрисовка страницы партнера
 */
app.get('/:partner', function(req, res){

    if(req.user.role && req.user.role != 'partner') {
        res.redirect(`http://auth.${req.postdomain}`);
        return;
    }

    if( !req.clientObj.id && req.partnerObj ) {
        var result =  _.findIndex(req.clientsObj, (item) => {
            return item.login.toLowerCase() == req.subdomain;
        });

        if(result == -1) {
            res.redirect(`http://auth.${req.postdomain}`);
        }
    }

    res.render('partner', {designClass: designClass, timestamp: timestamp});
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  next(err);
});

app.use((err, req, res, next) => {
  if (req.xhr) {
    checkError(err, res);
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  res.status(500);
  res.render('error', { error: err });
});

var server = http.listen(config.get('port'), function() {
    console.log("Listening %s on port: %s", server.address().address, server.address().port)
});
