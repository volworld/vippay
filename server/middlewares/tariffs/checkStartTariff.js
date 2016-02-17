var Promise = require('bluebird');
var Order = require('./../../models/Order');
var Rate = require('./../../models/Rate');
var Messages = require('./../../models/Messages');

module.exports = function(req, res, next){

    if(  req.tariff && req.tariff.tariff_name == 'start' ) {

        var count = 0;

        Order.get(req.user.id).then((orders) => {

            Promise.map(orders, (order) => {
                return Rate.getResult({
                    client_id: order.client_id,
                    from: order.product.currency_id,
                    to: 4
                    }).then((data) => {
                        count += data.result * order.total_price_order_rate;
                    })
            }).then((end_result) => {
                if(count > 150000) {
                    if(req.method != 'GET') {
                        Messages.add({
                            user_id: req.user.id,
                            type: 'info',
                            text: 'Ваш лимит заказов, выбранного вами тарифа 150 000 руб'
                        })
                        res.status(400).send('Общая сумма заказов исчерпала лимит.');
                        return;
                    } else {
                        next();
                    }
                }
            })

        })
    } else {
        next();
    }
};