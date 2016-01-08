import alt from '../alt';
import CategoriesAction from './../actions/CategoriesAction';

class CategoriesStore {

    constructor() {
        this.categories = [];
        this.category = "";
        this.bindListeners({
            onCheck: CategoriesAction.GET_ALL_CATEGORIES,
            onAddNewCat: CategoriesAction.ADD_NEW_CATEGORY
        });
    }

    onCheck(categories){
        categories.forEach(function(item){

        })
    }

    onAddNewCat(category){
        if(category instanceof Error) {
            console.log(JSON.parse(category.message).category)
                JSON.parse(category.message).category
                .forEach(function(i){alert(i)})
            return
        }
        this.categories = categories;
    }

}

export default alt.createStore(CategoriesStore, 'CategoriesStore');