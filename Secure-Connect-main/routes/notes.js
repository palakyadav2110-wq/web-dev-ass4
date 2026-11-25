const express = require('express');
const mongoose = require('mongoose');
const Note = require('../models/Note');
const events = require('../events/emitter');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate); // every notes route is protected

const validId = (id) => mongoose.Types.ObjectId.isValid(id);
// Users only touch their own notes; admins can touch all
const scope = (req) => (req.user.role === 'admin' ? {} : { owner: req.user.id });

router.post('/', async (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'title and content are required' });
    const note = await Note.create({ title, content, owner: req.user.id });
    events.emit('note:created', note);
    res.status(201).json(note);
  } catch (e) { next(e); }
});

router.get('/', async (req, res, next) => {
  try { res.json(await Note.find(scope(req))); } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid note id' });
    const note = await Note.findOne({ _id: req.params.id, ...scope(req) });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid note id' });
    const { title, content } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, ...scope(req) },
      { ...(title && { title }), ...(content && { content }) },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid note id' });
    const note = await Note.findOneAndDelete({ _id: req.params.id, ...scope(req) });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch (e) { next(e); }
});

module.exports = router;
