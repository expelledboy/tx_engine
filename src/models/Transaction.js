const mongoose = require("mongoose");
const Action = require("./Action.js");

const TransactionSchema = new mongoose.Schema(
  {
    trx_id: {
      type: String,
      required: true,
      unique: true
    },
    meta: Object,
    status: {
      type: String,
      enum: ["new", "processing", "completed", "rolledback"],
      default: "new"
    },
    actions: [Action.schema]
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);

TransactionSchema.virtual("resolved").get(function resolved() {
  return this.actions.findIndex(action => !action.resolved) < 0;
});

TransactionSchema.virtual("results").get(function results() {
  const reduce = this.status === "rolledback" ? "detail" : "result";
  return this.actions.map(action => action[reduce]);
});

TransactionSchema.virtual("data").get(function data() {
  // have action in history be grouped by name eg: _.action[i].result.value
  return this.actions.reduce((acc, { name, result }) => {
    if (!acc[name]) acc[name] = [];
    acc[name].push(result);
    return acc;
  }, {});
});

TransactionSchema.methods.perform = async function perform() {
  this.status = "processing";
  await this.save();

  /* eslint-disable no-await-in-loop, no-restricted-syntax */
  for (const action of this.actions) {
    action.start(this.data);
    await this.save();

    await action.perform();
    await this.save();

    if (!action.resolved) break;
  }
  /* eslint-enable no-await-in-loop, no-restricted-syntax */
};

TransactionSchema.methods.complete = async function complete() {
  if (this.resolved) {
    this.status = "completed";
  } else {
    await this.rollback();
    this.status = "rolledback";
  }
  await this.save();
  return {
    status: this.status,
    // resolved: this.resolved,
    results: this.results
  };
};

TransactionSchema.methods.rollback = async function rollback() {
  /* eslint-disable no-await-in-loop */
  for (let i = this.actions.length - 1; i >= 0; i -= 1) {
    const action = this.actions[i];

    switch (action.status) {
      case "rolledback":
        break;
      case "new":
        await action.cancel();
        break;
      default:
        await action.rollback();
    }
    await this.save();
  }
  /* eslint-enable no-await-in-loop */
};

module.exports = mongoose.model("transaction", TransactionSchema);
