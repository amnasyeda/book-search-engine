const { User } = require("../models");
const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id }).select(
          "-__v -password");

        return userData;
      }

      throw new AuthenticationError("Sorry, you are not logged in.");
    },
    users: async () => {
      return User.find().select("-__v -password");
    },

    user: async (parent, { username }) => {
      return User.findOne({ username }).select("-__v -password");
    },

    userById: async (parent, { _id }) => {
      return User.findOne({ _id }).select("-__v -password");
    },
  },
  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Error.");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Error.");
      }

      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (parent, args, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
            { _id: context.user._id },
            { $addToSet: { savedBooks: args.input } },
            { new: true, runValidators: true }
          );
      
          return updatedUser;
        }
      
        throw new AuthenticationError('You are not logged in.');
      },
      removeBook: async (parent, args, context) => {
        if (context.user) {
          console.log(context.user);
          const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $pull: { savedBooks: { bookId: args.bookId } } },
            { new: true }
          );
        console.log(updatedUser);
          return updatedUser;
        }
  
        throw new AuthenticationError("You are not logged in.");
      },
  },
};

module.exports = resolvers;