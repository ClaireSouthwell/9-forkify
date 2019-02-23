import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import { elements, renderLoader, clearLoader } from './views/base';

/** Global state of the app 
 * - Search object (query and results)
 * - Current recipe objert
 * - Shopping list object
 * - Liked recipes 
*/
const state = {};
window.state = state; 

// SEARCH CONTROLLER 

const controlSearch = async () => {
    // 1) Get query from view
    const query = searchView.getInput();

    if (query) {
        // 2) new search object and add it to the state 
        state.search = new Search(query);

        // 3) Prepare UI for results 
        searchView.clearInput(); 
        searchView.clearResults(); 
        renderLoader(elements.searchRes); // pass in the parent element

        try {
        // 4) Search for recipes 
        await state.search.getResults(); 

        // 5) render results on UI 
        clearLoader(); 
        searchView.renderResults(state.search.result);
        } catch (err) {
            alert('Something wrong with the search');
            clearLoader(); 
        }
       
    }
}

elements.searchForm.addEventListener('submit', e=> {
    e.preventDefault();
    controlSearch(); 
});



elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults(); 
        searchView.renderResults(state.search.result, goToPage);
    } 
});

/*
// RECIPE CONTROLLER 
*/ 
const controlRecipe = async () => {
    // Get ID from url 
    const id = window.location.hash.replace('#', ''); 
    console.log(id);

    if (id) {
        // Prepare the Ui for changes
        recipeView.clearRecipe(); 
        renderLoader(elements.recipe); // pass in the parent so the loador knows where to go

        // Highlight selected search item
        if (state.search) searchView.highlightSelected(id);

        // Create new recipe object 
        state.recipe = new Recipe(id);

        try {
            // Get recipe data and parse ingredients 
            await state.recipe.getRecipe(); 
            state.recipe.parseIngredients(); 

            // call calctime and calcservings
            state.recipe.calcTime(); 
            state.recipe.calcServings(); 

            // Render recipe 
            clearLoader(); 
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );

        } catch (err) {
            console.log(err);
            alert('error processing recipe');
        }
    }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));


/* 
LIST CONTROLLER 
*/ 
const controlList = () => {
    // Create a new list if there is none yet 
    if (!state.list) state.list = new List();

    // Add each ingredient to the list 
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient); 
        listView.renderItem(item);
    });
}

// Handle delete and update events 
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle the delete
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
    //  Delete from the state  
        state.list.deleteItem(id);
    // Delete item from the UI
        listView.deleteItem(id);
    
    // Handle the count update 
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});


/*
LIKE CONTROLLER 
*/
// TESTING
state.likes = new Likes();
likesView.toggleLikeMenu(state.likes.getNumLikes());


const controlLike = () => {
    if(!state.like) stat.likes = new Likes(); 
    const currentID = state.recipe.id;
    
    // User has not yet liked the recipe
    if(!state.like.isLiked(currentID)) {
        // Add like to the state 
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img          
        );
        // Toggle the like button to Liked 
        likesView.toggleLikeBtn(true);

        // add like to the UI list 
        likesView.renderLike(newLike);

    // Otherwise if the user HAS liked the recipe
    } else {
        // Remove Like from state 
        state.likes.deleteLike(currentID);

        // toggle like button 
        likesView.toggleLikeBtn(false);

        // Remove like from UI list 
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};



// Handling recipe button clicks 
elements.recipe.addEventListener('click', e=> {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        if (state.recipe.servings > 1) {
            // Any part of the decrease button is clicked
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if  (e.target.matches('.btn-increase, .btn-increase *')) {
       // Any part of the decrease button is clicked
       state.recipe.updateServings('inc');
       recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn-add *')) {
        // Add ingredients to hopping list 
        controlList(); 
    } else if (e.target.matches('.recipe__love .recipe__love *')) {
        // call the like controller 
        controlLike(); 
    }
});

window.l = new List(); 