export default async (ctx, args) => {
    const isRecursive = args.includes("-r") || args.includes("-rf") || args.includes("-fr");
    const isForce = args.includes("-f") || args.includes("-rf") || args.includes("-fr");

    const targets = args.filter(arg => !arg.startsWith("-"));

    const isRootDelete = targets.includes("/");
    const noPreserveRoot = args.includes("--no-preserve-root");

    if (isRootDelete && !ctx.isRoot) {
        ctx.writeLine("rm: cannot remove '/': Permission denied");
        return;
    }

    // safety check
    if (isRootDelete && ctx.isRoot && !noPreserveRoot) {
        ctx.writeLine("rm: it is dangerous to operate recursively on '/'");
        ctx.writeLine("rm: use --no-preserve-root to override this failsafe");
        return;
    }

    if (isRootDelete && ctx.isRoot && noPreserveRoot) {
        ctx.canInput = false;

        const fakeDeletes = [
            "/bin",
            "/boot",
            "/dev",
            "/etc",
            "/home",
            "/lib",
            "/proc",
            "/root",
            "/sys",
            "/usr",
            "/var"
        ];

        for (const dir of fakeDeletes) {
            ctx.writeLine(`removed '${dir}'`);
            await ctx.sleep(150);
        }

        await ctx.sleep(500);

        let title = encodeURIComponent("電研のフェイクターミナルでrm -rf /の実行に成功してしまった！");


        ctx.writeLine("");
        ctx.writeLine("[   14.228491] Kernel panic - not syncing:");
        ctx.writeLine("VFS: Unable to mount root fs on unknown-block(0,0)");
        ctx.writeLine("");
        ctx.writeLine("System halted.");
        ctx.writeLine(`<a href='https://twitter.com/intent/tweet?text=${title}&url=${encodeURIComponent(window.location.href)}&hashtags=OSU電研' target='_blank'>Xで共有する</a>`);

        document.body.style.background = "black";
        document.body.style.color = "red";

        return;
    }

    if (targets.length === 0) {
        ctx.writeLine("rm: missing operand");
        return;
    }

    for (const target of targets) {
        ctx.writeLine(`removed '${target}'`);
    }
};
