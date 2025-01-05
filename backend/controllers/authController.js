import User from "../models/userModel";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
    try {
        const { username, fullname, email, password } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json(
                {
                    error: "Invalid email address"
                }
            );
        }
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
                    error: "Username already exists"
                }
            );
        }

        if (password.length < 6) {
            return res.status(400).json(
                {
                    error: "Password should be at least 6 characters long"
                }
            );
        }

        // hash passwords 
        const salt = await bcrypt.genSalt(100);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            username,
            fullname,
            email, 
            password: hashedPassword
        });
        if (newUser) {
            generateTokenAndSetCookie(res, newUser._id);
            await newUser.save();
            res.status(201).json(
                {
                    _id: newUser._id,
                    username: newUser.username,
                    fullname: newUser.fullname,
                    email: newUser.email,
                    followers: newUser.followers,
                    following: newUser.following,
                    profilePicture: newUser.profilePicture,
                    coverPicture: newUser.coverPicture,
                    bio: newUser.bio,
                    location: newUser.location,
                    website: newUser.website
                }
            );
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
            const validPassword = await bcrypt.compare(password, user?.password || "");
            if (validPassword) {
                generateTokenAndSetCookie(res, user._id);
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
    res.json(
        {
            data: "this is the logout endpoint, it'll soon be active!"
        }
    );
}