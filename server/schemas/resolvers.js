const { User } = require('../models');

const resolvers = {
  Query: {
    getSingleUser: async (parent, user = null, context) => {
    const foundUser = await User.findOne({ _id: context.user._id});

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
    saveBook: (parent, args, context) => {
        try {
          const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $addToSet: { savedBooks: args.bookInfo } },
            { new: true, runValidators: true }
          );
          return res.json(updatedUser);
        } catch (err) {
          console.log(err);
          return res.status(400).json(err);
        }
      },
  },
  deleteBook: async (parent, args, context) => {
    const updatedUser = await User.findOneAndUpdate(
      { _id: context.user._id },
      { $pull: { savedBooks: { bookId: args.bookId } } },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "Couldn't find user with this id!" });
    }
    return res.json(updatedUser);
  },
};s

module.exports = resolvers;
