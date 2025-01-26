const userText = document.getElementById('userText')
const pinPos = document.getElementById('pinPos')
const zhuPos = document.getElementById('zhuPos')
const pinyinBlock = document.getElementById('pinyinBlock')
const zhuyinBlock = document.getElementById('zhuyinBlock')

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

function changeRubyPos(pinOrZhu, str) {
    
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

let pinyinKeys
let zhuyinDict

function getZhChars() {
    fetch('./data/mono_chars2.json')
    .then(res => {
        if (res.ok) {
            console.log('Successfully fetched pinyin keys.')
        } else {
            console.log('Failed to fetch pinyin keys.')
        }
        return res.json()
    })
    .then(data => {
        pinyinKeys = data;
        updateBlocks(userText.value)
    })
    .catch(error => console.log(error))
}

function getPinZhuDict() {
    fetch('./data/pin_to_zhu_2.json')
    .then(res => {
        if (res.ok) {
            console.log('Successfully fetched zhuyin dict.')
        } else {
            console.log('Failed to fetch zhuyin dict.')
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

function updateBlocks(str) {
    charArr = str.split('')
    pinyinBlock.innerHTML = ''
    zhuyinBlock.innerHTML = ''
    
    charArr.forEach(char => {

        newRuby = document.createElement('ruby')
        newRuby.classList.add('pin-wrap')

        charIndex = pinyinKeys.findIndex(({ trad }) => trad === char)
        if (charIndex >= 0) {
            pinRT = document.createElement('rt')
            pinRT.classList.add('pin-text')
            pinRT.innerText = insertPYDiacritic(pinyinKeys[charIndex].pin1[0])

            newRuby.append(char)
            newRuby.append(pinRT)

            pinyinBlock.append(newRuby)
            zhuyinBlock.append(constructZhuyinRT(char, pinyinKeys[charIndex].pin1[0]))
        } else {
            pinyinBlock.append(char)
            zhuyinBlock.append(char)
        }
    })
}

function insertPYDiacritic(str) {
    letterStr = str.substring(0, str.length - 1)
    toneNum = str.substring(str.length - 1)
    thisDiacritic = null
    newStr = letterStr
    
    if (toneNum < 5) {
        thisDiacritic = pinyinDiacritics[toneNum - 1]

        letterArr = letterStr.split('')

        let i = 0

        while (!(letterArr.includes(vowelHierarchy[i]))){
            i++
        }

        diaIndex = letterArr.indexOf(vowelHierarchy[i]) + 1

        if (letterArr.includes('v')) {
            newStr = str.slice(0, diaIndex - 1) 
                    + umlaut 
                    + thisDiacritic 
                    + str.slice(diaIndex, str.length - 1)
        } else {
            newStr = str.slice(0, diaIndex) 
                    + thisDiacritic 
                    + str.slice(diaIndex, str.length - 1)
        }
    }

    return newStr
}

function pinToZhu(syll) {
    let divideIndex = 0
    let zhuOnset = ''
    let zhuCoda = ''

    if (syll.substring(1, 2) == 'h') {
        divideIndex = 2
    } else if (pinyinCons.includes(syll.substring(0, 1))) {
        divideIndex = 1
    }

    pinOnset = syll.slice(0, divideIndex)
    pinCoda = syll.slice(divideIndex)

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

    fullZhuyin = zhuOnset + zhuCoda

    return fullZhuyin
}

function constructZhuyinRT(char, str) {
    letterStr = str.substring(0, str.length - 1)
    toneNum = str.substring(str.length - 1)

    newRuby = document.createElement('ruby')
    miniRuby = document.createElement('ruby')
    zhuRT = document.createElement('rt')
    toneRT = document.createElement('rt')

    newRuby.classList.add('zhu-wrap')
    zhuRT.classList.add('zhu-text')
    toneRT.classList.add('tone-text')

    zhuRT.innerText = pinToZhu(letterStr)

    if (toneNum > 1) {
        zhuDia = zhuyinDiacritics[toneNum - 2]

        if (toneNum == 5) {
            zhuRT.innerText = zhuDia + zhuRT.innerText
        } else {
            toneRT.innerText = zhuDia

            miniRuby.append(toneRT)
        }
    }

    miniRuby.append(char)
    miniRuby.append(zhuRT)

    newRuby.append(miniRuby)
    newRuby.append(toneRT)

    return newRuby
}