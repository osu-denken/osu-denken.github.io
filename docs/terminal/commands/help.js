export default async (ctx, args) => {
    const helpLines = [
        "ECRD fash, version 26.05-release",
        "These shell commands are defined internally. Type `help' to see this list.",
        "",
        " ls [path]      - List files",
        " cd [path]      - Change directory",
        " cat [file]     - Display contents of a file",
        " pwd            - Print working directory",
        " yes [string]   - Output a string repeatedly",
        " help           - Show this help message",
        " clear          - Clear the terminal",
        " sudo [command] - Execute a command as root",
        " rm [options] <file> - Remove files (options: -r, -f, --no-preserve-root)",
        " echo [string] - Print a string",
    ];
    helpLines.forEach(line => ctx.writeLine(line));
};
