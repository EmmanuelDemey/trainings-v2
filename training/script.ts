import { mkdirSync, rmSync } from "fs";
import generatePracticalWorksPdf from "./scriptGeneratePracticalWorksPdf";
import generatePracticalWorksWebsite from "./scriptGeneratePracticalWorksWebsite";
import generateSlidesWebsite from "./scriptGenerateSlideWebSite";
import generateSlidesPdf from "./scriptGenerateSlidesPdf";

(async () => {
  rmSync("dist", { recursive: true, force: true });
  mkdirSync("dist");

  const projects = process.argv[2].split(",");
  for (let project of projects) {
    await Promise.all([
      generateSlidesWebsite({ trainingRootPath: `${project}.md`}),
      generateSlidesPdf({ trainingRootPath: `${project}.md`}),
      generatePracticalWorksWebsite({trainingRootPath: `${project}_pw.md`}),
      generatePracticalWorksPdf({ trainingRootPath: `${project}_pw.md`}),
    ]);
  }
})();
