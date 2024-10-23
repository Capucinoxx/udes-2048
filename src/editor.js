class Editor {
  #els = [];
  #els_draggable;
  #dropzone;
  #editor_zone;

  constructor(dropzone, els_draggable, editor_zone) {
    this.#dropzone = dropzone;
    this.#els_draggable = els_draggable;
    this.#editor_zone = editor_zone;

    this.handle_toggling();
    this.setup_dropzone();
    this.setup_editor();
    this.update();
  }

  handle_toggling() {
    const toggling_el = [this.#dropzone, this.#editor_zone];
    const buttons = toggling_el.map(el => el.nextElementSibling);

    let idx = 0;

    buttons.forEach(button => {
      button.addEventListener('click', async (e) => {
        if (idx === 1 && !(await accept_confirm_box())) {
          return;
        }

        if (idx === 1) {
          this.#editor_zone.classList.add('read-only');
          this.#dropzone.classList.remove('read-only');
          this.#els_draggable.classList.remove('read-only');
          this.update();
        } else {
          this.#editor_zone.classList.remove('read-only');
          this.#dropzone.classList.add('read-only');
          this.#els_draggable.classList.add('read-only');
        }

        buttons[idx].style.visibility = 'hidden';
        toggling_el[idx].classList.remove('focused-edition');

        idx = (idx + 1) % buttons.length;
        buttons[idx].style.visibility = 'visible';
        toggling_el[idx].classList.add('focused-edition');
      });

      if (idx === 0) {
        this.#editor_zone.classList.add('read-only');
        this.#dropzone.classList.remove('read-only');
        this.#els_draggable.classList.remove('read-only');
      } else {
        this.#editor_zone.classList.remove('read-only');
        this.#dropzone.classList.add('read-only');
        this.#els_draggable.classList.add('read-only');
      }
    });
  }

  create_block(block) {
    const div = block.create();

    div.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text', block.stringify());
      div.classList.add('dragging');
    });

    div.addEventListener('dragend', (e) => {
      div.classList.remove('dragging');
      Array.from(this.#dropzone.childNodes).forEach((el) => el.classList.remove('over'));
      Array.from(this.#els_draggable.childNodes).forEach((el) => el.classList.remove('over'));

      if (div.parentNode === this.#dropzone)
        div.remove();

      this.update();
    });

    div.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.target.classList.add('over');
    });

    div.addEventListener('dragleave', (e) => {
      e.target.classList.remove('over');
    });

    this.#els_draggable.appendChild(div);

    return div;
  }

  setup_editor() {
    this.#editor_zone.addEventListener('keydown', (e) => {
      e.stopPropagation();

      this.distach_editor_changement(e.target.value);
    })
  }

  setup_dropzone() {
    this.#dropzone.addEventListener('drop', (e) => {
      e.preventDefault();

      const text = e.dataTransfer.getData('text');
      let block;
      try {
        block = Block.parse(text);
      } catch (e) {
        return;
      }

      const closest = this.get_closest_draggable(e.clientY);
      e.target.classList.remove('dragging');

      block = this.create_block(block);

      if (closest === null) {
        this.#dropzone.appendChild(block);
        return;
      }

      const { top, height } = closest.getBoundingClientRect();
      if (e.clientY < (top + height / 2)) {
        this.#dropzone.insertBefore(block, closest);
      } else {
        this.#dropzone.insertAfter(block, closest);
      }

      const blocks = Array.from(this.#dropzone.childNodes).map((block) => Object.assign(block, { 'type': block.getAttribute('data-type'), 'code': block.getAttribute('data-code') }));
      if (!BlockManager.synthax_is_valid(blocks)) {
        this.#dropzone.removeChild(block);

        this.#dropzone.addEventListener('dragend', (e) => {
          e.preventDefault();
        }, { once: true });
      }
    });

    this.#dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
    });
  }

  distach_editor_changement(data) {
    document.dispatchEvent(new CustomEvent('editor-modif', { detail: data }));
  }

  get_closest_draggable(y) {
    const els = Array.from(this.#dropzone.childNodes);

    return els.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset)
        return { offset: offset, element: child };
      return closest;
    }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
  }


  update() {
    const blocks = Array.from(this.#dropzone.childNodes).map((block) => Object.assign(block, { 'type': block.getAttribute('data-type'), 'code': block.getAttribute('data-code') }));
    const valids = BlockManager.valid_next_blocks(blocks);

    BlockManager.generate_code(blocks, this.#editor_zone);
    this.distach_editor_changement(this.#editor_zone.value);

    Array.from(this.#els_draggable.children).forEach((el) => {
      const type = el.getAttribute('data-type');

      if (!valids.includes(type)) {
        el.classList.add('blocked');
      } else {
        el.classList.remove('blocked');
      }
    });
  }

  set_blocks(blocks) {
    this.#els = [];
    this.#els_draggable.innerHTML = '';
    blocks.forEach((block) => this.#els.push(this.create_block(block)));
    this.update();
  }

  cleanup() {
    this.#editor_zone.value = '';
    this.#dropzone.innerHTML = '';
  }
};


class Block {
  #text;
  #type;
  #code;

  generator = {
    [BlockManager.BLOCK_ACTION]: ActionBlock,
    [BlockManager.BLOCK_IF_STMT]: IfBlock,
    [BlockManager.BLOCK_FOR_STMT]: ForEachBlock,
    [BlockManager.BLOCK_FOR_STMT_IT]: ForIteratifBlock,
    [BlockManager.BLOCK_FOR_STMT_IT_DESC]: ForIteratifDescBlock,
    [BlockManager.BLOCK_CLOSE]: CloseBlock,
    [BlockManager.BLOCK_CONDITION]: ConditionBlock,
    [BlockManager.BLOCK_ASSIGNMENT]: AssignmentBlock
  };

  color = {
    [BlockManager.BLOCK_ACTION]: 'green',
    [BlockManager.BLOCK_IF_STMT]: 'yellow',
    [BlockManager.BLOCK_FOR_STMT]: 'yellow',
    [BlockManager.BLOCK_FOR_STMT_IT]: 'yellow',
    [BlockManager.BLOCK_FOR_STMT_IT_DESC]: 'yellow',
    [BlockManager.BLOCK_CLOSE]: 'yellow',
    [BlockManager.BLOCK_CONDITION]: 'blue',
    [BlockManager.BLOCK_ASSIGNMENT]: 'red'
  }

  constructor(text, type, code) {
    this.#text = text;
    this.#type = type;
    this.#code = code;
  }

  get type() { return this.#type; }
  get text() { return this.#text; }
  get code() { return this.#code; }

  static parse(info) {
    if (typeof info === 'string')
      info = JSON.parse(info);
    return new new Block().generator[info.type](info.text, info.code);
  }

  create() {
    const div = document.createElement('div');
    div.draggable = 'true';
    div.classList.add('block', 'draggable');
    div.setAttribute('data-type', this.type);
    div.setAttribute('data-code', this.code);
    div.style.setProperty('--background', `var(--${this.color[this.type]}-100)`);
    div.style.setProperty('--foreground', `var(--${this.color[this.type]}-200)`);
    div.innerText = this.text;
    return div;
  }

  stringify() {
    const { type, text, code } = this;
    return JSON.stringify({ type, text, code });
  }
};

class ConditionBlock extends Block 
  { constructor(text, code) { super(text, BlockManager.BLOCK_CONDITION, code); } };

class IfBlock extends Block 
  { constructor(text, code) { super(text, BlockManager.BLOCK_IF_STMT, code); } };

class ForEachBlock extends Block 
  { constructor(text, code) { super(text, BlockManager.BLOCK_FOR_STMT, code); } };

class ForIteratifBlock extends Block 
  { constructor(text, code) { super(text, BlockManager.BLOCK_FOR_STMT_IT, code); } };

class ForIteratifDescBlock extends Block 
  { constructor(text, code) { super(text, BlockManager.BLOCK_FOR_STMT_IT_DESC, code); } };

class CloseBlock extends Block 
  { constructor(text, code) { super(text, BlockManager.BLOCK_CLOSE, code); } };

class ActionBlock extends Block 
  { constructor(text, code) { super(text, BlockManager.BLOCK_ACTION, code); } };

class AssignmentBlock extends Block 
  { constructor(text, code) { super(text, BlockManager.BLOCK_ASSIGNMENT, code); } };
