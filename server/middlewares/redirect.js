var User = require('../models/Users');


/**
 * Обработка правил редиректа
 * @param req
 * @param res
 * @param next
 */
module.exports = function(req, res, next){

    if (req.subdomain == 'payments') {
        next();
    }

    else if(req.url.indexOf('/api/order') != -1 || req.url.indexOf('/api/basket') != -1) {
        next();
    }

    else if(req.user.id && !req.clientObj.active) {
        res.cookie('token', '', {maxAge: 9000000000, domain: `.${req.postdomain}`});
        var link = `http://${req.clientObj.login}.${req.postdomain}`;
        res.redirect(link)
    }

    else if (req.subdomain == 'auth' && req.user.role) {
        var link = '';
        if (req.user.role == 'client' || req.user.role == 'staff') {
            link = `http://${req.clientObj.login}.${req.postdomain}`;
        }
        else if (req.user.role == 'partner') {
            link = `http://${req.clientsObj[0].login}.${req.postdomain}/${req.partnerObj.login}`;
        }

        res.redirect(link);
    }
    /**
     * It's a kind of magic
     */
    else if (req.subdomain != 'auth' && !req.user.id && req.xhr) {
        if(req.url == '/api/admin/login' ||
            req.url == '/api/staff/login' ||
            req.url == '/api/partner/register' ||
            req.url == '/api/partner/login' ||
            req.url == '/api/check?role=client') {
            next();
        } else {
            res.status(401).send();
        }
    }

    else {next();}



};