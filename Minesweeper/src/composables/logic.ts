import { Ref } from "vue";
import { BlockState } from "~/types";

const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
];

type GameStatus = 'ready' | 'playing' | 'won' | 'lost';

interface GameState {
    board: BlockState[][];
    mineGenerated: boolean;
    status: GameStatus;
    startMS?: number;
    endMS?: number;
}


export class GamePlay {
    state = ref() as Ref<GameState>

    constructor(
        public width: number,
        public height: number,
        public mines: number
    ) {
        this.reset()
    }

    get board() {
        return this.state.value.board;
    }

    get blocks() {
        return this.state.value.board.flat() as BlockState[];
    }

    reset(
        width = this.width,
        height = this.height,
        mines = this.mines
    ) {
        this.width = width
        this.height = height
        this.mines = mines

        this.state.value = {
            board: Array.from({ length: this.height }, (_, y) =>
                Array.from(
                    { length: this.width },
                    (_, x): BlockState => ({
                        x,
                        y,
                        revealed: false,
                        adjacentMines: 0,
                    })
                )
            ),
            status: 'ready',
            mineGenerated: false,
        }


    }

    randomRange(min: number, max: number) {
        return Math.random() * (max - min) + min
    }

    randomInt(min: number, max: number) {
        return Math.round(this.randomRange(min, max))
    }

    generateMines(state: BlockState[][], initial: BlockState) {
        const placeRandom = () => {
            const x = this.randomInt(0, this.width - 1)
            const y = this.randomInt(0, this.height - 1)
            const block = state[y][x]

            if (Math.abs(initial.x - block.x) <= 1 && Math.abs(initial.y - block.y) <= 1) {
                return false
            }
            if (block.mine) {
                return false
            }
            block.mine = true
            return true
        }
        Array.from({ length: this.mines }, () => null).forEach(() => {
            let placed = false
            while (!placed) {
                placed = placeRandom()
            }
        })
        this.updateNumbers();
    }


    updateNumbers() {
        this.board.forEach((raw) => {
            raw.forEach((block) => {
                if (block.mine) {
                    return;
                }
                this.getSiblings(block).forEach((b) => {
                    if (b.mine) {
                        block.adjacentMines += 1;
                    }
                });
            });
        });
    }


    expendZero(block: BlockState) {
        if (block.adjacentMines)
            return

        this.getSiblings(block)
            .forEach((s) => {
                if (!s.revealed) {
                    if (!s.flagged)
                        s.revealed = true
                    this.expendZero(s)
                }
            })
    }



    getSiblings(block: BlockState) {
        return directions
            .map(([dx, dy]) => {
                const x2 = block.x + dx;
                const y2 = block.y + dy;

                // 边界判定
                if (x2 < 0 || x2 >= this.width || y2 < 0 || y2 >= this.height) {
                    return undefined;
                }

                return this.state.value.board[y2][x2];
            })
            .filter(Boolean) as BlockState[];
    }


    checkGameState() {
        if (!this.state.value?.mineGenerated || this.state.value.status !== 'playing') {
            return;
        } else {

            if (this.blocks.every(b => b.revealed || b.flagged)) {
                if (this.blocks.some(b => b.flagged && !b.mine)) {
                    this.onGameOver('lost')
                } else if (this.blocks.some(b => !b.flagged && b.mine)) {
                    this.onGameOver('lost')
                } else {
                    this.onGameOver('won')
                }
            }
        }
    }

    autoExpand(block: BlockState) {
        if (this.state.value.status !== 'playing' || block.flagged)
            return

        const siblings = this.getSiblings(block)
        const flags = siblings.reduce((a, b) => a + (b.flagged ? 1 : 0), 0)
        const notRevealed = siblings.reduce((a, b) => a + (!b.revealed && !b.flagged ? 1 : 0), 0)
        if (flags === block.adjacentMines) {
            siblings.forEach((i) => {
                if (i.revealed || i.flagged)
                    return
                i.revealed = true
                this.expendZero(i)
                if (i.mine)
                    this.onGameOver('lost')
            })
        }
        const missingFlags = block.adjacentMines - flags
        if (notRevealed === missingFlags) {
            siblings.forEach((i) => {
                if (!i.revealed && !i.flagged)
                    i.flagged = true
            })
        }
    }


    onClick(block: BlockState) {
        if (this.state.value.status === 'ready') {
            this.state.value.startMS = Date.now();
            this.state.value.status = 'playing';
        }

        if (this.state.value.status !== 'playing' || block.flagged) {
            return;
        }

        // 如果没有生成雷，则生成雷
        if (!this.state.value.mineGenerated) {
            this.generateMines(this.board, block);
            this.state.value.mineGenerated = true;
        }

        block.revealed = true;

        // 如果是雷，结束游戏
        if (block.mine) {
            this.onGameOver('lost');
            // 翻开所有block
            this.state.value.board.forEach((row) => {
                row.forEach((b) => {
                    b.revealed = true;
                });
            });
        }

        // 如果是0，探索周围
        this.expendZero(block);
    }

    onRightClick(block: BlockState) {
        if (this.state.value.status !== 'playing') {
            return;
        }

        // 如果已经探索过，则不做任何操作
        if (block.revealed) {
            return;
        }

        // 如果已经标记过，则取消标记 
        block.flagged = !block.flagged;
    }

    onGameOver(status: GameStatus) {
        this.state.value.endMS = Date.now();
        this.state.value.status = status;

        if (status === 'lost') {
            this.showAllMines();
            setTimeout(() => {
                alert('lost')
            }, 10)
        }
    }

    showAllMines() {
        this.blocks.forEach((b) => {
            if (b.mine) {
                b.revealed = true;
            }
        });
    }



}

