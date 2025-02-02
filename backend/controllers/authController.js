import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import {generateTokenAndSetCookie} from "../lib/utils/generateToken.js";

export const signup = async (req, res) => {
    try {
        const { username, fullname, email, password } = req.body;

        // make sure the email has the right format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json(
                {
                    error: "Invalid email address"
                }
            );
        }

        // check that the credentials are unique
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json(
                {
                    error: "Email already exists"
                }
            );
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json(
                {
                    error: "Username is taken"
                }
            );
        }

        // enforce password length
        if (password.length < 6) {
            return res.status(400).json(
                {
                    error: "Password should be at least 6 characters long"
                }
            );
        }

        // hash passwords 
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            username,
            fullname,
            email, 
            password: hashedPassword
        });

        // generate access token and save user
        if (newUser) {
            generateTokenAndSetCookie(res, newUser._id);  // access token to prevent CSRF attacks 
            await newUser.save();
            res.status(201).send("user created successfully");
        } else {
            res.status(400).json(
                {
                    error: "Invalid user data"
                }
            );
        }

    } catch (error) {
        console.log(`Error in signup controller:  ${error.message}`);
        console.error(`Couldn't connect to database: ${error.message}`);
        res.status(500).json(
            {
                error: "Internal server error"
            }
        );
    }
}


export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({username});
        if (user) {
            // authenticate user
            const validPassword = await bcrypt.compare(password, user?.password || ""); 
            if (validPassword) {
                generateTokenAndSetCookie(res, user._id); // prevent CSRF attacks
                res.status(200).json(
                    {
                        _id: user._id,
                        username,
                        fullname: user.fullname,
                        email: user.email,
                        followers: user.followers,
                        following: user.following,
                        profilePicture: user.profilePicture,
                        coverPicture: user.coverPicture,
                        bio: user.bio,
                        location: user.location,
                        website: user.website
                    }
                );
            } else {
                res.status(400).json(
                    {
                        error: "Wrong password"
                    }
                );
            }
        } else {
            res.status(400).json(
                {
                    error: "User doesn't exist"
                }
            );
        }

    } catch (error) {
        console.log(`Error in login controller:  ${error.message}`);
        console.error(`Couldn't connect to database: ${error.message}`);
        res.status(500).json(
            {
                error: "Internal server error"
            }
        );
    }
}


export const logout = async (req, res) => {
    try {
        if(!req.cookies.token) {
            return res.status(400).json(
                {
                    error: "You are not logged in"
                }
            );
        }
        // remove any existing access token cookies
        res.clearCookie("token");
        res.status(200).json({msg: "Logged out successfully"});
    } catch(error) {
        console.log(`Error in logout controller:  ${error.message}`);
        console.error(`Couldn't connect to database: ${error.message}`);
        res.status(500).json(
            {
                error: "Internal server error"
            }
        );
    }
}

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (user) {
            res.status(200).json(
                {
                    user
                }
            );
        } else {
            res.status(400).json(
                {
                    error: "User doesn't exist"
                }
            );
        }
    } catch (error) {
        console.log(`Error in getMe controller:  ${error.message}`);
        console.error(`Couldn't connect to database: ${error.message}`);
        res.status(500).json(
            {
                error: "Internal server error"
            }
        );
    }
}