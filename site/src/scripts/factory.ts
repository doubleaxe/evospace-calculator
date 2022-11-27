import type {JsonItem, JsonData} from '../../data';
import dataJsonUntyped from '../../data/data.json';

const dataJson = dataJsonUntyped as JsonData;

export class Item {
    protected readonly item: JsonItem;
    constructor(name: string, item: JsonItem) {
        item.Name = name;
        this.item = item;
    }

    get image() { return this.item.Image; }
    get name(): string { return this.item.Name || ''; }
}

export class ProducerFactory extends Item {
    constructor(name: string, item: JsonItem) {
        super(name, item);
    }
}

class ItemCollection {
    private readonly items: {[key: string]: Item} = {};
    private readonly producerItems: ProducerFactory[] = [];
    constructor(collection: {[key: string]: JsonItem}) {
        for(const [key, value] of Object.entries(collection)) {
            let item: Item;
            if(value.Recipe) {
                const producer = new ProducerFactory(key, value);
                item = producer;
                this.producerItems.push(producer);
            } else {
                item = new Item(key, value);
            }
            this.items[key] = item;
        }
    }
    getProducerItems() {
        return this.producerItems.concat();
    }
    getItem(name: string) {
        return this.items[name];
    }
}
export const itemCollection = new ItemCollection(dataJson.items);
