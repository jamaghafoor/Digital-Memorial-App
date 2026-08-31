const MAX_SOURCE_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_STORED_IMAGE_BYTES = 600 * 1024;

const acceptedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const compressionQualities = [0.86, 0.78, 0.7, 0.62, 0.54];

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("This image could not be read. Please choose another file."));
    };
    image.src = objectUrl;
  });

const drawImage = (image, maximumDimension) => {
  const scale = Math.min(1, maximumDimension / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not prepare this photo for upload.");

  // JPEG has no transparency. A white background avoids transparent PNGs
  // becoming black when they are converted for compact MongoDB storage.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
};

const canvasToBlob = (canvas, quality) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("The photo could not be compressed.")),
      "image/jpeg",
      quality,
    );
  });

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("The photo could not be prepared for upload."));
    reader.readAsDataURL(blob);
  });

export async function prepareMemoryPhoto(file) {
  if (!file) throw new Error("Please choose a photo.");
  if (!acceptedImageTypes.has(file.type)) {
    throw new Error("Please choose a JPEG, PNG, or WebP image.");
  }
  if (file.size > MAX_SOURCE_IMAGE_BYTES) {
    throw new Error("Please choose an image smaller than 10 MB.");
  }

  const image = await loadImage(file);
  let maximumDimension = 1600;

  while (maximumDimension >= 500) {
    const canvas = drawImage(image, maximumDimension);
    for (const quality of compressionQualities) {
      const blob = await canvasToBlob(canvas, quality);
      if (blob.size <= MAX_STORED_IMAGE_BYTES) return blobToDataUrl(blob);
    }
    maximumDimension = Math.floor(maximumDimension * 0.8);
  }

  throw new Error("This photo is too detailed to store. Please choose a smaller image.");
}
