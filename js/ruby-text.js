// import { splitPinyin, addPinTone, constructPinRT, constructZhuRT } from './ruby-text.js'

// FETCH DATA SECTION 

export const monocharLangs = [
    'zh', 'cmn', 'cmn-Hans', 'cmn-Hant', 
    'zh-TW', 'yue-Hant-HK', 'zh-CN', 
    'cmn-Hans-CN', 'cmn-Hant-TW'
]

export let pinyinKeys
let zhuyinDict

export function getZhChars() {
    fetch('../data/py_trad_monochars.json')
    .then(res => {
        if (res.ok) {
            console.log('Fetched chars to Pinyin')
        } else {
            console.log('Couldnt fetch chars to Pinyin')
        }
        return res.json()
    })
    .then(data => {
        pinyinKeys = data;
    })
    .catch(error => console.log(error))
}

export function getPinZhuDict() {
    fetch('../data/pin_to_zhu.json')
    .then(res => {
        if (res.ok) {
            console.log('Fetched Pin to Zhu')
        } else {
            console.log('Couldnt fetch Pin to Zhu')
        }
        return res.json()
    })
    .then(data => {
        zhuyinDict = data;
    })
    .catch(error => console.log(error))
}

getPinZhuDict()
getZhChars()

// END OF FETCH DATA SECTION

const umlaut = 'u' + '\u0308'
const vowelHierarchy = ['a', 'o', 'e', 'i', 'u', 'v']
const pinyinDiacritics = ['\u0304', '\u0301', '\u030C', '\u0300']
const zhuyinDiacritics = ['⸍','∨','⸌','∙']
const zhuyinDiacritics2 = ['ˊ','ˇ','ˋ','∙']
const zhuyinDiacritics3 = ['╱⸝','ˇ','╲⸜','•']

const pinyinCons = [
    'b', 'p', 'm', 'f', 
    'd', 't', 'n', 'l', 
    'g', 'k', 'h',
    'j', 'q', 'x',
    'z', 'c', 's', 'r'
]

export function splitPinyin(str) {
    const letterStr = str.substring(0, str.length - 1)
    const toneNum = str.substring(str.length - 1)

    return [letterStr, toneNum]
}

export function charToPin(char) {
    const pinIndex = pinyinKeys.findIndex(({ trad }) => trad === char)
    
    if (pinIndex >= 0) {
        return pinyinKeys[pinIndex].pin1[0]
    } else {
        return false
    }
}

export function charToZhu(char) {
    const pinyin = charToPin(char)
    const zhuyin = pinToZhu(pinyin)

    return zhuyin
}

export function pinToZhu(pin) {
    
    console.log(pin)
    const syll = splitPinyin(pin)[0]
    const tone = splitPinyin(pin)[1]
    
    let divideIndex = 0
    let zhuOnset = ''
    let zhuCoda = ''

    if (syll.substring(1, 2) == 'h') {
        divideIndex = 2
    } else if (pinyinCons.includes(syll.substring(0, 1))) {
        divideIndex = 1
    }

    const pinOnset = syll.slice(0, divideIndex)
    const pinCoda = syll.slice(divideIndex)

    if (pinOnset.length > 0) {
        zhuOnset = zhuyinDict[0][pinOnset]
    }

    if (['u', 'un', 'uan'].includes(pinCoda)) {
        if (['j', 'q', 'x'].includes(pinOnset)) {
            zhuCoda = zhuyinDict[1][pinCoda][1]
        } else {
            zhuCoda = zhuyinDict[1][pinCoda][0]
        }
    } else {
        zhuCoda = zhuyinDict[1][pinCoda]
    }

    const fullZhuyin = zhuOnset + zhuCoda

    return [fullZhuyin, tone]
}

export function addPinTone([letterStr, toneNum]) {

    let thisDiacritic = ''
    let newStr = letterStr
    
    if (toneNum < 5) {
        thisDiacritic = pinyinDiacritics[toneNum - 1]

        const letterArr = letterStr.split('')

        let i = 0

        while (!(letterArr.includes(vowelHierarchy[i]))){
            i++
        }

        const diaIndex = letterArr.indexOf(vowelHierarchy[i]) + 1

        if (letterArr.includes('v')) {
            newStr = newStr.slice(0, diaIndex - 1) 
                    + umlaut 
                    + thisDiacritic 
                    + newStr.slice(diaIndex, newStr.length)
        } else {
            newStr = newStr.slice(0, diaIndex) 
                    + thisDiacritic 
                    + newStr.slice(diaIndex, newStr.length)
        }
    }

    return newStr
}

export function constructPinRT(char, str) {

    if (!str) {
        str = addPinTone(splitPinyin(charToPin(char)))
    }

    let finalElem = createHorRT(char, str)

    return finalElem
}

export function constructZhuRT(char, str) {

    if (!str) {
        str = charToPin(char)
    }

    const splits = pinToZhu(str);
    const letterStr = splits[0];
    const toneNum = splits[1];

    const fullWrap = document.createElement('span')
    fullWrap.style.writingMode = 'vertical-rl'
    fullWrap.style.textOrientation = 'upright'

    const outerRuby = document.createElement('ruby')
    const innerRuby = document.createElement('ruby')
    const zhuRT = document.createElement('rt')
    const toneRT = document.createElement('rt')
    
    outerRuby.classList.add('zhu-wrap')
    zhuRT.classList.add('zhu-text')
    toneRT.classList.add('tone-text')

    zhuRT.innerText = letterStr

    if (toneNum > 1) {
        const zhuDia = zhuyinDiacritics[toneNum - 2]

        if (toneNum == 5) {
            zhuRT.innerText = zhuDia + zhuRT.innerText
        } else {
            toneRT.innerText = zhuDia

            innerRuby.append(toneRT)
        }
    }

    innerRuby.append(char)
    innerRuby.append(zhuRT)

    outerRuby.append(innerRuby)
    outerRuby.append(toneRT)

    fullWrap.append(outerRuby)

    return fullWrap
}

export function changeRubyPos(pinOrZhu, str) {
    
    if (pinOrZhu == "pinyin") {
        rubyElements = Array.from(document.getElementsByClassName('pin-wrap'))
    } else if (pinOrZhu == "zhuyin") {
        rubyElements = Array.from(document.getElementsByClassName('zhu-wrap'))
    }

    rubyElements.forEach(element => {
        if (element.classList.length > 1) {
            element.classList.remove(element.classList[1])
        }
        element.classList.add("ruby-" + str)
    })
}

export function createHorRT(main, cap) {
    const fullWrap = document.createElement('span')
    fullWrap.style.writingMode = 'horizontal-lr'
    fullWrap.style.textOrientation = 'upright'

    const pinRuby = document.createElement('ruby')
    const pinRT = document.createElement('rt')

    pinRuby.classList.add('pin-wrap')
    pinRT.classList.add('pin-text')
    pinRT.innerText = cap;


    pinRuby.append(main)
    pinRuby.append(pinRT)

    fullWrap.append(pinRuby)

    return fullWrap
}