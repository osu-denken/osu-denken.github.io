export default async (ctx, args) => {
    const dateString = new Date().toString();
    ctx.writeLine(dateString);
};
