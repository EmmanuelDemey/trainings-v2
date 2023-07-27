const { execSync } = require("child_process");
const fs = require("fs");
const { mdToPdf } = require("md-to-pdf");
const { join } = require("path");
const replace = require('replace-in-file');
const kebabCase = require("just-kebab-case"); 
const targetDist = "dist";
const fse = require('fs-extra');

const generateAstroWebSite = (pw: string, dest: string): Promise<void> => {
  if(pw === 'angular_pw.md'){
    return Promise.resolve();
  }
  const distFolder = join(dest, pw.replace("pw.md", "website__"));
  execSync(`npm create astro@latest -- ${distFolder} --no-install --template starlight --no-git --typescript strict`, { stdio: 'inherit'})
  execSync(`cd ${distFolder}`, { stdio: 'inherit'});
  process.chdir(distFolder);
  execSync(`npm i`, { stdio: 'inherit'});
  process.chdir(__dirname)

  try {
    const nReadlines = require("n-readlines");
    const broadbandLines = new nReadlines(pw);

    let line;
    let lineNumber = 1;


    let mainTitle = '';
    let pws: string[][] = [];
    let pwTitles: string[] = [];
    let i = 0
    while ((line = broadbandLines.next())) {
      if(line.indexOf("# ") === 0){
        mainTitle = line.toString().replace('# ', '');      
      }
      else if(line.indexOf("## ") === 0){
        if(pws.length > 0){
          i += 1;
        }
        if(!pws[i]){
          pws[i] = []
          pwTitles[i] = line.toString().replace('## ', '');
        }
        pws[i].push(`---
title: ${line.toString().replace('## ', '')}
---`.trim());
      } else if(!!pws[i]) {
        pws[i].push(line.toString())
      }
      lineNumber++;
    }
    
    const configfile = `
  import { defineConfig } from 'astro/config';
  import starlight from '@astrojs/starlight';
  
  // https://astro.build/config
  export default defineConfig({
    base: '/${pw.replace("pw.md", "website")}',
    integrations: [
      starlight({
        title: '${mainTitle}',
        sidebar: [
          {
            label: 'Travaux Pratiques',
            items: [
              { label: 'Slides', link: '/guides/slides'},
              ${
                pws.map((pw, i) => {
                  return `{ label: '${pwTitles[i]}', link: '/guides/${kebabCase(pwTitles[i])}/' }`
                }).join(',')
              }
            ],
          }
        ],
      }),
    ],
  
    // Process images with sharp: https://docs.astro.build/en/guides/assets/#using-sharp
    image: { service: { entrypoint: 'astro/assets/services/sharp' } },
  });        
    `
    fs.writeFileSync(`${distFolder}/astro.config.mjs`, configfile);

    const index = `---
title: ${mainTitle}
template: splash
hero:
  tagline: Vous allez à présent commencer la partie pratique de la ${mainTitle}
  image:
    file: ../../assets/houston.webp
  actions:
    - text: Accéder aux sujets
      link: /${pw.replace("_pw.md", "")}_website/guides/${kebabCase(pwTitles[0])}/
      icon: right-arrow
      variant: primary
---`

    fs.writeFileSync(`${distFolder}/src/content/docs/index.mdx`, index)
    for(let i = 0; i < pws.length; i++){
      const pw = pws[i];
      console.log(pw, i, pws.length)
      fs.writeFileSync(join(distFolder, 'src/content/docs/guides', kebabCase(pwTitles[i]) + '.md'), pw.join('\r\n'))
    }
    fs.writeFileSync(join(distFolder, 'src/content/docs/guides/slides.md'), `---
title: Slides
---

<iframe style="height: 500px; width: 100%" src="https://philibert-consulting-training.netlify.app/${pw.replace("_pw.md", "")}"></iframe>
`)
  } catch (err) {
    console.error(err);
  }


  execSync(`npm --prefix ${join(distFolder)} run build`, { stdio: 'inherit'})

  fse.copySync(join(distFolder, 'dist'), distFolder.replace('__', ''), { overwrite: true })

  fs.rmSync(distFolder, { recursive: true, force: true });
  return Promise.resolve();
};

(async () => {

  fs.rmSync('dist', { recursive: true, force: true });
  

  const mds = fs
    .readdirSync(".")
    .filter((p: string) => p.endsWith("react.md") && !p.endsWith("_pw.md"))
    .filter((p: string) => !p.startsWith("README"));
  mds.forEach((md: string) => {
    const base = md.replace(".md", "");
    console.log(`building ${md}`);
    execSync(`npm run build -- ${md} --base /${base} --out dist/${base}`);
    execSync(`npm run export -- ${md} --with-toc --output dist/${base}.pdf`);
  });

  const pws = fs.readdirSync(".").filter((p: string) => p.endsWith("_pw.md"));
  for (let pw of pws) {
    console.log(`building pw ${pw}`);
    const pdf = await mdToPdf({ path: pw }).catch(console.error);

    if (pdf) {
      fs.writeFileSync(join(targetDist, pw.replace(".md", ".pdf")), pdf.content);
    }

    await generateAstroWebSite(pw, targetDist);
  }
})();