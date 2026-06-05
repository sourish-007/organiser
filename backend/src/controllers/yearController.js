import Year from '../models/Year.js';
import Month from '../models/Month.js';
import Subject from '../models/Subject.js';
import Topic from '../models/Topic.js';

const getYears = async (req, res) => {
  try {
    const years = await Year.find({ userId: req.user._id }).sort({ year: 1 });
    res.json(years);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createYear = async (req, res) => {
  const { year } = req.body;
  if (!year) {
    return res.status(400).json({ message: 'Year is required' });
  }

  try {
    const yearExists = await Year.findOne({ userId: req.user._id, year });
    if (yearExists) {
      return res.status(400).json({ message: 'Year already exists' });
    }

    const newYear = await Year.create({
      userId: req.user._id,
      year,
    });

    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const monthsToCreate = monthNames.map((name) => ({
      yearId: newYear._id,
      month: name,
    }));

    await Month.insertMany(monthsToCreate);

    res.status(201).json(newYear);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateYear = async (req, res) => {
  const { year } = req.body;
  if (!year) {
    return res.status(400).json({ message: 'Year is required' });
  }

  try {
    const yearObj = await Year.findOne({ _id: req.params.id, userId: req.user._id });
    if (!yearObj) {
      return res.status(404).json({ message: 'Year not found' });
    }

    const yearExists = await Year.findOne({
      userId: req.user._id,
      year,
      _id: { $ne: req.params.id },
    });
    if (yearExists) {
      return res.status(400).json({ message: 'Year already exists' });
    }

    yearObj.year = year;
    await yearObj.save();

    res.json(yearObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteYear = async (req, res) => {
  try {
    const yearObj = await Year.findOne({ _id: req.params.id, userId: req.user._id });
    if (!yearObj) {
      return res.status(404).json({ message: 'Year not found' });
    }

    const months = await Month.find({ yearId: yearObj._id });
    const monthIds = months.map((m) => m._id);

    const subjects = await Subject.find({ monthId: { $in: monthIds } });
    const subjectIds = subjects.map((s) => s._id);

    await Topic.deleteMany({ subjectId: { $in: subjectIds } });
    await Subject.deleteMany({ monthId: { $in: monthIds } });
    await Month.deleteMany({ yearId: yearObj._id });
    await Year.deleteOne({ _id: yearObj._id });

    res.json({ message: 'Year and all associated content deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getYears, createYear, updateYear, deleteYear };
