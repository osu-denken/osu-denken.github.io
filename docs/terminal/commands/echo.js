export default async (ctx, args) => {    
    const cmd = args[0];
    if (!cmd) {
        ctx.writeLine("usage: echo <message>");
        return;
    }

    const message = args.join(" ");
    ctx.writeLine(message);
};
