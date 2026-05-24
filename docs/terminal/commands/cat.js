export default async (ctx, args) => {    
    const path = args[0];
    if (!path) {
        ctx.writeLine("cat: missing operand");
        return;
    }
    const content = await ctx.getFile(path);
    // const escapedContent = ctx.escapeHtml(content);
    content.split('\n').forEach(line => ctx.writeLine(line));
};
