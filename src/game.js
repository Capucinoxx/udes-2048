const grid_width = 4;
const cell_width = 7;
const cell_gap = 1;

const is_empty_function = fn =>
  typeof fn === "function" && fn.toString() === "() => {}";

class Grid {
  #cells;

  constructor(grid) {
    if (grid) {
      const width = grid.offsetWidth;
      grid.style.setProperty('--grid-size', grid_width);
      grid.style.setProperty('--cell-size', `${width / 4}px`);
      grid.style.setProperty('--cell-gap', `${cell_gap}vmin`);
    }

    this.init_cells(grid);
  }

  init_cells(grid) {
    if (grid) {
      grid.innerHTML = '';
      document.querySelector('#score').innerText = '0';
    }


    this.#cells = [];
    for (let x = 0; x < grid_width; x++) {
      for (let y = 0; y < grid_width; y++) {
        const cell = new Cell(document.createElement('div'), x, y);
        if (grid)
          grid.append(cell.el);
        this.#cells.push(cell);
      }
    }
  }

  get cells() { return this.#cells; }

  get cells_row() {
    return this.#cells.reduce((acc, cell) => {
      acc[cell.y] = acc[cell.y] || [];
      acc[cell.y][cell.x] = cell;
      return acc;
    }, []);
  }

  get cells_col() {
    return this.#cells.reduce((acc, cell) => {
      acc[cell.x] = acc[cell.x] || [];
      acc[cell.x][cell.y] = cell;
      return acc;
    }, []);
  }

  get empty_cells() { return this.#cells.filter(cell => cell.tile == null); }

  random_empty_cell() {
    const cells = this.empty_cells;
    const idx = Math.floor(Math.random() * cells.length);
    let empty = cells[idx];
    return empty;
  }

  equals(oth) {
    if (!(oth instanceof Grid))
      return false;

    for (let i = 0; i != this.#cells.length; i++)
      if (!this.#cells[i].equals(oth.cells[i]))
        return false;


    return true;
  }

  load_cfg(cells, el = undefined) {
    cells.forEach((cell) => {
      const idx = cell.x * grid_width + cell.y;
      cell.tile = new Tile(undefined, 4);

      this.#cells[idx] = cell;

    });

    return this;
  }
}

class Cell {
  #el;
  #x;
  #y;
  #tile;
  #merge_tile;

  constructor(el, x, y) {
    this.#x = x;
    this.#y = y;
    this.#el = el;
    if (this.#el !== undefined)
      this.#el.classList.add('cell');
  }

  get x() { return this.#x; }
  get y() { return this.#y; }
  get tile() { return this.#tile; }
  get el() { return this.#el; }

  set tile(value) {
    this.#tile = value;
    if (value == null)
      return;
    this.#tile.x = this.#x;
    this.#tile.y = this.#y;
  }

  get merge_tile() { return this.#merge_tile; }

  set merge_tile(value) {
    this.#merge_tile = value;
    if (value == null) return;
    this.#merge_tile.x = this.#x;
    this.#merge_tile.y = this.#y;
  }

  can_accept(tile) {
    return !this.tile || (
      !this.merge_tile && this.tile.value === tile.value);
  }

  merge() {
    if (this.tile == null || this.merge_tile == null)
      return;

    this.tile.value += this.merge_tile.value;
    document.dispatchEvent(new CustomEvent('score-add', { detail: this.tile.value }));
    this.merge_tile.remove();
    this.merge_tile = null;
  }

  equals(oth) {
    const res = oth instanceof Cell &&
      this.x === oth.x &&
      this.y === oth.y &&
      ((this.tile == undefined && oth.tile == undefined) || (this.tile && this.tile.equals(oth.tile)));

    return res;
  }
}

class Tile {
  #el;
  #value;
  #x;
  #y;
  #color = '';

  constructor(container = undefined, value = Math.random() > 0.5 ? 2 : 4) {
    this.#el = document.createElement('div');
    this.#el.classList.add('tile');
    if (container)
      container.append(this.#el);
    this.value = value;
  }

  get value() { return this.#value; }

  set value(v) {
    this.#value = v;
    this.#el.textContent = v;
    this.#color = this.retrieve_color(v).toString();
    this.#el.style.setProperty('--background-lightness', this.#color);
  }

  get color() { return this.#color; }

  set x(v) {
    this.#x = v;
    this.#el.style.setProperty('--x', v);
  }

  set y(v) {
    this.#y = v;
    this.#el.style.setProperty('--y', v);
  }

  retrieve_color(v) {
    return '#fff';
  }

  remove() { this.#el.remove(); }

  wait_transition(animation = false) {
    return new Promise(resolve => {
      this.#el.addEventListener(
        animation ? 'animationend' : 'transitionend',
        resolve, { once: true }
      );
    });
  }

  equals(oth) {
    return oth instanceof Tile &&
      this.value === oth.value;
  }
}

class Game {
  #el;
  #level = 0;

  #movement_methods = {
    'left': async () => { },
    'right': async () => { },
    'up': async () => { },
    'down': async () => { }
  }

  constructor(el, cfg = null) {
    this.#el = el;

    this.grid = new Grid(this.#el);
    if (cfg)
      this.grid.load_cfg(cfg);

    if (el !== undefined) {
      this.generate_random_tile();
      this.generate_random_tile();

      this.handle_event_listeners();
    }
  }

  set_level(v) { this.#level = v; }

  init_game() {
    this.grid.init_cells(this.#el);
    this.generate_random_tile();
    this.generate_random_tile();
  }


  handle_event_listeners() {
    document.querySelector('#reset-game').addEventListener('click', () => {
      this.init_game();
    });

    document.addEventListener('keydown', async (e) => {
      switch (e.key) {
        case 'ArrowUp':
          if (!this.can_move_up()) {
            this.handle_event_listeners();
            return;
          }
          await this.#movement_methods['up']();
          break;
        case 'ArrowDown':
          if (!this.can_move_down()) {
            this.handle_event_listeners();
            return;
          }
          await this.#movement_methods['down']();
          break;
        case 'ArrowLeft':
          if (!this.can_move_left()) {
            this.handle_event_listeners();
            return;
          }
          await this.#movement_methods['left']();
          break;
        case 'ArrowRight':
          if (!this.can_move_right()) {
            this.handle_event_listeners();
            return;
          }
          await this.#movement_methods['right']();
          break;
        default:
          this.handle_event_listeners();
          return;
      }

      this.grid.cells.forEach(cell => cell.merge());
      this.generate_random_tile();
      this.handle_event_listeners();
    }, { once: true });
  }

  set up(fct) {
    this.#movement_methods['up'] = async () => await fct(this);
  }

  set down(fct) {
    this.#movement_methods['down'] = async () => await fct(this);
  }

  set left(fct) {
    this.#movement_methods['left'] = async () => await fct(this);
  }

  set right(fct) {
    this.#movement_methods['right'] = async () => await fct(this);
  }

  move_up() { return this.slide(this.grid.cells_col); }
  move_down() { return this.slide(this.grid.cells_col.map(col => [...col].reverse())); }
  move_left() { return this.slide(this.grid.cells_row); }
  move_right() { return this.slide(this.grid.cells_row.map(row => [...row].reverse())); }

  can_move(cells) {
    return cells.some(group => {
      return group.some((cell, idx) => {
        if (idx == 0) return false;
        if (cell.tile == null) return false;

        const curr = group[idx - 1];
        return curr.can_accept(cell.tile);
      })
    })
  }

  can_move_up() { return this.can_move(this.grid.cells_col); }
  can_move_down() { return this.can_move(this.grid.cells_col.map(col => [...col].reverse())); }
  can_move_left() { return this.can_move(this.grid.cells_row); }
  can_move_right() { return this.can_move(this.grid.cells_row.map(row => [...row].reverse())); }

  slide(cells) {
    return Promise.all(
      cells.flatMap((group) => {
        return this.slide_once(group);
      })
    );
  }

  slide_once(group) {
    const promises = [];
    for (let i = 0; i < group.length; i++) {
      const curr = group[i];
      if (curr.tile == null) continue;

      let last_valid_cell;
      for (let j = i - 1; j >= 0; j--) {
        if (!group[j].can_accept(curr.tile)) break;
        last_valid_cell = group[j];
      }

      if (last_valid_cell) {
        promises.push(curr.tile.wait_transition());
        if (last_valid_cell.tile != null) {
          last_valid_cell.merge_tile = curr.tile;
        } else {
          last_valid_cell.tile = curr.tile;
        }
        curr.tile = null;
      }
    }
    return promises;
  }


  generate_random_tile() {
    const cell = this.grid.random_empty_cell();
    if (cell)
      cell.tile = new Tile(this.#el);
    else
      this.defeat();
  }

  async defeat() {
    alert("Partie terminée");
    this.init_game();
  }

  equals(oth) {
    return oth instanceof Game && this.grid.equals(oth.grid);
  }
}
