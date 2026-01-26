const updateData = [
  {
    id: 1,
    title: "Severe Weather Closure: January 26, 2026",
    textBefore: `LU Alert – Due to the severe weather conditions and out of an abundance of caution, the Lamar University campus will be closed on Monday, January 26, 2026. This closure includes all in-person, hybrid, and online classes.

If an additional change to normal operations becomes necessary, notifications will be sent through your LU email, lamar.edu/alerts, Lamar University’s social media sites and an automated phone call and text message will be placed to the number listed in your Self-Service Banner account. Please monitor these communications methods for official updates.`,
    linkText: "",
    linkUrl: "",
    textAfter: "",
  },

  {
    id: 2,
    title: "Blackboard Course Enrollment & Availability Overview",
    textBefore: `Students will be automatically enrolled in courses 24 hours after completing registration. Students should not expect to see courses listed in Blackboard until two weekdays before the course start date. New students will not have access to Blackboard LU Learn until two weekdays before their first course begins.`,
    linkText: "",
    linkUrl: "",
    textAfter: "",
  },

  {
    id: 3,
    title: "Preferred Name Display",
    segments: [
      {
        text: "In accordance with Lamar University policy, users who have a preferred name recorded in Self-Service Banner will have their Blackboard username displayed as such. If your display name in Blackboard does not appear to be correct, please check your personal information in Banner and update your Preferred First Name. For more details on this policy, please refer to ",
      },
      {
        text: "Records and Registration",
        link: "https://www.lamar.edu/records-registration",
      },
      { text: ". To access your personal information, navigate to " },
      { text: "LU Connect", link: "https://luconnect.lamar.edu" },
      { text: ' and click "Banner Self-Service."' },
    ],
  },
  {
    id: 4,
    title: "Attendance verification",
    segments: [
      {
        text: "Regular class attendance/participation is important to the attainment of educational objectives. The University must abide by federal guidelines to verify attendance in each course for which a student is enrolled. In addition, eligibility for federal financial aid awards, is dependent on a student’s attendance in class. Therefore, if a student does not attend class, their awards may be reduced or completely cancelled. Beginning in Fall 2019, verification of attendance in all LU courses, both ",
      },
      { text: "online and on campus", link: "https://www.lamar.edu/online" },
      {
        text: ", will be accomplished through the use of an attendance assignment in each Blackboard course. Students will have until the census date for ",
      },
      { text: "each course", link: "https://www.lamar.edu/courses" },
      {
        text: " to complete this assignment. Students who fail to complete this assignment for each course they are enrolled in will have their financial aid awards adjusted or cancelled. Questions may be directed to ",
      },
      { text: "financialaid@lamar.edu", link: "mailto:financialaid@lamar.edu" },
    ],
  },
];

export default updateData;
