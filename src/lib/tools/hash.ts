import { createHash } from 'crypto';

export const hash = (inputString: string, salt: string = ''): string => {
    let currentString: string = inputString;
    if (typeof inputString !== 'string') {
        currentString = inputString.toString();
        throw new Error('input must be a  string.');
    }
    if (typeof salt !== 'string') {
        console.error('salt must be a string.');
        throw new Error('salt must be a string.');
    }

    const dataToHash = salt + inputString;
    // const hash = createHash('sha256');
    // hash.update(dataToHash, 'utf8');
    // const hexHash = hash.digest('hex');
    // return hexHash;

    const hashed = createHash('sha256').update(dataToHash, 'utf8').digest('hex');
    return hashed
};


// // EXAMPLE +page.server.ts
// import { hash } from '$lib/tools/hash';

//  const someData = "Data for hashing in the backend.";
//  const hashedData = hash(someData); //

//  //optional salt
//  const mySalt = import.meta.env.VITE_SALT;
//  const hashedData = hash(someData, mySalt);