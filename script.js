const userText = document.getElementById('userText')
const posOpts = document.getElementById('posOpts')
const pinyinBlock = document.getElementById('pinyinBlock')
const zhuyinBlock = document.getElementById('zhuyinBlock')

const umlaut = 'u' + '\u0308'
const vowelHierarchy = ['a', 'o', 'e', 'i', 'u', 'v']
const pinyinDiacritics = ['\u0304', '\u0301', '\u030C', '\u0300']
const zhuyinDiacritics = []

function changeRubyPos(str) {
    rubyElements = Array.from(document.getElementsByTagName('ruby'))

    rubyElements.forEach(element => {
        element.style.rubyPosition = str
    })
}

let pinyinKeys

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
    })
    .catch(error => console.log(error))
}

getZhChars()

function updateBlocks(str) {
    charArr = str.split('')
    pinyinBlock.innerHTML = ''
    
    charArr.forEach(char => {

        newRuby = document.createElement('ruby')

        charIndex = pinyinKeys.findIndex(({ trad }) => trad === char)
        if (charIndex >= 0) {
            newRT = document.createElement('rt')
            newRT.innerText = numToDiacritic(pinyinKeys[charIndex].pin1[0])

            newRuby.append(char)
            newRuby.append(newRT)
        }

        pinyinBlock.append(newRuby)
    })
}

function numToDiacritic(str) {
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