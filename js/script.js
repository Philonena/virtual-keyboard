import opt from './options.js';
import onPageLoad from './createDom.js';

onPageLoad();

let lang = localStorage.getItem('lang') || 'ru';
let text = '';
let cursorStart = 0;
let cursorEnd = 0;
let pressedButton = false;
let isCapsLock = false;
let isShift = false;

const textarea = document.querySelector('textarea');
const alfaNumButtons = document.querySelectorAll('[data-alfa-num]');
const serviceButtons = document.querySelectorAll('[data-service]');

const textareaCols = 70;

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

textarea.addEventListener('blur', () => textarea.focus());
textarea.addEventListener('click', () => {
  cursorStart = textarea.selectionStart;
  cursorEnd = textarea.selectionEnd;
});

alfaNumButtons.forEach((but) => but.addEventListener('click', onClickAlfaNumButton));
serviceButtons.forEach((but) => but.addEventListener('click', onClickServiceButton));

function onKeyDown(ev) {
  ev.preventDefault();
  const key = document.querySelector(`[data-code=${ev.code}]`);
  if (key) {
    key.click();
    key.classList.add('click-button');
  }
}

function onKeyUp(ev) {
  const key = document.querySelector(`[data-code=${ev.code}]`);
  if (key) {
    key.classList.remove('click-button');
  }
  if (ev.code === 'ShiftLeft' || ev.code === 'ShiftRight') {
    isShift = false;
    changeButtons();
    selectionButton();
  }
}

function onClickAlfaNumButton(ev) {
  const key = ev.target.dataset.code;
  if (
    (pressedButton === 'ControlLeft' || pressedButton === 'ControlRight')
    && (key === 'KeyA' || key === 'KeyX' || key === 'KeyC' || key === 'KeyV')
  ) {
    switch (key) {
      case 'KeyA':
        cursorStart = 0;
        cursorEnd = text.length;
        changeTextareaSelected();
        break;
      case 'KeyX':
        navigator.clipboard.writeText(text.slice(cursorStart, cursorEnd));
        deleteText();
        break;
      case 'KeyC':
        navigator.clipboard.writeText(text.slice(cursorStart, cursorEnd));
        break;
      case 'KeyV':
        navigator.clipboard.readText().then((clipText) => addText(clipText.replace(/\t/g, '    ').replace(/\r/g, '\n')));
        break;
      default:
        break;
    }
  } else {
    addText(ev.target.innerText);
  }
  pressedButton = false;
  selectionButton();
}

function addText(key) {
  if (cursorStart === cursorEnd && cursorStart === text.length) {
    text += key;
  } else {
    text = text.slice(0, cursorStart) + key + text.slice(cursorEnd);
  }
  textarea.value = text;

  cursorStart += key.length;
  cursorEnd = cursorStart;

  changeTextareaSelected();
}

function deleteText(direction) {
  if (!((cursorStart === text.length && direction === 'next') || (cursorEnd === 0 && direction === 'prev'))) {
    if (cursorStart === cursorEnd) {
      direction === 'next' ? (cursorEnd += 1) : (cursorStart -= 1);
    }
    text = text.slice(0, cursorStart) + text.slice(cursorEnd);
    textarea.value = text;
    cursorEnd = cursorStart;

    changeTextareaSelected();
  }
}

function changeTextareaSelected() {
  textarea.selectionStart = cursorStart;
  textarea.selectionEnd = cursorEnd;
}

function onClickServiceButton(ev) {
  const key = ev.target.dataset.code;

  if (key !== 'ControlLeft' && key !== 'AltLeft') pressedButton = false;

  switch (key) {
    case 'Tab':
      addText('    ');
      break;
    case 'Space':
      addText(' ');
      break;
    case 'Enter':
      addText('\n');
      break;
    case 'CapsLock':
      isCapsLock = !isCapsLock;
      changeButtons();
      break;
    case 'ShiftLeft':
    case 'ShiftRight':
      isShift === key ? (isShift = false) : (isShift = key);
      changeButtons();
      break;
    case 'ControlLeft':
      if (pressedButton === 'AltLeft') {
        lang === 'ru' ? (lang = 'en') : (lang = 'ru');
        localStorage.setItem('lang', lang);
        pressedButton = false;
        changeButtons();
      } else pressedButton === 'ControlLeft' ? (pressedButton = false) : (pressedButton = 'ControlLeft');
      break;
    case 'AltLeft':
      if (pressedButton === 'ControlLeft') {
        lang === 'ru' ? (lang = 'en') : (lang = 'ru');
        localStorage.setItem('lang', lang);
        pressedButton = false;
        changeButtons();
      } else pressedButton === 'AltLeft' ? (pressedButton = false) : (pressedButton = 'AltLeft');
      break;
    case 'ControlRight':
      pressedButton = key;
      break;
    case 'Delete':
      deleteText('next');
      break;
    case 'Backspace':
      deleteText('prev');
      break;
    case 'ArrowLeft':
      if (cursorStart !== 0) cursorStart -= 1;
      if (!isShift) cursorEnd = cursorStart;
      changeTextareaSelected();
      break;
    case 'ArrowRight':
      if (cursorEnd !== text.length) cursorEnd += 1;
      if (!isShift) cursorStart = cursorEnd;
      changeTextareaSelected();
      break;
    case 'ArrowUp':
      cursorStart = onArrowClick('up', cursorStart);
      if (!isShift) cursorEnd = cursorStart;
      changeTextareaSelected();
      break;
    case 'ArrowDown':
      cursorEnd = onArrowClick('down', cursorEnd);
      if (!isShift) cursorStart = cursorEnd;
      changeTextareaSelected();
      break;

    default:
      break;
  }

  selectionButton();
}

function onArrowClick(direction, cursorPos) {
  if (direction === 'up' && cursorPos <= textareaCols && !text.includes('\n')) return 0;
  if (direction === 'down' && cursorPos >= text.length - textareaCols && !text.includes('\n')) return text.length;

  const textArr = [];

  text.split('\n').forEach((str) => {
    if (str.length <= textareaCols) {
      textArr.push(`${str}+`);
    } else {
      let lastIndex = 0;
      for (let i = textareaCols; i < str.length; i += textareaCols) {
        while (str[i] !== ' ' && str[i] !== '\t' && i > lastIndex) {
          i -= 1;
        }
        i === lastIndex ? (i += textareaCols + 1) : (i += 1);
        textArr.push(str.substring(lastIndex, i));
        lastIndex = i;
        if (str.length - i < textareaCols) textArr.push(`${str.substring(i)}+`);
      }
    }
  });

  let lineNumber = 0;
  let linePosition = cursorPos;

  while (textArr[lineNumber].length <= linePosition) {
    linePosition -= textArr[lineNumber].length;
    lineNumber += 1;
  }

  let newPosition = 0;
  const line = direction === 'up' ? lineNumber - 1 : lineNumber + 1;

  if (line >= textArr.length) return text.length;
  if (line < 0) return 0;

  for (let i = 0; i < line; i += 1) {
    newPosition += textArr[i].length;
  }
  textArr[line].length < linePosition
    ? (newPosition += textArr[line].length - 1)
    : (newPosition += linePosition);

  return newPosition;
}

function changeButtons() {
  alfaNumButtons.forEach((but) => {
    if (isShift) {
      but.textContent = opt[`${lang}Shift`][but.dataset.code];
    } else {
      isCapsLock
        ? (but.textContent = opt[lang][but.dataset.code].toUpperCase())
        : (but.textContent = opt[lang][but.dataset.code]);
    }
  });
}

function selectionButton() {
  serviceButtons.forEach((but) => but.classList.remove('active-button'));
  if (pressedButton) document.querySelector(`[data-code=${pressedButton}]`).classList.add('active-button');
  if (isCapsLock) document.querySelector('[data-code=CapsLock').classList.add('active-button');
  if (isShift) document.querySelector(`[data-code=${isShift}`).classList.add('active-button');
}
