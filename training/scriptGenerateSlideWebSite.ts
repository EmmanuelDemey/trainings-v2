import { execSync } from "child_process";

export default ({trainingRootPath}: {trainingRootPath: string}) => {
  console.log("generating website for slides");

  const base = trainingRootPath.replace(".md", "");
  return execSync(
    `node --run build -- ${trainingRootPath} --base /${base} --out dist/${base}`
  );
};
