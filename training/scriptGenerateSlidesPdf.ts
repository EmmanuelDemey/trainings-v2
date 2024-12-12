import { execSync } from "child_process";

export default ({trainingRootPath}: {trainingRootPath: string}) => {
  console.log("generating PDF for slides");

  const base = trainingRootPath.replace(".md", "");
  return execSync(
    `node --run export -- ${trainingRootPath} --with-toc --output dist/${base}.pdf`
  );
};
