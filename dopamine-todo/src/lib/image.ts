export function readImageFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not decode image'));
      img.onload = () => resolve(img);
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function drawSquare(img: HTMLImageElement, size: number): string {
  const side = Math.min(img.naturalWidth, img.naturalHeight);
  const sx = (img.naturalWidth - side) / 2;
  const sy = (img.naturalHeight - side) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
  return canvas.toDataURL('image/png');
}

/** Crops an image to a centered square and produces the icon sizes the manifest needs. */
export function toIconDataUrls(img: HTMLImageElement) {
  return {
    icon192: drawSquare(img, 192),
    icon512: drawSquare(img, 512),
  };
}
