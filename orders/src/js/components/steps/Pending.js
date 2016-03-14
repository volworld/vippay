import React from 'react';
import {RoutingContext, Link} from 'react-router';
import Payment from './Payments';
import OrderActions from'./../../actions/OrdersActions';
import ApiActions from'./../../actions/ApiActions';
import OrdersStore from'./../../stores/OrdersStore';
import Alert from'./../../../../../common/js/Alert/Alert';
import AlertActions from'./../../../../../common/js/Alert/AlertActions';
import ModalActions from'./../../../../../common/js/ModalWindow/ModalActions';
import _  from 'lodash';
import $  from 'jquery';

class DeliverySelect extends React.Component {

    constructor(){
        super();
        this.state = {};
        this.onChange = this.onChange.bind(this);
    }

    onChange(e) {
        var state = {current: this.props.delivery[e.target.value], condition: this.props.delivery[e.target.value].condition, price: this.props.delivery[e.target.value].price};
        this.setState(state);
        this.props.onChange(e);
    }

    componentDidMount() {
        this.setState({current: this.props.delivery[0], condition: this.props.delivery[0].condition, price: this.props.delivery[0].price});
    }


    render(){
        var self = this;
        return  <div className="description boxed">
                <div>
                    <div>
                        <span><b>Условия доставки: </b></span>
                        <span>{this.state.condition}</span>
                    </div>
                    <div><span><b>Цена: </b></span>
                        <span>{this.state.price}</span>
                    </div>
                </div>
            <div className="form-group">
                <select className="form-control" id="sell"  name="delivery_id"
                            onChange={self.onChange}>
                        { this.props.delivery.map(function(item, index){
                            return <option
                                key={index}
                                value={index}
                            >{item.condition}</option>
                            })}
                    </select>
            </div>

                </div>
    }


}

class Pending extends React.Component {

    constructor() {
        super();
        this.state = OrdersStore.getState();
        this.update = this.update.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onContinue = this.onContinue.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onPromoChange = this.onPromoChange.bind(this);
        this.checkFields = this.checkFields.bind(this);
        this.finishPending = this.finishPending.bind(this);
    }

    componentDidMount() {
        var id = window.location.pathname.slice(window.location.pathname.lastIndexOf('/') + 1);

        this.setState({prod_id: id});
        OrdersStore.listen(this.update);
        OrderActions.getProduct(id);
    }

    componentWillUnmount() {
        OrdersStore.unlisten(this.update);
    }

    update(state){
        _.assign(this.state, state);
        this.setState({});
    }

    onPromoChange(e) {
        this.state.promo = e.target.value;
    }

    onChange(e) {
        var state = {};

        if(e.target.name == 'delivery_id')  _.assign(this.state, {delivery_id: e.target.value});

        state[e.target.name] = e.target.value;
        _.assign(this.state.delivery, state);

        this.setState({});
    }

    onClick() {
        AlertActions.hide();
    }

    checkFields() {
         var self = this;
        var telephone = new RegExp(/^\d[\d\(\)\ -]{4,14}\d$/);
        var email = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

        if(!this.state.delivery.telephone || _.trim(this.state.delivery.telephone).length == 0 ||
            !this.state.delivery.name || _.trim(this.state.delivery.name).length == 0 ||
            !this.state.delivery.email || _.trim(this.state.delivery.email).length == 0) {
            AlertActions.set({
                     type: 'error',
                     title: 'Ошибка',
                     text: 'Все обязательные поля должны быть заполнены'
             })
        }
        else if(! telephone.test(this.state.delivery.telephone) ) {
             AlertActions.set({
                     type: 'error',
                     title: 'Ошибка',
                     text: 'Проверьте правильность заполнения поле "телефон"'
             })

        }
        else if(! email.test(this.state.delivery.email) ) {
            AlertActions.set({
                     type: 'error',
                     title: 'Ошибка',
                     text: 'Проверьте правильность заполнения поле "электронная почта"'
             })

        }

        else {
            return true;
        }

        return false;
    }

    onContinue() {
       if(! this.checkFields()) return;

            var delivery = this.state.product.delivery ? this.state.product.delivery[this.state.delivery_id] : {};
            var total = this.state.product.delivery && this.state.product.delivery.length > 0 ? parseInt(this.state.product.price) + parseInt(this.state.product.delivery[this.state.delivery_id].price) : this.state.product.price;
            _.assign(delivery, this.state.delivery, {total: total});
            console.log('Delivery', delivery);

            if(this.state.promo && _.trim(this.state.promo)) { //if promo code
                OrderActions.getPromo({code: this.state.promo, product_id: this.state.prod_id}).then((promo) => {

                    var discountTotal = total - promo.discount*total/100;
                    ModalActions.set({data: {messages: [` Общая сумма заказа сейчас ${total} ${this.state.product.currency_name}.`,
                                                        `Со скидкой ${promo.discount}% составляет ${discountTotal} ${this.state.product.currency_name}`]
                                            , onContinue: this.finishPending
                                            , title: `Подтвердите применение скидки по промо коду.`
                                            , forComponent: {total: discountTotal, discount: promo.discount}
                                            }
                                    , name: 'Message'});

                }).catch((err) => {
                    ModalActions.set({data: {message: err.message}, name: 'MessageError'});
                })
            } else {
                this.finishPending();
            }


    }

    finishPending(data) {

        ModalActions.hide();

        data = data || {};
         var delivery = this.state.product.delivery ? this.state.product.delivery[this.state.delivery_id] : {};
         var total = data.total || (this.state.product.delivery && this.state.product.delivery.length > 0 ? parseInt(this.state.product.price) + parseInt(this.state.product.delivery[this.state.delivery_id].price) : this.state.product.price);
            _.assign(delivery, this.state.delivery, {total: total});
        var toSend = {delivery: delivery};
        var self = this;

        debugger
        if(this.state.promo) {
            toSend.promo={code: this.state.promo, discount: data.discount};
        } else {
            toSend.promo = {};
        }

        if(this.state.product.isUpsell) {
                OrderActions.getUpsellProducts(this.state.prod_id).then((upsells) => {
                    upsells.map((u) => {
                       u.currency_name = self.state.product.currency_name;
                    });

                    _.assign(toSend, {upsells: upsells, product: this.state.product});
                    ModalActions.set({data: toSend, name: 'Upsells'});
                });
            } else {
                    _.assign(toSend, {prod_id: [this.state.prod_id]});
                    OrderActions.add(toSend);
            }
    }

    render() {
        var total = this.state.product.delivery && this.state.product.delivery.length > 0 ? parseInt(this.state.product.price) + parseInt(this.state.product.delivery[this.state.delivery_id].price) : this.state.product.price;
        return <div>
            <div>
                <div className="content-step row">
                     <Alert />
                    <div className="col-md-6">
                        <img className="img-responsive img-thumbnail image" src={this.state.product.image} />
                        <div className="field"><b>Название: </b> {this.state.product.name}</div>
                        <div className="field"><b>Цена: </b> {this.state.product.price + ' ' + this.state.product.currency_name}</div>
                        <div className="description image"><b>Описание: </b> <pre>{this.state.product.description}</pre></div>
                    </div>
                  
                    <div className="col-md-6">
                        <form className="">
                        {this.state.product.material ? <DeliverySelect delivery={this.state.product.delivery} onChange={this.onChange}/> : ""}

                            <div className="form-group">
                            <label>Электронная почта:<span className="text-danger"> * </span> </label>
                            <input type="email" name="email" className="form-control"
                                   onChange={this.onChange}
                                   onClick={this.onClick}
                                   placeholder="Введите электронную почту" />
                        </div>

                         <div className="form-group">
                            <label>ФИО:<span className="text-danger"> * </span> </label>
                            <input type="text" name="name" className="form-control"
                                   onChange={this.onChange}
                                   onClick={this.onClick}
                                   placeholder="Введите ФИО" />
                        </div>

                         <div className="form-group">
                            <label>Телефон: <span className="text-danger"> * </span> </label>
                            <input type="text" name="telephone" className="form-control"
                                   onChange={this.onChange}
                                   onClick={this.onClick}
                                   id="telephone" placeholder="(ХХХ) ХХ ХХ ХХХ" />
                        </div>
                        <div className="form-group">
                            <label>Комментарий: </label>
                            <textarea name="comment" rows="5" className="form-control" onChange={this.onChange}
                                   placeholder="Комментарий" />
                        </div>

                        <div className="form-inline">
                            <div className="form-group">
                            <label>Промо код: </label>
                            <input type="text" name="promo_code" onChange={this.onPromoChange} />
                        </div>

                        </div>

                            <div className="text-warning text-uppercase pull-right"><b>Итоговая цена: {`${total} ${this.state.product.currency_name}`}</b></div><br/>
                            <div className="text-danger small pull-right">*Поля обязательные для заполнения</div><br/>
                    </form>
                    </div>



                    <button type="button" className="btn btn-danger btn-lg pull-right btn-order" onClick={this.onContinue}>Оформить</button>
                </div>
            </div>
           </div>
    }
}

export default Pending;
