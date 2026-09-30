import { TestReport } from "../models/test-report.model.js";
import { Instrument } from "../models/instrument.model.js";
import { Lab } from "../models/lab.model.js";

export const getDashboardSummary = async () => {
  const [
    totalInstruments,
    activeInstruments,
    totalReports,
    passedReports,
    failedReports,
    pendingReports,
    completedReports,
    draftReports,
    submittedReports,
    underReviewReports,
    approvedReports,
    totalLabs,
  ] = await Promise.all([
    Instrument.countDocuments(),

    Instrument.countDocuments({
      isActive: true,
    }),

    TestReport.countDocuments(),

    TestReport.countDocuments({
      overallResult: "pass",
    }),

    TestReport.countDocuments({
      overallResult: "fail",
    }),

    TestReport.countDocuments({
      overallResult: "pending",
    }),

    TestReport.countDocuments({
      status: "completed",
    }),

    TestReport.countDocuments({
      status: "draft",
    }),

    TestReport.countDocuments({
      status: "submitted",
    }),

    TestReport.countDocuments({
      status: "under_review",
    }),

    TestReport.countDocuments({
      status: "approved",
    }),

    Lab.countDocuments({
      isActive: true,
    }),
  ]);

  const instrumentStatus = await Instrument.aggregate([
    {
      $group: {
        _id: "$status",
        count: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]);

  const recentReports = await TestReport.find()
    .populate("instrument", "instrumentName modelNumber serialNumber")
    .populate("lab", "name code")
    .sort({
      testDate: -1,
      createdAt: -1,
    })
    .limit(10)
    .lean();

  const reportActivity = await TestReport.aggregate([
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$testDate",
          },
        },
        count: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        _id: -1,
      },
    },
    {
      $limit: 30,
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]);

  return {
    overview: {
      totalInstruments,
      activeInstruments,
      totalReports,
      passedReports,
      failedReports,
      pendingReports,
      completedReports,
      totalLabs,
    },

    workflow: {
      draft: draftReports,
      submitted: submittedReports,
      underReview: underReviewReports,
      approved: approvedReports,
      completed: completedReports,
    },

    instrumentStatus,

    recentReports,

    reportActivity,
  };
};
