import jwt from 'jsonwebtoken';

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorisation &&
    req.headers.authorisation.startsWith('Bearer')
  ) {
    try {
      // get token
      token = req.headers.authorisation.split(' ')[1];

      //verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {}
  }
};
