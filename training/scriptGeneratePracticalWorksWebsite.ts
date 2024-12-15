import { execSync } from "child_process";
import { existsSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import fse from "fs-extra";
import kebabCase from "just-kebab-case";

const TRAINING_PLATFORM_HIDDEN_FOLDER = join(__dirname, ".training_platform");

const downloadAstroTemplate = (distFolder: string) => {
  execSync(
    `npm create astro@latest -- ${distFolder} --no-install --template starlight --no-git --typescript strict`,
    {
      stdio: "inherit",
    }
  );
  execSync(`cd ${distFolder}`, { stdio: "inherit" });
  process.chdir(distFolder);
  execSync(`npm i`, { stdio: "inherit" });
  process.chdir(__dirname);
};

const generateAstroWebSite = (pw: string, dest: string): Promise<void> => {
  if (pw === "angular_pw.md") {
    return Promise.resolve();
  }
  const distFolder = join(dest, pw.replace("pw.md", "website__"));
  if (!existsSync(TRAINING_PLATFORM_HIDDEN_FOLDER)) {
    downloadAstroTemplate(TRAINING_PLATFORM_HIDDEN_FOLDER);
  }

  fse.copySync(TRAINING_PLATFORM_HIDDEN_FOLDER, distFolder);

  try {
    const nReadlines = require("n-readlines");
    const broadbandLines = new nReadlines(pw);

    let line;
    let lineNumber = 1;

    let mainTitle = "";
    let pws: string[][] = [];
    let pwTitles: string[] = [];
    let i = 0;
    while ((line = broadbandLines.next())) {
      if (line.indexOf("# ") === 0) {
        mainTitle = line.toString().replace("# ", "");
      } else if (line.indexOf("## ") === 0) {
        if (pws.length > 0) {
          i += 1;
        }
        if (!pws[i]) {
          pws[i] = [];
          pwTitles[i] = line.toString().replace("## ", "");
        }
        pws[i].push(
          `---
title: ${line.toString().replace("## ", "")}
---`.trim()
        );
      } else if (!!pws[i]) {
        pws[i].push(line.toString());
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
                ${pws
                  .map((pw, i) => {
                    return `{ label: "${pwTitles[i]}", link: "guides/${kebabCase(pwTitles[i])}/" }`;
                  })
                  .join(",")}
              ],
            }
          ],
        }),
      ],
    
      // Process images with sharp: https://docs.astro.build/en/guides/assets/#using-sharp
      image: { service: { entrypoint: 'astro/assets/services/sharp' } },
    });        
      `;
    writeFileSync(`${distFolder}/astro.config.mjs`, configfile);

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
---`;

    writeFileSync(`${distFolder}/src/content/docs/index.mdx`, index);
    for (let i = 0; i < pws.length; i++) {
      const pw = pws[i];
      writeFileSync(
        join(
          distFolder,
          "src/content/docs/guides",
          kebabCase(pwTitles[i]) + ".md"
        ),
        pw.join("\r\n")
      );
    }
    writeFileSync(
      join(distFolder, "src/content/docs/guides/slides.md"),
      `---
title: Slides
---
  
  <iframe style="height: 500px; width: 100%" src="https://philibert-consulting-training.netlify.app/${pw.replace(
    "_pw.md",
    ""
  )}"></iframe>
  `
    );
  } catch (err) {
    console.error(err);
  }

  execSync(`npm --prefix ${join(distFolder)} run build`, { stdio: "inherit" });

  fse.copySync(join(distFolder, "dist"), distFolder.replace("__", ""), {
    overwrite: true,
  });

  rmSync(distFolder, { recursive: true, force: true });
  return Promise.resolve();
};

export default ({trainingRootPath}: {trainingRootPath: string}) => {
  console.log("generating website for pratical works");

  return generateAstroWebSite(trainingRootPath, "dist");
};
