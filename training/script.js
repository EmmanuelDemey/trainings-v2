const { exec, execSync } = require('child_process');
const fs = require('fs');
const { mdToPdf } = require('md-to-pdf');
const { join } = require('path');

(async () => {
    const mds = fs.readdirSync('.').filter(p => p.endsWith('.md') && !p.endsWith('_pw.md')).filter(p => !p.startsWith('README'));
    mds.forEach(md => {
        const base = md.replace('.md', '');
        console.log(`building ${md}`)
        execSync(`npm run build -- ${md} --base ${base} --out dist/${base}`)
    })

    const pws = fs.readdirSync('.').filter(p => p.endsWith('_pw.md'));
    for(let pw of pws){
        console.log(`building pw ${pw}`)
        const pdf = await mdToPdf({ path: pw }).catch(console.error);

	if (pdf) {
        console.log(pdf)
		fs.writeFileSync(join("dist", pw.replace('.md', '.pdf')), pdf.content);
	}
    }
})()