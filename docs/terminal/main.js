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

        this.commands = {
            "ls": this.ls.bind(this),
            "cd": this.cd.bind(this),
            "cat": this.cat.bind(this),
            "help": this.help.bind(this),
            "clear": this.clear.bind(this),
            "pwd": this.pwd.bind(this),
            "yes": this.yes.bind(this),
        };

        this.init();
    }

    init() {
        this.cliElement.addEventListener('click', () => {
            if (window.getSelection().toString() === "") {
                this.hiddenInputElement.focus();
            }
        });
        this.hiddenInputElement.addEventListener('input', this.handleInput.bind(this));
        this.hiddenInputElement.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.playInitAnimation();
    }

    async playInitAnimation() {
        this.canInput = false;
        try {
            this.createNewLine();
            await new Promise(resolve => setTimeout(resolve, 500)); // 500ms待機

            const initialCommands = [
                "ls /var/www/html/",
                "cd /var/www/html/",
                "cat welcome.md"
            ];

            for (const command of initialCommands) {
                this.history.push(command);
                await this.type(command, 80);
                this.currentLine.classList.remove("cursor");
                await this.executeCommand(command);
                await new Promise(resolve => setTimeout(resolve, 200)); // 200ms待機
                if (initialCommands.indexOf(command) < initialCommands.length - 1) {
                    this.createNewLine();
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
        }
        const line = document.createElement("div");
        line.classList.add("line");
        line.innerHTML = `<span class="user">denken@osu<span class="sp">:</span>${this.currentDir}</span><span class="prefix">$&nbsp;</span><span class="text cursor"></span>`;
        this.cliElement.appendChild(line);
        this.currentLine = line.querySelector(".text");
        this.hiddenInputElement.value = '';
        window.scrollTo(0, document.body.scrollHeight);
    }
    
    async type(text, speed) {
        for (let i = 0; i < text.length; i++) {
            this.currentLine.textContent += text[i];
            await new Promise(resolve => setTimeout(resolve, speed));
        }
    }

    handleInput(e) {
        if (!this.canInput) return;
        this.currentLine.textContent = e.target.value;
    }

    async handleKeyDown(e) {
        if (e.ctrlKey && e.key === 'c') {
            e.preventDefault();
            if (!this.canInput) {
                this.isInterrupted = true;
                this.writeLine('^C');
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
                    this.currentLine.classList.remove("cursor");
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
                    this.currentLine.textContent = this.hiddenInputElement.value;
                }
                break;
            case "ArrowDown":
                e.preventDefault();
                if (this.historyIndex < this.history.length - 1) {
                    this.historyIndex++;
                    this.hiddenInputElement.value = this.history[this.historyIndex];
                    this.currentLine.textContent = this.hiddenInputElement.value;
                } else {
                    this.historyIndex = this.history.length;
                    this.hiddenInputElement.value = "";
                    this.currentLine.textContent = "";
                }
                break;
            case "Tab":
                e.preventDefault();
                break;
        }
    }

    async executeCommand(commandText) {
        const [command, ...args] = commandText.trim().split(" ");
        this.isInterrupted = false;

        if (command in this.commands) {
            await this.commands[command](args);
        } else if(command !== "") {
            this.writeLine(`-bash: ${command}: command not found`);
        }
    }

    writeLine(text) {
        const line = document.createElement("div");
        line.classList.add("line");
        line.innerHTML = `<span class="text">${text}</span>`;
        this.cliElement.appendChild(line);
    }

    writeHtml(html) {
        const line = document.createElement("div");
        line.classList.add("line");
        line.innerHTML = `<span class="text">${html}</span>`;
        this.cliElement.appendChild(line);
    }
    
    async getFile(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                return `cat: ${path}: No such file or directory`;
            }
            return await response.text();
        } catch (error) {
            return `cat: ${path}: No such file or directory`;
        }
    }

    escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // --- Commands ---
    async ls(args) {
        const path = args[0] || this.currentDir;
        if (path === '/var/www/html/' || path === '~/') {
             this.writeHtml(`<a class="dir" href="/about/" target="_parent">about/</a>\t<a class="dir" href="/background/" target="_parent">background/</a>\t<a class="dir" href="/blog/" target="_parent">blog/</a>\t<a href="/denken-pub.asc" target="_parent">denken-pub.asc</a>\t<a href="/favicon.ico" target="_parent">favicon.ico</a>\t<a href="/icon.png" target="_parent">icon.png</a>\t<a href="./" target="_parent">index.html</a>\t<a href="./welcome.md" target="_parent">welcome.md</a>`);
        } else {
             this.writeLine(`ls: cannot access '${path}': No such file or directory`);
        }
    }

    async cd(args) {
        const path = args[0];
        if (!path || path === '~') {
            this.currentDir = "~";
        } else {
            this.currentDir = path;
        }
    }

    async cat(args) {
        const path = args[0];
        if (!path) {
            this.writeLine("cat: missing operand");
            return;
        }
        const content = await this.getFile(path);
        // const escapedContent = this.escapeHtml(content);
        content.split('\n').forEach(line => this.writeLine(line));
    }

    async pwd() {
        this.writeLine(this.currentDir);
    }

    async yes(args) {
        const text = args.join(' ') || 'y';
        return new Promise(resolve => {
            const printYes = () => {
                if (this.isInterrupted) {
                    resolve();
                    return;
                }
                this.writeLine(text);
                window.scrollTo(0, document.body.scrollHeight);
                setTimeout(printYes, 10);
            };
            printYes();
        });
    }

    async help() {
        const helpLines = [
            "ecrd-fake-terminal, version 25.12-release",
            "These shell commands are defined internally. Type `help' to see this list.",
            "",
            " ls [path]      - List files",
            " cd [path]      - Change directory",
            " cat [file]     - Display contents of a file",
            " pwd            - Print working directory",
            " yes [string]   - Output a string repeatedly",
            " help           - Show this help message",
            " clear          - Clear the terminal",
        ];
        helpLines.forEach(line => this.writeLine(line));
    }
    
    async clear() {
        this.cliElement.innerHTML = "";
    }
}