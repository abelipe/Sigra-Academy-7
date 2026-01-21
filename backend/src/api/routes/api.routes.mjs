import { Router } from "express";
import { SETTINGS } from "../../../config/settings.config.mjs";
import { controlRoute } from "../../modules/access-control-I/control.route.mjs";
import { subjectRoute } from "../../modules/academic-structure-II/subjects/subjects.route.mjs";
import { GradesLogRoutes } from "../../modules/grades-record-V/grades/grades.route.mjs";
import { prelaciesRoute } from "../../modules/academic-structure-II/prelacies/prelacies.route.mjs";
import { SectionRoutes } from "../../modules/academic-structure-II/sections/section.route.mjs";
import { GradeRoutes } from "../../modules/academic-structure-II/grades/grade.route.mjs";
import { YearRoutes } from "../../modules/academic-structure-II/years/year.route.mjs";
import { NotificationRoutes } from "../../modules/notifications-VII/notification.route.mjs";
import { AssignmentRouter } from "../../modules/academic-manager-III/assignments/assignment.route.mjs";
import { SchedulesRoutes } from "../../modules/academic-manager-III/schedules/schedules.route.mjs";
import { managerRoutes } from "../../modules/academic-manager-III/manager.route.mjs";
import { ActivitiesRoute } from "../../modules/teaching-manager-IV/activities/activities.route.mjs";
import { SubmissionRoute } from "../../modules/teaching-manager-IV/submissions/submission.route.mjs";
import { ResourceRoute } from "../../modules/teaching-manager-IV/courseResources/resources.route.mjs";
import { EnrollmentRouter } from "../../modules/academic-structure-II/enrollments/enrollment.route.mjs";
import { AssistanceRouter } from "../../modules/teaching-manager-IV/assistance/assistance.route.mjs";
import { academicAssignmentRoute } from "../../modules/academic-structure-II/assignments/assignment.route.mjs";

const router = Router();


export const ListRoutes = {
    auth: {
        control: router.use(`${SETTINGS.BASE_PATH}/auth`, controlRoute)
    },
    academicStructure: {
        subjects: router.use(`${SETTINGS.BASE_PATH}/subjects`, subjectRoute),
        prelacies: router.use(`${SETTINGS.BASE_PATH}/prelacies`, prelaciesRoute),
        sections: router.use(`${SETTINGS.BASE_PATH}/sections`, SectionRoutes),
        gradeAcademic: router.use(`${SETTINGS.BASE_PATH}/grades`, GradeRoutes),
        years: router.use(`${SETTINGS.BASE_PATH}/years`, YearRoutes),
        enrollments: router.use(`${SETTINGS.BASE_PATH}/enrollments`, EnrollmentRouter),
        academicAssignments: router.use(`${SETTINGS.BASE_PATH}/academic-assignments`, academicAssignmentRoute)
    },
    grades: {
        grades: router.use(`${SETTINGS.BASE_PATH}/grades-log`, GradesLogRoutes)
    },
    notifications: {
        notifications: router.use(`${SETTINGS.BASE_PATH}/notifications`, NotificationRoutes)
    },
    academicManager: {
        assignments: router.use(`${SETTINGS.BASE_PATH}/assignments`, AssignmentRouter),
        schedules: router.use(`${SETTINGS.BASE_PATH}/schedules`, SchedulesRoutes),
        manager: router.use(`${SETTINGS.BASE_PATH}/manager`, managerRoutes)
    },
    activities: {
        activity: router.use(`${SETTINGS.BASE_PATH}/activities`, ActivitiesRoute),
        submissions: router.use(`${SETTINGS.BASE_PATH}/submissions`, SubmissionRoute),
        resources: router.use(`${SETTINGS.BASE_PATH}/resources`, ResourceRoute),
        assistance: router.use(`${SETTINGS.BASE_PATH}/assistance`, AssistanceRouter)
    }
}
