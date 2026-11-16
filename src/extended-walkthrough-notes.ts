/** Original move-specific teaching notes for expanded repertoire examples.
 * Keys are zero-based indices of the just-played SAN move. */
export const extendedWalkthroughNotes: Record<string, Record<number, string>> = {
  "caro-advance-c5": {
    4: "White closes the center with e5. Look at d4, the pawn supporting that advanced center.",
    5: "Black attacks the d4 pawn immediately with ...c5, an alternative to developing the bishop first.",
    6: "c3 reinforces d4. White may maintain the pawn chain rather than exchange.",
    7: "...Nc6 develops with extra pressure on d4.",
    9: "...Bg4 develops the bishop actively and challenges White's f3-knight."
  },
  "caro-classical-nd7": {
    5: "...dxe4 resolves the center instead of leaving White both pawns.",
    6: "White recaptures with the knight, bringing it to an active central square.",
    7: "...Nd7 develops a knight and reserves choices for the bishop.",
    9: "...Ngf6 develops the kingside knight, challenging the centralized e4 knight."
  },
  "caro-two-knights-order": {
    2: "Nc3 comes first: recognize the position even though White has changed the move order.",
    5: "...Bg4 develops with pressure along the diagonal to White's queen.",
    6: "h3 asks the bishop to choose between a retreat and a capture.",
    7: "...Bxf3 exchanges the bishop for a knight. This gives White the bishop pair.",
    9: "...e6 reinforces the pawn on d5 and frees Black's dark-squared bishop."
  },
  "caro-quiet-d3": {
    2: "d3 supports e4, but White has not yet occupied d4.",
    3: "...d5 takes advantage of the opportunity to occupy the center.",
    5: "...e5 creates a broad pawn center. Monitor its mobility and weaknesses.",
    7: "...Nd7 develops without rushing forward with central pawns."
  },
  "caro-c4": {
    2: "White challenges d5 in advance by playing c4 on move two.",
    3: "...d5 strikes at the e4 pawn despite the unusual move order.",
    4: "White trades the e-pawn for the d-pawn, opening the center.",
    5: "...cxd5 recaptures toward the center.",
    6: "The c-pawn captures on d5; Black must evaluate the resulting isolated pawn and piece activity.",
    7: "...Nf6 brings a knight into play instead of automatically pushing another pawn."
  },
  "vienna-f4-nc6": {
    4: "White offers the f-pawn to gain central activity, but also weakens the kingside.",
    5: "Black accepts the pawn. White should not assume it must be recaptured immediately.",
    6: "Nf3 develops toward the center and helps prepare the next pawn break.",
    7: "...g5 protects Black's extra pawn and loosens Black's own kingside.",
    8: "d4 develops White's center while the kingside remains tactically sharp."
  },
  "vienna-gambit-nf3": {
    4: "f4 offers a pawn to challenge Black's center.",
    5: "...d5 counterattacks immediately; do not play a prepared sacrifice blindly.",
    6: "fxe5 removes Black's e-pawn and opens the f-file.",
    7: "...Nxe4 brings Black's knight to an active central square.",
    8: "Nf3 develops while attacking the knight's support squares.",
    10: "Bb5 develops with pressure on the queenside knight."
  },
  "vienna-quiet-f4": {
    4: "Bc4 puts the bishop on an active diagonal toward f7.",
    6: "d3 reinforces e4 before White chooses whether to advance the f-pawn.",
    8: "f4 now challenges the center. Compare this with the riskier immediate gambit.",
    10: "Nf3 develops the final kingside knight and prepares castling."
  },
  "vienna-fianchetto": {
    4: "g3 prepares to develop the bishop on the long diagonal.",
    6: "Bg2 places the bishop behind a flexible central pawn structure.",
    8: "d3 supports e4, giving White time for safe development.",
    10: "Nge2 preserves options for advancing the f-pawn later."
  },
  "london-nc6": {
    2: "Bf4 develops before e3 shuts the bishop behind the pawn chain.",
    5: "...c5 attacks the base of White's center.",
    6: "c3 supports d4. White should check captures before choosing the familiar setup.",
    7: "...Nc6 reinforces central pressure.",
    8: "Nd2 brings the queenside knight into play and supports flexible central responses."
  },
  "london-queenside-fianchetto": {
    2: "Bf4 develops the bishop before White plays e3.",
    5: "...b6 prepares to develop Black's light bishop along the long diagonal.",
    7: "...Bb7 eyes the center from a distance.",
    8: "Bd3 develops White's other bishop and helps prepare castling."
  },
  "london-nf6-c5": {
    3: "...d5 establishes a pawn in the center.",
    4: "e3 maintains d4 and clears the way for White's kingside bishop.",
    5: "...c5 challenges the d4 pawn.",
    8: "c3 reinforces the center; reassess the position if Black exchanges on d4."
  },
  "london-mirror-bishop": {
    3: "...Bf5 develops Black's bishop before ...e6.",
    4: "e3 protects d4 and opens White's kingside bishop.",
    8: "Bd3 develops with an invitation to compare bishop exchanges.",
  },
  "slav-accepted": {
    3: "...c6 builds the Slav pawn chain supporting d5.",
    7: "...dxc4 wins a pawn temporarily but releases central tension.",
    8: "e4 gives White a large center in return for the pawn.",
    9: "...b5 supports the c4 pawn at the cost of queenside weaknesses.",
    10: "a4 challenges that pawn chain. Black must respond to the pressure, not assume the pawn is safe."
  },
  "slav-solid": {
    3: "...c6 reinforces d5 and establishes a Slav structure.",
    7: "...e6 adds support but restricts Black's light-squared bishop.",
    9: "...Nbd7 completes another piece of development. Plan how to activate the c8 bishop."
  },
  "slav-exchange-bf4": {
    4: "White exchanges on d5, opening the c-file.",
    5: "Black recaptures with the c-pawn, keeping a pawn on d5.",
    6: "Bf4 develops a bishop before playing e3.",
    7: "...Nc6 develops and supports the center.",
    9: "...Nf6 continues development while controlling e4."
  },
  "slav-bf5": {
    3: "...c6 supports d5 and prepares a solid structure.",
    7: "...Bf5 develops the bishop outside the pawn chain while the e-pawn is still on e7.",
    9: "...e6 then reinforces d5 without trapping that bishop."
  }
};
