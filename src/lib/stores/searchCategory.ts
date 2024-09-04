import { writable, readable } from 'svelte/store';

export const listCategory = readable([
    { title: 'Casa | Giardino', idNum: '2399' },
    { title: 'Cucina | Gourmet', idNum: '2403' },
    { title: 'Sport | Fitness', idNum: '2491' },
    { title: 'Salute | Bellezza', idNum: '2501' },
    { title: 'Profumeria | Cosmesi', idNum: '2507' },
    { title: 'Moda | Accessori', idNum: '2570' },
    { title: 'Giocattoli | Costumi', idNum: '2571' },
    { title: 'Informatica | Elettronica', idNum: '2609' }
]);

export const currentSearchCategory = writable('all');
export const currentSearchId = writable('all');

export const newSearch = writable(true);

