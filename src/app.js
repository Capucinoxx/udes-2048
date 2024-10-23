const editor = new Editor(
  document.querySelector('#drop-zone'),
  document.querySelector('.tasks-list'),
  document.querySelector('#editor'),
);

const step_manager = new StepManager(
  editor,
  document.querySelector('.explication'),
  document.querySelector('.scenarios'),
  document.querySelector('.steps'),
  [
    new Step(
      "Un petit 2048 ça vous dit ?",
      [
        new ActionBlock("J'ai compris", " J'ai compris"),
        new ActionBlock("J'ai très bien compris", " J'ai très bien compris"),
        new ActionBlock("J'ai attendu que les explications soient finies", " J'ai attendu que les explications soient finies")
      ],
      "Bonjour ! Les explications vous seront présentées sous peu. Un peu de patience ;)",
      [
        new Assertion("Écoute des règlements",
          new EditorString(""),
          new EditorString(" J'ai très bien compris\n J'ai attendu que les explications soient finies\n")
        ),
      ],
      '(s) => { s.value = `',
      '`; return s };'
    ),

    new Step(
      'À gauche tous !',
      [
        new ForEachBlock("pour toutes", "for (const groupe of "),
        new IfBlock("si", "if"),
        new ForIteratifBlock("pour tout croissant", "if"),
        new ForIteratifDescBlock("pour tout décroissant", "if"),
        new CloseBlock("fin", ""),
        new AssignmentBlock("retrouver rangée courante", "let rangee_courante = rangees[i];"),
        new AssignmentBlock("retrouver colonne courante", "let rangee_courante = rangees[i];"),
        new ConditionBlock("rangées", "rangees"),
        new ConditionBlock("colonnes", "colonnes"),
        new ActionBlock("faire glisser", "faire_glisser(groupe)"),
      ],
      "Dans le jeu du 2048, il est important de pouvoir bouger les pièces dans toute les directions.\n\nDans un premier temps, essayons de faire bouger les pièces vers la gauche.",
      [
        new Assertion("Les pièces bougent de la droite vers la gauche lorsque l'on pèse sur la flèche de gauche",
          new Game(undefined, [new Cell(undefined, 3, 0), new Cell(undefined, 2, 1), new Cell(undefined, 1, 2)]),
          new Game(undefined, [new Cell(undefined, 0, 0), new Cell(undefined, 0, 1), new Cell(undefined, 0, 2)])
        )
      ],
      `(game) => { 
          const rangees = game.grid.cells_row;
          const colonnes = game.grid.cells_col;
          const faire_glisser = (e) => game.slide_once(e); 
          const longueur = (l) => l.length;`,
      `; return game; };`
    ),

    new Step(
      'Et si nous essayons par la droite ?',
      [
        new ForEachBlock("pour toutes", "for (const groupe of "),
        new IfBlock("si", "if"),
        new ForIteratifBlock("pour tout croissant", "if"),
        new ForIteratifDescBlock("pour tout décroissant", "if"),
        new CloseBlock("fin", ""),
        new AssignmentBlock("retrouver rangée courante", "let rangee_courante = rangees[i];"),
        new AssignmentBlock("retrouver colonne courante", "let rangee_courante = rangees[i];"),
        new ConditionBlock("rangées", "rangees"),
        new ConditionBlock("colonnes", "colonnes"),
        new ConditionBlock("rangée", "groupe"),
        new ActionBlock("faire glisser", "faire_glisser(groupe)"),
        new ActionBlock("Ajouter le ième élément à la liste", "liste.push(groupe[i]);"),
      ],
      "À quoi cela sert de pouvoir bouger à gauche si l'on ne peut pas bouger à droite ?\n\n Dans l'étape 1, les blocs étaient siffisant pour compléter la logique est-ce que cela sera le cas ici ?\n\nIl est possible de cliquer sur basculer à l'édition pour écrire du code.",
      [
        new Assertion("Les pièces bougent de la gauche vers la droite lorsque l'on pèse sur la flèche de droite",
          new Game(undefined, [new Cell(undefined, 0, 0), new Cell(undefined, 2, 1), new Cell(undefined, 1, 2)]),
          new Game(undefined, [new Cell(undefined, 3, 0), new Cell(undefined, 3, 1), new Cell(undefined, 3, 2)])
        )
      ],
      `(game) => { 
          const rangees = game.grid.cells_row;
          const colonnes = game.grid.cells_col;
          const faire_glisser = (e) => game.slide_once(e); 
          const longueur = (l) => l.length;`,
      `; return game; };`
    ),

    new Step(
      "Il n'en resta plus qu'un !",
      [
        new ForEachBlock("pour toutes", "for (const groupe of "),
        new IfBlock("si", "if"),
        new ForIteratifBlock("pour tout croissant", "if"),
        new ForIteratifDescBlock("pour tout décroissant", "if"),
        new CloseBlock("fin", ""),
        new AssignmentBlock("retrouver rangée courante", "let rangee_courante = rangees[i];"),
        new AssignmentBlock("retrouver colonne courante", "let rangee_courante = rangees[i];"),
        new ConditionBlock("rangées", "rangees"),
        new ConditionBlock("colonnes", "colonnes"),
        new ActionBlock("faire glisser", "faire_glisser(groupe)"),
      ],
      "Un peu comme pour aller par la droite, il faudra réfléchir à comment faire pour aller vers le bas. ",
      [
        new Assertion("Les pièces bougent de la gauche vers la droite lorsque l'on pèse sur la flèche de droite",
          new Game(undefined, [new Cell(undefined, 0, 0), new Cell(undefined, 2, 1), new Cell(undefined, 1, 2)]),
          new Game(undefined, [new Cell(undefined, 0, 3), new Cell(undefined, 2, 3), new Cell(undefined, 1, 3)])
        )
      ],
      `(game) => { 
          const rangees = game.grid.cells_row;
          const colonnes = game.grid.cells_col;
          const faire_glisser = (e) => game.slide_once(e); 
          const longueur = (l) => l.length;`,
      `; return game; };`
    ),

    new Step(
      "vous ne trouvez pas qu'il manque de couleur ?",
      [
        new AssignmentBlock("retrouver liste couleurs", `let couleurs = ['#FFFFFF', '#CAEE91', '#95C14E', '#82B62F',\n '#649D07', '#41AC7A', '#00A759', '#008F4C',\n '#00753F', '#005C31', '#004223'];`),
        new IfBlock("si", "if"),
        new CloseBlock("fin", ""),
        new ConditionBlock("valeur du bloc égal 3", "valeur == 8"),
        new AssignmentBlock("la couleur de la case est la troisième couleur", "couleur_de_la_case = couleurs[2];")
      ],
      "Dans le jeu 2048, lorsque la valeur d'une case change, la couleur de la case devrait changer elle aussi.",
      [
        new AssertionBatch("Les cases 2 et 4 affichent la bonne couleur",
          [2, 4],
          [new EditorString('#FFFFFF'), new EditorString('#CAEE91')]),
        new AssertionBatch("Les cases 8 à 128 affichent la bonne couleur",
          [8, 16, 32, 64, 128],
          [new EditorString('#95C14E'), new EditorString('#82B62F'), new EditorString('#649D07'), new EditorString('#41AC7A'), new EditorString('#00A759')]),
        new AssertionBatch("Les cases 256 à 2048 affichent la bonne couleur",
          [256, 512, 1024, 2048],
          [new EditorString('#008F4C'), new EditorString('#00753F'), new EditorString('#005C31'), new EditorString('#004223')])
      ],
      `(valeur) => { let couleur_de_la_case = "";`,
      `; return new EditorString(couleur_de_la_case)};`
    ),

    new Step(
      "Qu'est-ce qu'un jeu sans score ?",
      [
        new AssignmentBlock("retrouver la valeur à ajouter", "let score = valeur;"),
        new AssignmentBlock("retrouver la boîte de score", "let boite_score = document.querySelector('#score');"),
        new AssignmentBlock("retrouver le score de la boîte de score", "let score_courant = parseInt(boite_score.value) || 0;"),

      ],
      "Dans notre 2048, le score est la somme des fusions des cases. On reçoit actuellement un événement à chaque fois qu'il y a un nouveau score, mais nous ne faisons rien avec cette valeur ...",
      [
        new Assertion("Dernière étape ! il n'y a pas de test.",
          new Game(), new String())
      ],
      `(valeur) => {`,
      '; };'
    )
  ]
);

const game = new Game(document.querySelector('#game'));
game.left = async (ctx) => await step_manager.get_step(1).eval_function()(ctx);
game.right = async (ctx) => await step_manager.get_step(2).eval_function()(ctx);
game.down = async (ctx) => await step_manager.get_step(3).eval_function()(ctx);
game.up = async (ctx) => ctx.move_up();
Tile.prototype.retrieve_color = (v) => step_manager.get_step(4).eval_function()(v);

step_manager.on_level_up = game.set_level;

document.addEventListener('score-add', (e) => {
  step_manager.get_step(5).eval_function()(e.detail);
});

step_manager.load_step();



