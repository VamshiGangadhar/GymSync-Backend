const { User } = require("../models/User");

exports.updateTrainerProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      certifications,
      expertise,
      availability,
      biography,
      experience,
      specializations,
    } = req.body;

    const trainer = await User.findById(userId);

    if (!trainer || !trainer.isTrainer()) {
      return res.status(404).json({
        success: false,
        message: "Trainer not found",
      });
    }

    // Validate certification dates
    if (certifications) {
      for (const cert of certifications) {
        if (new Date(cert.expiryDate) <= new Date(cert.issueDate)) {
          return res.status(400).json({
            success: false,
            message: "Certification expiry date must be after issue date",
          });
        }
      }
    }

    // Validate availability slots
    if (availability) {
      for (const day of availability) {
        for (const slot of day.slots) {
          const start = new Date(`1970-01-01T${slot.startTime}`);
          const end = new Date(`1970-01-01T${slot.endTime}`);

          if (end <= start) {
            return res.status(400).json({
              success: false,
              message: "Slot end time must be after start time",
            });
          }
        }
      }
    }

    trainer.trainerProfile = {
      ...trainer.trainerProfile,
      certifications: certifications || trainer.trainerProfile.certifications,
      expertise: expertise || trainer.trainerProfile.expertise,
      availability: availability || trainer.trainerProfile.availability,
      biography: biography || trainer.trainerProfile.biography,
      experience: experience || trainer.trainerProfile.experience,
      specializations:
        specializations || trainer.trainerProfile.specializations,
    };

    await trainer.save();

    res.json({
      success: true,
      message: "Trainer profile updated successfully",
      trainer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = exports;
