import alt from '../alt';
import Promise from 'bluebird';
import ApiActions from './ApiActions';

class SettingsAction {

    get() {
        var self = this;
        ApiActions.get('settings').then(function(data){
            self.dispatch(data);
        }).catch(function(err){
            //self.dispatch(err);
        })
    }

    getAllCurrencies() {

        var self = this;
        new Promise((resolve, reject) => {
            ApiActions.get(`currency`).then(function(data){
                self.dispatch(data);
                resolve(data);
            }).catch(function(err){
                //self.dispatch(err);
                reject(err);
            })
        })
    }

    setBasicCurrency(id) {

         var self = this;
            ApiActions.put(`basicCurrency`, {id: id}).then(function(data){
                self.dispatch(data);
            }).catch(function(err){
                self.dispatch(err);
            })
    }

    getBasicCurrency() {
         var self = this;
        new Promise((resolve, reject) => {
            ApiActions.get(`basicCurrency`).then(function(data){
                self.dispatch(data);
                resolve(data);
            }).catch(function(err){
                //self.dispatch(err);
                reject(err);
            })
        })
    }

    addRate(rate) {
        var self = this;
            ApiActions.put(`rate`, rate).then(function(data){
                self.dispatch(data);
            }).catch(function(err){
                self.dispatch(err);
        })
    }

    getRate() {
        var self = this;
            ApiActions.get(`rate`).then(function(data){
                self.dispatch(data);
            }).catch(function(err){
                self.dispatch(err);
        })
    }

    getFee() {
        var self = this;
            ApiActions.get(`fee`).then(function(data){
                self.dispatch(data);
            }).catch(function(err){
                self.dispatch(err);
        })
    }

    editFee(fee) {
        var self = this;
            ApiActions.put(`fee`, {fee: fee}).then(function(data){
                self.dispatch(data);
            }).catch(function(err){
                self.dispatch(err);
        })
    }

    getPayment() {
        var self = this;
            ApiActions.get(`payment`).then(function(data){
                self.dispatch(data);
            }).catch(function(err){
                self.dispatch(err);
        })
    }

    editPayment(data) {
        var self = this;
        return new Promise((resolve, reject) => {
            debugger
            ApiActions.put(`payment`, data).then(function(result){
                self.dispatch(result);
                resolve(result);
            }).catch(function(err){
                //self.dispatch(err);
                //reject(err);
        })
        })
    }

    setNewPassword(data) {
        return new Promise((resolve, reject) => {
            ApiActions.put(`user/password`, data).then(function(result){

                resolve(result);
            }).catch(function(err){

                reject(err);
            })
        })
    }

    getTariff() {
        var self = this;
         ApiActions.get(`settings/tariff`).then(function(result){
                 self.dispatch(result);
            }).catch(function(err){
                debugger
            })
    }

    setTariff(obj) {
        var self = this;
         ApiActions.post(`settings/tariff`, obj).then(function(result){
                 self.dispatch(result);
            }).catch(function(err){
                debugger
            })
    }

    getMessages() {
        var self = this;
         ApiActions.get(`messages`).then(function(result){
                 self.dispatch(result);
            }).catch(function(err){
                debugger
            })
    }

    setMessage(data) {
        var self = this;
         ApiActions.put(`messages/${data.id}`, data.data).then(function(result){
                 self.dispatch(result);
            }).catch(function(err){
                debugger
            })
    }
}

export default alt.createActions(SettingsAction);