// import {} from './js/eng-to-zhu.js'

// const userText = document.querySelector('.user-text');
const transText = document.querySelector('.trans-text');

let engIpa = [];
let ipaToZhu = [];

// check these consonants for combinations with the /i/ vowel
const consCheck = ['dʒ', 'tʃ', 'ʃ'];
// check these vowels for combinations with word-final 
// /n/ or /ŋ/ sounds
const vowCheck = ['ʌ', 'ɛ', 'i', 'ɪ', 'ɔ']

// userText.addEventListener('keyup', translateText);

fetchEngIPA()

function fetchEngIPA() {
    fetch("../data/syll_IPA.json")
    .then(res => res.json())
    .then(data => {
        console.log('Successfully fetched English IPA syllables.');
        engIpa = data;
        fetchIPAtoZhu();
    })
}

function fetchIPAtoZhu() {
    fetch("../data/ipa_to_zhu.json")
    .then(res => res.json())
    .then(data => {
        console.log('Successfully fetched IPA to zhuyin dict.');
        ipaToZhu = data;
        const testArr = wordToIpa('friday');
        const revArr = reviseIpaArr(testArr);
        console.log(ipaToZY(revArr));
    })
}

function wordToIpa(str) {
    let i = 0;

    while (engIpa[i][0] != str) {
        i++;
    }

    return engIpa[i][1];
}

function ipaToZY(arr) {
    let newArr = [];
    
    arr.forEach(syll => {
        syll.forEach(letter => {
            newArr.push(ipaToZhu[0][letter]);
        })
    });

    return newArr;
}

function translateText() {
    const textArr = userText.value.toLowerCase().split(' ');

    let zhuStr = '';

    textArr.forEach(word => {
        const thisIpa = wordToIpa(word);
        const revIpa = reviseIpaArr(thisIpa);
        const thisZY = ipaToZY(thisIpa);

        thisZY.forEach(zhu => {
            zhuStr = zhuStr.concat(zhu);
        })
    })

    transText.innerText = zhuStr
}

export function wordToZhu(str) {
    let zhuStr = '';

    const thisIpa = wordToIpa(str);
    const revIpa = reviseIpaArr(thisIpa);
    const thisZY = ipaToZY(revIpa);

    thisZY.forEach(zhu => {
        zhuStr = zhuStr.concat(zhu);
    })

    console.log(zhuStr)
    return zhuStr
}

function reviseIpaArr(arr) {
    let newArr = [...arr];
    
    newArr.forEach(syll => {
        for (let i = 0; i < syll.length; i++){
            if (consCheck.includes(syll[i]) && ['i', 'ɪ'].includes(syll[i+1])) {
                const combined = syll[i] + syll[i + 1];
                console.log(combined)
                syll.splice(i, 1, combined);
            }
    
            if (['n', 'ŋ'].includes(syll[i]) && vowCheck.includes(syll[i-1])) {
                const combined = syll[i - 1] + syll[i];
                syll.splice(i - 1, 2, combined);
            }
        }
    })


    console.log(newArr);
    return newArr
}