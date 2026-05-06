const { getSalesSummary } = require('../models/reportModel');

const getSalesReport = async (req, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    if (startDate && Number.isNaN(startDate.getTime())) {
      return res.status(400).json({ message: 'startDate tidak valid.' });
    }

    if (endDate && Number.isNaN(endDate.getTime())) {
      return res.status(400).json({ message: 'endDate tidak valid.' });
    }

    if (startDate) {
      startDate.setHours(0, 0, 0, 0);
    }

    if (endDate) {
      endDate.setHours(23, 59, 59, 999);
    }

    const report = await getSalesSummary({
      startDate,
      endDate,
    });

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
};

module.exports = {
  getSalesReport,
};
