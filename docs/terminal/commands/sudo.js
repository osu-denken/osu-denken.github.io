import commands from "./index.js";

export default async (ctx, args) => {
    if (args.length === 0) {
        ctx.writeLine("usage: sudo <command>");
        return;
    }

    const [cmd, ...cmdArgs] = args;
    const target = ctx.commands?.[cmd] ?? commands[cmd];

    if (!target) {
        ctx.writeLine(`sudo: ${cmd}: command not found`);
        return;
    }

    const MAX_TRY = 3;

    for (let i = 0; i < MAX_TRY; i++) {
        const password = await ctx.readPassword("[sudo] password for denken:");
        if (password === null) return;

        await ctx.sleep(200);

        if (password === "javaworld") {
            const prev = ctx.isRoot;
            ctx.isRoot = true;

            try {
                await target(ctx, cmdArgs);
            } finally {
                ctx.isRoot = prev;
            }

            return;
        }

        if (i < MAX_TRY - 1) {
            ctx.writeLine("Sorry, try again.");
        }
    }

    ctx.writeLine("sudo: 3 incorrect password attempts");
};
