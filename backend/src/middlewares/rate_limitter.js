import { rateLimit } from "express-rate-limit";

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  handler: (req, res) => {
    res.status(429).json({
      status: "fail",
      message: "Ooops!!, Too many requests \n Please try again after 15 minutes.",
    });
  },
});

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // maksimal 5 login attempts
  skipSuccessfulRequests: true, // reset counter jika login berhasil
  // keyGenerator: (req) => {
  //   // Track by IP + email untuk lebih spesifik
  //   return `${req.ip}-${req.body.email || 'unknown'}`;
  // },
  handler: (req, res) => {
    // errResponse("Too many login attempts. Please try again after 15 minutes.", res);
    res.status(429).json({
      status: "fail",
      message: "Too many login attempts. Please try again after 15 minutes.",
      // retryAfter: 15 * 60 // dalam detik
    });
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

export default rateLimiter;
