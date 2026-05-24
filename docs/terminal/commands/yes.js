export default async (ctx, args) => {    
    const text = args.join(' ') || 'y';
    return new Promise(resolve => {
        const printYes = () => {
            if (ctx.isInterrupted) {
                resolve();
                return;
            }
            ctx.writeLine(text);
            window.scrollTo(0, document.body.scrollHeight);
            setTimeout(printYes, 10);
        };
        printYes();
    });
};
