var express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
var bodyParser = require('body-parser');

const uri = "mongodb+srv://bdsim2023:Pmongodb19@cluster0.jvqlsbt.mongodb.net/code?retryWrites=true&w=majority&appName=Cluster0"

var app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const dataSchema = new mongoose.Schema({
    email: { type: String, required: true },
    codeId: { type: String, required: true },
    jsonData: { type: Object, required: true },
});

const infoSchema=new mongoose.Schema({
    username:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true}
})
const DataModel = mongoose.model('CodeStates', dataSchema);
const infoModel=mongoose.model('Info',infoSchema)


app.use(express.json());


app.post('/reg', (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Please provide username, email, and password' });
    }

    infoModel.findOne({ $or: [{ email: email }, { username: username }]})
        .then(user => {
            if (!user) {
                // User doesn't exist, save the new user
                const newUser = new infoModel({ username, email, password });
                return newUser.save()
                    .then(savedData => {
                        console.log("Data saved:", savedData);
                        res.status(200).json({ message: 'Successfully registered' });
                    })
                    .catch(err => {
                        console.log("Error: Error saving in the database:", err);
                        res.status(500).json({ error: 'An unexpected error occurred' });
                    });
            }

            // User exists, check if email or username is already used
            if (user.email === email) {
                return res.status(200).json({ message: 'Email already used' });
            } else {
                return res.status(200).json({ message: 'Username already used' });
            }
        })
        .catch(err => {
            console.error('Error:', err);
            res.status(500).json({ error: 'An unexpected error occurred' });
        });
});

app.post('/autoLogin', (req, res) => {
    const { email} = req.body;

    infoModel.findOne({ email: email})
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }
            console.log("User Information:",user)
            res.status(200).json({ message: 'successful', user: user });
        })
        .catch(err => {
            console.error('Error:', err);
            res.status(500).json({ error: 'An unexpected error occurred' });
        });
});


app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Please provide email and password' });
    }


    infoModel.findOne({ email: email, password: password })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }
            console.log("User Information:",user)
            res.status(200).json({ message: 'successful', user: user });
        })
        .catch(err => {
            console.error('Error:', err);
            res.status(500).json({ error: 'An unexpected error occurred' });
        });
});



app.post('/save', function(req, res) {
    const { email, codeId, jsonData } = req.body;

    const options = {
        upsert: true, // Create a new document if a matching document is not found
        new: true, // Return the updated document
        setDefaultsOnInsert: true // Set default values if creating a new document
    };

    const updateData = {
        email: email,
        codeId: codeId,
        jsonData: jsonData
    };

    // Find and update the document, or insert as new
    DataModel.findOneAndUpdate(
        { codeId: codeId }, // Search criteria: find document with the same codeId
        updateData, // Data to update or insert
        options // Update options
    )
    .then(savedData => {
        console.log('Data saved successfully:', savedData);
        res.status(200).send('Data saved successfully');
    })
    .catch(err => {
        console.error('Error saving data to database:', err);
        res.status(500).send('Error saving data to database');
    });
});



app.get('/codes/:email', function(req, res) {
    const email = req.params.email;

    DataModel.find({ email })
        .then(codes => {
            res.status(200).json(codes);
        })
        .catch(err => {
            console.error('Error fetching codes:', err);
            res.status(500).send('Error fetching codes');
        });
});




app.listen(8080);
