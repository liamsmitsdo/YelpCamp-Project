const User = require('../models/user');

module.exports.register = (req,res) =>{
    res.render('users/register');
}

module.exports.postRegister = async (req,res, next) =>{
    const {email,username,password} = req.body;
    try {
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if(err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })
    } catch (error) {
        req.flash('error', error.message);
        res.redirect('/register');
    }
}

module.exports.login = (req,res) =>{
    res.render('users/login');
}

module.exports.postLogin = (req,res) =>{
    req.flash('success', 'Welcome back');
    const redirect = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirect);
}

module.exports.logout = (req,res) =>{
    req.logOut();
    req.flash('success', 'Logged out');
    res.redirect('/');
}