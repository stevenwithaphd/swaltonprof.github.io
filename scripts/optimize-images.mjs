import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Directories containing tracked images to search in batch mode
const TARGET_IMAGE_DIRS = [
  path.join(projectRoot, 'genai-for-tinkerers', 'images'),
  path.join(projectRoot, 'soc-fundamentals', 'images'),
  path.join(projectRoot, 'assets', 'images'),
];

// Directories to scan for markdown / HTML reference updates
const CONTENT_DIRS = [
  path.join(projectRoot, 'genai-for-tinkerers'),
  path.join(projectRoot, 'soc-fundamentals'),
  projectRoot, // for root README.md, index.md, etc.
];

// Explicit exclusions
const EXCLUDED_FILES = new Set([
  path.normalize(path.join(projectRoot, 'favicon.png')),
]);

function isExcluded(filePath) {
  const norm = path.normalize(filePath);
  if (EXCLUDED_FILES.has(norm)) return true;

  const rel = path.relative(projectRoot, filePath);
  if (!rel || rel === '') return false;

  const segments = rel.split(/[\\/]/);
  const forbidden = ['.git', 'node_modules', 'education', '.gemini'];
  for (const f of forbidden) {
    if (segments.includes(f)) return true;
  }
  return false;
}

// Find all candidate image files recursively
function findImagesInDir(dir, images = []) {
  if (!fs.existsSync(dir) || isExcluded(dir)) return images;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (isExcluded(fullPath)) continue;

    if (entry.isDirectory()) {
      findImagesInDir(fullPath, images);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.png', '.jpg', '.jpeg'].includes(ext)) {
        images.push(fullPath);
      }
    }
  }
  return images;
}

// Find all markdown and HTML files recursively
function findContentFiles(dir, files = []) {
  if (!fs.existsSync(dir) || isExcluded(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (isExcluded(fullPath)) continue;

    if (entry.isDirectory()) {
      // Don't recurse into target content dirs from root to avoid duplicate scans
      if (dir === projectRoot && (entry.name === 'genai-for-tinkerers' || entry.name === 'soc-fundamentals')) {
        continue;
      }
      findContentFiles(fullPath, files);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.md', '.html', '.markdown'].includes(ext)) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

// Format bytes into human readable units
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

async function optimizeImage(inputPath) {
  const ext = path.extname(inputPath);
  const dir = path.dirname(inputPath);
  const basename = path.basename(inputPath, ext);
  const outputPath = path.join(dir, `${basename}.webp`);

  const statBefore = fs.statSync(inputPath);
  const sizeBefore = statBefore.size;

  const image = sharp(inputPath);
  const metadata = await image.metadata();

  // Resize if wider than 1920px
  if (metadata.width && metadata.width > 1920) {
    image.resize({
      width: 1920,
      withoutEnlargement: true,
      fit: 'inside',
    });
  }

  // Convert to WebP with aggressive, high-quality settings
  await image
    .webp({
      quality: 80,
      effort: 6,
      smartSubsample: true,
    })
    .toFile(outputPath);

  const statAfter = fs.statSync(outputPath);
  const sizeAfter = statAfter.size;

  // Remove the old source file
  fs.unlinkSync(inputPath);

  return {
    inputPath,
    outputPath,
    basename,
    oldFilename: path.basename(inputPath),
    newFilename: `${basename}.webp`,
    sizeBefore,
    sizeAfter,
    savings: sizeBefore - sizeAfter,
    dimensions: `${metadata.width || '?'}x${metadata.height || '?'}`,
  };
}

function updateReferences(conversions) {
  const contentFiles = [];
  for (const dir of CONTENT_DIRS) {
    findContentFiles(dir, contentFiles);
  }

  const updatedFiles = new Set();

  for (const contentFile of contentFiles) {
    let content = fs.readFileSync(contentFile, 'utf8');
    let changed = false;

    for (const conv of conversions) {
      // Look for references to the old filename e.g. "agy_cli_trust_folder_prompt.png"
      if (content.includes(conv.oldFilename)) {
        // Use global regex replacement for exact filename
        const escaped = conv.oldFilename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, 'g');
        content = content.replace(regex, conv.newFilename);
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(contentFile, content, 'utf8');
      updatedFiles.add(contentFile);
    }
  }

  return Array.from(updatedFiles);
}

async function main() {
  const cliArgs = process.argv.slice(2);
  let imagePaths = [];

  if (cliArgs.length > 0) {
    // Files passed explicitly (e.g. from lint-staged)
    imagePaths = cliArgs
      .map((p) => path.resolve(process.cwd(), p))
      .filter((p) => {
        const ext = path.extname(p).toLowerCase();
        return ['.png', '.jpg', '.jpeg'].includes(ext) && !isExcluded(p);
      });
  } else {
    // Batch mode: scan target image directories
    for (const dir of TARGET_IMAGE_DIRS) {
      findImagesInDir(dir, imagePaths);
    }
  }

  if (imagePaths.length === 0) {
    console.log('✨ No uncompressed PNG or JPG images found to optimize.');
    return;
  }

  console.log(`\n🖼️  Found ${imagePaths.length} image(s) to optimize into WebP (quality: 80, effort: 6, max-width: 1920px)...\n`);

  const conversions = [];
  let totalBefore = 0;
  let totalAfter = 0;

  for (const imgPath of imagePaths) {
    try {
      const result = await optimizeImage(imgPath);
      conversions.push(result);
      totalBefore += result.sizeBefore;
      totalAfter += result.sizeAfter;

      const pct = ((result.savings / result.sizeBefore) * 100).toFixed(1);
      console.log(
        `  ✓ ${result.oldFilename} -> ${result.newFilename} (${result.dimensions}) | ${formatBytes(result.sizeBefore)} -> ${formatBytes(result.sizeAfter)} (${pct}% saved)`
      );
    } catch (err) {
      console.error(`  ✗ Error converting ${imgPath}:`, err.message);
    }
  }

  if (conversions.length === 0) {
    console.log('No conversions were completed.');
    return;
  }

  // Update markdown and HTML references
  console.log(`\n📝 Updating image references across markdown & HTML files...`);
  const updatedContentFiles = updateReferences(conversions);
  console.log(`  ✓ Updated references in ${updatedContentFiles.length} file(s):`);
  for (const f of updatedContentFiles) {
    console.log(`    - ${path.relative(projectRoot, f)}`);
  }

  const totalSaved = totalBefore - totalAfter;
  const totalPct = ((totalSaved / totalBefore) * 100).toFixed(1);

  console.log('\n' + '='.repeat(60));
  console.log('🎉 COMPRESSION SUMMARY:');
  console.log(`  Total Images Converted: ${conversions.length}`);
  console.log(`  Total Original Size:    ${formatBytes(totalBefore)} (${totalBefore.toLocaleString()} bytes)`);
  console.log(`  Total Optimized Size:   ${formatBytes(totalAfter)} (${totalAfter.toLocaleString()} bytes)`);
  console.log(`  Total Storage Saved:    ${formatBytes(totalSaved)} (${totalSaved.toLocaleString()} bytes, ${totalPct}% reduction)`);
  console.log('='.repeat(60) + '\n');

  // Stage the changes in git whenever conversions occur
  if (conversions.length > 0) {
    try {
      console.log('📦 Staging new WebP files and updated markdown in git...');
      for (const conv of conversions) {
        execSync(`git add "${conv.outputPath}"`, { cwd: projectRoot });
        execSync(`git rm --cached --ignore-unmatch "${conv.inputPath}"`, { cwd: projectRoot, stdio: 'ignore' });
      }
      for (const file of updatedContentFiles) {
        execSync(`git add "${file}"`, { cwd: projectRoot });
      }
    } catch (e) {
      // Ignore git errors if not inside a git stage
    }
  }
}

main().catch((err) => {
  console.error('Fatal error during image optimization:', err);
  process.exit(1);
});
