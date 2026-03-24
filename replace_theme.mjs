import fs from 'fs';

const files = [
    'resources/js/pages/welcome.tsx',
    'resources/js/pages/super-admin.tsx',
    'resources/js/pages/Blog/Index.tsx',
    'resources/js/pages/Blog/Show.tsx',
    'resources/js/pages/errors/404.tsx',
    'resources/js/layouts/auth/auth-split-layout.tsx',
    'resources/js/components/first-extraction-modal.tsx',
    'resources/js/pages/terms.tsx',
    'resources/js/pages/privacy.tsx',
    'resources/js/pages/auth/register.tsx',
    'resources/js/pages/auth/login.tsx',
    'resources/js/pages/auth/authorize.tsx',
    'resources/js/pages/auth/verify-email.tsx',
    'resources/js/pages/Docs/ApiV1.tsx',
    'resources/js/pages/Solutions/Show.tsx'
];

const replacements = [
    // General backgrounds
    { regex: /bg-black/g, replace: 'bg-background' },
    { regex: /bg-zinc-950/g, replace: 'bg-muted/30' },
    { regex: /bg-zinc-900/g, replace: 'bg-card' },
    { regex: /bg-zinc-800/g, replace: 'bg-muted' },
    { regex: /bg-neutral-950/g, replace: 'bg-background' },
    { regex: /bg-neutral-900/g, replace: 'bg-card' },
    { regex: /bg-neutral-800/g, replace: 'bg-muted' },
    
    // Borders
    { regex: /border-white\/10/g, replace: 'border-border' },
    { regex: /border-white\/5/g, replace: 'border-border' },
    { regex: /border-neutral-800/g, replace: 'border-border' },
    { regex: /border-zinc-800/g, replace: 'border-border' },
    
    // Text colors
    { regex: /text-white/g, replace: 'text-foreground' },
    { regex: /text-zinc-400/g, replace: 'text-muted-foreground' },
    { regex: /text-zinc-300/g, replace: 'text-card-foreground' },
    { regex: /text-(gray|neutral|zinc|slate)-300/g, replace: 'text-muted-foreground' },
    { regex: /text-(gray|neutral|zinc|slate)-400/g, replace: 'text-muted-foreground' },
    { regex: /text-(gray|neutral|zinc|slate)-500/g, replace: 'text-muted-foreground' },
    
    // Transparent white backgrounds
    { regex: /bg-white\/\[0\.02\]/g, replace: 'bg-card' },
    { regex: /bg-white\/\[0\.04\]/g, replace: 'bg-muted' },
    { regex: /bg-white\/5/g, replace: 'bg-black/5' },
    { regex: /bg-white\/10/g, replace: 'bg-black/5' },
    { regex: /bg-white\/15/g, replace: 'bg-black/10' },
    { regex: /bg-white\/[0-9.]+/g, replace: 'bg-black/5' }, // Catchall for bg-white/x
    { regex: /bg-background\/5/g, replace: 'bg-muted' },
    
    // Borders
    { regex: /border-white\/8/g, replace: 'border-border' },
    { regex: /border-white\/15/g, replace: 'border-input' },
    { regex: /border-white\/20/g, replace: 'border-border' },
    { regex: /hover:border-white\/20/g, replace: 'hover:border-foreground/20' },
    
    // Colored transparent backgrounds
    { regex: /bg-blue-500\/5[^0-9]/g, replace: 'bg-blue-50 ' },
    { regex: /bg-blue-500\/15/g, replace: 'bg-blue-100' },
    { regex: /border-blue-500\/50/g, replace: 'border-blue-200' },
    { regex: /bg-red-500\/20/g, replace: 'bg-red-100' },
    { regex: /bg-green-500\/15/g, replace: 'bg-green-100' },
    { regex: /#ffffff03/g, replace: '#00000008' }, // Grid fixes 
    
    // Low-contrast colored text
    { regex: /text-foreground\/55/g, replace: 'text-foreground/80' },
    { regex: /text-red-400\/60/g, replace: 'text-red-600/80' },
    { regex: /text-red-400/g, replace: 'text-red-600' },
    { regex: /text-blue-400/g, replace: 'text-blue-600' },
    { regex: /text-green-400/g, replace: 'text-green-600' },
    { regex: /text-blue-300/g, replace: 'text-blue-700' },
    { regex: /text-blue-200/g, replace: 'text-blue-700' },
    { regex: /text-zinc-100/g, replace: 'text-foreground' },
    { regex: /text-zinc-200/g, replace: 'text-muted-foreground' },
    
    // Blog typography plugin specifically
    { regex: /prose-invert /g, replace: '' },
    { regex: /prose-a:text-indigo-400/g, replace: 'prose-a:text-indigo-600' },
    { regex: /hover:prose-a:text-indigo-300/g, replace: 'hover:prose-a:text-indigo-700' },
    { regex: /prose-code:text-indigo-300/g, replace: 'prose-code:text-indigo-700' },
    
    // Button fixes that were missed previously
    { regex: /bg-white text-black hover:bg-gray-100/g, replace: 'bg-secondary text-secondary-foreground hover:bg-secondary/80' },
    { regex: /bg-white font-semibold text-zinc-950 hover:bg-zinc-200/g, replace: 'bg-primary font-semibold text-primary-foreground hover:bg-primary/90' },
    { regex: /bg-white px-4 py-3 font-semibold text-zinc-950 transition-colors hover:bg-zinc-200/g, replace: 'bg-primary px-4 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90' },
    
    // Revert text-foreground inside colored backgrounds (like buttons, badges)
    { regex: /bg-blue-([56]00)([^"']*)text-foreground/g, replace: 'bg-blue-$1$2text-white' },
    { regex: /bg-indigo-([56]00)([^"']*)text-foreground/g, replace: 'bg-indigo-$1$2text-white' },
    { regex: /bg-red-([56]00)([^"']*)text-foreground/g, replace: 'bg-red-$1$2text-white' },
    { regex: /bg-green-([56]00)([^"']*)text-foreground/g, replace: 'bg-green-$1$2text-white' },
    { regex: /bg-destructive([^"']*)text-foreground/g, replace: 'bg-destructive$1text-white' },
    
    // Other specific fixes
    { regex: /shadow-white\/10/g, replace: 'shadow-black/5' },
];

for (const file of files) {
    if (!fs.existsSync(file)) {
        console.log(`File not found: ${file}`);
        continue;
    }
    
    let content = fs.readFileSync(file, 'utf8');
    
    for (const r of replacements) {
        content = content.replace(r.regex, r.replace);
    }
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Processed ${file}`);
}
