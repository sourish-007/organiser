import EssayPointer from '../models/EssayPointer.js';

const getEssayPointers = async (req, res) => {
  try {
    const pointers = await EssayPointer.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json(pointers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createEssayPointer = async (req, res) => {
  const { tag, description, points } = req.body;

  if (!tag) {
    return res.status(400).json({ message: 'Topic tag is required' });
  }

  try {
    const newPointer = await EssayPointer.create({
      userId: req.user._id,
      tag: tag.trim(),
      description: (description || '').trim(),
      points: points || [],
    });
    res.status(201).json(newPointer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateEssayPointer = async (req, res) => {
  const { tag, description, points } = req.body;

  try {
    const pointer = await EssayPointer.findOne({ _id: req.params.id, userId: req.user._id });
    if (!pointer) {
      return res.status(404).json({ message: 'Essay pointer not found' });
    }

    if (tag !== undefined) pointer.tag = tag.trim();
    if (description !== undefined) pointer.description = description.trim();
    if (points !== undefined) pointer.points = points;

    await pointer.save();
    res.json(pointer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteEssayPointer = async (req, res) => {
  try {
    const result = await EssayPointer.deleteOne({ _id: req.params.id, userId: req.user._id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Essay pointer not found' });
    }
    res.json({ message: 'Essay pointer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getEssayPointers,
  createEssayPointer,
  updateEssayPointer,
  deleteEssayPointer,
};
