# Manual Test Checklist (MVP)

## Start & Join
- [ ] POST /api/start with type=BINGO and settings returns gameId/joinUrl/boardUrl.
- [ ] Player can /api/join and receives card (BINGO) or message (RAFFLE).

## Draw (Bingo)
- [ ] /api/draw returns unique numbers within range; Undo marks last as undone.
- [ ] /api/board reflects lastValue and called within ≤3 seconds.

## Claim (Bingo)
- [ ] Valid ROW/COLUMN/DIAGONAL/FOUR_CORNERS are detected.
- [ ] Rank increments by claim order; noDuplicateWinners prevents repeats.
- [ ] maxWinners caps new winners.

## Draw (Raffle)
- [ ] /api/draw picks an un-drawn participant and auto-creates a RAFFLE winner until maxWinners.
- [ ] /api/board shows lastValue as a display name and hides numbers grid.

## End/Reset
- [ ] /api/end moves game to ENDED and blocks draw/join/claim.
- [ ] /api/reset clears Participants/Cards/Draws/Winners and returns game to DRAFT.

## Board/Frontend
- [ ] Board updates within ≤3s and shows winners list.
- [ ] Host page shows called history (numbers for BINGO, names for RAFFLE).
- [ ] Player can reclaim card via /api/card after refresh.
