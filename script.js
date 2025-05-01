import { 
    pinyinKeys,
    splitPinyin, addPinTone, 
    constructPinRT, constructZhuRT,
    createHorRT 
} from './js/ruby-text.js'
import { 
    genWPStrToArr 
} from './js/word-process.js'
import { wordToZhu } from './js/eng-to-zhu.js'

const defaultChinese = "道可道，非常道。名可名，非常名。";
const defaultEnglish = "Sing cheese documentation."

const userText      = document.getElementById('userText')
const langSel       = document.querySelector('#langSel')
const pinPos        = document.querySelector('#pinPos')
const zhuPos        = document.querySelector('#zhuPos')
const pinyinBlock   = document.querySelector('#pinyinBlock')
const zhuyinBlock   = document.querySelector('#zhuyinBlock')

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

langSel.addEventListener('change', swapLang());

function swapLang() {
    return function executeOnEvent(e) {
        const newLang = e.target.value;
        console.log(newLang)

        if (newLang == 'chinese') {
            userText.value = defaultChinese
        } else if (newLang == 'english') {
            userText.value = defaultEnglish
        }
    }
}

pinPos.addEventListener('change', changeRubyPos('pinyin'));
zhuPos.addEventListener('change', changeRubyPos('zhuyin'));

function changeRubyPos(pinOrZhu) {
    
    return function executeOnEvent(e) {
                
        let rubyElements = []
        let str = e.target.value
        
        if (pinOrZhu == "pinyin") {
            rubyElements = Array.from(document.getElementsByClassName('pin-wrap'));
        } else if (pinOrZhu == "zhuyin") {
            rubyElements = Array.from(document.getElementsByClassName('zhu-wrap'));
        }
    
        console.log(pinOrZhu, str)

        rubyElements.forEach(element => {
            if (element.classList.length > 1) {
                element.classList.remove(element.classList[1])
            }
            element.classList.add("ruby-" + str)
        })
    }
}

userText.addEventListener('keyup', updateBlocks)

function updateBlocks() {
    const str = userText.value;
    pinyinBlock.innerHTML = ''
    zhuyinBlock.innerHTML = ''
    
    if (langSel.value == 'chinese') {
        const charArr = str.split('')

        
        charArr.forEach(char => {

            const charIndex = pinyinKeys.findIndex(({ trad }) => trad === char)
            if (charIndex >= 0) {
                
                const newPYRT = constructPinRT(char);
                const newZYRT = constructZhuRT(char);
    
                pinyinBlock.append(newPYRT);
                zhuyinBlock.append(newZYRT);
            } else {
                pinyinBlock.append(char)
                zhuyinBlock.append(char)
            }
        })
    } else if (langSel.value == 'english') {

        const wordArr = genWPStrToArr(str);

        wordArr.forEach(word => {
            const capText = wordToZhu(word);
            const newElem = createHorRT(word, capText);

            pinyinBlock.append(newElem);
            pinyinBlock.append(" ")
        })
    }
}
