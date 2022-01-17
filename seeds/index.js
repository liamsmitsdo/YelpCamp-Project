const mongoose = require('mongoose');
const cities = require('./cities');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console,"connection error:"));
db.once("open", () =>{
    console.log('Database connected');
})

const seedDB = async () =>{
    await Campground.deleteMany({});
    for(let i = 0; i<200;i++){
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*30) +10;
        const camp = new Campground({
            author: '61b0ad0c0f7d5a4dcae38e71',
            title: `Campground ${random1000}`,
            location: `${cities[random1000].city} , ${cities[random1000].state}`,
            images: [{url:'https://images.unsplash.com/photo-1507599944477-f675212ef210?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2070&q=80', filename: 'seedImage'}],
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Tenetur, totam fugit corporis iste quasi temporibus ipsum soluta eum nulla numquam, et quisquam velit nemo accusamus. Totam nihil labore incidunt illo.',
            price,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            }
        })
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
})