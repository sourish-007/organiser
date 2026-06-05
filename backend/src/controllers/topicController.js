import Topic from '../models/Topic.js';
import Subject from '../models/Subject.js';
import Month from '../models/Month.js';
import Year from '../models/Year.js';
import EssayPointer from '../models/EssayPointer.js';

const getTopics = async (req, res) => {
  const { subjectId } = req.query;

  try {
    let query = {};
    if (subjectId) {
      const subject = await Subject.findById(subjectId);
      if (!subject) {
        return res.status(404).json({ message: 'Subject not found' });
      }
      const month = await Month.findById(subject.monthId);
      const year = await Year.findOne({ _id: month.yearId, userId: req.user._id });
      if (!year) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      query.subjectId = subjectId;
    } else {
      const userYears = await Year.find({ userId: req.user._id });
      const yearIds = userYears.map((y) => y._id);
      const months = await Month.find({ yearId: { $in: yearIds } });
      const monthIds = months.map((m) => m._id);
      const subjects = await Subject.find({ monthId: { $in: monthIds } });
      const subjectIds = subjects.map((s) => s._id);
      query.subjectId = { $in: subjectIds };
    }

    const topics = await Topic.find(query);
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTopic = async (req, res) => {
  const { subjectId, title } = req.body;

  if (!subjectId || !title) {
    return res.status(400).json({ message: 'subjectId and title are required' });
  }

  try {
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const month = await Month.findById(subject.monthId);
    const year = await Year.findOne({ _id: month.yearId, userId: req.user._id });
    if (!year) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const newTopic = await Topic.create({
      subjectId,
      title,
    });

    res.status(201).json(newTopic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTopic = async (req, res) => {
  const { title, prelimsPointers, mainsPointers, essayPointers, notes } = req.body;

  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    const subject = await Subject.findById(topic.subjectId);
    const month = await Month.findById(subject.monthId);
    const year = await Year.findOne({ _id: month.yearId, userId: req.user._id });
    if (!year) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (title !== undefined) topic.title = title;
    if (prelimsPointers !== undefined) topic.prelimsPointers = prelimsPointers;
    if (mainsPointers !== undefined) topic.mainsPointers = mainsPointers;
    if (essayPointers !== undefined) topic.essayPointers = essayPointers;
    if (notes !== undefined) topic.notes = notes;

    await topic.save();
    res.json(topic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    const subject = await Subject.findById(topic.subjectId);
    const month = await Month.findById(subject.monthId);
    const year = await Year.findOne({ _id: month.yearId, userId: req.user._id });
    if (!year) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await Topic.deleteOne({ _id: topic._id });
    res.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchContent = async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    const userYears = await Year.find({ userId: req.user._id });
    const yearIds = userYears.map((y) => y._id);
    const yearMap = userYears.reduce((acc, curr) => {
      acc[curr._id] = curr.year;
      return acc;
    }, {});

    const months = await Month.find({ yearId: { $in: yearIds } });
    const monthIds = months.map((m) => m._id);
    const monthMap = months.reduce((acc, curr) => {
      acc[curr._id] = { name: curr.month, yearId: curr.yearId };
      return acc;
    }, {});

    const subjects = await Subject.find({ monthId: { $in: monthIds } });
    const subjectIds = subjects.map((s) => s._id);
    const subjectMap = subjects.reduce((acc, curr) => {
      acc[curr._id] = { name: curr.name, monthId: curr.monthId };
      return acc;
    }, {});

    const regex = new RegExp(q, 'i');

    const matchedSubjects = subjects.filter((s) => regex.test(s.name));

    const matchedTopics = await Topic.find({
      subjectId: { $in: subjectIds },
      $or: [
        { title: regex },
        { prelimsPointers: regex },
        { mainsPointers: regex },
        { essayPointers: regex },
        { notes: regex },
      ],
    });

    const results = [];

    for (const sub of matchedSubjects) {
      const parentMonth = monthMap[sub.monthId];
      if (parentMonth) {
        const parentYearVal = yearMap[parentMonth.yearId];
        results.push({
          id: sub._id,
          type: 'subject',
          title: sub.name,
          matchField: 'subject',
          snippet: `Subject in ${parentMonth.name} ${parentYearVal}`,
          hierarchy: {
            yearId: parentMonth.yearId,
            year: parentYearVal,
            monthId: sub.monthId,
            month: parentMonth.name,
            subjectId: sub._id,
            subjectName: sub.name,
          },
        });
      }
    }

    for (const topic of matchedTopics) {
      const parentSub = subjectMap[topic.subjectId];
      if (parentSub) {
        const parentMonth = monthMap[parentSub.monthId];
        if (parentMonth) {
          const parentYearVal = yearMap[parentMonth.yearId];
          const hierarchy = {
            yearId: parentMonth.yearId,
            year: parentYearVal,
            monthId: parentSub.monthId,
            month: parentMonth.name,
            subjectId: topic.subjectId,
            subjectName: parentSub.name,
            topicId: topic._id,
            topicTitle: topic.title,
          };

          if (regex.test(topic.title)) {
            results.push({
              id: topic._id,
              type: 'topic',
              title: topic.title,
              matchField: 'title',
              snippet: `Topic: ${topic.title}`,
              hierarchy,
            });
          }

          for (const pointer of topic.prelimsPointers) {
            if (regex.test(pointer)) {
              results.push({
                id: topic._id,
                type: 'topic',
                title: topic.title,
                matchField: 'prelims',
                snippet: `Prelims: "${pointer}"`,
                hierarchy,
              });
            }
          }

          for (const pointer of topic.mainsPointers) {
            if (regex.test(pointer)) {
              results.push({
                id: topic._id,
                type: 'topic',
                title: topic.title,
                matchField: 'mains',
                snippet: `Mains: "${pointer}"`,
                hierarchy,
              });
            }
          }

          for (const pointer of topic.essayPointers) {
            if (regex.test(pointer)) {
              results.push({
                id: topic._id,
                type: 'topic',
                title: topic.title,
                matchField: 'essay',
                snippet: `Essay: "${pointer}"`,
                hierarchy,
              });
            }
          }

          if (regex.test(topic.notes)) {
            const index = topic.notes.toLowerCase().indexOf(q.toLowerCase());
            const start = Math.max(0, index - 30);
            const end = Math.min(topic.notes.length, index + q.length + 30);
            const snippetText = topic.notes.slice(start, end);
            results.push({
              id: topic._id,
              type: 'topic',
              title: topic.title,
              matchField: 'notes',
              snippet: `Notes: "...${snippetText}..."`,
              hierarchy,
            });
          }
        }
      }
    }

    const matchedEssayPointers = await EssayPointer.find({
      userId: req.user._id,
      $or: [
        { tag: regex },
        { description: regex },
        { points: regex },
      ],
    });

    for (const ep of matchedEssayPointers) {
      const hierarchy = {
        essayPointerId: ep._id,
      };

      if (regex.test(ep.tag)) {
        results.push({
          id: ep._id,
          type: 'essay',
          title: ep.tag,
          matchField: 'tag',
          snippet: `Essay Topic: ${ep.tag}`,
          hierarchy,
        });
      }

      if (ep.description && regex.test(ep.description)) {
        results.push({
          id: ep._id,
          type: 'essay',
          title: ep.tag,
          matchField: 'description',
          snippet: `Essay Description: "${ep.description}"`,
          hierarchy,
        });
      }

      for (const pt of ep.points) {
        if (regex.test(pt)) {
          results.push({
            id: ep._id,
            type: 'essay',
            title: ep.tag,
            matchField: 'points',
            snippet: `Essay Point: "${pt}"`,
            hierarchy,
          });
        }
      }
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getTopics, createTopic, updateTopic, deleteTopic, searchContent };
