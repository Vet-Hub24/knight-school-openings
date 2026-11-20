// Illustrative continuations from the exact lesson endpoint. These are not forced.
export const middlegameExamples = {
  'family-0': {
    idea: 'Support e4 before opening the center. Watch whether Black keeps the bishop on c5.',
    lines: [
      {moves:'Re1 a6 Bb3', why:'Re1 protects e4. After ...a6, Bb3 keeps pressure on f7 and steps away from a future ...Na5 attack.'},
      {moves:'Re1 Be6 Bxe6 fxe6', why:'If Black develops the bishop to e6 instead, White can trade. Black accepts doubled e-pawns in exchange for a half-open f-file.'},
    ],
  },
  'family-2': {
    idea: 'White’s bishop choice tells you what kind of position to prepare for. Each reply has its own lesson.',
    lines: [
      {moves:'Be3 e5 Nb3', why:'White signals an English Attack setup. Black hits the d4 knight, gaining space but giving White a potential d5 outpost.'},
      {moves:'Bg5 e6 f4', why:'The bishop puts pressure on f6. Black blocks the diagonal to the queen and supports d5 before developing the kingside.'},
      {moves:'Be2 e5 Nb3', why:'White prepares short castling. Black can gain space with ...e5, but must still contest d5 with pieces.'},
    ],
  },
  'family-3': {
    idea: 'In the French, pressure the base of the pawn chain before chasing the pawn at its tip.',
    lines: [
      {moves:'Be3 cxd4 Nxd4 Bc5', why:'Black trades on d4 and develops with pressure on the knight that recaptures.'},
      {moves:'Be3 cxd4 Bxd4 Nxd4 Nxd4', why:'If White recaptures with the bishop, Black can trade it off with the c6 knight. The new structure matters more than the original memorized line.'},
    ],
  },
  'family-15': {
    idea: 'Read the center before launching a wing attack. An open center and a locked center call for different plans.',
    lines: [
      {moves:'Nc6 d5 Ne7', why:'When White closes the center, Black reroutes the knight to e7 and can prepare ...f5. White can look for c5.'},
      {moves:'Nc6 Be3 exd4 Nxd4', why:'When White develops and leaves the tension, Black can exchange instead. Both sides should watch the newly opened lines before advancing flank pawns.'},
    ],
  },
};

// One annotated bridge for each remaining line. Existing branch examples stay available.
const bridges = [
  ['family-1','c3 O-O h3','Support d4 with the c-pawn and provide a retreat for the b3 bishop.','Get Black’s king safe before the center opens.','Keep the f3 knight free by preventing ...Bg4.'],
  ['family-4','O-O Nc6 Be3','Secure the king before resolving the tension on d4.','Add pressure to d4 and develop a piece at the same time.','Develop the bishop and reinforce d4 before choosing a pawn exchange.'],
  ['family-5','Bc4 Bf5 O-O','Develop with pressure toward f7 and clear the way to castle.','Use the open diagonal to develop before playing ...e6.','Get the king safe while the center is still stable.'],
  ['family-6','Be3 c5 dxc5','Develop and add a defender to the d4 pawn.','Challenge White’s center before it can advance with tempo.','Accept the break. Expect Black to regain the pawn or develop with activity.'],
  ['family-7','Bd3 Nd7 O-O','Support e4 and clear the path to castle.','Develop while keeping the option of ...c5 to challenge d4.','Secure the king before committing the center.'],
  ['family-8','Bg7 O-O O-O','Develop on the long diagonal before challenging White’s advanced pawns.','Get the king safe while retaining the space advantage.','Bring the king to safety and prepare to attack the center.'],
  ['family-9','Nge7 Bc4 O-O','Develop without blocking the bishop’s pressure on d4.','Put the bishop on an active diagonal and clear f1 for castling.','Castle before the center starts opening further.'],
  ['family-10','O-O O-O Be3','Get the king out of the center before challenging e5.','Match White’s king safety and bring the rook toward the center.','Develop with pressure on the bishop at c5. Check the recapture if bishops trade.'],
  ['family-11','Nf6 d4 d6','Develop and challenge White’s grip on the center.','Support the e5 knight and open a path for the c1 bishop.','Attack the e5 knight and force White to calculate its retreat.'],
  ['family-12','Nbd7 Bd3 c5','Develop and support a later ...c5 break.','Point the bishop at h7 and prepare to castle.','Challenge d4 before White builds an uncontested center.'],
  ['family-13','e3 e6 Bxc4','Open the f1 bishop’s path to the pawn on c4.','Support the center and free Black’s f8 bishop.','Recover the c4 pawn with development and prepare to castle.'],
  ['family-14','c5 O-O Nc6','Challenge d4 instead of letting White settle into an easy center.','Get the king safe before exchanging central pawns.','Develop with pressure on d4 and support for Black’s pawn on d5.'],
  ['family-16','Nf3 c5 Be3','Develop, support d4 and clear a path to castle.','Attack the base of the pawn center with support from the g7 bishop.','Reinforce d4 and develop. Check whether Black can add pressure before you advance.'],
  ['family-17','c4 d6 Nc3','Gain space and prepare to contest the center with Nc3.','Support an eventual ...e5 break while keeping the center flexible.','Develop toward d5 and add pressure on e4.'],
  ['family-18','c5 O-O Nc6','Challenge d4 before White settles into a comfortable setup.','Finish securing the king before deciding how to meet the central pressure.','Develop another attacker of d4. White can consider c3 to reinforce the center.'],
  ['family-19','Nb6 Nf3 Nc6','Move the knight away from the pressure of the c3 knight and g2 bishop.','Develop and clear g1 for castling.','Develop with support for e5 and more control of d4.'],
  ['family-20','O-O b3 c5','Castle before changing the central structure.','Prepare Bb2 so the second bishop can pressure the center from a distance.','Contest d4 and gain space instead of letting White develop without opposition.'],
  ['family-21','dxc4 Qc2 a6','Take on c4 and make White decide how to regain the pawn.','Attack c4 and prepare a quick recovery if Black does not defend it.','Prepare ...b5 to support c4. Check whether holding the pawn costs too much development.'],
  ['family-22','Nc6 O-O Be7','Develop and reinforce Black’s control of d4 and e5.','Get the king safe before challenging the knight on e4.','Prepare to castle and keep the center defended.'],
  ['family-23','O-O O-O Re1','Get the king out of the center before exchanges on d4.','Match White’s king safety while keeping e5 defended.','Line a rook up behind e4 in case the e-file opens.'],
  ['family-24','Nf3 Bg7 Be2','Develop and prepare to castle before using the central space advantage.','Develop on the long diagonal and prepare kingside castling.','Clear f1, support the f3 knight and avoid opening the center prematurely.'],
  ['family-25','Nf3 g6 e4','Develop instead of spending moves protecting every queenside pawn.','Prepare ...Bg7 to build pressure along the long diagonal toward b2.','Use the extra central space, but keep an eye on the open queenside files.'],
  ['family-26','e3 O-O Nc3','Free the f1 bishop and reinforce d4.','Move the king to safety before contesting the center.','Develop toward d5 and e4. The queen on d2 keeps the c1 bishop free to move.'],
  ['family-27','Nf6 cxd4 Bb4+','Develop and attack e4 instead of hanging on to the d4 pawn.','Recover the pawn and build a central pawn pair.','Use the open diagonal for a check. White must answer before continuing the plan.'],
  ['advanced-najdorf','b4 Ne2 Qa5','Attack the c3 knight and remove a defender of e4.','Keep the knight safe and leave c3 open as a possible defensive square.','Bring the queen toward White’s king. Check how the open files support the attack.'],
  ['advanced-italian-break','Bg4 Qe2 d5','Pin the f3 knight to the queen and reduce its freedom to help on d4.','Take the queen off the pin and reinforce e4.','Challenge the space advantage directly before White can improve every piece.'],
  ['advanced-french','Bxd4 Bxd4 Qa5','Trade the knight on d4, removing a central piece from White’s attack.','Restore material and keep a bishop active in the center.','Bring the queen toward the exposed queenside to look for threats.'],
  ['advanced-kid','f3 f4 Bf2','Support e4 before moving the queenside pawns.','Close the kingside pawn tension and attack the bishop on e3.','Save the bishop while keeping an eye on the kingside. White can still prepare c5.'],
  ['advanced-ruy','Nbd2 cxd4 cxd4','Develop and reinforce e4 before resolving the pawn tension.','Trade the c-pawn to make White show how the center will be rebuilt.','Use the c-pawn to keep a pawn on d4. Expect Black to target the center with pieces.'],
  ['advanced-najdorf-bg5','Bd3 b5 Rhe1','Develop and add a piece to the kingside attack.','Gain space near White’s king and prepare to open a queenside file.','Bring the second rook into the game instead of relying on pawn pushes alone.'],
  ['advanced-najdorf-be2','Qd2 Nbd7 Rad1','Connect the rooks and prepare to pressure d6.','Develop and reinforce f6 while keeping options on the queenside.','Put a rook opposite d6. The queen can move later to clear the file.'],
];

for (const [id, moves, ...notes] of bridges) {
  middlegameExamples[id] = { lines: [{ moves, notes }] };
}
