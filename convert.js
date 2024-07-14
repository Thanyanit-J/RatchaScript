import { readFile, writeFile } from 'fs';
import map from './resources/map.json' with { type: "json" };


// Some value from mapping may ruin the regex: escape it
const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
};

const isInsideQuotes = (code, index) => {
    let isInside = false;
    let currentQuoteType = null;

    for (let i = 0; i < index; i++) {
        if ((code[i] === '"') && (i === 0 || code[i - 1] !== '\\')) {
            if (!isInside) {
                isInside = true;
                currentQuoteType = code[i];
            } else if (currentQuoteType === code[i]) {
                isInside = false;
                currentQuoteType = null;
            }
        }
    }
    return isInside && currentQuoteType === '"';
};

// Replace value in code only if it is not inside quotes
const replaceInCode = (code, searchValue, replaceValue, isRegex = false) => {
    let result = '';
    let i = 0;

    if (isRegex) {
        return code.replace(new RegExp(searchValue, 'g'), match => {
            const index = code.indexOf(match);
            return isInsideQuotes(code, index) ? match : replaceValue;
        });
    }

    while (i < code.length) {
        if (code.substr(i, searchValue.length) === searchValue && !isInsideQuotes(code, i)) {
            result += replaceValue;
            i += searchValue.length;
        } else {
            result += code[i];
            i++;
        }
    }

    return result;

};

// Replace value in code only if it is inside quotes
const replaceInsideQuotes = (code, searchValue, replaceValue, isRegex = false) => {
    let result = '';
    let i = 0;

    if (isRegex) {
        return code.replace(new RegExp(searchValue, 'g'), match => {
            const index = code.indexOf(match);
            return !isInsideQuotes(code, index) ? match : replaceValue;
        });
    }

    while (i < code.length) {
        if (code.substr(i, searchValue.length) === searchValue && isInsideQuotes(code, i)) {
            result += replaceValue;
            i += searchValue.length;
        } else {
            result += code[i];
            i++;
        }
    }

    return result;
};

const replaceนอกข้อความ = (str, mapping) => {
    const ignorePattern = /ข้อความ.*?เพียงเท่านี้/g;
    let match;
    let parts = [];
    let lastIndex = 0;

    while ((match = ignorePattern.exec(str)) !== null) {
        // Add part before "ข้อความ"
        parts.push({ text: str.slice(lastIndex, match.index), ignore: false });
        // Add part between "ข้อความ" and "เพียงเท่านี้"
        parts.push({ text: match[0], ignore: true });
        lastIndex = ignorePattern.lastIndex;
    }
    // Add the remaining part of the string
    parts.push({ text: str.slice(lastIndex), ignore: false });

    return parts.map(part => {
        if (part.ignore) {
            return part.text.replace(/ข้อความ|เพียงเท่านี้/g, '"');
        };
        return Object.keys(mapping).reduce((acc, phrase) => {
            const regex = new RegExp(phrase, 'g');
            const รวมกับ = new RegExp('รวมกับ', 'g');
            acc = acc.replace(รวมกับ, mapping['รวมกับ']);
            acc = acc.replace(regex, mapping[phrase]);
            return acc;
        }, part.text);
    }).join('');
}


const JSToThai = (jsCode) => {
    let thaiCode = jsCode;

    // Convert single quotes to double quotes and handle escaped single quotes
    thaiCode = replaceInCode(thaiCode, "'", '"');
    thaiCode = replaceInsideQuotes(thaiCode, "\\'", "'");

    // Handle specific brackets and parentheses
    thaiCode = replaceInCode(thaiCode, '()', 'โดยทั่วไป');
    thaiCode = replaceInCode(thaiCode, '{}', 'จนกว่าจะได้รับคำสั่ง');
    thaiCode = replaceInCode(thaiCode, '[]', 'สมาชิกอันสมควรได้รับการยกย่อง');

    // Handle specific cases
    thaiCode = replaceInCode(thaiCode, '===', 'ซึ่งมีคุณสมบัติเหมือนกันทุกประการกับ');
    thaiCode = replaceInCode(thaiCode, '==', 'ซึ่งมีลักษณะเทียบเคียงได้กับ');
    thaiCode = replaceInCode(thaiCode, '<=', 'น้อยกว่าหรือเท่ากับ');
    thaiCode = replaceInCode(thaiCode, '>=', 'มากกว่าหรือเท่ากับ');
    thaiCode = replaceInCode(thaiCode, '++', 'ได้รับการแต่งตั้งเพิ่มขึ้นอีกหนึ่งขั้น');
    thaiCode = replaceInCode(thaiCode, '--', 'ถูกถอดยศพร้อมเรียกคืนเครื่องราชอิสริยาภรณ์');
    thaiCode = replaceInCode(thaiCode, '=>', 'ให้พิจารณา');
    thaiCode = replaceInCode(thaiCode, '//', 'ขอเสนอความเห็นไว้ว่า');
    thaiCode = replaceInCode(thaiCode, '/**', 'มีความเห็นดังนี้');
    thaiCode = replaceInCode(thaiCode, '/*', 'มีความเห็นว่า');
    thaiCode = replaceInCode(thaiCode, '*/', 'ขอบคุณที่รับฟัง');

    // Replace all keys in the map with their respective values
    for (const [key, value] of Object.entries(map)) {
        if (value === '"') {
            continue;
        }
        if ([".", "*", "+", "?", "^", "$", "{", "}", "(", ")", "|", "[", "]", "\\", "/", ";", "="].includes(value)) {
            thaiCode = replaceInCode(thaiCode, value, key);
        } else {
            const escapedValue = escapeRegExp(value);
            thaiCode = replaceInCode(thaiCode, escapedValue, key);
        }
    }

    // Handle quotes separately and latest to make sure no value in the quote is changed
    let insideString = false;
    thaiCode = thaiCode.split('').map(char => {
        if (char === '"' && !insideString) {
            insideString = true;
            return 'ข้อความ';
        } else if (char === '"' && insideString) {
            insideString = false;
            return 'เพียงเท่านี้';
        }
        return char;
    }).join('');


    return thaiCode;
};

const ThaiToJS = (thaiCode) => {
    let jsCode = thaiCode;

    jsCode = replaceนอกข้อความ(jsCode, map);

    return jsCode;
};

const convertAndSave = (inputFile, outputFile, conversionFunction) => {
    readFile(inputFile, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file ${inputFile}:`, err);
            return;
        }

        const convertedData = conversionFunction(data);
        if (!convertedData) {
            return;
        }

        writeFile(outputFile, convertedData.toString(), 'utf8', (err) => {
            if (err) {
                console.error(`Error writing to file ${outputFile}:`, err);
                return;
            }

            console.log(`Converted code saved to ${outputFile}`);
        });
    });
};

// Example usage
convertAndSave('example-javascript.js', 'output_thai.เจเอส', JSToThai);
convertAndSave('output_thai.เจเอส', 'output_js.js', ThaiToJS);
