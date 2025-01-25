"use strict";
const SudokuSolver = require("../controllers/sudoku-solver.js");
module.exports = function (app) {
  let solver = new SudokuSolver();
  app.route("/api/check").post((req, res) => {
    const { puzzle, coordinate, value } = req.body;
    
    // Check for missing fields
    if (!puzzle || !coordinate || !value) {
      return res.json({ error: "Required field(s) missing" });
    }
    
    // Validate coordinate
    const row = coordinate.split("")[0];
    const column = coordinate.split("")[1];
    if (
      coordinate.length !== 2 ||
      !/[a-i]/i.test(row) ||
      !/[1-9]/i.test(column)
    ) {
      return res.json({ error: "Invalid coordinate" });
    }
    
    // Strict validation for value - must be a single digit from 1-9
    if (value.toString().length !== 1 || !/^[1-9]$/.test(value)) {
      return res.json({ error: "Invalid value" });
    }
    
    // Validate puzzle
    if (puzzle.length !== 81) {
      return res.json({ error: "Expected puzzle to be 81 characters long" });
    }
    
    if (/[^0-9.]/g.test(puzzle)) {
      return res.json({ error: "Invalid characters in puzzle" });
    }
    
    // Convert row to index (A=0, B=1, etc.)
    const rowIndex = row.toLowerCase().charCodeAt(0) - 97;
    const colIndex = parseInt(column) - 1;
    const puzzleIndex = rowIndex * 9 + colIndex;
    
    // Check if value is already placed at the coordinate
    if (puzzle[puzzleIndex] === value) {
      return res.json({ valid: true });
    }
    
    // Perform placement checks
    let validCol = solver.checkColPlacement(puzzle, row, column, value);
    let validReg = solver.checkRegionPlacement(puzzle, row, column, value);
    let validRow = solver.checkRowPlacement(puzzle, row, column, value);
    
    // Prepare response
    if (validCol && validReg && validRow) {
      return res.json({ valid: true });
    } else {
      const conflicts = [];
      if (!validRow) conflicts.push("row");
      if (!validCol) conflicts.push("column");
      if (!validReg) conflicts.push("region");
      return res.json({ valid: false, conflict: conflicts });
    }
  });
  
  app.route("/api/solve").post((req, res) => {
    const { puzzle } = req.body;
    
    // Check for missing puzzle
    if (!puzzle) {
      return res.json({ error: "Required field missing" });
    }
    
    // Validate puzzle length
    if (puzzle.length !== 81) {
      return res.json({ error: "Expected puzzle to be 81 characters long" });
    }
    
    // Validate puzzle characters
    if (/[^0-9.]/g.test(puzzle)) {
      return res.json({ error: "Invalid characters in puzzle" });
    }
    
    // Attempt to solve
    let solvedString = solver.solve(puzzle);
    
    // Return solution or error
    if (!solvedString) {
      return res.json({ error: "Puzzle cannot be solved" });
    } else {
      return res.json({ solution: solvedString });
    }
  });
};