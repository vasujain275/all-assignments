const express = require('express');
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];
let courseId = 1;

const adminAuth = (req,res,next) => {
  const {username, password} = req.headers;

  const isAdmin = ADMINS.find(a => a.username === username && a.password === password)
  if (isAdmin) {
    next();
  }
  res.status(404);
};

const userAuth = (req,res,next) => {
  const {username, password} = req.headers;

  const user = USERS.find(a => a.username === username && a.password === password)
  if (user) {
    req.user = user;
    next();
  }
  res.status(404);
};



// Admin routes
app.post('/admin/signup', (req, res) => {
  // logic to sign up admin
  const admin = req.body;
  const existingAdmin = ADMINS.find(a => a.username === username)
  if (existingAdmin) {
    res.status(403).json({ message: 'Admin already exists' });
  }
  else {
    ADMINS.push(admin);
    res.json({ message: 'Admin created successfully' });
  }
});

app.post('/admin/login',adminAuth,(req, res) => {
  // logic to log in admin
  res.json({ message: 'Logged in successfully' });
});

app.post('/admin/courses',adminAuth, (req, res) => {
  // logic to create a course
  let courseObj = req.body;
  
  courseObj['id'] = courseId;
  courseId++;
  COURSES.push(courseObj);
  res.json({ message: 'Course created successfully', courseId: courseId -1 });
});

app.put('/admin/courses/:courseId',adminAuth, (req, res) => {
  // logic to edit a course
  const courseId = parseInt(req.params.courseId);
  const course = COURSES.find(c => c.id === courseId);
  if (course) {
    Object.assign(course, req.body);
    res.json({ message: 'Course updated successfully' });
  } else {
    res.status(404).json({ message: 'Course not found' });
  }
});

app.get('/admin/courses',adminAuth, (req, res) => {
  // logic to get all courses
  res.json({courses: COURSES});
});

// User routes
app.post('/users/signup', (req, res) => {
  // logic to sign up user
  const user = req.body;
  user['purchased'] = [];
  
  const existingUser = USERS.find(a => a.username === username)
  if (existingUser) {
    res.status(403).json({ message: 'User already exists' });
  }
  else {
    USERS.push(user);
    res.json({ message: 'User created successfully' });
  }
});

app.post('/users/login',userAuth, (req, res) => {
  // logic to log in user
  res.json({ message: 'Logged in successfully' });
});

app.get('/users/courses',userAuth, (req, res) => {
  // logic to list all courses
  let allowedCourses = COURSES.filter(a => a.published);
  res.json({courses: allowedCourses});
});

app.post('/users/courses/:courseId',userAuth, (req, res) => {
  // logic to purchase a course
  const id = Number(req.params.courseId);
  const course = COURSES.find(c => c.id === id && c.published);
  if (course) {
    req.user.purchased.push(id);
    res.json({ message: 'Course purchased successfully' });
  }
  else {
    res.status(404).json({ message: 'Course not found or not available' });
  }
});

app.get('/users/purchasedCourses',userAuth, (req, res) => {
  // logic to view purchased courses
  const purchasedCourses = COURSES.filter(c => req.user.purchased.includes(c.id));
  res.json({ purchasedCourses });
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
