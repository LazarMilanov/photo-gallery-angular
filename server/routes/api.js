const passwordValidator = require('password-validator');
const express = require("express");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const argon2 = require("argon2");
const multer = require("multer");
const { BlobServiceClient } = require("@azure/storage-blob");
const dotenv = require("dotenv");
dotenv.config({path: "../config.env"});

const upload = multer();

const User = require("../models/user");
const Image = require("../models/image");

const RSA_PRIVATE_KEY = fs.readFileSync("./keys/private.pem");
const RSA_PUBLIC_KEY = fs.readFileSync("./keys/public.pem");
const JWT_SESSION_DURATION = process.env.JWT_SESSION_DURATION;
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

const router = express.Router();

router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, _id");

    res.header(
        'Access-Control-Expose-Headers',
        'Authorization'
    );
    next();
});

// UTILITY FUNCTIONS

async function uploadImageToAzureBlobStorage(file) {
    const containerName = 'finalexamcontainer';
    const containerClient = blobServiceClient.getContainerClient(containerName);
    
    // Generate a unique name for the file
    const uniqueName = `${Date.now()}-${file.originalname}`;
  
    // Get a block blob client and upload the file
    const blockBlobClient = containerClient.getBlockBlobClient(uniqueName);
    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: { blobContentType: file.mimetype }
    });
  
    // Return the URL to the uploaded file
    return blockBlobClient.url;
}

async function deleteImageFromAzureBlobStorage(imageUrl) {
    const containerName = 'finalexamcontainer';
    const containerClient = blobServiceClient.getContainerClient(containerName);
    
    // Get the name of the file from the URL
    const fileName = imageUrl.split('/').pop();
  
    // Get a block blob client and upload the file
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    await blockBlobClient.delete();
}

function validatePassword(password) {

    // Create a schema
    var schema = new passwordValidator();

    // Add properties to it
    schema
        .is().min(2)                                    // Minimum length 8
        .is().max(100)                                  // Maximum length 100
        .has().lowercase()                              // Must have lowercase letters
        .has().digits(2)                                // Must have at least 2 digits
        .has().not().spaces()                           // Should not have spaces
        .is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values

    // returns the result as a list of error codes or empty array
    return schema.validate(password, { list: true });
}

function verifyToken(req, res, next) {

    try {
        // check if the authorization key is present as part of the header
        if (!req.headers.authorization) {
            throw new Error("Authorization key not present");
        }
        // extract the value from the bearer token if it's present
        let token = req.headers.authorization.split(' ')[1] // get the token

        // check if the token is null
        if (token === 'null' || token === undefined || token === "") {
            throw new Error("Token not present");
        }

        // if the token is present, try to verify it if it's valid
        let payload = jwt.verify(token, RSA_PUBLIC_KEY)

        // assign the payload subject as the request id (user id)
        req.userId = payload.subject
        next();

    } catch (err) {
        return res.status(401).json({
            "error": err.message,
            "message": "Unauthorized request!"
        });
    }
}

async function hashPassword(password) {
    return await argon2.hash(password);
}

async function attemptLogin(passwordDigest, inputPassword) {
    return argon2.verify(passwordDigest, inputPassword);
}

// ROUTES

router.get("/images", verifyToken, async (req, res) => {
    try {
        let data = await Image.find();
        res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
});

router.get("/images/:imageId", verifyToken, async (req, res) => {
    try {
        let data = await Image.findOne({ _id: req.params.imageId });
        res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
});

router.post("/images", verifyToken, upload.single('file'), async (req, res) => {
    try {
        // Upload the image to Azure Blob Storage and get the URL
        const imageUrl = await uploadImageToAzureBlobStorage(req.file);
    
        // Create a new Image document with the URL and save it to MongoDB
        const image = new Image({
            imageUrl: imageUrl,
            _authorId: req.body.authorId,
            description: req.body.description
        });
        await image.save();
    
        // Return the saved document
        res.status(200).json(image);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to upload image.' });
      }
});

router.patch("/images/:id", verifyToken, async (req, res) => {
    try {
        Image.updateOne({ _id: req.params.id }, {
            $set: {
                description: req.body.description
            }
        }).then(() => {
            res.status(200).json({
                message: "Image updated successfully"
            });
        })
    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
});

router.delete("/images/:id", verifyToken, async (req, res) => {
    try {
        Image.findById(req.params.id).then(async (image) => {
            await deleteImageFromAzureBlobStorage(image.imageUrl);
            await Image.deleteOne({ _id: req.params.id });
            res.status(200).json({
                message: "Image deleted successfully"
            });
        }).catch((error) => {
            return res.status(500).json({
                error: error.message
            });
        });
    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
});

router.get("/users/:userId", verifyToken, async (req, res) => {
    try {
        let data = await User.findOne({ _id: req.params.userId });
        res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
});


router.patch("/users/:userId", verifyToken, async (req, res) => {
    try {
        let password = req.body.password;
        let errors = validatePassword(password);
        if (errors.length > 0) {
            throw new Error("Password does not meet the requirements!");
        } else {
            hashPassword(password).then(async (passwordDigest) => {
                User.updateOne({ _id: req.params.userId }, {
                    $set: {
                        password: passwordDigest
                    }
                }).then(() => {
                    res.status(200).json({
                        message: "User updated successfully"
                    });
                }).catch((error) => {
                    return res.status(500).json({
                        error: error.message
                    });
                });
            }).catch((error) => {
                return res.status(500).json({
                    error: error.message
                });
            });
        }
    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
});

router.post("/users/login", async (req, res) => {
    
    try {
        
        let userCredentials = req.body;
        let email = userCredentials.email;
        let password = userCredentials.password;

        let user = await User.findOne({email: email});

        if(!user){
            throw new Error("User not found!");
        } else {
            let passwordDigest = user.password;
            let isPasswordCorrect = await attemptLogin(passwordDigest, password);
            if(!isPasswordCorrect){
                throw new Error("Incorrect password!");
            } else {
                let payload = { subject: user._id };

                let token = jwt.sign(payload, RSA_PRIVATE_KEY, {
                    algorithm: "RS256",
                    expiresIn: JWT_SESSION_DURATION,
                    subject: "1"
                });

                res.header('Authorization', token).send(user);
            }
        }

    } catch (err) {
        return res.status(400).json({
            error: err.message
        });
    }

});

router.post("/users", async (req, res) => {
    
    try {
        
        let userCredentials = req.body;
        let email = userCredentials.email;
        let password = userCredentials.password;

        let user = await User.findOne({email: email});

        if (user) {
            throw new Error("User already exists!");
        } else {
            let passwordErrors = validatePassword(password);
            if (passwordErrors.length > 0) {
                throw new Error("Password does not meet the requirements!");
            } else {

                hashPassword(password).then((passwordDigest) => {
                    let newUser = new User({
                        email: email,
                        password: passwordDigest
                    });
                    newUser.save().then((user) => {
                        let payload = { subject: user._id };

                        let token = jwt.sign(payload, RSA_PRIVATE_KEY, {
                            algorithm: "RS256",
                            expiresIn: JWT_SESSION_DURATION,
                            subject: "1"
                        });

                        res.header('Authorization', token).send(user);
                    }).catch((err) => {
                        console.log("[ERROR] POST /api/v1/users");
                        console.log(err);
                        res.status(500).json({
                            "error": err.message,
                            "message": "Internal server error!"
                        });
                    });
                }).catch((err) => {
                    console.log("[ERROR] POST /api/v1/users");
                    console.log(err);
                    res.status(500).json({
                        "error": err.message,
                        "message": "Internal server error!"
                    });
                });
            }
        }

    } catch (err) {
        console.log("[ERROR] POST /api/v1/sign-up");
        console.log(err);
        res.status(500).json({
            "error": err.message,
            "message": "Internal server error!"
        });
    }

});

module.exports = router;