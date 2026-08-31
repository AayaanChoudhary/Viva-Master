const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const File = require('../models/File');
const { protect, admin } = require('../middleware/auth');

// Setup Multer for file storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5000000 }, // 5MB max
});

// @route   POST /api/files/upload
// @desc    Upload a file
// @access  Private
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const file = new File({
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      user: req.user._id
    });

    const savedFile = await file.save();
    
    // Emit websocket event
    const io = req.app.get('io');
    if (io) {
      io.emit('file_updated', { message: 'A new file was uploaded', file: savedFile });
    }

    res.status(201).json(savedFile);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/files
// @desc    Get all files (Admins see all, Users see only theirs)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let files;
    if (req.user.role === 'admin') {
      files = await File.find().populate('user', 'name email');
    } else {
      files = await File.find({ user: req.user._id });
    }
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/files/admin/all
// @desc    Get all files - strictly admin only
// @access  Private/Admin
router.get('/admin/all', protect, admin, async (req, res) => {
  try {
    const files = await File.find().populate('user', 'name email');
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/files/:id
// @desc    Delete a file
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check user authorization (must be owner or admin)
    if (file.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this file' });
    }

    // Delete file from local filesystem
    const filePath = path.join(__dirname, '..', file.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete document from MongoDB
    await file.deleteOne();
    
    // Emit websocket event
    const io = req.app.get('io');
    if (io) {
      io.emit('file_updated', { message: 'A file was deleted' });
    }

    res.json({ message: 'File removed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/files/share/:id
// @desc    SSR Share Page
// @access  Public
router.get('/share/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).send('File not found');
    }
    // Render the EJS template
    res.render('share', { file });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
