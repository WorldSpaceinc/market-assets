import path from "path";
import fs from "fs";
import { getSize } from "../getSize";
import { getNextAndPrev } from "../getNextAndPrev";

const getMaterial = (name) => {
  const materialsFolder = path.join(__dirname, "../../files/materials/");
  const nextAndPrev = getNextAndPrev(materialsFolder, name);
  var material = { ...nextAndPrev };
  const newPath = path.join(materialsFolder, name);
  if (fs.statSync(newPath).isDirectory()) {
    // eslint-disable-next-line array-callback-return
    fs.readdirSync(newPath).map((filename) => {
      const filePath = path.join(materialsFolder, name, filename);
      const fileContents = fs.readFileSync(filePath, "utf-8");

      if (filename.includes(".json")) {
        const info = JSON.parse(fileContents);

        if (info.links) {
          info.sizes = {};
          Object.values(info.links).map((link, i) => {
            const mapLink = path.join(process.cwd(), `public${link}`);
            const { size } = getSize(mapLink, true);
            const name = Object.keys(info.links)[i];
            info.sizes[name] = size;

            return null;
          });
        }
        material = {
          ...material,
          info,
        };
      }
      material.folder = name;

      if (filename.includes("render.")) {
        material.image = `/files/materials/${name}/${filename}`;
      } else {
        if (filename.includes(".jpg")) {
          const { size } = getSize(filePath);

          material.size = size;
          material.url = `/files/materials/${name}/${filename}`;
        }
      }
    });

    return material;
  }

  return material;
};

export default function handler(req, res) {
  const file = getMaterial(req.query.name);

  res.status(200).json(file);
}
