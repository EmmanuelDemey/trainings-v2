const { exec } = require('child_process');
const fs = require('fs');

(() => {
    const mds = fs.readdirSync('.').filter(p => p.endsWith('.md')).filter(p => !p.startsWith('README'));
    mds.forEach(md => {
        const base = md.replace('.md', '');
        console.log(`building ${md}`)
        exec(`npm run build -- ${md} --base ${base} --out dist/${base}`)
    })
})()