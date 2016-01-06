import alt from '../alt';
import AuthActions from './../actions/AuthActions';

class AuthStore {

    constructor() {
        this.auth = true;

        this.bindListeners({
            onCheck: AuthActions.CHECK
        });
    }

    onCheck(auth){
        this.auth = auth;
    }
}

export default alt.createStore(AuthStore, 'AuthStore');