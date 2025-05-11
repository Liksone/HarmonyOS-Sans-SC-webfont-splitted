import fs from "fs";
import { fontSplit } from "cn-font-split";
import path from "path";

async function splitFont(input, outDir, weightName) {
  const inputBuffer = new Uint8Array(fs.readFileSync(input).buffer);
  const weightMap = {
    Thin: 100,
    Light: 300,
    Regular: 400,
    Medium: 500,
    Bold: 700,
    Black: 900,
  };
  const weightNum = weightMap[weightName];

  await fontSplit({
    input: inputBuffer,
    outDir: outDir,
    css: {
      fontFamily: "HarmonyOS Sans SC",
      fontWeight: `${weightNum}`,
      // fontStyle: "normal",
      // fontDisplay: "swap",
      localFamily: [`HarmonyOS Sans SC ${weightName}`],
      compress: true, // 压缩生成的 CSS 产物
    },
    languageAreas: true, // 是否启用语言区域优化，将同一语言的字符分到一起
    testHtml: false, // 是否生成测试 HTML 文件
    reporter: false, // 是否生成 reporter.bin 文件
    renameOutputFont: `${weightName}_[hash:32].[ext]`,
  });
}

const fontDir = "./fonts/HarmonyOS_Sans_SC/";
const cacheDir = "./cache/";
const distDir = "./dist/";

// split each HarmonyOS_Sans_SC_***
for (const file of fs.readdirSync(fontDir)) {
  const weightName = file.split(".")[0].split("_").pop();
  const filePath = path.join(fontDir, file);
  const cachePath = path.join(
    cacheDir,
    path.basename(file, path.extname(file)),
  );

  await splitFont(filePath, cachePath, weightName);
}

// delete dist if it exists
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
}
fs.mkdirSync(distDir);

// merge css & font files
fs.readdirSync(cacheDir, { recursive: true }).forEach((file) => {
  if (path.extname(file) === ".woff2") {
    fs.renameSync(
      path.join(cacheDir, file),
      path.join(distDir, path.basename(file)),
    );
  } else if (path.extname(file) === ".css") {
    const css = fs.readFileSync(path.join(cacheDir, file), "utf8") + "\n";
    fs.appendFileSync(path.join(distDir, "result.css"), css);
  }
});

// delete cache
fs.rmSync(cacheDir, { recursive: true });

console.log("Done!");
