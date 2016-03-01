import alt from '../alt';
import Promise from 'bluebird';
import ApiActions from './ApiActions';

class PartnerLinksAction {

    get() {
        var self = this;
        ApiActions.get(`partner/partnerlinks`).then(function(data){
            self.dispatch(data);
        }).catch(function(err){
            //self.dispatch(err);
        })
    }

    add(data) {
        var self = this;
        return new Promise((resolve, reject) => {
            ApiActions.post(`partner/partnerlinks`, data).then(function(res){
                self.dispatch(res);
                resolve()
            }).catch(function(err){
                //self.dispatch(err);
            })
        })
    }

    set(data) {
         var self = this;

        return new Promise((resolve, reject) => {
            ApiActions.put(`partner/partnerlinks`, data).then(function(data){
                self.dispatch(data);
                resolve(data);
            }).catch(function(err){
                //self.dispatch(err);
            })
        })
    }

    getCurrent(id) {

         var self = this;

        ApiActions.get(`partner/partnerlinks/${id}`).then(function(data){
                self.dispatch(data);
            }).catch(function(err){
                //self.dispatch(err);
            })
    }

    remove(id) {

         var self = this;

        ApiActions.remove(`partner/partnerlinks/${id}`).then(function(data){
                self.dispatch(data);
            }).catch(function(err){
                //self.dispatch(err);
            })
    }

}

export default alt.createActions(PartnerLinksAction);