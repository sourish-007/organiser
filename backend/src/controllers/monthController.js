import Month from '../models/Month.js';
import Year from '../models/Year.js';
import Subject from '../models/Subject.js';
import Topic from '../models/Topic.js';

const getMonths = async (req, res) => {
  const { yearId } = req.query;

  try {
    let query = {};
    if (yearId) {
      const year = await Year.findOne({ _id: yearId, userId: req.user._id });
      if (!year) {
        return res.status(404).json({ message: 'Year not found' });
      }
      query.yearId = yearId;
    } else {
      const userYears = await Year.find({ userId: req.user._id });
      const yearIds = userYears.map((y) => y._id);
      query.yearId = { $in: yearIds };
    }

    const months = await Month.find(query);
    res.json(months);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createMonth = async (req, res) => {
  const { yearId, month } = req.body;

  if (!yearId || !month) {
    return res.status(400).json({ message: 'yearId and month are required' });
  }

  try {
    const year = await Year.findOne({ _id: yearId, userId: req.user._id });
    if (!year) {
      return res.status(404).json({ message: 'Year not found or unauthorized' });
    }

    const monthExists = await Month.findOne({ yearId, month });
    if (monthExists) {
      return res.status(400).json({ message: 'Month already exists for this year' });
    }

    const newMonth = await Month.create({
      yearId,
      month,
    });

    res.status(201).json(newMonth);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMonth = async (req, res) => {
  const { month } = req.body;

  if (!month) {
    return res.status(400).json({ message: 'Month name is required' });
  }

  try {
    const monthObj = await Month.findById(req.params.id);
    if (!monthObj) {
      return res.status(404).json({ message: 'Month not found' });
    }

    const year = await Year.findOne({ _id: monthObj.yearId, userId: req.user._id });
    if (!year) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const monthExists = await Month.findOne({
      yearId: monthObj.yearId,
      month,
      _id: { $ne: req.params.id },
    });
    if (monthExists) {
      return res.status(400).json({ message: 'Month already exists for this year' });
    }

    monthObj.month = month;
    await monthObj.save();

    res.json(monthObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMonth = async (req, res) => {
  try {
    const monthObj = await Month.findById(req.params.id);
    if (!monthObj) {
      return res.status(404).json({ message: 'Month not found' });
    }

    const year = await Year.findOne({ _id: monthObj.yearId, userId: req.user._id });
    if (!year) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const subjects = await Subject.find({ monthId: monthObj._id });
    const subjectIds = subjects.map((s) => s._id);

    await Topic.deleteMany({ subjectId: { $in: subjectIds } });
    await Subject.deleteMany({ monthId: monthObj._id });
    await Month.deleteOne({ _id: monthObj._id });

    res.json({ message: 'Month and all associated content deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getMonths, createMonth, updateMonth, deleteMonth };
