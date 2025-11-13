import Trening from "../models/Trening.js";

const allowedStatuses = ["active", "expired", "cancelled", "postponed"];
const canManageTrenings = (user) => {
  if (!user?.role) return false;
  const role = String(user.role).toLowerCase();
  return role === "admin" || role === "trener";
};

const normalizeStatus = (status) => {
  if (!status) return undefined;
  const normalized = String(status).toLowerCase();
  if (normalized === "canceled") return "cancelled";
  return allowedStatuses.includes(normalized) ? normalized : undefined;
};

const populateTrening = (query) =>
  query.populate("trainer", "username email role").populate("participants", "username role");

export const getTrenings = async (_req, res) => {
  try {
    const trenings = await populateTrening(
      Trening.find().sort({ date: 1, time: 1, createdAt: -1 })
    );
    res.json(trenings);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching trainings", error: error.message });
  }
};

export const createTrening = async (req, res) => {
  try {
    if (!canManageTrenings(req.user)) {
      return res
        .status(403)
        .json({ message: "Only admin or trener can create trainings" });
    }

    const { title, description, date, time, location, status, capacity } =
      req.body;

    if (!title || !description || !date || !time || !location) {
      return res
        .status(400)
        .json({ message: "title, description, date, time and location are required" });
    }

    const treningDate = new Date(date);
    if (Number.isNaN(treningDate.getTime())) {
      return res.status(400).json({ message: "Invalid date value" });
    }

    const parsedCapacity =
      capacity === undefined || capacity === null || capacity === ""
        ? undefined
        : Number(capacity);

    if (parsedCapacity !== undefined && (Number.isNaN(parsedCapacity) || parsedCapacity < 1)) {
      return res.status(400).json({ message: "Capacity must be a positive number" });
    }

    const trening = await Trening.create({
      title,
      description,
      date: treningDate,
      time,
      location,
      status: normalizeStatus(status) || "active",
      capacity: parsedCapacity,
      trainer: req.user._id,
    });

    const populated = await populateTrening(
      Trening.findById(trening._id)
    );
    res.status(201).json(populated);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating training", error: error.message });
  }
};

export const updateTrening = async (req, res) => {
  try {
    if (!canManageTrenings(req.user)) {
      return res
        .status(403)
        .json({ message: "Only admin or trener can update trainings" });
    }

    const trening = await Trening.findById(req.params.id);
    if (!trening) {
      return res.status(404).json({ message: "Training not found" });
    }

    if (
      req.user.role === "trener" &&
      trening.trainer.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "You do not have permission to update this training" });
    }

    const { title, description, date, time, location, status, capacity } =
      req.body;

    if (title !== undefined) trening.title = title;
    if (description !== undefined) trening.description = description;
    if (date !== undefined) {
      const newDate = new Date(date);
      if (Number.isNaN(newDate.getTime())) {
        return res.status(400).json({ message: "Invalid date value" });
      }
      trening.date = newDate;
    }
    if (time !== undefined) trening.time = time;
    if (location !== undefined) trening.location = location;
    if (capacity !== undefined) {
      const parsed = Number(capacity);
      if (Number.isNaN(parsed) || parsed < 1) {
        return res.status(400).json({ message: "Capacity must be a positive number" });
      }
      trening.capacity = parsed;
    }
    if (status !== undefined) {
      const normalized = normalizeStatus(status);
      if (!normalized) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      trening.status = normalized;
    }

    await trening.save();

    const populated = await populateTrening(
      Trening.findById(trening._id)
    );
    res.json(populated);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating training", error: error.message });
  }
};

export const deleteTrening = async (req, res) => {
  try {
    if (!canManageTrenings(req.user)) {
      return res
        .status(403)
        .json({ message: "Only admin or trener can delete trainings" });
    }

    const trening = await Trening.findById(req.params.id);
    if (!trening) {
      return res.status(404).json({ message: "Training not found" });
    }

    if (
      req.user.role === "trener" &&
      trening.trainer.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "You do not have permission to delete this training" });
    }

    await trening.deleteOne();
    res.json({ message: "Training deleted successfully" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error deleting training", error: error.message });
  }
};

export const joinTrening = async (req, res) => {
  try {
    const trening = await Trening.findById(req.params.id);
    if (!trening) {
      return res.status(404).json({ message: "Training not found" });
    }

    if (trening.status !== "active") {
      return res.status(400).json({ message: "You can only join active trainings" });
    }

    const userId = req.user._id;
    const alreadyJoined = trening.participants.some((id) =>
      id.equals(userId)
    );
    if (alreadyJoined) {
      return res.status(400).json({ message: "You have already joined this training" });
    }

    if (
      trening.capacity &&
      trening.participants.length >= trening.capacity
    ) {
      return res.status(400).json({ message: "Training is full" });
    }

    trening.participants.push(userId);
    await trening.save();

    const populated = await populateTrening(
      Trening.findById(trening._id)
    );
    res.json(populated);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error joining training", error: error.message });
  }
};

export const leaveTrening = async (req, res) => {
  try {
    const trening = await Trening.findById(req.params.id);
    if (!trening) {
      return res.status(404).json({ message: "Training not found" });
    }

    const userId = req.user._id;
    const isParticipant = trening.participants.some((id) =>
      id.equals(userId)
    );

    if (!isParticipant) {
      return res
        .status(400)
        .json({ message: "You are not part of this training yet" });
    }

    trening.participants = trening.participants.filter(
      (id) => !id.equals(userId)
    );
    await trening.save();

    const populated = await populateTrening(
      Trening.findById(trening._id)
    );
    res.json(populated);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error leaving training", error: error.message });
  }
};
