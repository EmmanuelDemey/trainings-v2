import { writeFileSync } from "fs";
import { mdToPdf } from "md-to-pdf";
import { join } from "path";

export default ({trainingRootPath}: {trainingRootPath: string}) => {
  console.log("generating PDF for pratical works");
  return mdToPdf({ path: trainingRootPath }).then((pdf: any) => {
    if (pdf) {
      writeFileSync(
        join("dist", trainingRootPath.replace(".md", ".pdf")),
        pdf.content
      );
    }
  });
};
