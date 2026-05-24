export default async (ctx, args) => {
    const helpLines = [
        "ECRD fash, version 26.05-release",
        "These shell commands are defined internally. Type `help' to see this list.",
        "",
        " ls [path]           - List files",
        " cd [path]           - Change directory",
        " cat [file]          - Display contents of a file",
        " echo [string]       - Print a string",
        " pwd                 - Print working directory",
        " yes [string]        - Output a string repeatedly",
        " help                - Show this help message",
        " clear               - Clear the terminal",
        " sudo [command]      - Execute a command as root",
        " rm [file]           - Remove files (options: -r, -f, --no-preserve-root)",
        " grep [regex] [file] - Search for a pattern in a file (options: -i, -v, -r)",
        " date                - Show current date and time",
    ];
    helpLines.forEach(line => ctx.writeLine(line));
};
