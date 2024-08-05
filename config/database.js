// import mongoose from "mongoose";

// export const connectDB = async () => {
//   // const { connection } = await mongoose.connect(process.env.MONGO_LOCAL_URI);
//   const { connection } = await mongoose.connect(process.env.MONGO_ATLAS_URI);
//   console.log(`MongoDB connected with ${connection.host}`);
// };

import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    // const { connection } = await mongoose.connect(process.env.MONGO_LOCAL_URI, {
    const { connection } = await mongoose.connect(process.env.MONGO_ATLAS_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected with ${connection.host}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process with an error code
  }
};
