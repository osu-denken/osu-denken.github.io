export default async (ctx, args) => {  
    let dir = ctx.currentDir;
    if (dir.startsWith('~')) {
        dir = '/home/denken' + dir.substring(1);
    }
    ctx.writeLine(dir);
};
