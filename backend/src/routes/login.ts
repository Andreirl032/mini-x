// import express from "express"
import { Router } from "express";

const router = Router();

router.get("/login", (req, res) => {
  res.json({ mensagem: "Login" });
});

export default router;
