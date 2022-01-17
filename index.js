if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const User = require('./models/user');
const Passport  = require('passport');
const passportL = require('passport-local');

const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

const mongoDBStore = require('connect-mongo')(session);

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console,"connection error:"));
db.once("open", () =>{
    console.log('Database connected');
})

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                `https://res.cloudinary.com/${process.env.CLOUDNAME}/`, //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

const secret = process.env.SECRET  || 'thisshouldbeabettersecret';

const store = new mongoDBStore({
    url: dbUrl,
    secret: secret,
    touchAfter: 24 * 60 * 60
})

store.on('error', function(e){
    console.log(e)
})

const sessionConfig = {
    store,
    name: 'Biscuit',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(Passport.initialize());
app.use(Passport.session());
Passport.use(new passportL(User.authenticate()));

Passport.serializeUser(User.serializeUser());
Passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.User = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);
app.use('/', userRoutes);

app.get('/', (req,res) =>{
    res.render('home');
})

app.all('*', (req,res,next)=>{
    next(new ExpressError('Page not found', 404));
})

app.use((err,req,res,next) =>{
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Oh no, Something Went Wrong!';
    res.status(statusCode).render('error', {err});
})

const port = process.env.PORT || 8888;

app.listen(port, ()=>{
    console.log(`serving on port ${port}`);
})
