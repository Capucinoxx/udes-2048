class BlockManager {
  static BLOCK_CONDITION = '{block} condition';
  static BLOCK_IF_STMT = '{block} if_stmt';
  static BLOCK_FOR_STMT_IT = '{block} for_stmt it';
  static BLOCK_FOR_STMT_IT_DESC = '{block} for_stmt it_desc';
  static BLOCK_FOR_STMT = '{block} for_stmt';
  static BLOCK_ASSIGNMENT = '{block} assignment';
  static BLOCK_ACTION = '{block} action';
  static BLOCK_CLOSE = '{block} close';

  static INDENT = '  ';

  static is_conditional(block) {
    return block === this.BLOCK_IF_STMT || block === this.BLOCK_FOR_STMT || block === this.BLOCK_FOR_STMT_IT || block === this.BLOCK_FOR_STMT_IT_DESC;
  }

  static is_nop(block) {
    return block === this.BLOCK_ACTION || block === this.BLOCK_ASSIGNMENT;
  }

  static validate_syntax(blocks) {
    const stack = [];

    for (let i = 0; i < blocks.length; i++) {
      const curr = blocks[i].type;

      switch (curr) {
        case this.BLOCK_FOR_STMT_IT:
        case this.BLOCK_FOR_STMT_IT_DESC:
        case this.BLOCK_FOR_STMT:
        case this.BLOCK_IF_STMT:
          stack.push(curr);
          break;

        case this.BLOCK_CONDITION:
          if (stack.length === 0 || !this.is_conditional(stack[stack.length - 1]))
            return false;
          stack.push(this.BLOCK_CONDITION);
          break;

        case this.BLOCK_CLOSE:
          if (stack.length === 0) return false;

          while (!this.is_conditional(stack[stack.length - 1])) {
            stack.pop();
            if (stack.length === 0) return false;
          }
          stack.pop();
          break;

        case this.BLOCK_ACTION:
        case this.BLOCK_ASSIGNMENT:
          if (stack.length !== 0 && is_conditional(stack[stack.length - 1]))
            return false;
          stack.push(curr);
          break;
      }
    }

    while (stack.length && this.is_nop(stack[stack.length - 1]))
      stack.pop();

    return stack.length === 0;
  }

  static valid_next_blocks(blocks) {
    const allowed_blocks = [this.BLOCK_IF_STMT, this.BLOCK_FOR_STMT, this.BLOCK_FOR_STMT_IT, this.BLOCK_FOR_STMT_IT_DESC, this.BLOCK_ASSIGNMENT, this.BLOCK_ACTION];
    if (blocks.length === 0) return allowed_blocks;

    const last_block_type = blocks[blocks.length - 1].type;
    if (this.is_conditional(last_block_type)) return [this.BLOCK_CONDITION];

    const depth = blocks.reduce((acc, block) =>
      acc + (this.is_conditional(block.type) ? 1 : block.type === this.BLOCK_CLOSE ? -1 : 0), 0);

    if (depth !== 0) allowed_blocks.push(this.BLOCK_CLOSE);

    return allowed_blocks;
  }

  static generate_code(blocks, root) {
    let code = '';
    let depth = 0;

    const append_code = (text, newline = true, with_indent = true) => {
      code += (with_indent ? BlockManager.INDENT.repeat(depth) : '') + text;
      code += newline ? '\n' : '';
    };

    for (let i = 0; i < blocks.length; i++) {
      switch (blocks[i].type) {
        case this.BLOCK_CLOSE:
          if (depth > 0) depth--;
          append_code('}');
          break;

        case this.BLOCK_FOR_STMT: {
          const condition = i + 1 < blocks.length ? blocks[i + 1].code : null;
          append_code(blocks[i].code, false);
          if (condition) append_code(condition, false, false);
          append_code(') {', true, false);
          depth++;
          i++;
          break;
        }

        case this.BLOCK_FOR_STMT_IT: {
          const condition = i + 1 < blocks.length ? blocks[i + 1].code : null;

          append_code('for (let i = 0; i < longueur(', false);
          if (condition) append_code(condition, false, false);
          append_code('); i = i + 1) {', true, false);
          depth++;
          i++;
          break;
        }

        case this.BLOCK_FOR_STMT_IT_DESC: {
          const condition = i + 1 < blocks.length ? blocks[i + 1].code : null;

          append_code('for (let i = longueur(', false);
          if (condition) append_code(condition, false, false);
          append_code('); i > 0; i = i - 1) {', true, false);
          depth++;
          i++;
          break;
        }

        case this.BLOCK_IF_STMT: {
          const condition = i + 1 < blocks.length ? blocks[i + 1].code : null;

          append_code('if (', false);
          if (condition) append_code(condition, false, false);
          append_code(') {', true, false);
          depth++;
          i++;
          break;
        }

        case this.BLOCK_ACTION:
        case this.BLOCK_ASSIGNMENT:
          append_code(blocks[i].code);
          break;
      }
    }

    root.value = code;
  }
}
