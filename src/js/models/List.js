import uniqid from 'uniqid';

export default class List {
    constructor() {
        this.items = [];
    }
    // method for adding new items into empty array 
    additem(count, unit, ingredient) {
        const item = {
            id: uniqid(),
            count,
            unit,
            ingredient
        }
        this.items.push(item);
        return item;
    }

    deleteItem(id) {
        const index = this.items.findIndex(el => el.id === id);
        this.items.splice(index, 1); // deletes 1 item of this ID
    }

    updateCount(id, newCount) {
        this.items.find(el => el.id === id).count = newCount;
    }
}

/*
[2, 4, 8] splice(1, 1); returns 4, leaving [2, 8] in the original array 
The values passed in refer to the starting position, and how many items to take. 
Splice also mutates the original array 
SLICE on [2, 4, 8] slice (1, 1) the parameters are the starting and stopping points.
Slice would also return the number 4, but would not mutate the original array.
*/ 