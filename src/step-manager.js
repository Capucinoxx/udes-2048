class Step {
  #title;
  #explanation;
  #blocks;
  #header_code;
  #footer_code;
  #code_str = '';
  #assertions;

  constructor(title, blocks, explanation, assertions, header_code = '', footer_code = '') {
    this.#blocks = blocks;
    this.#title = title;
    this.#explanation = explanation;
    this.#header_code = header_code;
    this.#footer_code = footer_code;
    this.#assertions = assertions;
  }

  get title() { return this.#title; }
  get explanation() { return this.#explanation; }
  get assertions() { return this.#assertions; }

  set code(value) { this.#code_str = value; }

  load(editor) {
    editor.set_blocks(this.#blocks);
  }

  assert() {
    return this.#assertions.reduce((acc, curr) => ({
      ...acc,
      [curr.title]: curr.assert(this.eval_function())
    }), {});
  }

  eval_function() {
    try {
      const code = `${this.#header_code}${this.#code_str}${this.#footer_code}`;
      return eval(code);
    } catch (e) {
      console.log(e, `${this.#header_code}${this.#code_str}${this.#footer_code}`);
      return () => { };
    }
  }
}

class Assertion {
  #got;
  #want;
  #title;

  constructor(title, got, want) {
    this.#title = title;
    this.#got = got;
    this.#want = want;
  }

  get title() { return this.#title; }

  assert(eval_function) {
    if (!eval_function) return false;

    try {
      const result = eval_function(this.#got);
      return this.#want.equals(result);
    } catch (e) {
      return false;
    }
  }
};

class AssertionBatch {
  #got;
  #want;
  #title;

  constructor(title, got, want) {
    this.#title = title;
    this.#got = got;
    this.#want = want;
  }

  get title() { return this.#title; }

  assert(eval_function) {
    if (!eval_function) return false;
    if (this.#got.length !== this.#want.length) return false;

    for (let i = 0; i != this.#got.length; i++) {
      try {
        const result = eval_function(this.#got[i]);
        if (!result.equals(this.#want[i]))
          return false;
      } catch (e) {
        return false;
      }
    }

    return true;
  }
}

class StepManager {
  #editor;
  #current_step;
  #steps;

  #explanation_el;
  #scenarios_el;
  #progressbar_el;

  constructor(editor, explanation_el, scenarios_el, progressbar_el, steps, current_step = 0) {
    this.#editor = editor;
    this.#explanation_el = explanation_el;
    this.#scenarios_el = scenarios_el;
    this.#progressbar_el = progressbar_el;

    this.#current_step = current_step;
    this.#steps = steps;

    this.setup_change_listener();
  }

  get_step(index) {
    return this.#steps[index];
  }

  setup_change_listener() {
    document.addEventListener('editor-modif', (e) => {
      this.#steps[this.#current_step].code = e.detail;
      if (this.run_tests()) {
        this.#current_step++;
        this.#editor.cleanup();
        this.load_step();
      }
    });
  }

  load_step() {
    const step = this.#steps[this.#current_step];

    const progress_steps = this.#progressbar_el.children;
    for (let i = 0; i < this.#current_step; i++) {
      progress_steps[i].classList = ['step-done'];
      progress_steps[i].innerText = '';
    }
    progress_steps[this.#current_step].classList = ['step-current'];
    progress_steps[this.#current_step].innerText = `${this.#current_step + 1}`;

    if (!step) return;

    const title = this.#explanation_el.querySelector('h3');
    title.innerText = `${this.#current_step + 1}- ${step.title}`;

    const explanation = this.#explanation_el.querySelector('.text');
    explanation.innerText = step.explanation;

    step.load(this.#editor);

    if (this.run_tests()) {
      this.#current_step++;
      this.load_step();
    }
  }

  run_tests() {
    const step = this.#steps[this.#current_step];

    const scenarios = this.#scenarios_el;
    scenarios.innerHTML = '';
    let all_assertions_passed = true;

    if (step == null)
      return false;

    step.assertions.forEach((assertion) => {
      const list_item = document.createElement('li');
      list_item.innerText = assertion.title;
      if (assertion.assert(step.eval_function())) {
        list_item.classList.add('done');
      } else {
        all_assertions_passed = false;
      }
      scenarios.appendChild(list_item);
    });

    return all_assertions_passed && this.#current_step != this.#steps.length;
  }
}
