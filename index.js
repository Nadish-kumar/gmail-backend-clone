import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import postmail from "./models/post.mail.js";
import users from "./models/user.model.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
//app config
const app = express();
app.use(cors());
app.use(express.json());
const secret = "8825637070";
const connection__url =
  "mongodb+srv://nadishkumar:yatvik@cluster0.kp8bt.mongodb.net/nadishkumar?retryWrites=true&w=majority";

const port = process.env.PORT || 8001;
//db config
mongoose.connect(connection__url);
//api endpoint
app.get("/", (req, res) => res.status(200).send("hello nadish"));

app.post("/sauce", (req, res) => {
  const dbcard = req.body;

  postmail.create(dbcard, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

app.post("/mail", (req, res) => {
  console.log(req.body);
  postmail.find(req.body, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

app.post("/singlemail", (req, res) => {
  console.log(req.body);
  postmail.findOne(req.body, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

//register users
app.post("/register", (req, res) => {
  //hash the password
  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(req.body.password, salt);
  req.body.password = hash;
  const dbcard = req.body;
  console.log(dbcard);
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "yatkumar246@gmail.com",
      pass: "8489537070",
    },
  });

  let mailoption = {
    from: "yatkumar246@gmail.com",
    to: req.body.email,
    subject: "Gmail authentication verify mail",
    text: `Hello ${req.body.firstname} . Your Smile is very cute its very important to as! Enjoy your life with smile and happiness`,
  };

  transporter.sendMail(mailoption, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log("email send !!!!!");
    }
  });
  users.create(dbcard, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

//login users
app.post("/login", async (req, res) => {
  //find the email matches
  try {
    let user = await users.findOne({ email: req.body.email });
    if (user) {
      let passwordresult = await bcrypt.compare(
        req.body.password,
        user.password
      );
      console.log(passwordresult);
      if (passwordresult) {
        let token = jwt.sign({ userid: user._id }, secret, { expiresIn: "1d" });
        res.json({ token });
      } else {
        res.status(401).json({ message: "wrong password" });
      }
    } else {
      res.status(401).json({ message: "user not found" });
    }
  } catch (error) {
    console.log(error);
  }
});

let authenticate = (req, res, next) => {
  if (req.headers.authentication) {
    try {
      let result = jwt.verify(req.headers.authentication, secret);
      next();
    } catch (error) {
      res.status(401).json({ mesaagae: "token expired" });
    }
  } else {
    res.status(401).json({ message: "not authorized" });
  }
};

app.get("/main", authenticate, (req, res) => {
  res.json({ mesaagae: 20 });
});

app.get("/viewall", (req, res) => {
  var dbcard = req.body;
  users.find(dbcard, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});
//listner
app.listen(port, () => console.log(`listing on localhost:${port}`));
