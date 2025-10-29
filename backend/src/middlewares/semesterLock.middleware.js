const SemesterClosure = require('../services/semesterClosure.service');

// Extract hoc_ky/nam_hoc from request (supports both body and query)
function extractSemester(req) {
  const src = Object.assign({}, req.body || {}, req.query || {});
  const hoc_ky = src.hoc_ky || src.semester || src.semester_code || null;
  const nam_hoc = src.nam_hoc || src.school_year || null;
  return { hoc_ky, nam_hoc };
}

// For routes where admin passes classId explicitly (e.g., create activity for class)
async function enforceAdminWritable(req, res, next) {
  try {
    const { hoc_ky, nam_hoc } = extractSemester(req);
    const classId = req.body?.lop_id || req.body?.classId || req.query?.classId || null;
    await SemesterClosure.checkWritableForClassSemesterOrThrow({ classId, hoc_ky, nam_hoc });
    return next();
  } catch (err) {
    const code = err.status || 423;
    return res.status(code).json({ success: false, message: err.message || 'SEMESTER_LOCKED', details: err.details || null });
  }
}

// For student/teacher/monitor actions: resolve class from userId internally
async function enforceUserWritable(req, res, next) {
  try {
    const { hoc_ky, nam_hoc } = extractSemester(req);
    const userId = req.user?.sub || req.user?.id;
    await SemesterClosure.enforceWritableForUserSemesterOrThrow({ userId, hoc_ky, nam_hoc });
    return next();
  } catch (err) {
    const code = err.status || 423;
    return res.status(code).json({ success: false, message: err.message || 'SEMESTER_LOCKED', details: err.details || null });
  }
}

module.exports = {
  enforceAdminWritable,
  enforceUserWritable,
};


