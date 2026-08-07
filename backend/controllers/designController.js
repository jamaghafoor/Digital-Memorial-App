const HeadstoneDesign = require('../models/HeadstoneDesign');

exports.list = async (req, res, next) => {
  try {
    const filter = req.query.category ? { category: req.query.category } : {};
    const designs = await HeadstoneDesign.find(filter).sort('category name');
    res.json({ designs });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try { const design = await HeadstoneDesign.create(req.body); res.status(201).json({ design }); } catch (error) { next(error); }
};
exports.update = async (req, res, next) => {
  try { const design = await HeadstoneDesign.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); if (!design) return res.status(404).json({ message: 'Design not found.' }); res.json({ design }); } catch (error) { next(error); }
};
exports.remove = async (req, res, next) => {
  try { const design = await HeadstoneDesign.findByIdAndDelete(req.params.id); if (!design) return res.status(404).json({ message: 'Design not found.' }); res.status(204).send(); } catch (error) { next(error); }
};
