export default async (ctx, args) => {
    let pattern = "";
    let files = [];
    let ignoreCase = false;
    let invertMatch = false;
    
    // Parse arguments
    for (const arg of args) {
        if (arg.startsWith("-")) {
            if (arg.includes("i")) ignoreCase = true;
            if (arg.includes("v")) invertMatch = true;
        } else {
            if (!pattern) {
                pattern = arg;
                continue;
            }
            files.push(arg);
        }
    }

    if (!pattern) {
        ctx.writeLine("grep: missing operand");
        return;
    }

    let regex;
    try {
        regex = new RegExp(pattern, ignoreCase ? "i" : "");
    } catch (e) {
        ctx.writeLine(`grep: invalid regular expression`);
        return;
    }

    const testMatch = (line) => {
        const matches = regex.test(line);
        return invertMatch ? !matches : matches;
    };

    if (files.length === 0) {
        if (ctx.stdin) {
            for (const line of ctx.stdin) {
                if (testMatch(line)) {
                    ctx.writeLine(line);
                }
            }
        }
        return;
    }

    for (const file of files) {
        try {
            const content = await ctx.getFile(file);
            const lines = content.split('\n');
            for (const line of lines) {
                if (testMatch(line)) {
                    if (files.length > 1) {
                        ctx.writeLine(`${file}:${line}`);
                        continue;
                    }
                    ctx.writeLine(line);
                }
            }
        } catch (err) {
            ctx.writeLine(`grep: ${file}: ${err.message}`);
        }
    }
};