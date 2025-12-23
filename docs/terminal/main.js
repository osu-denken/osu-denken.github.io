class Terminal {
    constructor(cliElement, inputElement) {
        this.cli = cliElement;
        this.hiddenInput = inputElement;
        this.currentLine = null;
        this.cd = "~";
        this.canInput = false;
        this.history = [];
        this.historyIndex = -1;

        this.commands = {
            "ls": this.ls.bind(this),
            "cd": this.cd.bind(this),
            "cat": this.cat.bind(this),
            "help": this.help.bind(this),
            "clear": this.clear.bind(this),
        };

        this.init();
    }

    init() {
        this.cli.addEventListener('click', () => this.hiddenInput.focus());
        this.hiddenInput.addEventListener('input', this.handleInput.bind(this));
        this.hiddenInput.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.playInitAnimation();
    }

    async playInitAnimation() {
        this.canInput = false;
        try {
            this.createNewLine();
            await new Promise(resolve => setTimeout(resolve, 500));

            const initialCommands = [
                "ls /var/www/html/",
                "cd /var/www/html/",
                "cat welcome.md"
            ];

            for (const command of initialCommands) {
                await this.type(command, 80);
                this.currentLine.classList.remove("cursor");
                await this.executeCommand(command);
                if (initialCommands.indexOf(command) < initialCommands.length - 1) {
                    this.createNewLine();
                }
            }
            this.createNewLine();
        } finally {
            this.canInput = true;
            this.hiddenInput.focus();
        }
    }

    createNewLine() {
        if (this.currentLine) {
            this.currentLine.classList.remove("cursor");
        }
        const line = document.createElement("div");
        line.classList.add("line");
        line.innerHTML = `<span class="user">denken@osu<span class="sp">:</span>${this.cd}</span><span class="prefix">$&nbsp;</span><span class="text cursor"></span>`;
        this.cli.appendChild(line);
        this.currentLine = line.querySelector(".text");
        this.hiddenInput.value = '';
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
        if (!this.canInput) return;
        
        switch (e.key) {
            case "Enter":
                e.preventDefault();
                this.canInput = false;
                try {
                    const text = this.hiddenInput.value;
                    this.history.push(text);
                    this.historyIndex = this.history.length;
                    this.currentLine.classList.remove("cursor");
                    await this.executeCommand(text);
                    this.createNewLine();
                } finally {
                    this.canInput = true;
                    this.hiddenInput.focus();
                }
                break;
            case "ArrowUp":
                e.preventDefault();
                if (this.historyIndex > 0) {
                    this.historyIndex--;
                    this.hiddenInput.value = this.history[this.historyIndex];
                    this.currentLine.textContent = this.hiddenInput.value;
                }
                break;
            case "ArrowDown":
                e.preventDefault();
                if (this.historyIndex < this.history.length - 1) {
                    this.historyIndex++;
                    this.hiddenInput.value = this.history[this.historyIndex];
                    this.currentLine.textContent = this.hiddenInput.value;
                } else {
                    this.historyIndex = this.history.length;
                    this.hiddenInput.value = "";
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
        this.cli.appendChild(line);
    }

    writeHtml(html) {
        const line = document.createElement("div");
        line.classList.add("line");
        line.innerHTML = `<span class="text">${html}</span>`;
        this.cli.appendChild(line);
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

    // Commands
    async ls(args) {
        const path = args[0] || this.cd;
        if (path === '/var/www/html/' || path === '~/') {
             this.writeHtml(`<a class="dir" href="/about/" target="_parent">about/</a>\t<a class="dir" href="/background/" target="_parent">background/</a>\t<a class="dir" href="/blog/" target="_parent">blog/</a>\t<a href="/denken-pub.asc" target="_parent">denken-pub.asc</a>\t<a href="/favicon.ico" target="_parent">favicon.ico</a>\t<a href="/icon.png" target="_parent">icon.png</a>\t<a href="./" target="_parent">index.html</a>\t<a href="./welcome.md" target="_parent">welcome.md</a>`);
        } else {
             this.writeLine(`ls: cannot access '${path}': No such file or directory`);
        }
    }

    async cd(args) {
        const path = args[0];
        if (!path || path === '~') {
            this.cd = "~";
        } else {
            this.cd = path;
        }
    }

    async cat(args) {
        const path = args[0];
        if (!path) {
            this.writeLine("cat: missing operand");
            return;
        }
        const content = await this.getFile(path);
        const escapedContent = this.escapeHtml(content);
        escapedContent.split('\n').forEach(line => this.writeLine(line));
    }

    async help() {
        const helpLines = [
            "Available commands:",
            "  ls [path]   - List files",
            "  cd [path]   - Change directory",
            "  cat [file]  - Display contents of a file",
            "  help        - Show this help message",
            "  clear       - Clear the terminal",
        ];
        helpLines.forEach(line => this.writeLine(line));
    }
    
    async clear() {
        this.cli.innerHTML = "";
    }
}
