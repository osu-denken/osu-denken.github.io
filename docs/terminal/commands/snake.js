export default async (ctx, args) => {    
    // snake game
    const width = 20;
    const height = 10;
    let snake = [{x: 5, y: 5}];
    let direction = {x: 1, y: 0};
    let food = {x: 10, y: 5};

    let exitGame = false;

    let current = ctx.getCurrentLineNumber();
    ctx.wait = true;

    const draw = () => {
        let output = '';
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (snake.some(s => s.x === x && s.y === y)) {
                    output += 'O';
                } else if (food.x === x && food.y === y) {
                    output += 'X';
                } else {
                    output += '.';
                }
            }            output += '\n';
        }
        // ctx.cliElement.innerHTML = "";
        ctx.changeLine(current, output);
    };

    const moveSnake = () => {
        const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
        if (head.x < 0 || head.x >= width || head.y < 0 || head.y >= height || snake.some(s => s.x === head.x && s.y === head.y)) {
            ctx.writeLine('Game Over!');
            ctx.wait = false;
            ctx.canInput = true;
            ctx.createNewLine();
            return false;
        }
        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
            food = {x: Math.floor(Math.random() * width), y: Math.floor(Math.random() * height)};
        } else {
            snake.pop();
        }
        return true;
    };

    draw();
    const interval = setInterval(() => {
        ctx.canInput = false;
        
        if (exitGame) {
            ctx.wait = false;
            ctx.canInput = true;
            ctx.createNewLine();
            clearInterval(interval);
            return;
        }
        if (!moveSnake()) {
            clearInterval(interval);
            return;
        }

        draw();
    }, 200);
    const keyHandler = (e) => {
        switch (e.key) {
            case 'ArrowUp': direction = {x: 0, y: -1}; break;
            case 'ArrowDown': direction = {x: 0, y: 1}; break;
            case 'ArrowLeft': direction = {x: -1, y: 0}; break;
            case 'ArrowRight': direction = {x: 1, y: 0}; break;
            case 'c': 
                if (e.ctrlKey) {
                    e.preventDefault();
                    ctx.writeLine('^C');
                    exitGame = true;
                }
                break;
        }
    };
    window.addEventListener('keydown', keyHandler);
    return () => {
        clearInterval(interval);
        window.removeEventListener('keydown', keyHandler);
    };
};
