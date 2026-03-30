import sharp from 'sharp';

export default async function (file, maxDimension = 512) {
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    let pipeline = sharp(fileBuffer);
    const metadata = await pipeline.metadata();

    if (metadata.width > maxDimension
        || metadata.height > maxDimension) {
        pipeline = pipeline.resize({
            width: metadata.width > maxDimension
                ? maxDimension : undefined,
            height: metadata.height > maxDimension
                ? maxDimension : undefined,
            fit: 'inside',
        });
    }

    const optimizedBuffer = await pipeline
        .png({ quality: 75, effort: 6 })
        .toBuffer();

    return optimizedBuffer;
}
