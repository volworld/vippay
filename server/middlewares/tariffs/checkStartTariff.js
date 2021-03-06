var Promise = require('bluebird');
var Order = require('./../../models/Order');
var Rate = require('./../../models/Rate');
var Messages = require('./../../models/Messages');

/**
 * Проверка ограничений для тарифа "Старт"
 * @param req
 * @param res
 * @param next
 */
module.exports = function(req, res, next){

    if(  req.tariff && req.tariff.tariff_name == 'start' ) {

        var count = 0;

        Order.get(req.clientObj.id).then((orders) => {

            orders = orders || [];

            return Promise.map(orders, (order) => {

                return Rate.getResult({
                    client_id: order.client_id,
                    from: order.basic_currency,
                    to: 4
                    }).then((rate) => {
                        var result = rate ? rate.result : 1;
                        count += result * order.total_price_order_rate;
                    })

            })

        }).then((end_result) => {
                if(count > 150000) {

                    req.tariff.active = false;

                    if(req.method != 'GET') {
                        Messages.add({
                            user_id: req.clientObj.id,
                            type: 'info',
                            text: 'Лимит заказов выбранного вами тарифа 150 000 руб'
                        });
                        res.status(403).send('Общая сумма заказов превысила лимит.');
                    } else {
                        next();
                    }
                } else {
                    next();
                }
            }).catch((err) => {
                next();
            })
    } else {
        next();
    }
};