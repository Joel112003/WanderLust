const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../models/user");

// Ensure the JWT secret exists
if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET is not set in the environment.");
  process.exit(1);
}

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return done(null, false, { message: 'Incorrect email or password' });
      }
      // Use the callback style for authentication:
      user.authenticate(password, (err, authenticatedUser, passwordError) => {
        if (err) return done(err);
        if (!authenticatedUser) {
          // If authentication fails, passwordError holds the reason
          return done(null, false, { message: passwordError || 'Incorrect email or password' });
        }
        // Authentication succeeded—return the authenticated user
        return done(null, authenticatedUser);
      });
    } catch (error) {
      return done(error);
    }
  }
));

// JWT Strategy for protected routes
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
  try {
    const user = await User.findById(jwt_payload.id);
    if (user) {
      return done(null, user);
    }
    return done(null, false, { message: 'User not found' });
  } catch (error) {
    return done(error);
  }
}));

module.exports = passport;
