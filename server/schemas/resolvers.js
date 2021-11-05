const { User } = require('../models');

const resolvers = {
  Query: {
    users: async () => {
      return await User.find()
    },
    me: async (parent, args, context) => {
        const foundUser = await User.findOne({ _id: context.user_id});

        if (!foundUser) {
          throw new AuthenticationError('Cannot find a user with this id!');
        }

        return foundUser;
    }
  },
  Mutation: {
    addUser: async (parent, {username, email, password}) => {
      
        if (!username || !email || !password) {
          throw new AuthenticationError('Something is wrong!');
        }
        const newUser = await User.create({username, email, password});
        const token = signToken(newUser);
        return { token, newUser };
      },
    login: async (parent, { email, password }) => {
        const user = await User.findOne({email});
        if (!user) {
          throw new AuthenticationError("Something is wrong!");
        }
    
        const correctPw = await user.isCorrectPassword(password);
    
        if (!correctPw) {
          throw new AuthenticationError('Something is wrong!');
        }
        const token = signToken(user);
        return { token, user };
      },
    saveBook: async (parent, book, context) => {
        try {
          const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $push: { savedBooks: book } },
            { new: true, runValidators: true }
          );
          return updatedUser;
        } catch (err) {
          console.log(err);
          throw new AuthenticationError("Unable save book");
        }
      },
  },
  // removeBook: async (parent, { bookId }, context) => {
  //     const updatedUser = await User.findOneAndUpdate(
  //       { _id: context.user._id },
  //       { $pull: { savedBooks: { bookId: bookId } } },
  //       { new: true }
  //     );
  //     if (!updatedUser) {
  //       throw new AuthenticationError("Couldn't find user with this id!");
  //     }
  //     return updatedUser;
  // }
};

module.exports = resolvers;
