import { Complaint } from '../models/Complaint.js';
import { ActivityLog } from '../models/ActivityLog.js';

/**
 * @desc    Create a civic complaint
 * @route   POST /api/complaints
 * @access  Private (Citizen)
 */
export async function createComplaint(req, res, next) {
  try {
    const { title, category, location, description, photoUrl, photoPublicId, priority } = req.body;

    if (!title || !category || !location || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, category, location, and description',
      });
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const customId = `#CIV-${randomNum}`;
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const timeline = [
      { step: 'Report Submitted', date: todayStr, time: timeStr, status: 'completed' },
      { step: 'Team Assigned', date: 'Pending Allocation', time: '', status: 'upcoming' },
      { step: 'Site Inspection', date: 'Scheduled', time: '', status: 'upcoming' },
      { step: 'Issue Resolved', date: 'Target: 24h', time: '', status: 'upcoming' },
    ];

    const complaint = await Complaint.create({
      customId,
      citizenId: req.user._id,
      citizenName: req.user.name,
      citizenPhone: req.user.phone || '',
      ward: req.user.ward || 'Sector 14',
      title,
      category,
      location,
      description,
      originalPhotoUrl: photoUrl || req.body.originalPhotoUrl || null,
      photoUrl: photoUrl || req.body.originalPhotoUrl || null,
      photoPublicId: photoPublicId || null,
      status: 'Submitted',
      priority: priority || 'Medium',
      timeline,
    });

    // Create activity log
    await ActivityLog.create({
      logId: `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action: 'Issue Reported',
      portal: 'citizen',
      userId: req.user._id,
      actorName: req.user.name,
      description: `New civic report: "${title}" at ${location} (${customId})`,
      details: { complaintId: customId, category, priority },
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Get current user's complaints
 * @route   GET /api/complaints/mine
 * @access  Private (Citizen)
 */
export async function getMyComplaints(req, res, next) {
  try {
    const complaints = await Complaint.find({ citizenId: req.user._id }).sort({ createdAt: -1 });

    const formatted = complaints.map((c) => ({
      _id: c._id,
      id: c.customId,
      title: c.title,
      category: c.category,
      location: c.location,
      description: c.description,
      status: c.status,
      priority: c.priority,
      originalPhotoUrl: c.originalPhotoUrl || c.photoUrl,
      photoUrl: c.originalPhotoUrl || c.photoUrl,
      completionPhotoUrl: c.completionPhotoUrl || null,
      completionDescription: c.completionDescription || '',
      completionRemarks: c.completionRemarks || '',
      completedBy: c.completedBy || '',
      completedAt: c.completedAt || null,
      assignedTeam: c.assignedTeam,
      timeline: c.timeline,
      date: c.createdAt.toISOString().split('T')[0],
      createdAt: c.createdAt,
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      complaints: formatted,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Get all complaints (Municipality Flow)
 * @route   GET /api/municipality/complaints
 * @access  Private (Municipality)
 */
export async function getAllComplaints(req, res, next) {
  try {
    const { status, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const complaints = await Complaint.find(filter)
      .populate('citizenId', 'name email phone ward address')
      .sort({ createdAt: -1 });

    const formatted = complaints.map((c) => ({
      _id: c._id,
      id: c.customId,
      title: c.title,
      category: c.category,
      location: c.location,
      description: c.description,
      status: c.status,
      priority: c.priority,
      assignedTeam: c.assignedTeam || 'Unassigned',
      citizen: c.citizenName || (c.citizenId && c.citizenId.name) || 'Resident',
      citizenId: c.citizenId?._id || c.citizenId || null,
      citizenPhone: c.citizenPhone || (c.citizenId && c.citizenId.phone) || '',
      ward: c.ward,
      originalPhotoUrl: c.originalPhotoUrl || c.photoUrl,
      photoUrl: c.originalPhotoUrl || c.photoUrl,
      completionPhotoUrl: c.completionPhotoUrl || null,
      completionDescription: c.completionDescription || '',
      completionRemarks: c.completionRemarks || '',
      completedBy: c.completedBy || '',
      completedAt: c.completedAt || null,
      timeline: c.timeline,
      createdAt: c.createdAt,
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      complaints: formatted,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Assign team to complaint
 * @route   PATCH /api/municipality/complaints/:id/assign
 * @access  Private (Municipality)
 */
export async function assignTeam(req, res, next) {
  try {
    const { teamName, priority } = req.body;

    if (!teamName) {
      return res.status(400).json({ success: false, message: 'Please select a response team' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.assignedTeam = teamName;
    complaint.status = 'Assigned';
    if (priority) complaint.priority = priority;
    complaint.assignedAt = new Date();

    const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Update timeline steps
    complaint.timeline = complaint.timeline.map((step) => {
      if (step.step === 'Team Assigned') {
        return { step: `Team Assigned (${teamName})`, date: todayStr, time: timeStr, status: 'completed' };
      }
      if (step.step === 'Site Inspection') {
        return { step: 'Site Inspection', date: 'In Progress', time: '', status: 'current' };
      }
      return step;
    });

    await complaint.save();

    // Log Activity
    await ActivityLog.create({
      logId: `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action: 'Team Assigned',
      portal: 'municipality',
      userId: req.user._id,
      actorName: req.user.name || 'Officer R. Vance',
      description: `Assigned team "${teamName}" to ${complaint.customId} (${complaint.title})`,
      details: { complaintId: complaint.customId, team: teamName },
    });

    res.status(200).json({
      success: true,
      message: `Team '${teamName}' assigned successfully`,
      complaint,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Update complaint status (e.g. In Progress, Resolved)
 * @route   PATCH /api/municipality/complaints/:id/status
 * @access  Private (Municipality)
 */
export async function updateComplaintStatus(req, res, next) {
  try {
    const { status, resolutionNotes } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.status = status || complaint.status;
    if (resolutionNotes) complaint.resolutionNotes = resolutionNotes;

    const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (status === 'Resolved') {
      complaint.resolvedAt = new Date();
      complaint.timeline = complaint.timeline.map((s) => ({
        ...s.toObject(),
        status: 'completed',
        date: s.status === 'upcoming' ? todayStr : s.date,
        time: s.status === 'upcoming' ? timeStr : s.time,
      }));
    }

    await complaint.save();

    // Log Activity
    await ActivityLog.create({
      logId: `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action: 'Complaint Updated',
      portal: 'municipality',
      userId: req.user._id,
      actorName: req.user.name || 'Officer R. Vance',
      description: `Updated ${complaint.customId} status to '${status}'`,
      details: { complaintId: complaint.customId, status },
    });

    res.status(200).json({
      success: true,
      message: `Complaint status updated to ${status}`,
      complaint,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Submit completion proof with mandatory photograph and work description
 * @route   PATCH /api/complaints/:id/complete
 * @access  Private (Municipality)
 */
export async function completeWork(req, res, next) {
  try {
    const { completionPhotoUrl, completionDescription, remarks } = req.body;

    if (!completionPhotoUrl || !completionPhotoUrl.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A valid completion photograph is mandatory to mark work as completed',
      });
    }

    if (!completionDescription || !completionDescription.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a work completion description',
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const now = new Date();
    const todayStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    complaint.completionPhotoUrl = completionPhotoUrl.trim();
    complaint.completionDescription = completionDescription.trim();
    if (remarks) complaint.completionRemarks = remarks.trim();
    complaint.completedBy = req.user.name || 'Municipal Officer';
    complaint.completedAt = now;
    complaint.resolvedAt = now;
    complaint.status = 'Resolved';

    complaint.timeline = complaint.timeline.map((s) => {
      const stepName = s.step || '';
      if (stepName.includes('Site Inspection') || stepName.includes('Inspection')) {
        return { ...s.toObject(), status: 'completed', date: s.date === 'In Progress' ? todayStr : s.date, time: timeStr };
      }
      if (stepName.includes('Resolved') || stepName.includes('Issue Resolved') || stepName.includes('Completed')) {
        return { step: 'Work Completed & Verified', date: todayStr, time: timeStr, status: 'completed' };
      }
      return { ...s.toObject(), status: 'completed' };
    });

    await complaint.save();

    // Log Activity
    await ActivityLog.create({
      logId: `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action: 'Work Completed',
      portal: 'municipality',
      userId: req.user._id,
      actorName: req.user.name || 'Officer R. Vance',
      description: `Completed work on ${complaint.customId} (${complaint.title}) with verification photograph`,
      details: {
        complaintId: complaint.customId,
        completionPhotoUrl,
        completionDescription,
        completedBy: complaint.completedBy,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Work completion proof submitted successfully. Complaint marked as Resolved.',
      complaint,
    });
  } catch (err) {
    next(err);
  }
}

