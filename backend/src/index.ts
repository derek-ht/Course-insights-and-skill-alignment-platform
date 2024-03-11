import {
  authRegisterV2,
  authRegisterVerify,
  authLogin,
  authLogout,
  authPasswordResetRequest,
  authPasswordReset
} from './auth.ts'
import cors from 'cors'
import express from 'express'
import passport from 'passport'
import cookieParser from 'cookie-parser'
import 'dotenv/config'
import './jwt.ts'
import {
  authorizeRole,
  authorizeUIdIsAuthUser,
  authorizeAcademicUIdIsAuthUser,
  authorizeGroupMember,
  authorizeCourseOwner,
  authorizeProjectOwner,
  authorizeSharedProfile
} from './jwt.ts'
import { errorHandler } from '../libs/utils.ts'
import {
  userDelete,
  userProfile,
  userSetEmail,
  userSetName,
  userSetPassword,
  userProfiles,
  userProfilesPublic,
  userProfilesShared,
  userProfilesVisible,
  userIsPublic,
  userToggleVisibility,
  userAddCourse,
  userUploadTranscript,
  userSetPhone,
  userSetSchool,
  userSetDegree,
  userSetPhoneSchoolDegree,
  userSetAvatar,
  userSetType,
  userAddWorkExperience,
  userDeleteWorkExperience,
  userEditWorkExperience,
  userShareProfile,
  userUnshareProfile,
  userUnshareAll,
  userRemoveCourse,
  userIsShared,
  userProfilesSharedTo,
  userProjectSkillGap,
  userAddCourseMultiple,
  userAcceptInvite,
  userRejectInvite,
  userGetInvites,
  userRequestJoin,
  userCancelRequest,
  userGetRequests,
  userShareProfileMulti
} from './user.ts'
import {
  projectAdd,
  projectsOwnedGet,
  projectSetTitle,
  projectSetDescription,
  projectSetTopics,
  projectSetScope,
  projectSetRequiredSkills,
  projectSetOutcomes,
  projectSetGroupSizes,
  projectSetMaxGroupCount,
  projectSetCoverPhoto,
  projectDelete,
  projectGet,
  projectsGetAll,
  projectGetUserJoinableGroups,
  projectGetJoinableGroups
} from './project.ts'
import { courseSummaryVisual, userSummaryVisual } from './summary.ts'
import {
  courseGet,
  coursesGetOwned,
  coursesGetAll,
  courseDelete,
  coursesGetEnrolled,
  academicAddCoursePDF,
  academicAddCourseWeb
} from './courses.ts'
import {
  getGroup,
  groupCreate,
  groupJoin,
  groupLeave,
  groupUpdateDescription,
  groupUpdateSize,
  groupSetCoverPhoto,
  groupJoinProject,
  groupsGetByProject,
  groupsGetAll,
  groupUpdateName,
  groupDelete,
  groupProjectSkillGap,
  groupInvite,
  groupRequestReject,
  groupGetInvites,
  groupGetRequests,
  groupUninvite,
  groupsGetRecruiting
} from './group.ts'
import {
  recommendProjectsToGroup,
  recommendUsersToUser,
  recommendUsersToGroup,
  recommendGroupsToUser,
  recommendProjectsToUser
} from './recommended.ts'
import { UserType } from '@prisma/client'

const app = express()

app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:3001'
  })
)
app.use(cookieParser())
app.use(passport.initialize())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb' }))

app.use('/imgurl', express.static('static'))

const PORT: number = parseInt(process.env.PORT || '3000')
const HOST: string = process.env.IP || '127.0.0.1'

app.post('/auth/register/v2', authRegisterV2)

app.get('/auth/register/verify/:token', authRegisterVerify)

app.post('/auth/passwordreset/request', authPasswordResetRequest)

app.post('/auth/passwordreset/:token', authPasswordReset)

app.post('/auth/login', authLogin)

app.use(passport.authenticate('jwt', { session: false }))

app.post('/auth/logout', authLogout)

app.get('/auth/protected', (req, res) => {
  res.json({ message: 'This is the protected route' })
})

app.get(
  '/auth/admin-only',
  authorizeRole([UserType.ADMIN, UserType.ACADEMIC_ADMIN]),
  (req, res) => {
    res.json({ message: 'This route is admin only' })
  }
)

app.get(
  '/auth/academic-only',
  authorizeRole([UserType.ACADEMIC, UserType.ACADEMIC_ADMIN]),
  (req, res) => {
    res.json({ message: 'This route is academic only' })
  }
)

app.get('/user', authorizeSharedProfile, userProfile)

app.get('/users/shared', authorizeUIdIsAuthUser, userProfilesShared)

app.get('/users/sharedto', authorizeUIdIsAuthUser, userProfilesSharedTo)

app.get('/user/isshared', authorizeUIdIsAuthUser, userIsShared)

app.put('/user/setname', authorizeUIdIsAuthUser, userSetName)

app.put('/user/setemail', authorizeUIdIsAuthUser, userSetEmail)

app.put('/user/setpassword', authorizeUIdIsAuthUser, userSetPassword)

app.put('/user/setphone', authorizeUIdIsAuthUser, userSetPhone)

app.put('/user/setschool', authorizeUIdIsAuthUser, userSetSchool)

app.put('/user/setdegree', authorizeUIdIsAuthUser, userSetDegree)

app.put('/user/setdetails', authorizeUIdIsAuthUser, userSetPhoneSchoolDegree)

app.put(
  '/user/settype',
  authorizeRole([UserType.ADMIN, UserType.ACADEMIC_ADMIN]),
  userSetType
)

app.put('/user/setavatar', authorizeUIdIsAuthUser, userSetAvatar)

app.post('/user/workexperience', authorizeUIdIsAuthUser, userAddWorkExperience)

app.put('/user/workexperience', authorizeUIdIsAuthUser, userEditWorkExperience)

app.put('/user/shareprofile', authorizeUIdIsAuthUser, userShareProfile)

app.put(
  '/user/shareprofile/multi',
  authorizeUIdIsAuthUser,
  userShareProfileMulti
)

app.put('/user/unshareprofile', authorizeUIdIsAuthUser, userUnshareProfile)

app.put('/user/unshareall', authorizeUIdIsAuthUser, userUnshareAll)

app.delete(
  '/user/workexperience',
  authorizeUIdIsAuthUser,
  userDeleteWorkExperience
)

app.get(
  '/users/all',
  authorizeRole([UserType.ADMIN, UserType.ACADEMIC_ADMIN]),
  userProfiles
)

app.get('/users/all/public', userProfilesPublic)

app.get('/users/all/visible', userProfilesVisible)

app.get('/user/ispublic', authorizeUIdIsAuthUser, userIsPublic)

app.put('/user/togglevisibility', authorizeUIdIsAuthUser, userToggleVisibility)

app.delete('/user', authorizeUIdIsAuthUser, userDelete)

app.post('/user/addcourse', authorizeUIdIsAuthUser, userAddCourse)

app.post(
  '/user/addcourse/multiple',
  authorizeUIdIsAuthUser,
  userAddCourseMultiple
)

app.post('/user/removecourse', authorizeUIdIsAuthUser, userRemoveCourse)

app.post('/user/uploadtranscript', authorizeUIdIsAuthUser, userUploadTranscript)

app.get('/user/summary/visual', userSummaryVisual)

app.post(
  '/academic/addcourse/web',
  authorizeRole([UserType.ACADEMIC, UserType.ACADEMIC_ADMIN]),
  academicAddCourseWeb
)

app.post(
  '/academic/addcourse/pdf',
  authorizeRole([UserType.ACADEMIC, UserType.ACADEMIC_ADMIN]),
  academicAddCoursePDF
)

app.get('/course/summary/visual', courseSummaryVisual)

app.get('/course', courseGet)

app.get('/courses/owned', authorizeAcademicUIdIsAuthUser, coursesGetOwned)

app.get('/courses/enrolled', authorizeUIdIsAuthUser, coursesGetEnrolled)

app.get('/courses/all', coursesGetAll)

app.delete('/course', authorizeCourseOwner, courseDelete)

app.post(
  '/project/add',
  authorizeRole([UserType.ACADEMIC, UserType.ACADEMIC_ADMIN]),
  projectAdd
)

app.get('/projects/owned', authorizeAcademicUIdIsAuthUser, projectsOwnedGet)

app.get('/projects/all', projectsGetAll)

app.get('/project', projectGet)

app.put('/project/settitle', authorizeProjectOwner, projectSetTitle)

app.put('/project/setdescription', authorizeProjectOwner, projectSetDescription)

app.put('/project/settopics', authorizeProjectOwner, projectSetTopics)

app.put('/project/setscope', authorizeProjectOwner, projectSetScope)

app.put('/project/setcoverphoto', authorizeProjectOwner, projectSetCoverPhoto)

app.put(
  '/project/setrequiredskills',
  authorizeProjectOwner,
  projectSetRequiredSkills
)

app.put('/project/setoutcomes', authorizeProjectOwner, projectSetOutcomes)

app.put('/project/setgroupsizes', authorizeProjectOwner, projectSetGroupSizes)

app.put(
  '/project/setmaxgroupcount',
  authorizeProjectOwner,
  projectSetMaxGroupCount
)

app.delete('/project', authorizeProjectOwner, projectDelete)

app.post('/group/create', groupCreate)

app.get('/group', getGroup)

app.get('/groups/all', groupsGetAll)

app.get('/groups/byproject', groupsGetByProject)

app.get('/groups/recruiting', groupsGetRecruiting)

app.post('/group/join', authorizeUIdIsAuthUser, groupJoin)

app.post('/group/leave', authorizeUIdIsAuthUser, groupLeave)

app.put('/group/updatename', authorizeGroupMember, groupUpdateName)

app.put(
  '/group/updatedescription',
  authorizeGroupMember,
  groupUpdateDescription
)

app.put('/group/updatesize', authorizeGroupMember, groupUpdateSize)

app.put('/group/setcoverphoto', authorizeGroupMember, groupSetCoverPhoto)

app.post('/group/joinproject', authorizeGroupMember, groupJoinProject)

app.delete('/group', authorizeGroupMember, groupDelete)

app.get('/user/recommendedusers', authorizeUIdIsAuthUser, recommendUsersToUser)

app.get(
  '/group/recommendedprojects',
  authorizeGroupMember,
  recommendProjectsToGroup
)

app.get('/group/recommendedusers', authorizeGroupMember, recommendUsersToGroup)

app.get(
  '/user/recommendedgroups',
  authorizeUIdIsAuthUser,
  recommendGroupsToUser
)

app.get(
  '/user/recommendedprojects',
  authorizeUIdIsAuthUser,
  recommendProjectsToUser
)

app.get('/user/project/skillgap', authorizeUIdIsAuthUser, userProjectSkillGap)

app.get('/group/project/skillgap', authorizeGroupMember, groupProjectSkillGap)

app.post('/group/invite', authorizeGroupMember, groupInvite)

app.delete('/group/uninvite', authorizeGroupMember, groupUninvite)

app.delete('/group/request/reject', authorizeGroupMember, groupRequestReject)

app.get('/group/invites', authorizeGroupMember, groupGetInvites)

app.get('/group/requests', authorizeGroupMember, groupGetRequests)

app.post('/user/invite/accept', authorizeUIdIsAuthUser, userAcceptInvite)

app.delete('/user/invite/reject', authorizeUIdIsAuthUser, userRejectInvite)

app.post('/user/request', authorizeUIdIsAuthUser, userRequestJoin)

app.delete('/user/unrequest', authorizeUIdIsAuthUser, userCancelRequest)

app.get('/user/invites', authorizeUIdIsAuthUser, userGetInvites)

app.get('/user/requests', authorizeUIdIsAuthUser, userGetRequests)

app.get(
  '/project/userjoinablegroups',
  authorizeUIdIsAuthUser,
  projectGetUserJoinableGroups
)

app.get(
  '/project/joinablegroups',
  authorizeProjectOwner,
  projectGetJoinableGroups
)

app.use(errorHandler)

if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, HOST, () => {
    console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`)
  })
  process.on('SIGINT', () => {
    server.close(() => console.log('Shutting down server gracefully.'))
  })
}

export { app }
