import Subject from '../models/Subject.js';
import Month from '../models/Month.js';
import Year from '../models/Year.js';
import Topic from '../models/Topic.js';

const getSubjects = async (req, res) => {
  const { monthId } = req.query;

  try {
    let query = {};
    if (monthId) {
      const month = await Month.findById(monthId);
      if (!month) {
        return res.status(404).json({ message: 'Month not found' });
      }
      const year = await Year.findOne({ _id: month.yearId, userId: req.user._id });
      if (!year) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      query.monthId = monthId;
    } else {
      const userYears = await Year.find({ userId: req.user._id });
      const yearIds = userYears.map((y) => y._id);
      const months = await Month.find({ yearId: { $in: yearIds } });
      const monthIds = months.map((m) => m._id);
      query.monthId = { $in: monthIds };
    }

    const subjects = await Subject.find(query).sort({ createdAt: 1 });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createSubject = async (req, res) => {
  const { monthId, name } = req.body;

  if (!monthId || !name) {
    return res.status(400).json({ message: 'monthId and name are required' });
  }

  try {
    const month = await Month.findById(monthId);
    if (!month) {
      return res.status(404).json({ message: 'Month not found' });
    }

    const year = await Year.findOne({ _id: month.yearId, userId: req.user._id });
    if (!year) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const subjectExists = await Subject.findOne({ monthId, name });
    if (subjectExists) {
      return res.status(400).json({ message: 'Subject already exists for this month' });
    }

    const newSubject = await Subject.create({
      monthId,
      name,
    });

    res.status(201).json(newSubject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSubject = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Subject name is required' });
  }

  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const month = await Month.findById(subject.monthId);
    if (!month) {
      return res.status(404).json({ message: 'Month not found' });
    }

    const year = await Year.findOne({ _id: month.yearId, userId: req.user._id });
    if (!year) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const subjectExists = await Subject.findOne({
      monthId: subject.monthId,
      name,
      _id: { $ne: req.params.id },
    });
    if (subjectExists) {
      return res.status(400).json({ message: 'Subject already exists for this month' });
    }

    subject.name = name;
    await subject.save();

    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const month = await Month.findById(subject.monthId);
    if (!month) {
      return res.status(404).json({ message: 'Month not found' });
    }

    const year = await Year.findOne({ _id: month.yearId, userId: req.user._id });
    if (!year) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await Topic.deleteMany({ subjectId: subject._id });
    await Subject.deleteOne({ _id: subject._id });

    res.json({ message: 'Subject and all associated topics deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getSubjects, createSubject, updateSubject, deleteSubject };
