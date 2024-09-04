//const fs = require('fs');
import fs from 'fs';

const checkNumber = value => {
    const num = Number(value);
    if (isNaN(value) && typeof value == 'string') {
        const checkNum = Number(value);
        const testNumber = isNaN(checkNum);
        if (testNumber) {
            return 0;
        }
        return checkNum;
    }
    if (isNaN(num)) {
        return 0;
    }
    return num;

};

//module.exports = {
export const tools = {
    fixedTo: (num, precision) => {
        return (+(Math.round(+(num + "e" + precision)) + "e" + -precision)).toFixed(
            precision
        );
    },
    write: (line, file, dir) => {
        const logStream = fs.createWriteStream(`${dir || 'logs/'}${file || 'systemlog.txt'}`, { flags: 'a' });
        logStream.write(`${new Date(Date.now()).toLocaleString('it-IT')}: ${JSON.stringify(line)}\n`);
        logStream.end();
    },
    check: (type, value) => {
        const checkType = typeof value;
        switch (type) {
            case 'string':
                //console.log('string:', value);
                if (value === undefined || value === null) {
                    return '';
                }
                return String(value);
            case 'number':
                //console.log('number:', value);
                return checkNumber(value);
            case 'boolean':
                //console.log('boolean:', value);
                if (value === 'false') {
                    return false;
                }
                return !!value;
            case 'function':
                //console.log('function:', value);
                if (checkType === 'function') {
                    return value;
                }
                return '';
            case 'object':
                //console.log('object:', value);
                if (checkType === 'object') {
                    return value;
                }
                return {};
            default:
                return undefined;
        }
    },
};