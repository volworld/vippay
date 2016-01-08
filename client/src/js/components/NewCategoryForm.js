import React from 'react';
import { Router, Route, IndexRoute, Link } from 'react-router';
import CategoriesStore from'./../stores/CategoriesStore';
import CategoriesAction from'./../actions/CategoriesAction';

class Category extends React.Component {

    constructor(){
        super();
        this.state = CategoriesStore.getState();
        this.update = this.update.bind(this);
        this.onChange = this.onChange.bind(this);
        this.addNewCategory = this.addNewCategory.bind(this);
    }

    componentDidMount() {
        CategoriesStore.listen(this.update);
       // CategoriesAction.addNewCategory(this.state);
    }

    componentWillUnmount() {
        CategoriesStore.unlisten(this.update);
    }

    addNewCategory() {
        if(this.state.category.length == 0) {alert('Поле "категория" обязательно для заполнения'); return;}
        CategoriesAction.addNewCategory(this.state);
    }

    onChange(e) {
        var state = {};
		state[e.target.name] = e.target.value;
		this.setState(state);
    }

    update(state){
        this.setState(state);
    }

    render(){
        return  <div className="col-sm-7">
            <form>
              <fieldset className="form-group">
                <label htmlFor="newCategory" className="text-primary">Новая категория</label>
                <input type="text" name="category" className="form-control" id="newCategory" onChange={this.onChange} placeholder="Введите название новой категории" />
              </fieldset>
                <button type="button" className="btn btn-info pull-right" onClick={this.addNewCategory}>Добавить</button>
            </form>
        </div>

    }


}


export default Category;