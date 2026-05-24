export default async (ctx, args) => {    
    if (args.length === 0) {
        if (ctx.stdin) {
            ctx.stdin.forEach(line => ctx.writeLine(line));
            return;
        }

        ctx.writeLine("cat: missing operand");
        return;
    }
    
    for (const path of args) {
        try {
            const content = await ctx.getFile(path);
            content.split('\n').forEach(line => ctx.writeLine(line));
        } catch (err) {
            ctx.writeLine(`cat: ${path}: ${err.message}`);
        }
    }
};
