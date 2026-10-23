export function authorizeModification(req, res, next) {
  const role = req.user?.role;
  const userId = req.user?.id;
  const targetUserId = req.params?.userId;

  if (role === "parent") {
    return next();
  }

  if (role === "child" && String(userId) === String(targetUserId)) {
    return next();
  }

  return res.status(403).json({ error: "Access denied" });
}
