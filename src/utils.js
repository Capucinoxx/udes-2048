class EditorString {
  #value;

  constructor(value) { this.#value = value; }

  get value() { return this.#value; }
  set value(v) { this.#value = v; }

  equals(oth) {
    return (oth instanceof EditorString && this.value === oth.value) || (oth instanceof String && this.value === oth);
  }

  toString() {
    return this.#value;
  }
};
