const mongoose = require("mongoose");

const questionBankSchema = new mongoose.Schema({
  questionName: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  subTopic1: {
    type: String,
    required: true,
  },
  subTopic2: {
    type: String,
    required: true,
  },
  subTopic3: {
    type: String,
    required: true,
  },
  class: {
    type: Number,
    required: true,
  },
  month: {
    type: Number,
    required: true,
  },
  options: 
    {
      a: {
        type: String,
        required: true,
      },
      b: {
        type: String,
        required: true,
      },
      c: {
        type: String,
        required: true,
      },
      d: {
        type: String,
        required: true,
      },
    },
  previousYear: {
      type: Boolean,
    },
  previousYearPaper: [
    {
      nameOfPaper: {
        type: String,
      },
      year1: {
        type: Number,
      },
      year2: {
        type: Number,
      },
      year3: {
        type: Number,
      },
    },
  ],
 important: {
    type: Boolean,
  },
 recommended: {
    type: Boolean,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  explanation: {
    type: String,
  },
  ratings: {
    type: Number,
    default: 0,
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "Candidate",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
      featured: {
        type: Boolean,
        default: false,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Candidate", 
  },
});

// instituteSchema.virtual("id").get(function () {
//   return this._id.toHexString();
// });

// instituteSchema.set("toJSON", {
//   virtuals: true,
// });

module.exports = mongoose.model("QuestionBank", questionBankSchema);
// exports.instituteSchema = instituteSchema;
