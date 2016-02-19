import React from 'react'
import OrdersStore from'./../stores/OrdersStore'
import OrderActions from'./../actions/OrdersActions'

class Yandex extends React.Component {

    constructor() {
        super();
    }

    click(e){
        e.stopPropagation();
    }


    render() {
        console.log(this.props.method)
        return <div>
            <form method="POST" action={this.props.method.action}>
                <input type="hidden" name="receiver" value={this.props.method.receiver} />
                <input type="hidden" name="formcomment" value={this.props.method.formcomment} />
                <input type="hidden" name="short-dest" value={ this.props.method['short-dest'] } />
                <input type="hidden" name="label" value={this.props.method.label} />
                <input type="hidden" name="targets" value={this.props.method.targets} />
                <input type="hidden" name="quickpay-form" value='donate' />
                <input type="hidden" name="sum" value="5" data-type="number" />
                <input type="submit" className="btn" value="Перевести" />
            </form>
            </div>
    }
}

//type="hidden"

export default Yandex;
