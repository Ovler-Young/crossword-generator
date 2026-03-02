export default function CWG(wordsList) {
    const words = wordsList
        .map((text, index) => ({ text, id: index }))
        .filter(w => w.text.length > 0);

    if (words.length === 0) return null;

    const charFreq = {};
    words.forEach(w => {
        for (let char of w.text) {
            charFreq[char] = (charFreq[char] || 0) + 1;
        }
    });

    words.forEach(w => {
        w.connScore = w.text.split('').reduce((sum, char) => sum + charFreq[char], 0);
    });

    let bestGrid = null;
    let bestScore = Infinity;

    const MAX_TIME_MS = 150;
    const startTime = Date.now();
    let attemptCount = 0;

    while (Date.now() - startTime < MAX_TIME_MS) {
        attemptCount++;
        let unplaced = [...words];

        if (attemptCount === 1) {
            unplaced.sort((a, b) => b.connScore - a.connScore);
        } else if (attemptCount === 2) {
            unplaced.sort((a, b) => b.text.length - a.text.length);
        } else {
            for (let i = unplaced.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [unplaced[i], unplaced[j]] = [unplaced[j], unplaced[i]];
            }
            if (Math.random() > 0.5) {
                unplaced.sort((a, b) => (b.connScore * Math.random()) - (a.connScore * Math.random()));
            }
        }

        let grid = new Map();
        let first = unplaced.shift();

        let currentBounds = { minX: 0, maxX: first.text.length - 1, minY: 0, maxY: 0 };
        placeWord(grid, first.text, first.id, 0, 0, true);

        let placedSomething = true;
        let totalIntersections = 0;

        while (unplaced.length > 0 && placedSomething) {
            placedSomething = false;
            let validPlacements = [];

            for (let i = 0; i < unplaced.length; i++) {
                let w = unplaced[i];

                for (let [coords, cell] of grid.entries()) {
                    let [gx, gy] = coords.split(',').map(Number);

                    for (let cIdx = 0; cIdx < w.text.length; cIdx++) {
                        if (w.text[cIdx] === cell.char) {
                            if (cell.vWordId !== undefined && cell.hWordId === undefined) {
                                let startX = gx - cIdx;
                                let startY = gy;
                                let test = tryPlace(grid, w.text, startX, startY, true);
                                if (test.valid) {
                                    let newArea = getNewArea(currentBounds, startX, startY, w.text.length, true);
                                    let score = newArea - test.intersections * 200;
                                    validPlacements.push({ wordIdx: i, w, startX, startY, isHorizontal: true, score, intersections: test.intersections });
                                }
                            }

                            if (cell.hWordId !== undefined && cell.vWordId === undefined) {
                                let startX = gx;
                                let startY = gy - cIdx;
                                let test = tryPlace(grid, w.text, startX, startY, false);
                                if (test.valid) {
                                    let newArea = getNewArea(currentBounds, startX, startY, w.text.length, false);
                                    let score = newArea - test.intersections * 200;
                                    validPlacements.push({ wordIdx: i, w, startX, startY, isHorizontal: false, score, intersections: test.intersections });
                                }
                            }
                        }
                    }
                }
            }

            if (validPlacements.length > 0) {
                validPlacements.sort((a, b) => a.score - b.score);

                let bestLocalScore = validPlacements[0].score;
                let topChoices = validPlacements.filter(p => p.score <= bestLocalScore + 50);

                let best = topChoices[Math.floor(Math.random() * topChoices.length)];

                placeWord(grid, best.w.text, best.w.id, best.startX, best.startY, best.isHorizontal);
                updateBounds(currentBounds, best.startX, best.startY, best.w.text.length, best.isHorizontal);
                totalIntersections += best.intersections;

                unplaced.splice(best.wordIdx, 1);
                placedSomething = true;
            }
        }

        if (unplaced.length === 0) {
            let width = currentBounds.maxX - currentBounds.minX + 1;
            let height = currentBounds.maxY - currentBounds.minY + 1;
            let finalArea = width * height;

            let aspectPenalty = Math.abs(width - height) * 2;
            let finalScore = finalArea - totalIntersections * 200 + aspectPenalty;

            if (finalScore < bestScore) {
                bestScore = finalScore;
                bestGrid = { grid, bounds: currentBounds, width, height, finalArea };
            }
        }
    }

    if (!bestGrid) return null;

    let ownerMap = [];
    for (let y = 0; y < bestGrid.height; y++) {
        ownerMap.push([]);
    }

    for (let [coords, cell] of bestGrid.grid.entries()) {
        let [x, y] = coords.split(',').map(Number);
        let normX = x - bestGrid.bounds.minX;
        let normY = y - bestGrid.bounds.minY;

        let obj = { letter: cell.char };
        if (cell.hWordId !== undefined) obj.h = cell.hWordId;
        if (cell.vWordId !== undefined) obj.v = cell.vWordId;
        if (cell.hIdx !== undefined) obj.hIdx = cell.hIdx;
        if (cell.vIdx !== undefined) obj.vIdx = cell.vIdx;

        ownerMap[normY][normX] = obj;
    }

    return {
        width: bestGrid.width,
        height: bestGrid.height,
        ownerMap
    };
}

function tryPlace(grid, word, startX, startY, isHorizontal) {
    if (isHorizontal) {
        if (grid.has(`${startX - 1},${startY}`)) return { valid: false };
        if (grid.has(`${startX + word.length},${startY}`)) return { valid: false };
    } else {
        if (grid.has(`${startX},${startY - 1}`)) return { valid: false };
        if (grid.has(`${startX},${startY + word.length}`)) return { valid: false };
    }

    let intersections = 0;

    for (let i = 0; i < word.length; i++) {
        let x = isHorizontal ? startX + i : startX;
        let y = isHorizontal ? startY : startY + i;
        let char = word[i];
        let cell = grid.get(`${x},${y}`);

        if (cell) {
            if (cell.char !== char) return { valid: false };
            if (isHorizontal && cell.hWordId !== undefined) return { valid: false };
            if (!isHorizontal && cell.vWordId !== undefined) return { valid: false };
            intersections++;
        } else {
            if (isHorizontal) {
                if (grid.has(`${x},${y - 1}`) || grid.has(`${x},${y + 1}`)) return { valid: false };
            } else {
                if (grid.has(`${x - 1},${y}`) || grid.has(`${x + 1},${y}`)) return { valid: false };
            }
        }
    }
    return { valid: true, intersections };
}

function placeWord(grid, word, id, startX, startY, isHorizontal) {
    for (let i = 0; i < word.length; i++) {
        let x = isHorizontal ? startX + i : startX;
        let y = isHorizontal ? startY : startY + i;
        let cell = grid.get(`${x},${y}`) || { char: word[i] };

        if (isHorizontal) {
            cell.hWordId = id;
            cell.hIdx = i;
        } else {
            cell.vWordId = id;
            cell.vIdx = i;
        }
        grid.set(`${x},${y}`, cell);
    }
}

function getNewArea(bounds, startX, startY, length, isHorizontal) {
    let minX = Math.min(bounds.minX, startX);
    let maxX = Math.max(bounds.maxX, isHorizontal ? startX + length - 1 : startX);
    let minY = Math.min(bounds.minY, startY);
    let maxY = Math.max(bounds.maxY, isHorizontal ? startY : startY + length - 1);
    return (maxX - minX + 1) * (maxY - minY + 1);
}

function updateBounds(bounds, startX, startY, length, isHorizontal) {
    bounds.minX = Math.min(bounds.minX, startX);
    bounds.maxX = Math.max(bounds.maxX, isHorizontal ? startX + length - 1 : startX);
    bounds.minY = Math.min(bounds.minY, startY);
    bounds.maxY = Math.max(bounds.maxY, isHorizontal ? startY : startY + length - 1);
}
