import opt from './options.js';

const lang = localStorage.getItem('lang') || 'ru';

class CreateButton {
  constructor(key) {
    this.key = key;
  }

  create() {
    const div = document.createElement('button');
    div.dataset.code = [this.key.code];
    if (!this.key.ins) {
      div.classList.add('button');
      div.dataset.alfaNum = '';
      div.innerText = opt[lang][this.key.code];
    } else {
      div.classList.add('button-service');
      div.dataset.service = '';
      div.innerText = this.key.ins;
    }
    return div;
  }
}

export default function onPageLoad() {
  const div = document.createElement('div');
  div.className = 'container';

  const textarea = document.createElement('textarea');
  textarea.className = 'textarea';
  textarea.autofocus = true;
  textarea.cols = 70;

  const textContainer = document.createElement('div');
  textContainer.className = 'text-container';
  textContainer.innerHTML = `
    <h1>Virtual Keyboard</h1>
    <p>Переключение раскладки: левые Ctrl и Alt. Сделано в ОС Windows.</p>`;

  const keyboard = document.createElement('div');
  keyboard.className = 'keyboard';

  [
    [0, 13],
    [14, 28],
    [29, 41],
    [42, 54],
    [55, 61],
  ].forEach((line) => {
    const keyboardRow = document.createElement('div');
    keyboardRow.className = 'keyboard-row';

    const [start, end] = line;
    for (let i = start; i <= end; i += 1) {
      keyboardRow.append(new CreateButton(opt.code[i]).create());
    }

    keyboard.append(keyboardRow);
  });

  div.append(textContainer, textarea, keyboard);
  document.body.append(div);
}
