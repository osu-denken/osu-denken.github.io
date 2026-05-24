import commands from "./commands/index.js"

class Terminal {
    constructor(cliElement, hiddenInputElement) {
        this.cliElement = cliElement; // ターミナル表示部の要素
        this.hiddenInputElement = hiddenInputElement; // コマンド入力用の非表示入力要素
        this.currentLine = null; // 現在の入力
        this.currentDir = "~";
        this.canInput = false;
        this.history = [];
        this.historyIndex = -1;
        this.isInterrupted = false; // 中断フラグ

        this.init();
    }

    init() {
        this.cliElement.addEventListener('click', () => {
            if (window.getSelection().toString() === "") {
                this.hiddenInputElement.focus();
                setTimeout(() => this.updateInputDisplay(), 0);
            }
        });
        
        this.hiddenInputElement.addEventListener('input', this.handleInput.bind(this));
        this.hiddenInputElement.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.hiddenInputElement.addEventListener('keyup', () => this.updateInputDisplay());
        this.hiddenInputElement.addEventListener('click', () => this.updateInputDisplay());
        this.playInitAnimation();
    }

    async playInitAnimation() {
        this.canInput = false;
        try {
            this.createNewLine();
            this.currentLine.innerHTML = ''; // Hide cursor during animation
            await this.sleep(500); // 500ms待機

            const initialCommands = [
                "ls /var/www/html/",
                "cd /var/www/html/",
                "cat welcome.md"
            ];

            for (const command of initialCommands) {
                this.history.push(command);
                this.hiddenInputElement.value = "";
                await this.type(command, 80);
                await this.executeCommand(command);
                await this.sleep(200); // 200ms待機
                if (initialCommands.indexOf(command) < initialCommands.length - 1) {
                    this.createNewLine();
                    this.currentLine.innerHTML = '';
                }
            }
            this.historyIndex = this.history.length;
            this.createNewLine();
        } finally {
            this.canInput = true;
            this.hiddenInputElement.focus();
        }
    }

    createNewLine() {
        if (this.currentLine) {
            this.currentLine.classList.remove("cursor");
            const oldCursor = this.currentLine.querySelector(".cursor");
            if (oldCursor) oldCursor.classList.remove("cursor");
        }
        const line = document.createElement("div");
        line.classList.add("line");
        line.innerHTML = `<span class="user">denken@osu<span class="sp">:</span>${this.currentDir}</span><span class="prefix">$&nbsp;</span><span class="text"></span>`;
        this.cliElement.appendChild(line);
        this.currentLine = line.querySelector(".text");
        this.hiddenInputElement.value = '';
        this.updateInputDisplay();
        window.scrollTo(0, document.body.scrollHeight);
    }
    
    updateInputDisplay() {
        if (!this.currentLine) return;
        const text = this.hiddenInputElement.value;
        const pos = typeof this.hiddenInputElement.selectionStart === 'number' ? this.hiddenInputElement.selectionStart : text.length;

        const before = text.slice(0, pos);
        const after = text.slice(pos);

        this.currentLine.innerHTML = '';
        const beforeSpan = document.createElement("span");
        beforeSpan.className = "cursor";
        beforeSpan.textContent = before;
        const afterSpan = document.createElement("span");
        afterSpan.textContent = after;
        
        this.currentLine.appendChild(beforeSpan);
        this.currentLine.appendChild(afterSpan);
    }

    async type(text, speed) {
        for (let i = 0; i < text.length; i++) {
            this.hiddenInputElement.value += text[i];
            this.updateInputDisplay();
            await this.sleep(speed);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    handleInput(e) {
        if (!this.canInput) return;
        this.updateInputDisplay();
    }

    async handleKeyDown(e) {
        if (e.ctrlKey && e.key === 'c') {
            e.preventDefault();
            if (!this.canInput) {
                this.isInterrupted = true;
                this.writeLine('^C');
                if (this.passwordInterrupt) {
                    this.passwordInterrupt();
                }
            }
            return;
        }

        if (!this.canInput) return;
        
        switch (e.key) {
            case "Enter":
                e.preventDefault();
                this.canInput = false;
                try {
                    const text = this.hiddenInputElement.value;
                    if(text) {
                        this.history.push(text);
                        this.historyIndex = this.history.length;
                    }
                    if (this.currentLine) {
                        const oldCursor = this.currentLine.querySelector(".cursor");
                        if (oldCursor) oldCursor.classList.remove("cursor");
                        this.currentLine.innerHTML = this.escapeHtml(text); // Show typed text without cursor
                    }
                    await this.executeCommand(text);
                    this.createNewLine();
                } finally {
                    this.canInput = true;
                    this.hiddenInputElement.focus();
                }
                break;
            case "ArrowUp":
                e.preventDefault();
                if (this.historyIndex > 0) {
                    this.historyIndex--;
                    this.hiddenInputElement.value = this.history[this.historyIndex];
                    this.updateInputDisplay();
                }
                break;
            case "ArrowDown":
                e.preventDefault();
                if (this.historyIndex < this.history.length - 1) {
                    this.historyIndex++;
                    this.hiddenInputElement.value = this.history[this.historyIndex];
                    this.updateInputDisplay();
                } else {
                    this.historyIndex = this.history.length;
                    this.hiddenInputElement.value = "";
                    this.updateInputDisplay();
                }
                break;
            case "Tab":
                e.preventDefault();
                break;
        }
    }

    async executeCommand(commandText) {
        this.isInterrupted = false;
        
        const segments = commandText.split('|').map(s => s.trim()).filter(s => s);
        if (segments.length === 0) return;

        let previousOutput = null;

        for (let i = 0; i < segments.length; i++) {
            if (this.isInterrupted) break;

            const [command, ...args] = segments[i].split(/\s+/);
            const isLast = (i === segments.length - 1);

            this.captureOutput = !isLast;
            this.capturedOutput = [];
            this.stdin = previousOutput;

            if (command in commands) {
                await commands[command](this, args);
            } else if (command !== "") {
                this.writeLine(`-fash: ${command}: command not found`);
            }

            if (!isLast) {
                previousOutput = [...this.capturedOutput];
            }
        }

        this.captureOutput = false;
        this.capturedOutput = [];
        this.stdin = null;
    }

    writeLine(text) {
        if (this.captureOutput) {
            this.capturedOutput.push(text);
            return;
        }
        const line = document.createElement("div");
        line.classList.add("line");
        line.innerHTML = `<span class="text">${text}</span>`;
        this.cliElement.appendChild(line);
    }

    writeHtml(html) {
        if (this.captureOutput) {
            const temp = document.createElement("div");
            temp.innerHTML = html;
            // When capturing HTML (like from ls), convert it to items delimited by tabs/newlines
            const items = Array.from(temp.childNodes).map(node => node.textContent).filter(t => t.trim() !== '');
            this.capturedOutput.push(...items);
            return;
        }
        const line = document.createElement("div");
        line.classList.add("line");
        line.innerHTML = `<span class="text">${html}</span>`;
        this.cliElement.appendChild(line);
    }
    
    async getFile(path) {
        const url = this.getFetchUrl(path);
        if (!url) {
            throw new Error(`Permission denied or No such file or directory`);
        }
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`No such file or directory`);
            }
            return await response.text();
        } catch (error) {
            throw new Error(`No such file or directory`);
        }
    }

    resolvePath(targetPath) {
        if (!targetPath) return this.currentDir;
        
        let path = targetPath;
        if (path.startsWith('~')) {
            path = '/home/denken' + path.substring(1);
        }

        let basePath = this.currentDir;
        if (basePath.startsWith('~')) {
            basePath = '/home/denken' + basePath.substring(1);
        }

        if (path.startsWith('/')) {
            basePath = '';
        }

        const baseParts = basePath.split('/').filter(p => p !== '');
        const targetParts = path.split('/').filter(p => p !== '');

        for (const part of targetParts) {
            if (part === '.') continue;
            if (part === '..') {
                if (baseParts.length > 0) baseParts.pop();
            } else {
                baseParts.push(part);
            }
        }

        // 特別なディレクトリとして扱うために、末尾のスラッシュは適宜調整するが、
        // CDなどしやすいように基本は末尾スラッシュなしまたはありで統一。
        // ここでは通常通りくっつける。
        let result = '/' + baseParts.join('/');
        if (targetPath.endsWith('/') && result !== '/') {
            result += '/';
        }
        return result;
    }

    getFetchUrl(targetPath) {
        const absPath = this.resolvePath(targetPath);
        if (absPath.startsWith('/var/www/html')) {
            const relPath = absPath.substring('/var/www/html'.length);
            // Certain files in /var/www/html are actually served from the terminal folder
            if (relPath === '/welcome.md' || relPath === '/welcome-log.md' || relPath === '/index.html' || relPath === '/style.css' || relPath === '/main.js' || relPath === '/main.html') {
                return '.' + relPath;
            }
            // Other files map to the root directory (../ from /terminal/)
            return '..' + (relPath === '' ? '/' : relPath);
        }
        
        // Everything else maps to the local root/ folder
        return './root' + absPath;
    }

    async readPassword(promptText) {
        // Temporarily freeze the main input so `updateInputDisplay` won't
        // render in the original command line area during password entry.
        if (this.currentLine) {
            const oldCursor = this.currentLine.querySelector(".cursor");
            if (oldCursor) oldCursor.classList.remove("cursor");
            this.currentLine.innerHTML = this.escapeHtml(this.hiddenInputElement.value);
            // Forget current line temporarily so updates don't affect it
            this.currentLine = null;
        }

        const line = document.createElement("div");
        line.classList.add("line");
        line.innerHTML = `<span class="text">${promptText}</span><span class="password-input cursor"></span>`;
        this.cliElement.appendChild(line);
        const passSpan = line.querySelector('.password-input');
        
        this.hiddenInputElement.value = '';
        this.canInput = false;

        return new Promise((resolve) => {
            const finish = (value) => {
                passSpan.classList.remove('cursor');
                this.hiddenInputElement.removeEventListener('keydown', keydownHandler);
                this.hiddenInputElement.value = '';
                this.canInput = true;
                this.passwordInterrupt = null;
                resolve(value);
            };

            this.passwordInterrupt = () => finish(null);

            const keydownHandler = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    finish(this.hiddenInputElement.value);
                }
            };

            this.hiddenInputElement.addEventListener('keydown', keydownHandler);
            this.hiddenInputElement.focus();
        });
    }

    escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

const terminal = new Terminal(
    document.querySelector('.cli'),
    document.querySelector('#terminal-input')
);