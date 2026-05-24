export default async (ctx, args) => {    
    const path = args[0] ? ctx.resolvePath(args[0]) : ctx.resolvePath(ctx.currentDir);

    if (path === '/var/www/html' || path === '/var/www/html/') {
        ctx.writeHtml(`<a class="dir" href="/about/" target="_parent">about/</a>\t<a class="dir" href="/background/" target="_parent">background/</a>\t<a class="dir" href="/blog/" target="_parent">blog/</a>\t<a href="/denken-pub.asc" target="_parent">denken-pub.asc</a>\t<a href="/favicon.ico" target="_parent">favicon.ico</a>\t<a href="/icon.png" target="_parent">icon.png</a>\t<a class="dir" href="/works/" target="_parent">works/</a>\t<a href="/welcome.md" target="_parent">welcome.md</a>`);
        return;
    }

    try {
        let jsonPath = path.endsWith('/') ? path.slice(0, -1) : path;
        let url = './root' + (jsonPath === '' ? '/index.json' : jsonPath + '/index.json');
        
        const response = await fetch(url);
        if (response.ok) {
            const files = await response.json();
            const html = files.map(file => {
                if (file.endsWith('/')) {
                    return `<span class="dir">${ctx.escapeHtml ? ctx.escapeHtml(file) : file}</span>`;
                }
                return `<span>${ctx.escapeHtml ? ctx.escapeHtml(file) : file}</span>`;
            }).join('\t');
            ctx.writeHtml(html);
            return;
        }
    } catch (e) {
        ctx.writeLine(`Error accessing '${args[0] || ctx.currentDir}': ${e.message}`);
    }

    ctx.writeLine(`ls: cannot access '${args[0] || ctx.currentDir}': No such file or directory`);
};
