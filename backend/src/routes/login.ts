// import express from "express"
import { NextFunction, Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
// import path from "path";
// import dotenv from "dotenv"

// dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const router = Router();

//Autenticar usuário
router.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const user = { name: username, password: password };

  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET!);
  res.json({ accessToken: accessToken });
});

function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  //"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiYW5kcmVpIiwicGFzc3dvcmQiOiIxMjM0NTYiLCJpYXQiOjE3ODUzNDc1MjJ9.ejhUP5He01MbNaQPvVxj8f19RhVnyhVZCdfUO22Ok8E"
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, user)=>{
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  });
}

export default router;
