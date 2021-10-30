const { User } = require('../models');

const resolvers = {
  Query: {
    getSingleUser: async (parent, user = null,) => {
    const foundUser = await User.findOne({
      $or: [{ _id: user ? user._id : user.id }, { username: user.username }],
    });

    if (!foundUser) {
      return res.status(400).json({ message: 'Cannot find a user with this id!' });
    }

    return foundUser;
    }
  },
  Mutation: {
    createUser: async (parent, user) => {
        const newUser = await User.create(user);
    
        if (!user) {
          return res.status(400).json({ message: 'Something is wrong!' });
        }
        const token = signToken(newUser);
        res.json({ token, newUser });
      },
    login: (parent, user) => {
        const checkUser = await User.findOne({ $or: [{ username: user.username }, { email: user.email }] });
        if (!checkUser) {
          return res.status(400).json({ message: "Can't find this user" });
        }
    
        const correctPw = await checkUser.isCorrectPassword(body.password);
    
        if (!correctPw) {
          return res.status(400).json({ message: 'Wrong password!' });
        }
        const token = signToken(checkUser);
        res.json({ token, checkUser });
      },
    saveBook: (parent, user) => {
        try {
          const updatedUser = await User.findOneAndUpdate(
            { _id: user._id },
            { $addToSet: { savedBooks: user.savedBooks } },
            { new: true, runValidators: true }
          );
          return res.json(updatedUser);
        } catch (err) {
          console.log(err);
          return res.status(400).json(err);
        }
      },
  },
  deleteBook: async (parent, user) => {
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { $pull: { savedBooks: { bookId: user.bookId } } },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "Couldn't find user with this id!" });
    }
    return res.json(updatedUser);
  },
};s

module.exports = resolvers;
