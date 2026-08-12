const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const { uploadImage } = require('../config/cloudinary');

/**
 * MOCKED AI hairstyle recommendation engine.
 *
 * A real implementation would run a face-shape classifier (e.g. a CNN served
 * via TensorFlow.js / a Python microservice) on the uploaded selfie. Here we
 * deterministically derive a "result" from a hash of the uploaded image so
 * the same photo always gets the same recommendation, and the UI can be
 * built end-to-end against a realistic response shape.
 */
const FACE_SHAPES = ['Oval', 'Round', 'Square', 'Heart', 'Diamond', 'Oblong'];

const HAIRSTYLES_BY_SHAPE = {
  Oval: ['Textured Crop', 'Classic Pompadour', 'Side-Part Fade', 'Slicked Back Undercut'],
  Round: ['High Fade with Volume', 'Angular Fringe', 'Faux Hawk', 'Long Top Comb Over'],
  Square: ['Buzz Cut', 'Crew Cut', 'Textured Quiff', 'Low Fade with Fringe'],
  Heart: ['Side-Swept Fringe', 'Medium Length Layers', 'Textured Crop', 'Curly Top Fade'],
  Diamond: ['Fringe with Volume', 'Textured Pompadour', 'Side Part', 'Soft Undercut'],
  Oblong: ['Crew Cut', 'Fringe Forward Crop', 'Caesar Cut', 'Layered Waves'],
};

const BEARD_STYLES_BY_SHAPE = {
  Oval: ['Classic Full Beard', 'Stubble', 'Van Dyke'],
  Round: ['Angular Beard', 'Extended Goatee', 'Chin Strap'],
  Square: ['Rounded Beard', 'Light Stubble', 'Circle Beard'],
  Heart: ['Full Beard', 'Boxed Beard', 'Balbo'],
  Diamond: ['Full Beard with Rounded Cheeks', 'Stubble', 'Goatee'],
  Oblong: ['Short Boxed Beard', 'Full Beard (avoid length)', 'Horseshoe'],
};

const HAIR_COLORS = [
  { name: 'Natural Black', hex: '#1B1B1B' },
  { name: 'Espresso Brown', hex: '#3B2417' },
  { name: 'Ash Gray', hex: '#8A8A8A' },
  { name: 'Caramel Highlights', hex: '#A65E2E' },
  { name: 'Platinum Blonde', hex: '#E8DCC0' },
];

// @desc    Upload a selfie and get a mocked AI hairstyle recommendation
// @route   POST /api/ai/hairstyle
// @access  Private (customer)
const recommendHairstyle = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a selfie image');
  }

  const uploaded = await uploadImage(req.file.path, 'fade-connect/ai-uploads');

  // Deterministic pseudo-analysis from the file contents so repeat uploads
  // of the same photo return the same result (feels like a real model).
  const fs = require('fs');
  const buffer = fs.readFileSync(req.file.path);
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  const seed = parseInt(hash.slice(0, 8), 16);

  const faceShape = FACE_SHAPES[seed % FACE_SHAPES.length];
  const confidence = 78 + (seed % 18); // 78-95%
  const hairstyles = HAIRSTYLES_BY_SHAPE[faceShape];
  const beardStyles = BEARD_STYLES_BY_SHAPE[faceShape];
  const recommendedColor = HAIR_COLORS[(seed >> 3) % HAIR_COLORS.length];

  const result = {
    photoUrl: uploaded.url,
    faceShape,
    confidence,
    hairstyleRecommendations: hairstyles.map((name, i) => ({
      name,
      matchScore: Math.max(70, confidence - i * 6),
    })),
    beardStyleRecommendations: beardStyles,
    recommendedHairColor: recommendedColor,
    note:
      'This is a preview recommendation. For a precise consultation, share this result with your barber during booking.',
  };

  res.json({ success: true, result });
});

module.exports = { recommendHairstyle };
