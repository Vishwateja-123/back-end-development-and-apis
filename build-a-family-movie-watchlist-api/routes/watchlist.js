import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeModification } from "../middleware/authorize.js";
import {
  getWatchlist,
  addMovie,
  updateMovie,
  deleteMovie,
} from "../utils/db.js";

const router = Router();

// All watchlist endpoints require authentication
router.use(authenticate);

// GET /api/watchlist/:userId
router.get("/:userId", (req, res) => {
  const userId = Number(req.params.userId);
  const list = getWatchlist(userId);

  if (list === null) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.status(200).json(list);
});

// POST /api/watchlist/:userId/movies
router.post("/:userId/movies", authorizeModification, (req, res) => {
  const userId = Number(req.params.userId);
  const movie = addMovie(userId, req.body);

  if (!movie) {
    return res.status(400).json({ error: "Could not add movie" });
  }

  return res.status(201).json(movie);
});

// PUT /api/watchlist/:userId/movies/:movieId
router.put("/:userId/movies/:movieId", authorizeModification, (req, res) => {
  const userId = Number(req.params.userId);
  const movieId = Number(req.params.movieId);
  const updated = updateMovie(userId, movieId, req.body);

  if (!updated) {
    return res.status(404).json({ error: "Movie not found" });
  }

  return res.status(200).json(updated);
});

// DELETE /api/watchlist/:userId/movies/:movieId
router.delete("/:userId/movies/:movieId", authorizeModification, (req, res) => {
  const userId = Number(req.params.userId);
  const movieId = Number(req.params.movieId);
  const success = deleteMovie(userId, movieId);

  if (!success) {
    return res.status(404).json({ error: "Movie not found" });
  }

  return res.status(200).json({ message: "Movie deleted successfully" });
});

export default router;
