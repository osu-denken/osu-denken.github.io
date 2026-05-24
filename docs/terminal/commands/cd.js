export default async (ctx, args) => {    
    const path = args[0];
    if (!path || path === '~') {
        ctx.currentDir = "~";
    } else {
        const resolved = ctx.resolvePath(path);
        // "~" はホームディレクトリ相当の特別扱い
        if (resolved === '/home/denken' || resolved === '/home/denken/') {
            ctx.currentDir = "~";
        } else {
            ctx.currentDir = resolved;
        }
    }
}
