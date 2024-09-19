const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authorize');
const auth = require('../controllers/auth');
const product = require('../controllers/product');
const features = require('../controllers/features');
const user = require('../controllers/user');
const dashboard = require('../controllers/globalDashboard');
const internalUserDashboard = require('../controllers/internalUserDashboard');
const ticket = require('../controllers/ticket');
const accountManager = require('../controllers/accountManager');
const company = require('../controllers/company');
const service = require('../controllers/service');
const serverDetail = require('../controllers/serverDetail');
const codec = require('../controllers/codec');
const gateway = require('../controllers/gateway');
const extension = require('../controllers/extension');
const common = require('../controllers/common');
const contactList = require('../controllers/contactList');
const contactGroup = require('../controllers/contactGroup');
const blackList = require('../controllers/blackList');
const voicemail = require('../controllers/voicemail');
const callforward = require('../controllers/callforward');
const speeddial = require('../controllers/speeddial');
const emailCategory = require('../controllers/emailCategory');
const did = require('../controllers/did');
const provider = require('../controllers/provider');
const billing = require('../controllers/billing');
const supportDashboard = require('../controllers/supportDashboard');
const prompt = require('../controllers/prompt');
const conference = require('../controllers/conference');
const callgroup = require('../controllers/callgroup');
const callqueue = require('../controllers/callqueue');
const assignRights = require('../controllers/assignRights')
const featureCode = require('../controllers/featureCode');
const globalrate = require('../controllers/globalrate');
const gatewayGroup = require('../controllers/gatewayGroup');
const holiday = require('../controllers/holiday');
const timeGroup = require('../controllers/timeGroup');
const callPlan = require('../controllers/callplan');
const callPlanRate = require('../controllers/callplanrate');
const recording = require('../controllers/recording');
const ivr = require('../controllers/ivr');
const cdr = require('../controllers/cdr');
const ccavenue = require('../controllers/ccavenue');
const invoice = require('../controllers/invoice');
const paytm = require('../controllers/paytm');
const addBalance = require('../controllers/addBalance');
const circle = require('../controllers/circle');
const supportgroup = require('../controllers/supportGroup');
const FeatureRatePlan = require('../controllers/FeatureRatePlan');
const SMS = require('../controllers/sms');
const teleConsultation = require('../controllers/tele-consultation');
const activityLog = require('../controllers/activityLog');
const softPhone = require('../controllers/softphone');
const broadcast = require('../controllers/broadcast');
const softphone_authorize = require('../middleware/softphone_authorize');
const appointment = require('../controllers/appointment');
const permission = require('../controllers/permission');
const backendAPIintegration = require('../controllers/backendIntegrationAPI');
const callRateGroup = require('../controllers/callRateGroup');
const bundlePlan = require('../controllers/bundlePlan');
const report = require('../controllers/report');
const accessRestriction = require('../controllers/accessRestriction');
const viewAccessRestriction = require('../controllers/viewAccessRestriction');
const imGroup = require('../controllers/imGroup');
const plugin = require('../controllers/plugin');
const reseller = require('../controllers/reseller')
const trunk = require('../controllers/trunk')
const audit = require('../controllers/auditLog')
const outboundconf = require('../controllers/outboundconf');
const obd = require('../controllers/obd');
const whatsapp = require('../controllers/whatsapp');
const CustomerDialoutRule = require('../controllers/customerdialoutrule')
const thirdPartyIntegration = require('../controllers/thirdPartyIntegration');
const voicebot = require('../controllers/voicebot')
const validateRequest = require('../middleware/validateRequest');
const EmailSchema = require('../validateRequestSchema/verifyEmailSchema');
const UsernameSchema = require('../validateRequestSchema/verifyUsernameSchema');
const userListingSchema = require('../validateRequestSchema/userSchema');
const supporGroupSchema = require('../validateRequestSchema/supportGroupSchema');
const callPlanSchema = require('../validateRequestSchema/callPlanSchema');
const callPlanRateSchema = require('../validateRequestSchema/callPlanRateSchema')
const bundlePlanSchema = require('../validateRequestSchema/bundlePlanSchema');
const providerSchema = require('../validateRequestSchema/providerSchema');
const circleSchema = require('../validateRequestSchema/circleSchema');
const serverSchema = require('../validateRequestSchema/serverSchema');
const didSchema = require('../validateRequestSchema/didSchema');
const ticketSchema = require('../validateRequestSchema/ticketSchema');
const balanceSchema = require('../validateRequestSchema/BalanceSchema');
const billingSchema = require('../validateRequestSchema/billingSchema');
const cdrSchema = require('../validateRequestSchema/cdrSchema');
const invoiceSchema = require('../validateRequestSchema/invoiceSchema');
const emailCategorySchema = require('../validateRequestSchema/emailCategorySchema');
const extensionDashboard = require('../controllers/extensionDashboard');
const emailTemplate = require('../controllers/emailTemplate');
const holidaySchema = require('../validateRequestSchema/holidaySchema')
const timegroupSchema = require('../validateRequestSchema/timegroupSchema')
const ContactSchema = require('../validateRequestSchema/ContactSchema')
const trunkSchema = require('../validateRequestSchema/trunkSchema');
const voicebotSchema = require('../validateRequestSchema/voicebotSchema');
const auditLogSchema = require('../validateRequestSchema/auditLogSchema');
const reportModuleSchema = require('../validateRequestSchema/reportModuleSchema');
const featureSchema = require('../validateRequestSchema/featureSchema');
const imSchema = require('../validateRequestSchema/imSchema');
const extensionSchema = require('../validateRequestSchema/extensionSchema');
const callForwardSchema = require('../validateRequestSchema/callForwardSchema');
const intercomSchema = require('../validateRequestSchema/intercomSchema');
const callGroupSchema = require('../validateRequestSchema/callGroupSchema');
const configSchema = require('../validateRequestSchema/configSchema');

const accessRestrictionSchema = require('../validateRequestSchema/accessRestrictionSchema');
const resellerSchema = require('../validateRequestSchema/resellerSchema');
const premissionSchema = require('../validateRequestSchema/PermissonSchema');
const smsSchema = require('../validateRequestSchema/smsSchema');
const activityLogSchema = require('../validateRequestSchema/activityLogSchema')
const speedDialSchema = require('../validateRequestSchema/speedDialSchema');
const packageSchema = require('../validateRequestSchema/packageSchema');
const recordingSchema = require('../validateRequestSchema/recordingSchema');
const voiceMailSchema = require('../validateRequestSchema/voiceMailSchema');
const authSchema = require('../validateRequestSchema/authSchema');
const productSchema = require('../validateRequestSchema/productSchema');
const callQueueSchema = require('../validateRequestSchema/callQueueSchema');
const BlackListSchema = require('../validateRequestSchema/BlackListSchema');

const whiteListIpSchema = require('../validateRequestSchema/whiteListIpSchema');
const appointmentSchema = require('../validateRequestSchema/appointmentSchema');
const conferenceSchema = require('../validateRequestSchema/conferenceSchema');
const TCSchema = require('../validateRequestSchema/TCSchema');
const pluginSchema = require('../validateRequestSchema/pluginSchema');
const customerDialoutSchema = require('../validateRequestSchema/customerDialoutRuleSchema');
const broadcastSchema = require('../validateRequestSchema/broadcastSchema');
const promptSchema = require('../validateRequestSchema/promptSchema');
const dynamicIvr = require('../controllers/dynamicIvr')

router.get('/company/getCompanyInfo', authorize, company.getCompanyInfo);

//get product
router.get('/product', authorize, product.getproduct);
router.get('/product/getProductCustomer', authorize, product.getProductCustomer); //customer wise product
router.post('/product/verifyPackageName', authorize, product.verifyPackageName);
router.get('/product/getproduct', authorize, product.getproduct);

//config/get circle
router.post('/config/circleList', validateRequest.validateBodyRequest(circleSchema.getCircleSchema), authorize, circle.getcircleList);
router.post('/config/addCircle', authorize, circle.addCircle);
router.get('/config/getCircleById', authorize, circle.getCircleById);
router.post('/config/updateCircle', authorize, circle.updateCircle);
router.post('/config/deleteCircle', authorize, circle.deleteCircle);
router.get('/config/getCircle', authorize, circle.getAllCircle);
router.get('/config/getAllContactFromCircle', authorize, circle.getAllContactFromCircle);
router.post('/config/createWhiteIp', validateRequest.validateBodyRequest(circleSchema.createWhiteListIpSchema), authorize, circle.createWhiteListIP);
router.post('/config/getWhiteIp', validateRequest.validateBodyRequest(circleSchema.viewWhiteListIpSchema), authorize, circle.viewWhiteListIPDetails);
router.delete('/config/deleteWhiteIP', validateRequest.validateBodyRequest(configSchema.deleteWhiteIP), authorize, circle.deleteWhiteListIP);
router.post('/config/getblockedIP', validateRequest.validateBodyRequest(whiteListIpSchema.getblockedIP), authorize, circle.getblockedIP)
router.post('/config/addSmtp', validateRequest.validateBodyRequest(circleSchema.addSmtpSchema), authorize, circle.addSmtp);
router.post('/config/updateSmtp', validateRequest.validateBodyRequest(circleSchema.addSmtpSchema), authorize, circle.updateSmtp);
router.get('/config/getSmtpList', authorize, circle.getSmtpList);
router.post('/config/getSmtpListByFilter', validateRequest.validateBodyRequest(circleSchema.smtpListByFilters), authorize, circle.getSmtpListByFilter);
router.delete('/config/deleteSmtp', authorize, circle.deleteSmtp);
router.get('/config/getSmtpByList', authorize, circle.getSmtpByList);


//dialout rules & group
router.post('/config/dialoutGroupList', validateRequest.validateBodyRequest(circleSchema.getDialoutGroupSchema), authorize, circle.getDialoutGroup);
router.post('/config/addDialoutGroup', validateRequest.validateBodyRequest(circleSchema.addDialoutGroupSchema), authorize, circle.createDialOutGroup);
router.post('/config/deleteDialOutGroup', authorize, circle.deleteDialOutGroup);
router.post('/config/addDialoutRules', validateRequest.validateBodyRequest(circleSchema.createDialoutRuleSchema), authorize, circle.createDialOutRules);
router.post('/config/dialoutRuleList', validateRequest.validateBodyRequest(circleSchema.getDialoutRuleSchema), authorize, circle.getDialoutRule);
router.get('/config/getAllContactFromDialoutGroup', authorize, circle.getAllContactFromDialOutGroup);
router.post('/config/deleteDialOutRule', authorize, circle.deleteDialOutRule);
router.get('/config/getAssociatedUser', authorize, circle.getAssociatedUser);  //akshay




//supportUser/supportGroup
router.post('/support-user/getsupportList', authorize, supportgroup.getsupportList);
router.post('/support-user/addsupportGroup', validateRequest.validateBodyRequest(supporGroupSchema.addSupportGroupSchema), authorize, supportgroup.addsupportGroup);
router.get('/support-user/getsupportGroupById', authorize, supportgroup.getsupportGroupById);
router.post('/support-user/updatesupportGroup', validateRequest.validateBodyRequest(supporGroupSchema.updateSupportGroupSchema), authorize, supportgroup.updatesupportGroup);
router.post('/support-user/deletesupportGroup', validateRequest.validateBodyRequest(supporGroupSchema.deleteSupportGroupSchema), authorize, supportgroup.deletesupportGroup);
router.get('/support-user/getallsupportGroup', authorize, supportgroup.getAllsupportGroup);
router.post('/support-user/createSupportUser', authorize, supportgroup.assignSupportGroup);
router.get('/support-user/getUserFromGroup', authorize, supportgroup.getUserFromGroup);
router.post('/support-user/updateContactGroupWithUser', authorize, supportgroup.updateSupportGroupWithUsers);


//Assign user
router.post('/support-user/assigngroup/getassigntList', authorize, supportgroup.getGroupAssignUser);
router.post('/support-user/assigngroup/addassigngroup', validateRequest.validateBodyRequest(supporGroupSchema.addAssignGroupSchema), authorize, supportgroup.addassigngroup);
router.post('/support-user/assigngroup/updateassignGroup', authorize, supportgroup.updateassignGroup);
router.post('/support-user/assigngroup/deleteassignGroup', authorize, supportgroup.deleteassignGroup);
router.get('/support-user/getAllContactFromGroup', authorize, supportgroup.getAllUserFromGroup);

//show dashboard data
router.get('/dashboard/getStatusProductwiseDashboard', authorize, dashboard.getStatusProductwiseDashboard);
// router.get('/dashboard/getResellerStatus', authorize, dashboard.getResellerStatus);
router.get('/dashboard/ActiveExtensions', authorize, dashboard.ActiveExtensions);
router.get('/dashboard/inactiveExtensions', authorize, dashboard.inactiveExtensions);
// router.get('/dashboard/totalExtension',authorize,dashboard.totalExtension);
router.get('/dashboard/getMonthlyRevenue', authorize, dashboard.getMonthlyRevenue);
router.get('/dashboard/getTotalMonthlyCalls', authorize, dashboard.getTotalMonthlyCalls);
router.get('/dashboard/getTotalMonthlyIncomingCalls', authorize, dashboard.getTotalMonthlyIncomingCalls);
router.get('/dashboard/getTotalMonthlyOutgoingCalls', authorize, dashboard.getTotalMonthlyOutgoingCalls);
router.get('/dashboard/getTotalMonthlyCallDuration', authorize, dashboard.getTotalMonthlyCallDuration);
router.get('/dashboard/getAnsweredCalls', authorize, dashboard.getAnsweredCalls);
router.get('/dashboard/getFailedCalls', authorize, dashboard.getFailedCalls);
router.get('/dashboard/getForwardCalls', authorize, dashboard.getForwaredCalls);
router.get('/dashboard/getNotAnsweredCalls', authorize, dashboard.getNotAnsweredCalls);
router.get('/dashboard/getBusyCalls', authorize, dashboard.getBusyCalls);
router.get('/dashboard/getRejectedCalls', authorize, dashboard.getRejectedCalls);
router.get('/dashboard/getMinuteConsumedAnsweredCalls', authorize, dashboard.getMinuteConsumedAnsweredCalls);
router.get('/dashboard/getMinuteConsumeFailedCalls', authorize, dashboard.getMinuteConsumeFailedCalls);
router.get('/dashboard/getMinuteConsumeNotAnsweredCalls', authorize, dashboard.getMinuteConsumeNotAnsweredCalls);
router.get('/dashboard/getDiskSpaceUsage', authorize, dashboard.getDiskSpaceUsage);
router.get('/dashboard/getCallsPerTenant', authorize, dashboard.getCallsPerTenant);
router.get('/dashboard/getCallsPerHours', authorize, dashboard.getCallsPerHours);
router.get('/dashboard/getTotalCallsPerTenant', authorize, dashboard.getTotalCallsPerTenant);
router.get('/dashboard/getTotalCallsPerHours', authorize, dashboard.getTotalCallsPerHours);
router.get('/dashboard/getTotalRevenue', authorize, dashboard.getTotalRevenue);
router.get('/dashboard/getTotalActiveResellerExtension', authorize, dashboard.getTotalActiveResellerExtension);
router.get('/dashboard/getTotalActiveExtension', authorize, dashboard.getTotalActiveExtension);
router.get('/dashboard/getPbxTotalIvrByCustomer', authorize, dashboard.getPbxTotalIvrByCustomer);
router.get('/dashboard/getActiveExtension', authorize, dashboard.getActiveExtension);
router.get('/dashboard/getActiveResellerExtension', authorize, dashboard.getActiveResellerExtension);
router.get('/dashboard/getDateWiseMinuteConsumedAnsweredCalls', authorize, dashboard.getDateWiseMinuteConsumedAnsweredCalls);
router.get('/dashboard/getDateWiseMinuteConsumeFailedCalls', authorize, dashboard.getDateWiseMinuteConsumeFailedCalls);
router.get('/dashboard/getDateWiseMinuteConsumeNotAnsweredCalls', authorize, dashboard.getDateWiseMinuteConsumeNotAnsweredCalls);
router.post('/internalUserDashboard/getDidIdForAccountManager', authorize, internalUserDashboard.getDidIdForAccountManager);
router.get('/internalUserDashboard/getCustomer', authorize, internalUserDashboard.getCustomer);
router.post('/supportDashboard/getProductWiseCustomer', authorize, supportDashboard.getProductWiseCustomer);
router.post('/supportDashboard/getProductWiseDid', authorize, supportDashboard.getProductWiseDid);
router.get('/dashboard/getAsrCallsPerHours', authorize, dashboard.getAsrCallsPerHours);
router.get('/dashboard/getTotalAsrCallsPerHours', authorize, dashboard.getTotalAsrCallsPerHours);
router.get('/dashboard/getAcdCallsPerHours', authorize, dashboard.getAcdCallsPerHours);
router.get('/dashboard/getTotalAcdCallsPerHours', authorize, dashboard.getTotalAcdCallsPerHours);
router.get('/dashboard/getCustomerInvoiceDetails', authorize, dashboard.getCustomerInvoiceDetail);
router.get('/dashboard/getregisExtension', authorize, dashboard.getRegisExtension);



//product and feature get
router.get('/productPbxPackage', authorize, product.getPbxPackage);
router.get('/productPbxPackageForCustomerCreation', authorize, product.getPbxPackageForCustomerCreation);
router.get('/productOcPackage', authorize, product.getOcPackage);
router.post('/getPackageExtensionCount', authorize, product.getPackageExtensionCount);
router.get('/accountManager', authorize, accountManager.getAccountManager);
router.get('/accountManagerProductPbxPackage', authorize, product.getPbxPackageForAccountManagerCustomers);
router.get('/accountManagerProductOCPackage', authorize, product.getOCPackageForAccountManagerCustomers);
router.get('/package/getCirclePackage', authorize, product.getCircleBasedPackages);

//post request
router.post('/features/createPbxFeature', validateRequest.validateBodyRequest(featureSchema.createPackage), authorize, features.postPbxFeature);
router.post('/features/customCreatePbxFeature', authorize, features.customPostPbxFeature);
router.post('/features/createOcFeature', authorize, features.postOcFeature);
router.post('/features/customCreateOcFeature', authorize, features.customPostOcFeature);
router.post('/features/updatePbxFeature', validateRequest.validateBodyRequest(featureSchema.updatePackage), authorize, features.updatePbxFeature);
router.post('/features/customUpdatePbxFeature', authorize, features.customUpdatePbxFeature);
router.post('/features/customUpdateOcFeature', authorize, features.customUpdateOcFeature);
router.post('/features/updateOcFeature', authorize, features.updateOcFeature);
router.post('/features/getPbxFeatures', validateRequest.validateBodyRequest(featureSchema.getPbxFeatures), authorize, features.getPbxFeatures);
router.get('/features/getProductFeatures', authorize, features.getProductFeatures);
router.get('/features/getCustomerProductFeatures', authorize, features.getCustomerProductFeatures);
router.post('/features/getBlacklistFeatures', validateRequest.validateBodyRequest(featureSchema.blackListFeatures), authorize, features.getBlacklistFeatures);
router.get('/features/getExtensionFeatures', authorize, features.getExtensionFeaturesBasedOnCustomer);

// user/customer
router.post('/user/createUser', validateRequest.validateBodyRequest(userListingSchema.createUser), authorize, user.createUser);
router.get('/user/getAllUsers', authorize, user.getAllUser);
router.get('/user/paidStatusCustomerInvoice', authorize, user.paidStatusCustomerInvoice);
router.get('/user/getCustomers', authorize, user.getCustomers);
router.post('/user/verifyUsername', validateRequest.validateBodyRequest(UsernameSchema), authorize, user.verifyUsername);
router.post('/user/verifyEmail', validateRequest.validateBodyRequest(EmailSchema), authorize, user.verifyEmail);
router.post('/user/verifynotificationEmail', authorize, user.verifynotificationEmail);
router.post('/user/verifyCompany', authorize, user.verifyCompany);
router.post('/user/getAllUserStatusWise', authorize, user.getAllUserStatusWise);
router.post('/user/getUserInfo', validateRequest.validateBodyRequest(userListingSchema.getUserInfo), authorize, user.getUserInfo);
router.post('/user/custDashInfo', authorize, user.custDashInfo);
router.get('/user/getPackageProductWise', authorize, user.getPackageProductWise);
// router.put('/user/updateUser', authorize, user.updateUser);
router.put('/user/updateUserProfile', authorize, user.updateUserProfile);
router.patch('/user/UpdateProfile', authorize, user.UpdateProfile);
router.get('/user/getInternalUser', authorize, user.getInternalUser);

router.put('/user/deleteCustomer', authorize, user.deleteUser);
router.put('/user/inactiveCustomer', validateRequest.validateBodyRequest(userListingSchema.inactiveCustomer), authorize, user.inactiveUser);
router.put('/user/activeCustomer', validateRequest.validateBodyRequest(userListingSchema.activeCustomer), authorize, user.activeUser);
router.get('/user/getCustomerById', authorize, user.getCustomerById);
router.get('/user/getAdminCredentials', authorize, user.getAdminCredentials);
router.get('/user/getTopDialOut', authorize, user.getTopDialOut);
router.get('/user/getInternalUserById', authorize, user.getInternalUserById);
router.get('/user/getCustomerBillingTypePackage', authorize, user.getCustomerBillingTypePackage);
router.get('/user/getCustomerBillingTypeAndWithOutBundlePackage', authorize, user.getCustomerBillingTypeAndWithOutBundlePackage);

// router.post('/user/updateInternalUser', authorize, user.updateInternalUser);
router.post('/user/getUsersByFilters', validateRequest.validateBodyRequest(userListingSchema.getUsersByFilters), authorize, user.getUsersByFilters);
router.post('/user/getInternalUsersByFilters', validateRequest.validateBodyRequest(userListingSchema.getInternalUsersByFilters), authorize, user.getInternalUsersByFilters);
router.post('/user/getUsersForAccountManagerByFilters', authorize, user.getUsersForAccountManagerByFilters);
router.post('/user/getUsersForResellerByFilters', authorize, user.getUsersForResellerByFilters);
router.get('/user/getAllUserForAccountManager', authorize, user.getAllUserForAccountManager);
router.post('/user/getUsersForSupportByFilters', authorize, user.getUsersForSupportByFilters);
router.get('/user/getAllUserForSupport', authorize, user.getAllUserForSupport);
router.get('/user/getAllReseller', authorize, user.getAllReseller);
router.get('/user/getAllResellerData', authorize, user.getAllResellerData);
router.get('/user/getAllSupportUser', authorize, user.getAllSupportUser);
router.get('/user/getCustomercompany', authorize, user.getCustomercompany);
router.get('/user/getCustomercompanyReseller', authorize, user.getCustomercompanyReseller);
router.get('/user/getAccountManagerCustomercompany', authorize, user.getAccountManagerCustomercompany);
router.get('/user/getAllCustomerCompany', authorize, user.getAllCustomerCompany);
router.post('/user/getAllUserStatusWiseFilters', authorize, user.getAllUserStatusWiseFilters);
router.get('/user/getAccountManagerProductCustomercompany', authorize, user.getAccountManagerProductCustomercompany);
router.get('/user/getCompany', authorize, user.getCompany);
router.get('/user/getAssignedUser', authorize, user.getAssignedUser);
router.get('/user/getUserByType', authorize, user.getUserByType);
router.get('/user/viewCustomDashboard', authorize, user.viewCustomDashboard);
router.get('/user/isSuppotContactAssociateGroup', authorize, user.checkContactAssociateOrNot)
router.get('/user/getMinutePlanUser', authorize, user.getUserHasMinutePlan)
router.post('/user/sendmail', authorize, user.sendUserEmail);




//package
router.get('/getPackage', authorize, product.getPackage);
router.get('/getPackageById', authorize, product.getPackageById);//by get req
router.post('/getPackageByFilters', validateRequest.validateBodyRequest(productSchema.filterPackage), authorize, product.getPackageByFilters);
router.post('/getCustomerPackage', validateRequest.validateBodyRequest(packageSchema.getCustomerPackage), authorize, product.getUserPackage);
router.post('/getPackageCustomers', validateRequest.validateBodyRequest(packageSchema.getPackageCustomers), authorize, product.getPackageCustomers);
router.post('/deletePackage', validateRequest.validateBodyRequest(packageSchema.deletePackage), authorize, product.deletePackage);
router.get('/featureUsersCount', authorize, product.featureUsersCount);
router.get('/getGatewayGroup', authorize, product.getGatewayGroup);
router.get('/getCallPlan', authorize, product.getCallPlan);
router.post('/getCircleCallPlan', authorize, product.getCircleCallPlan);
router.get('/getCallPlanList', authorize, product.getCallPlanList);
router.get('/getTCcallPlanList', authorize, product.getTCCallPlanList);
router.post('/deleteAssociateBoosterFromMinutePlan', authorize, product.deleteBoosterDuringChangeMinutePlan);
router.get('/getNewRates', authorize, product.getNewRates);
router.post('/assignNewRates', authorize, product.assignNewRates);
router.post('/checkCallRates', authorize, product.checkCallRates);


//ticket
//put request
router.post('/ticket/ticketHistory', authorize, ticket.ticketHistory);
router.post('/ticket/getTicketHistory', validateRequest.validateBodyRequest(ticketSchema.ticketHistorySchema), authorize, ticket.getTicketHistory);
router.post('/ticket/getTicketByFilters', validateRequest.validateBodyRequest(ticketSchema.filterTicketSchema), authorize, ticket.getTicketByFilters);
router.post('/ticket/getCustomerTicketByFilters', authorize, ticket.getCustomerTicketByFilters);
router.post('/ticket/createTicket', validateRequest.validateBodyRequest(ticketSchema.createTicketSchema), authorize, ticket.createTicket);
router.post('/ticket/viewTicketId', authorize, ticket.viewTicketId);
router.post('/ticket/viewTicketCustomerWise', authorize, ticket.viewTicketCustomerWise);
router.post('/ticket/viewTicketProductandCustomerwise', validateRequest.validateBodyRequest(ticketSchema.viewTicketProductandCustomerwise), authorize, ticket.viewTicketProductandCustomerwise);
router.post('/ticket/viewTicket', authorize, ticket.viewTicket);
router.get('/ticket/viewTicketFORPBX', authorize, ticket.viewTicketFORPBX);
router.get('/ticket/viewResellerTicketPBX', authorize, ticket.viewResellerTicketPBX);
router.get('/ticket/viewTicketFORPBXForSupport', authorize, ticket.viewTicketFORPBXForSupport);
router.get('/ticket/viewTicketFOROC', authorize, ticket.viewTicketFOROC);
router.post('/ticket/viewAccountManagerTicket', authorize, ticket.viewAccountManagerTicket);
router.post('/ticket/getAccountManagerTicketByFilters', authorize, ticket.getAccountManagerTicketByFilters);
router.post('/ticket/getCustomerWithProductTicketByFilters', validateRequest.validateBodyRequest(ticketSchema.filterCustomerWithProductTicket), authorize, ticket.getCustomerWithProductTicketByFilters);
router.post('/ticket/getSupportTicketByFilters', authorize, ticket.getSupportTicketByFilters);
router.put('/ticket/updateTicketNewStatus', authorize, ticket.updateTicketNewStatus);
router.post('/ticket/ticketList', validateRequest.validateBodyRequest(ticketSchema.filterTicketTypeList), authorize, ticket.getticketList);
router.post('/ticket/addTicket', validateRequest.validateBodyRequest(ticketSchema.addTicketTypeSchema), authorize, ticket.addticket);
router.post('/ticket/updateTicket', validateRequest.validateBodyRequest(ticketSchema.updateTicketTypeSchema), authorize, ticket.updateTicket);

//get service
router.get('/service/getServices', authorize, service.getServices);


//get and post server detail
router.post('/serverDetail/createServer', validateRequest.validateBodyRequest(serverSchema.createServerSchema), authorize, serverDetail.createServer);
router.post('/serverDetail/viewServerDetails', authorize, serverDetail.viewServerDetails);
router.post('/serverDetail/deleteServerDetail', authorize, serverDetail.deleteServerDetail);
router.put('/serverDetail/updateServerStatus', validateRequest.validateBodyRequest(serverSchema.updateServerStatusSchema), authorize, serverDetail.updateServerStatus);
router.post('/serverDetail/getServerByFilters', validateRequest.validateBodyRequest(serverSchema.filterServerDetailSchema), authorize, serverDetail.getServerByFilters);
router.post('/serverDetail/verifyPort', authorize, serverDetail.verifyPort);
//get codec info
router.get('/codec/getCodecInfo', authorize, codec.getCodecInfo);

//get gateway info
router.post('/gateway/createGateway', authorize, gateway.createGateway);
router.post('/gateway/viewGateway', authorize, gateway.viewGateway);
router.get('/gateway/viewGatewayById', authorize, gateway.viewGatewayById);
router.put('/gateway/updateGateway', authorize, gateway.updateGateway);
router.post('/gateway/deleteGateway', authorize, gateway.deleteGateway);
router.put('/gateway/updateGatewayStatus', authorize, gateway.updateGatewayStatus);
router.post('/gateway/getGatewayByFilters', authorize, gateway.filterGateway);
router.get('/gateway/gatewayProvider', authorize, gateway.gatewayProvider);
router.post('/gateway/updateGatewayManipulation', authorize, gateway.updateGatewayManipulation);
router.get('/gateway/viewGatewayialog', authorize, gateway.viewGatewayialog);
router.post('/gateway/getdata', authorize, gateway.getdata);
router.get('/gateway/getSofiaProfileName', authorize, gateway.getSofiaProfileName);







//extension
router.get('/extension/getRoaming', authorize, extension.getRoaming);
router.get('/extension/getExtensionByExtId', authorize, extension.getExtensionByExtId);//
router.post('/extension/createExtension', authorize, extension.createExtension);
router.get('/extension/getAllExtension', authorize, extension.getAllExtension);
router.get('/extension/getAllIntercomExtension', authorize, extension.getAllIntercomExtension);
router.get('/extension/getAllExtensionsForCustomer', authorize, extension.getAllExtensionsForCustomer);
router.get('/extension/getAllExtensionNumber', authorize, extension.getAllExtensionNumber);
router.get('/extension/getAllExtensionWithPlugin', authorize, extension.getAllExtensionWithPlugin);
router.get('/extension/getPluginExtByCustomerId', authorize, extension.getPluginExtByCustomerId);
router.post('/extension/verifyExtension', authorize, extension.verifyExtension);
router.post('/extension/verifyExtensionn', authorize, extension.verifyExtensionn);
router.get('/extension/getExtensionLimit', authorize, extension.getExtensionLimit);
router.get('/extension/getTotalExtension', authorize, extension.getTotalExtension);
router.get('/extension/getMonthlyTotalExtension', authorize, extension.getMonthlyTotalExtension);
router.delete('/extension/deleteExtension', authorize, extension.deleteExtension);
router.get('/extension/getExtensionById', authorize, extension.getExtensionById);
router.get('/extension/onlyOutboundStatus', authorize, extension.onlyOutboundStatus);
router.post('/extension/updateExtension', authorize, extension.updateExtension);
router.patch('/extension/UpdateProfile', authorize, extension.UpdateProfile);
router.post('/extension/getExtensionByFilters', validateRequest.validateBodyRequest(extensionSchema.filterExtension), authorize, extension.getExtensionByFilters);
router.post('/extension/getExtensionSetting', validateRequest.validateBodyRequest(extensionSchema.getExtensionSetting), authorize, extension.getExtensionSetting);
router.put('/extension/updateExtensionSettings', validateRequest.validateBodyRequest(extensionSchema.updateExtensionSettings), authorize, extension.updateExtensionSettings);
router.put('/extension/updateExtension_fmfm_Settings', authorize, extension.updateExtension_FMFM_Settings);
router.post('/extension/getExtension_FMFM_Setting', validateRequest.validateBodyRequest(extensionSchema.extensionFMFMSetting), authorize, extension.getExtension_FMFM_Setting);

router.get('/extension/getExtensionNameandNumber', authorize, extension.getExtensionNameandNumber);
router.put('/extension/updateExtensionPassword', authorize, extension.updateExtensionPassword);
router.post('/extension/verifyEmail', authorize, extension.verifyEmail);
router.post('/extension/getExtensionForSupport', validateRequest.validateBodyRequest(extensionSchema.getExtensionForSupport), authorize, extension.getExtensionForSupport);
router.post('/extension/verifyExtUsername', authorize, extension.verifyExtUsername);
router.post('/extension/updatePackageMinuteBal', authorize, extension.updatePackageMinuteBal);
router.post('/extension/manageExtMinute', authorize, extension.updateExtensionMinute);
router.post('/extension/deductCustomeExtMinute', authorize, extension.deductCustomExtensionMinute);
router.post('/extension/deductAllExtMinute', authorize, extension.deductAllExtensionMinute);
router.get('/extensionCount', authorize, extension.getExtensionCount);
router.get('/extension/getDestinationDID', authorize, extension.getDestinationDID);
router.post('/extension/bulkextension', authorize, extension.bulkExtensionUpdate);
router.get('/extension/getExtensionRealtime', authorize, extension.getExtensionForRealtimeDashboard);
router.post('/extension/makeFavorite', authorize, extension.makeFavoriteContactByExtension);
router.post('/extension/bundlePlanMinuteAssign', authorize, extension.assignBundlePlanMinuteForExtension);
router.post('/extension/getExtensionAssignMinutes', authorize, extension.getExtensionAssignMinutes);
router.post('/extension/getExtensionAssignMinutesByExtId', validateRequest.validateBodyRequest(extensionSchema.extensionAssignMinutes), authorize, extension.getExtensionAssignMinutesByExtnId);
router.post('/extension/bundlePlanMinuteAdjust', authorize, extension.adjustBundlePlanMinuteForExtension);
router.put('/extension/inactiveExtension', authorize, extension.inactiveExtension);
router.put('/extension/activeExtension', authorize, extension.activeExtension);
router.get('/extension/getparticularExtensionMinute', authorize, extension.getExtensionMinute);
router.post('/extension/removeExtensionMinute', authorize, extension.freeMinutesFromExtension);
router.post('/extension/setAdvanceService', authorize, extension.setAdvanceService);//advance service
router.post('/extension/bulkDeleteExtension', authorize, extension.bulkDeleteExtension);//advance service

router.get('/common/getCountryList', authorize, common.getCountryList);
router.get('/common/getTimeZone', authorize, common.getTimeZone);
router.get('/common/customerWiseCountry', authorize, common.customerWiseCountry);
router.get('/common/getProviders', authorize, common.getProviders);
router.get('/common/getCustomerCountry', authorize, common.getCustomerCountry);
router.get('/common/getIndiaStates', authorize, common.getIndiaStates);

//contact list
router.post('/contactList/createContact', validateRequest.validateBodyRequest(ContactSchema.createContact), authorize, contactList.createContact);
router.post('/contactList/viewContactList', validateRequest.validateBodyRequest(ContactSchema.viewContactList), authorize, contactList.viewContactList);
router.post('/contactList/deleteContact', validateRequest.validateBodyRequest(ContactSchema.deleteContact), authorize, contactList.deleteContact);
router.post('/contactList/copyToBlackList', authorize, contactList.copyToBlackList);
router.post('/contactList/getContactListByFilters', validateRequest.validateBodyRequest(ContactSchema.getContactListByFilters), authorize, contactList.getContactListByFilters);
router.get('/contactList/getCustomerEmailContact', authorize, contactList.getCustomerEmailContact);
router.post('/contactList/deleteContactGroup', validateRequest.validateBodyRequest(ContactSchema.deleteContactGroup), authorize, contactList.deleteContactGroup);
router.post('/contactList/checkContactExistInBlackList', authorize, contactList.checkNumberExistInBlackList);

//contact group
router.post('/contact/createContactGroup', validateRequest.validateBodyRequest(ContactSchema.createContactGroup), authorize, contactGroup.createContactGroup);
router.get('/contact/viewContactGroup', authorize, contactGroup.viewContactGroup);
router.get('/contact/viewGroup', authorize, contactGroup.viewSingleContactGroup);
router.post('/contact/updateContactGroup', validateRequest.validateBodyRequest(ContactSchema.updateContactGroup), authorize, contactGroup.updateContactGroup);
router.post('/contact/createContactInGroup', authorize, contactGroup.createContactInGroup);
router.get('/contact/getContactFromGroup', authorize, contactGroup.getContactFromGroup);
router.get('/contact/getAllContactFromGroup', authorize, contactGroup.getAllContactFromGroup);
router.post('/contact/getContactGroupByFilters', validateRequest.validateBodyRequest(ContactSchema.getContactGroupByFilters), authorize, contactGroup.getContactGroupByFilters);
router.post('/contact/updateContactGroupWithContact', authorize, contactGroup.updateContactGroupWithContacts);
router.get('/contact/getGroupName', authorize, contactGroup.getGroupNameExist);
router.get('/contact/isContactAssociateGroup', authorize, contactGroup.checkContactAssociateOrNot)
//black list contact
router.post('/blackList/createBlackListContact', validateRequest.validateBodyRequest(BlackListSchema.createBlackListContact), authorize, blackList.createBlackListContact);
router.post('/blackList/viewBlackList', validateRequest.validateBodyRequest(BlackListSchema.viewBlackList), authorize, blackList.viewBlackList);
router.post('/blackList/deleteBlackListContact', authorize, blackList.deleteBlackListContact);
router.put('/blackList/updateBlackListContactStatus', validateRequest.validateBodyRequest(BlackListSchema.updateBlackListContactStatus), authorize, blackList.updateBlackListContactStatus);
router.post('/blackList/checkNumberExistInBlackList', validateRequest.validateBodyRequest(ContactSchema.checkNumberExistInBlackList), authorize, blackList.checkNumberExistInBlackList);
router.post('/blackList/getBlackListByFilters', validateRequest.validateBodyRequest(BlackListSchema.getBlackListByFilters), authorize, blackList.getBlackListByFilters);
//white list contact
router.post('/blackList/createWhiteListContact', validateRequest.validateBodyRequest(whiteListIpSchema.createWhiteListContact), authorize, blackList.createWhiteListContact);
router.post('/blackList/viewWhiteList', authorize, blackList.viewWhiteList);
router.post('/blackList/deleteWhiteListContact', authorize, blackList.deleteWhiteListContact);
router.put('/blackList/updateWhiteListContactStatus', validateRequest.validateBodyRequest(whiteListIpSchema.updateWhiteListContactStatus), authorize, blackList.updateWhiteListContactStatus);
router.post('/blackList/checkNumberExistInWhiteList', authorize, blackList.checkNumberExistInWhiteList);
router.post('/blackList/getWhiteListByFilters', authorize, blackList.getWhiteListByFilters);

//voicemail
router.post('/voicemail/createVoicemail', validateRequest.validateBodyRequest(voiceMailSchema.createVoiceMail), authorize, voicemail.createVoicemail);
router.post('/voicemail/viewVoiceMailById', validateRequest.validateBodyRequest(voiceMailSchema.voiceMailById), authorize, voicemail.viewVoiceMailById);


//callforward
router.post('/callforward/createCallForward', authorize, callforward.createCallForward);
router.post('/callforward/viewCallForwardById', validateRequest.validateBodyRequest(callForwardSchema.viewCallForwardById), authorize, callforward.viewCallForwardById);
router.get('/callforward/extFeatureCallForward', authorize, callforward.extFeatureCallForward);
router.get('/callforward/getMinuteplanandOutboundcall', authorize, callforward.getMinuteplanandOutboundcall);
router.get('/callforward/extVoiceMailSetting', authorize, callforward.extVoiceMailSetting);

//speeddial
router.post('/speeddial/createSpeedDial', validateRequest.validateBodyRequest(speedDialSchema.createSpeedDial), authorize, speeddial.createSpeedDial);
router.post('/speeddial/viewSpeedDialById', validateRequest.validateBodyRequest(speedDialSchema.viewSpeedDialById), authorize, speeddial.viewSpeedDialById);

//get email category info
router.post('/emailCategory/createEmailCategory', authorize, emailCategory.createEmailCategory);
router.get('/emailCategory/viewEmailCategory', authorize, emailCategory.viewEmailCategory);
router.get('/getEmailCategory', authorize, emailCategory.getEmailCategory);
router.post('/emailCategory/getEmailCatgeoryByFilters', validateRequest.validateBodyRequest(emailCategorySchema.filterEmailCategory), authorize, emailCategory.getEmailCatgeoryByFilters);

//DID
router.post('/did/createDID', validateRequest.validateBodyRequest(didSchema.createDID), authorize, did.createDID);
router.post('/did/updateDID', validateRequest.validateBodyRequest(didSchema.updateDID), authorize, did.updateDID);
router.get('/did/getAllDID', authorize, did.getAllDID);
router.post('/did/verifyDID', authorize, did.verifyDID);
router.put('/did/deleteDID', validateRequest.validateBodyRequest(didSchema.deleteDID), authorize, did.deleteDID);
router.put('/did/inactiveDID', validateRequest.validateBodyRequest(didSchema.inactiveDIDSchema), authorize, did.inactiveDID);
router.put('/did/activeDID', validateRequest.validateBodyRequest(didSchema.activeDIDSchema), authorize, did.activeDID);
router.put('/did/inactiveCustomerDID', validateRequest.validateBodyRequest(didSchema.inactiveCustomerDID), authorize, did.inactiveCustomerDID);
router.put('/did/activeCustomerDID', validateRequest.validateBodyRequest(didSchema.activeCustomerDID), authorize, did.activeCustomerDID);
router.patch('/did/makeMasterDID', validateRequest.validateBodyRequest(didSchema.makeMasterDID), authorize, did.makeMasterDID);  //masterDID
// router.patch('/did/removeMasterDID', authorize, did.removeMasterDID); //change master DID
router.post('/did/getDIDByFilters', validateRequest.validateBodyRequest(didSchema.DIDByFilterSchema), authorize, did.getDIDByFilters);
router.get('/did/getDIDById', authorize, did.getDIDById);
router.post('/did/getDIDByCountry', validateRequest.validateBodyRequest(didSchema.DIDByCountrySchema), authorize, did.getDIDByCountry);
router.post('/did/assignDID', validateRequest.validateBodyRequest(didSchema.assignDID), authorize, did.assignDID);
router.get('/did/getCustomerDID', authorize, did.getCustomerDID);
router.post('/did/releaseDID', validateRequest.validateBodyRequest(didSchema.releaseDIDSchema), authorize, did.releaseDID);
router.get('/did/getActiveFeature', authorize, did.getActiveFeature);
router.get('/did/getDestination', authorize, did.getDestination);
router.post('/did/createDestination',validateRequest.validateBodyRequest(didSchema.createDestination), authorize, did.createDestination);
router.post('/did/updateDestination',validateRequest.validateBodyRequest(didSchema.createDestination), authorize, did.updateDestination);
router.get('/did/getDIDDestination', authorize, did.getDIDDestination);
router.post('/did/getCustomerDIDByFilters', validateRequest.validateBodyRequest(didSchema.getCustomerDIDByFilters), authorize, did.getCustomerDIDByFilters);
router.post('/did/getInternalUserDIDByFilters', authorize, did.getInternalUserDIDByFilters);
router.get('/did/getIntenalUserDID', authorize, did.getIntenalUserDID);
router.post('/did/getSupportDIDByFilters', authorize, did.getSupportDIDByFilters);
router.get('/did/getSupportProductWiseDID', authorize, did.getSupportProductWiseDID);
router.post('/did/getProductWiseCustomer', validateRequest.validateBodyRequest(didSchema.productWiseCustomerSchema), authorize, did.getProductWiseCustomer);
router.get('/did/getAllMappedDIDHistory', authorize, did.getAllMappedDIDHistroy);
router.post('/did/getAllMappedDIDHistoryByFilters', validateRequest.validateBodyRequest(didSchema.mappedDIDByFiltersSchema), authorize, did.getMappedDIDByFilters);
router.get('/did/getAllFeatureDIDHistory', authorize, did.getAllFeatureDIDHistory); //akshay
router.get('/extension/getDidListById', authorize, extension.getDidListById); //akshay
router.get('/vmn/getVmnDetails', authorize, did.getVMN); // Yash kashyap
router.post('/did/createVMN', validateRequest.validateBodyRequest(didSchema.createVMNSchema), authorize, did.createVmn); // Yash kashyap
router.post('/did/getVmnById', validateRequest.validateBodyRequest(didSchema.filterVMNSchema), authorize, did.getVMNById); // Yash kashyap
router.post('/did/deleteVMN', validateRequest.validateBodyRequest(didSchema.deleteVMNSchema), authorize, did.deleteVMN); // Yash kashyap
router.post('/did/getAssociateDID', validateRequest.validateBodyRequest(didSchema.getAssociateDID), authorize, did.getAssociateDIDWithVMN);
router.get('/did/getVoicebotByCustId', authorize, did.getVoicebotByCustId);



//providers
router.post('/provider/createProvider', validateRequest.validateBodyRequest(providerSchema.createProviderSchema), authorize, provider.createProvider);
router.post('/provider/updateProvider', validateRequest.validateBodyRequest(providerSchema.updateProviderSchema), authorize, provider.updateProvider);
router.get('/provider/getProviderById', authorize, provider.getProviderById);
router.get('/provider/viewProviderDetails', authorize, provider.viewProviderDetails);
router.get('/provider/viewProviderAssignDID', authorize, provider.viewProviderAssignDID);
router.delete('/provider/deleteProvider', authorize, provider.deleteProvider);
router.post('/provider/verifyProvider', validateRequest.validateBodyRequest(providerSchema.verifyProviderSchema), authorize, provider.verifyProvider);
router.get('/provider/isProviderInUse', authorize, provider.isProviderInUse);
router.get('/provider/getDidDetails', authorize, provider.viewDIDDetailsBasedOnDID);

//billing
router.get('/billing/getBillingInfo', authorize, billing.getBillingInfo);
router.post('/billing/getBillingByFilters', validateRequest.validateBodyRequest(billingSchema.filterBilling), authorize, billing.getBillingByFilters);
router.get('/billing/getCustomerBillingInfo', authorize, billing.getCustomerBillingInfo);
router.post('/billing/getCustomerBillingByFilters', validateRequest.validateBodyRequest(billingSchema.getCustomerBillingByFilters), authorize, billing.getCustomerBillingByFilters);
router.get('/billing/getAllBillingInfo', authorize, billing.getAllBillingInfo);
router.post('/billing/getAllBillingInfoByFilters', validateRequest.validateBodyRequest(billingSchema.filterBillingInfo), authorize, billing.getAllBillingInfoByFilters);

//prompts
router.post('/prompt/viewPrompt', authorize, prompt.promptDetails);
router.post('/prompt/getPromptByFilters', authorize, prompt.getPromptByFilters);
router.put('/prompt/deletePrompt', authorize, prompt.deletePrompt);
router.get('/prompt/getPromptById', authorize, prompt.getPromptById);
router.post('/prompt/updatePrompt', validateRequest.validateBodyRequest(promptSchema.updatePrompt), authorize, prompt.updatePrompt);
router.get('/prompt/getMOHPrompt', authorize, prompt.getMOHPrompt);
router.get('/prompt/getConferencePrompt', authorize, prompt.getConferencePrompt);
router.get('/prompt/getQueuePrompt', authorize, prompt.getQueuePrompt);
router.get('/prompt/getIVRPrompt', authorize, prompt.getIVRPrompt);
router.get('/prompt/getTimeGroupPrompt', authorize, prompt.getTimeGroupPrompt);
router.get('/prompt/getTCPrompt', authorize, prompt.getTCPrompt);
router.get('/prompt/getBroadcastPrompt', authorize, prompt.getBCPrompt);
router.get('/prompt/promptAssociate', authorize, prompt.getPromptAssociated);
router.get('/prompt/getTimeGroupPromptForExtn', authorize, prompt.getTimeGroupPromptForExtension);
router.get('/prompt/getCallGroupPrompt', authorize, prompt.getCallGroupPrompt);
router.get('/prompt/getmappedPackages', authorize, prompt.getmappedPackagesById);
router.get('/prompt/getGeneralPrompt', authorize, prompt.getGeneralPrompt);





//conference
router.post('/conference/createConference', validateRequest.validateBodyRequest(conferenceSchema.createConference), authorize, conference.createConference);
router.post('/conference/viewConference', validateRequest.validateBodyRequest(conferenceSchema.viewConference), authorize, conference.viewConference);
router.post('/conference/deleteConference', authorize, conference.deleteConference);
router.post('/conference/getConferenceByFilters', validateRequest.validateBodyRequest(conferenceSchema.filterConference), authorize, conference.getConferenceByFilters);
router.get('/conference/getTotalConference', authorize, conference.getTotalConference);
router.get('/conferenceCount', authorize, conference.getConferenceCount);



//callgroup
router.post('/callgroup/saveCallGroup', validateRequest.validateBodyRequest(callGroupSchema.saveCallGroup), authorize, callgroup.saveCallGroup);
router.post('/callgroup/deleteCallgroup', authorize, callgroup.deleteCallgroup);
router.post('/callgroup/getCallgroup', validateRequest.validateBodyRequest(callGroupSchema.getCallgroup), authorize, callgroup.getCallgroup);
router.post('/callgroup/getCallgroupByFilters', validateRequest.validateBodyRequest(callGroupSchema.getCallgroupByFilters), authorize, callgroup.getCallgroupByFilters);
router.post('/callgroup/getExten', authorize, callgroup.getExten);
router.get('/callGroupCount', authorize, callgroup.getCallGroupCount);


//callqueue
router.post('/callqueue/createCallQueue', validateRequest.validateBodyRequest(callQueueSchema.createCallQueue), authorize, callqueue.createCallQueue);
router.post('/callqueue/viewCallqueue', validateRequest.validateBodyRequest(callQueueSchema.viewCallqueue), authorize, callqueue.viewCallqueue);
router.post('/callqueue/getCallQueueByFilters', validateRequest.validateBodyRequest(callQueueSchema.getCallQueueByFilters), authorize, callqueue.getCallQueueByFilters);
router.post('/callqueue/deleteCallQueue', authorize, callqueue.deleteCallQueue);
router.get('/callqueue/getTotalQueue', authorize, callqueue.getTotalQueue);
router.get('/callQueueCount', authorize, callqueue.getCallQueueCount);
router.post('/callqueue/getIVR', authorize, callqueue.getfeedbackIVR);


//assignRights
router.post('/assignrights/getuserpackagedetail', authorize, assignRights.getUserPackageDetails);
router.post('/assignrights/saveAssignRights', authorize, assignRights.saveAssignRights);
router.get('/assignrights/getAssignRights', authorize, assignRights.getAssignRights);
router.post('/assignrights/getSavedAssignRights', authorize, assignRights.getSavedAssignRights);
router.post('/assignrights/deleteAssignRights', authorize, assignRights.deleteAssignRights);
router.post('/assignrights/getAssignRightsFilter', authorize, assignRights.getAssignRightsFilter);
//Featurecode
router.get('/featureCode/viewFeatureCode', authorize, featureCode.viewFeatureCode);
router.post('/featureCode/getFeatureCodeByFilters', validateRequest.validateBodyRequest(featureSchema.getFeatureCodeByFilters), authorize, featureCode.getFeatureCodeByFilters);

//Checkfeature
router.get('/feature/checkFeatureByPackage', authorize, features.checkFeatureByPackage);


//FeatureGlobalRate
router.post('/feature/viewGlobalRate', authorize, globalrate.viewGlobalRate);
router.get('/feature/getglobalRateById', authorize, globalrate.getglobalRateById);
router.post('/feature/updateGlobalRate', authorize, globalrate.UpdateGlobalRate);
router.post('/feature/deleteGlobalrate', authorize, globalrate.deleteGlobalRate);
router.post('/feature/viewGlobalRateMapping', validateRequest.validateBodyRequest(featureSchema.viewGlobalRateMapping), authorize, globalrate.viewGlobalFeatureMappingRate);

// router.post('/featureCode/getglobalRateByFilters', authorize, featureCode.getglobalRateByFilters);

//FeatureRatePlan
router.post('/feature/viewFeaturePlan', validateRequest.validateBodyRequest(featureSchema.viewFeaturePlan), authorize, FeatureRatePlan.viewFeaturePlan);
router.get('/feature/getFeaturePlanById', authorize, FeatureRatePlan.getFeaturePlanById);
router.post('/feature/updateFeaturePlan', authorize, FeatureRatePlan.updateFeaturePlan);
router.post('/feature/deleteFeaturePlan', authorize, FeatureRatePlan.deleteFeaturePlan);
router.post('/feature/addFeaturePlan', authorize, FeatureRatePlan.addFeaturePlan);
router.get('/feature/getfeaturePackages', authorize, FeatureRatePlan.getFeaturePlanPackagesById);
router.post('/feature/upgradeFeatureRatePlan', authorize, FeatureRatePlan.UpgradeFeatureRatePlan);


//GatewayGroup
router.post('/gatewayGroup/createGatewaygroup', authorize, gatewayGroup.createGatewayGroup);
router.post('/gatewayGroup/viewGatewayGroup', authorize, gatewayGroup.viewGatewayGroup);
router.post('/gatewayGroup/getGatewayGroupFilter', authorize, gatewayGroup.getGatewayGroupFilter);
router.post('/gatewayGroup/deleteGatewayGroup', authorize, gatewayGroup.deleteGatewayGroup);

//Holiday
router.post('/holiday/createHoliday', validateRequest.validateBodyRequest(holidaySchema.createHoliday), authorize, holiday.createHoliday);
router.post('/holiday/viewHoliday', validateRequest.validateBodyRequest(holidaySchema.viewHoliday), authorize, holiday.viewHoliday);
router.post('/holiday/deleteHoliday', validateRequest.validateBodyRequest(holidaySchema.deleteHoliday), authorize, holiday.deleteHoliday);
router.post('/holiday/getHolidayFilters', validateRequest.validateBodyRequest(holidaySchema.getHolidayFilters), authorize, holiday.getHolidayFilters);
router.post('/holiday/createHolidayFromExcel', authorize, holiday.createHolidayFromExcel);

//Time Group
router.post('/timeGroup/createTimeGroup', validateRequest.validateBodyRequest(timegroupSchema.createTimeGroup), authorize, timeGroup.createTimeGroup);
router.post('/timeGroup/viewTimeGroup', validateRequest.validateBodyRequest(timegroupSchema.viewTimeGroup), authorize, timeGroup.viewTimeGroup);
router.post('/timeGroup/getTimeGroupFilters', validateRequest.validateBodyRequest(timegroupSchema.getTimeGroupFilters), authorize, timeGroup.getTimeGroupFilters);
router.post('/timeGroup/deleteTimeGroup', validateRequest.validateBodyRequest(timegroupSchema.deleteTimeGroup), authorize, timeGroup.deleteTimeGroup);

//Access Restriction created by bhupendra
router.post('/accessRestriction/createAccessRestriction', authorize, accessRestriction.createAccessRestriction);
router.get('/accessRestriction/viewAccessCategory', authorize, accessRestriction.viewAccessCategory);
router.post('/accessRestriction/getAccessFilter', validateRequest.validateBodyRequest(accessRestrictionSchema.getAccessFilter), authorize, accessRestriction.getAccessFilter);
router.post('/accessRestriction/deleteAccessGroup', authorize, accessRestriction.deleteAccessGroup);
router.patch('/accessRestriction/updateAccessGroup', authorize, accessRestriction.updateAccessGroup);
router.post('/accessRestriction/viewAccessGroupById', authorize, accessRestriction.viewAccessGroupById);
router.post('/accessRestriction/ValidateIP', authorize, accessRestriction.ValidateIP);


//view Access Restriction created by bhupendra
// router.get('/viewAccessRestriction/getAccessRestrictionCustomer', authorize, viewAccessRestriction.getAccessRestrictionCustomer);
router.post('/viewAccessRestriction/createviewAccessRestriction', validateRequest.validateBodyRequest(accessRestrictionSchema.createviewAccessRestriction), authorize, viewAccessRestriction.createviewAccessRestriction);
router.post('/viewAccessRestriction/getViewAccessFilter', validateRequest.validateBodyRequest(accessRestrictionSchema.getViewAccessFilter), authorize, viewAccessRestriction.getViewAccessFilter);
router.get('/viewAccessRestriction/viewAccessRestriction', authorize, viewAccessRestriction.viewAccessRestriction);
router.post('/viewAccessRestriction/deleteviewAccessGroup', authorize, viewAccessRestriction.deleteviewAccessGroup);
router.post('/viewAccessRestriction/viewAccessRestGroupById', authorize, viewAccessRestriction.viewAccessRestGroupById);
router.post('/viewAccessRestriction/ValidateAccessRestrictionIP', authorize, viewAccessRestriction.ValidateAccessRestrictionIP);
router.patch('/viewAccessRestriction/updateAccessRestrictionGroup', validateRequest.validateBodyRequest(accessRestrictionSchema.updateAccessRestrictionGroup), authorize, viewAccessRestriction.updateAccessRestrictionGroup);
router.get('/viewAccessRestriction/getCustomercompanyByID', authorize, viewAccessRestriction.getCustomercompanyByID);

















//Call Plan
router.post('/callPlan/createCallPlan', validateRequest.validateBodyRequest(callPlanSchema.createCallPlan), authorize, callPlan.createCallPlan);
router.post('/callPlan/viewCallPlan', validateRequest.validateBodyRequest(callPlanSchema.viewCallPlanSchema), authorize, callPlan.viewCallPlan);
router.post('/callPlan/viewCallPlanDetails', authorize, callPlan.viewCallPlanDetails);
router.post('/callPlan/getExtraFeeMapping', validateRequest.validateBodyRequest(callPlanSchema.extraFeeMappingSchema), authorize, callPlan.getExtraFeeMapping);
router.get('/callPlan/checkRatesAssociated', authorize, callPlan.checkRatesAssociated);
router.post('/callPlan/deleteCallPlan', authorize, callPlan.deleteCallPlan);
router.get('/callPlan/getcallPlan', authorize, callPlan.getcallPlan);
router.get('/callPlan/forgetCallPlanOnMinutePlan', authorize, product.forgetCallPlanOnMinutePlan);
router.post('/callPlan/getCallPlanByFilter',  authorize, callPlan.getCallPlanByFilter);
// router.post('/callPlan/getCallPlanByFilter', validateRequest.validateBodyRequest(callPlanSchema.filterCallPlanSchema), authorize, callPlan.getCallPlanByFilter);
router.post('/callPlan/getCallExist', authorize, callPlan.getCallPlanIsExist);
router.get('/callPlan/getManagerCustomercallPlan', authorize, callPlan.getManagerCustomerscallPlan);
router.get('/callPlan/getManagerCustomerscallPlanRoaming', authorize, callPlan.getManagerCustomerscallPlanRoaming);
router.get('/callPlan/getManagerCustomerscallPlanTC', authorize, callPlan.getManagerCustomerscallPlanTC);
router.get('/callPlan/getManagerCustomerscallPlanStandard', authorize, callPlan.getManagerCustomerscallPlanStandard);
router.get('/callPlan/TCPackageDestination', authorize, callPlan.TCPackageDestination);

router.post('/callPlan/deleteCallRateGroup', authorize, callPlan.deleteCallRateGroup);
router.post('/callPlan/associatepackage', validateRequest.validateBodyRequest(callPlanSchema.associatepackage), authorize, callPlan.getAssociatePackage);
router.get('/callPlan/getNewRates', authorize, callPlan.getNewRates);

// router.get('/callPlan/callRateGroupCount', authorize, callPlan.getCallRateGroupCount);


//Call Plan Rate
router.post('/callPlanRate/createCallPlanRate', validateRequest.validateBodyRequest(callPlanRateSchema.createCallPlanSchema), authorize, callPlanRate.createCallPlanRate);
router.post('/callPlanRate/viewCallPlanRate', authorize, callPlanRate.viewCallPlanRate);
router.post('/callPlanRate/deleteCallPlanRate', authorize, callPlanRate.deleteCallPlanRate);
router.post('/callPlanRate/getCallPlanRateByFilters',  authorize, callPlanRate.getCallPlanRateByFilters);
router.post('/callPlanRate/checkUniqueGatewayPrefix', validateRequest.validateBodyRequest(callPlanRateSchema.uniqueGatewayPrefixSchema), authorize, callPlanRate.checkUniqueGatewayPrefix);
router.post('/callPlanRate/viewCustomerCallPlanRate', validateRequest.validateBodyRequest(featureSchema.viewCustomerCallPlanRate), authorize, callPlanRate.viewCustomerCallPlanRate);
router.post('/callPlanRate/getCustomerCallPlanRateByFilters', authorize, callPlanRate.getCustomerCallPlanRateByFilters);
router.post('/callPlanRate/viewExtensionCallPlanRate', validateRequest.validateBodyRequest(callPlanRateSchema.viewExtensionCallPlanRate), authorize, callPlanRate.viewExtensionCallPlanRate);
router.post('/callPlanRate/getExtensionCallPlanRateByFilters', validateRequest.validateBodyRequest(callPlanRateSchema.filterExtensionCallPlanRate), authorize, callPlanRate.getExtensionCallPlanRateByFilters);
router.post('/callPlanRate/viewUserDetailCallPlanRate', validateRequest.validateBodyRequest(callPlanRateSchema.userDetailCallPlanRate), authorize, callPlanRate.viewUserDetailCallPlanRate);
router.post('/callPlanRate/viewManagerCallPlanRate', authorize, callPlanRate.viewManagerCustomerCallPlanRate);
router.post('/callPlanRate/getManagerCallPlanRateByFilters', authorize, callPlanRate.getManagerCustomerCallPlanRateByFilters);
router.post('/callPlanRate/checkUniqueCallGroup', validateRequest.validateBodyRequest(callPlanRateSchema.uniqueGatewayPrefixSchema), authorize, callPlanRate.checkUniqueCallGroup);
router.post('/callPlanRate/deleteBundleRates', authorize, callPlanRate.deleteBundleRates);
router.put('/callPlanRate/GatewaUpdate', authorize, callPlanRate.GatewaUpdate);

//recording
router.post('/recording/deleteRecording', validateRequest.validateBodyRequest(recordingSchema.deleteRecording), authorize, recording.deleteRecording);
router.post('/recording/getRecordingList', validateRequest.validateBodyRequest(recordingSchema.recordingList), authorize, recording.getRecordingList);
router.post('/recording/filterRecordingList', validateRequest.validateBodyRequest(recordingSchema.filterRecordingList), authorize, recording.filterRecordingList);
// router.post('/recording/getTeleConsultationRecording',validateRequest.validateBodyRequest(TCSchema.getTeleConsultationRecording), authorize, recording.getTeleConsultRecordingList);

//ivr
router.post('/ivr/createIVR', authorize, ivr.createIVR);
router.get('/ivr/getIVRAction', authorize, ivr.getIVRAction);
router.post('/ivr/createBasicIVR', authorize, ivr.createBasicIVR);
router.post('/ivr/viewBasicIVR', authorize, ivr.viewBasicIVR);
router.post('/ivr/getBasicIVRByFilters', authorize, ivr.getBasicIVRByFilters);
router.post('/ivr/deleteBasicIVR', authorize, ivr.deleteBasicIVR);
router.post('/ivr/getIVRMaster', authorize, ivr.getIVRMaster);
router.get('/ivrCount', authorize, ivr.getIVRCount);
router.get('/ivr/getAllAssociatedIVR', authorize, ivr.getAllAssociateIVR);
router.get('/ivr/getIVRMappedWithDID', authorize, ivr.getIVRCount);




//cdr  
router.get('/cdr/getAdminCdrInfo', authorize, cdr.getAdminCdrInfo);
router.get('/cdr/getCdrResellerInfo', authorize, cdr.getCdrResellerInfo);
router.get('/cdr/getAdminCdrInfodash', authorize, cdr.getAdminCdrInfodash);
router.get('/cdr/getResellerCdrInfo', authorize, cdr.getResellerCdrInfo);
router.post('/cdr/getAdminCdrByFilters', validateRequest.validateBodyRequest(cdrSchema.filterAdminCdr), authorize, cdr.getAdminCdrByFilters);
router.get('/cdr/getCustomerCdrInfo', authorize, cdr.getCustomerCdrInfo);
router.post('/cdr/getCustomerCdrByFilters', authorize, cdr.getCustomerCdrByFilters);
router.post('/cdr/getCustomerCdrByFiltersExcel', authorize, cdr.getCustomerCdrByFiltersExcel);
router.post('/cdr/getPluginCdrByFilter', validateRequest.validateBodyRequest(pluginSchema.filterPluginCdr), authorize, cdr.getPluginCdrByFilter);
router.post('/cdr/getExportExcelData', authorize, cdr.getExportExcelData);
router.post('/cdr/getConferenceByFilter', validateRequest.validateBodyRequest(cdrSchema.filterConference), authorize, cdr.getConferenceByFilter);
router.get('/cdr/getAccountManagerCdrInfo', authorize, cdr.getAccountManagerCdrInfo);
router.post('/cdr/getAccountManagerCdrByFilters', authorize, cdr.getAccountManagerCdrByFilters);
router.get('/cdr/getSupportCdrInfo', authorize, cdr.getSupportCdrInfo);
router.post('/cdr/getSupportCdrByFilters', authorize, cdr.getSupportCdrByFilters);
router.get('/cdr/getExtensionCdrInfo', authorize, cdr.getExtensionCdrInfo);
router.post('/cdr/getExtensionCdrByFilters', validateRequest.validateBodyRequest(cdrSchema.filterExtensionCdr), authorize, cdr.getExtensionCdrByFilters);
router.get('/cdr/getTerminateCause', authorize, cdr.getTerminateCause);
router.get('/cdr/getFeedbackReport', authorize, cdr.viewFeedback_Report);
router.post('/cdr/getFeedbackReportByFilters', validateRequest.validateBodyRequest(cdrSchema.filterFeedBackReport), authorize, cdr.getFeedback_ReportByFilters);
router.get('/cdr/getCustomerStickyAgentInfo', authorize, cdr.getCustomerStickyAgentInfo);
router.post('/cdr/getCustomerStickyAgentByFilters', validateRequest.validateBodyRequest(cdrSchema.filterCustomerStickyAgent), authorize, cdr.getCustomerStickyAgentByFilters);
router.get('/cdr/getPluginCdr', authorize, cdr.getPluginCdr);
router.get('/cdr/getConferenceData', authorize, cdr.getConferenceData);
router.get('/cdr/getConferenceCdr', authorize, cdr.getConferenceCdr);
router.get('/cdr/getSpeechToText', authorize, cdr.getSpeechToText);


//ccavenue payment gateway
router.post('/ccavenue/payHere', authorize, ccavenue.payHere);
//invoice
router.get('/invoice/getAllInvoices', authorize, invoice.viewAllInvoice);
router.get('/invoice/getInvoiceDetail', authorize, invoice.getInvoiceDetail);
router.get('/invoice/getInvoiceCdrDetail', authorize, invoice.getInvoiceCdrDetail);
router.get('/invoice/getAllInvoicesOfCustomer', authorize, invoice.getAllInvoicesOfCustomer);
router.get('/invoice/getAllInvoicesOfCustomerOfYear', authorize, invoice.getAllInvoicesOfCustomerOfYear);
router.get('/invoice/getAllInvoicesOfManagerCustomer', authorize, invoice.getAllInvoicesOfManagerCustomer);
router.post('/invoice/getInvoiceByFilters', validateRequest.validateBodyRequest(invoiceSchema.filterInvoice), authorize, invoice.getInvoiceByFilters); //get invoiveFilter
router.post('/invoice/getInvoicesOfManagerCustomerByFilters', authorize, invoice.getInvoicesOfManagerCustomerByFilters); //get invoiveFilter
router.post('/invoice/saveAdminPaymentLog', validateRequest.validateBodyRequest(invoiceSchema.saveAdminPaymentLog), authorize, invoice.saveAdminPaymentLog);
router.get('/invoice/getPreviousLogPayments', authorize, invoice.getPreviousLogPayments);

//paytm payment gateway
router.post('/paytm/getChecksum', authorize, paytm.getPaytmCheckSum);
//router.post('/paytm/callback', authorize, paytm.getPaytmCallback);
//Add balance in user  
router.post('/addBalance/createAddBalance', validateRequest.validateBodyRequest(balanceSchema.createAddBalance), authorize, addBalance.createAddBalance);
router.post('/addBalance/createAddResellerBalance', authorize, addBalance.createAddResellerBalance);
router.post('/addBalance/viewAddBalance', validateRequest.validateBodyRequest(balanceSchema.viewAddBalanceSchema), authorize, addBalance.viewAddBalance);
router.post('/addBalance/deleteAddBalance', authorize, addBalance.deleteAddBalance);
router.post('/addBalance/getAddBalanceByFilters', validateRequest.validateBodyRequest(balanceSchema.filterAddBalance), authorize, addBalance.getAddBalanceByFilters);

// TeleConsultation
router.post('/tele-consultation/addTCPackage',validateRequest.validateBodyRequest(TCSchema.addTCPackage), authorize, teleConsultation.addTCPackage);
router.post('/tele-consultation/getTCPackage',validateRequest.validateBodyRequest(TCSchema.viewTCPackage), authorize, teleConsultation.viewTCPackage);
router.put('/tele-consultation/updateTCPackage',validateRequest.validateBodyRequest(TCSchema.updateTCPackage), authorize, teleConsultation.updateTCPackage);
router.get('/tele-consultation/getMyAssignMinutes', authorize, teleConsultation.getMyAssignedMinutes);
router.post('/tele-consultation/assignMinuteToUser', authorize, teleConsultation.assignMinuteToUser);
router.post('/tele-consultation/getAssignUser', authorize, teleConsultation.viewAssignUsers);
router.put('/tele-consultation/updateassignMinuteToUser', authorize, teleConsultation.updateassignMinuteToUser);
router.post('/tele-consultation/addTC',validateRequest.validateBodyRequest(TCSchema.addTC), authorize, teleConsultation.addTC);
router.post('/tele-consultation/getTC', authorize, teleConsultation.viewTC);
router.post('/tele-consultation/getTCCdr', authorize, teleConsultation.getTCCdr);
router.post('/tele-consultation/getUnauthCdrByFilter', authorize, teleConsultation.getUnauthCdrByFilter);
router.get('/tele-consultation/getSingleTC', authorize, teleConsultation.viewSingleTCFullDetails);
router.put('/tele-consultation/updateTC',validateRequest.validateBodyRequest(TCSchema.updateTC), authorize, teleConsultation.updateTC);
router.delete('/tele-consultation/deleteTC', authorize, teleConsultation.deleteTC);
router.delete('/tele-consultation/deleteTcMinuteMapping', authorize, teleConsultation.deleteTCMinuteMapping);
router.delete('/tele-consultation/deleteTcList', authorize, teleConsultation.deleteTCPlan);
router.get('/tele-consultation/TCPlanAssociateUsers', authorize, teleConsultation.viewTCPlanAssociateUsers);
router.post('/tele-consultation/getAssignMinuteUser', authorize, teleConsultation.viewAssignMinuteUsers);
router.get('/tele-consultation/getCdrInfo', authorize, teleConsultation.viewTC_CDR);
router.post('/tele-consultation/getCdrByFilters',validateRequest.validateBodyRequest(TCSchema.getTC_CdrByFilters), authorize, teleConsultation.getTC_CdrByFilters);
router.post('/tele-consultation/getAssignMinutes', authorize, teleConsultation.getTeleConsultancyAssignMinutes);
router.post('/tele-consultation/getMappedContacts', authorize, teleConsultation.getMappedContacts);
router.post('/tele-consultation/getMappedTcHistory', authorize, teleConsultation.getMappedTcHistory);
router.post('/tele-consultation/getMappedContactsByFilter', authorize, teleConsultation.getMappedContactsByFilter);
router.post('/tele-consultation/getTcPackageDetail', authorize, teleConsultation.getTcPlanById);
router.post('/tele-consultation/remaingMinutes', authorize, teleConsultation.remaingMinutes);
router.post('/tele-consultation/getRemainingContactMinutes', authorize, teleConsultation.getRemainingContactMinutes);
router.post('/tele-consultation/getSubscriberInfo',validateRequest.validateBodyRequest(TCSchema.getSubscriberInfo), authorize, teleConsultation.getSubscriberInfo);
router.post('/tele-consultation/getSubscriberInfoByFilter',validateRequest.validateBodyRequest(TCSchema.getSubscriberInfoByFilter), authorize, teleConsultation.getSubscriberInfoByFilter);
router.post('/tele-consultation/deleteSubscriber', authorize, teleConsultation.deleteSubscriber);
router.post('/tele-consultation/addContact', authorize, teleConsultation.addContact);
router.post('/tele-consultation/addMinutes', authorize, teleConsultation.addMinutes);
router.get('/tele-consultation/getCallerId', authorize, teleConsultation.getCallerId);

// ActivityLogs
router.get('/activityLog/getActivityLog', authorize, activityLog.getActivityLog);
router.put('/user/updateLogoutLog', authorize, user.updateLogoutLog);
router.post('/activityLog/getActivityLogByFilter', validateRequest.validateBodyRequest(activityLogSchema.getActivityLogByFilter), authorize, activityLog.getActivityLogByFilter);

//Outbound Conference
router.post('/outboundconf/addOC', authorize, outboundconf.addOC);
router.post('/outboundconf/viewOC', authorize, outboundconf.viewOC);
router.get('/outboundconfCount', authorize, outboundconf.getConferenceCount);
router.get('/outboundconf/deleteOC', authorize, outboundconf.deleteOC);
router.post('/outboundconf/viewOCGroupById', authorize, outboundconf.viewOCGroupById);
router.patch('/outboundconf/updateOCGroup', authorize, outboundconf.updateOCGroup);
router.patch('/outboundconf/partiallyUpdateOC', authorize, outboundconf.partiallyUpdateOC);
router.get('/outboundconf/isOCExist', authorize, outboundconf.isOCExist);
router.get('/outboundconf/outboundcdr', authorize, outboundconf.outboundcdr);
router.get('/outboundconf/livecallforOC', authorize, outboundconf.livecallforOC);
router.get('/outboundconf/outboundreport', authorize, outboundconf.outboundreport);
router.get('/outboundconf/outboundreportstatusNotlive', authorize, outboundconf.outboundreportstatusNotlive);
router.post('/outboundconf/getoutboundcdrFilter', authorize, outboundconf.getoutboundcdrFilter);
router.post('/outboundconf/getreportFilter', authorize, outboundconf.getreportFilter);
router.post('/outboundconf/getreportFilterTwo', authorize, outboundconf.getreportFilterTwo);
router.get('/outboundconf/getoutboundCDR', authorize, outboundconf.getoutboundCDR);
router.get('/outboundconf/getoutboundCDRAssociate', authorize, outboundconf.getoutboundCDRAssociate);
router.get('/outboundconf/getstatusById', authorize, outboundconf.getstatusById);
router.get('/outboundconf/getoutboundParticipants', authorize, outboundconf.getoutboundParticipants);
router.patch('/outboundconf/partiallyUpdateOCStop', authorize, outboundconf.partiallyUpdateOCStop);
router.get('/outboundconf/getStatusOC', authorize, outboundconf.getStatusOC);
router.post('/outboundconf/getOCRecordingList', authorize, outboundconf.getOCRecordingList);
router.post('/outboundconf/deleteRecording', authorize, outboundconf.deleteRecording);
router.post('/outboundconf/filterRecordingList', authorize, outboundconf.filterRecordingList);




//CustomerDialoutRule 
router.get('/CustomerDialoutRule/getcustomerdialoutdata', authorize, CustomerDialoutRule.getcustomerdialoutdata);
router.get('/CustomerDialoutRule/getInternalDialout', authorize, CustomerDialoutRule.getInternalDialout);
router.get('/CustomerDialoutRule/getGroupType', authorize, CustomerDialoutRule.getGroupType);
router.get('/CustomerDialoutRule/getGroupCCType', authorize, CustomerDialoutRule.getGroupCCType);
router.get('/CustomerDialoutRule/getIntercomById', authorize, CustomerDialoutRule.getIntercomById);
router.get('/CustomerDialoutRule/getIntercomByExtID', authorize, CustomerDialoutRule.getIntercomByExtID);
router.get('/getIntercomIDCount', authorize, CustomerDialoutRule.getIntercomIDCount);

router.get('/CustomerDialoutRule/getIntercomByCustomer', authorize, CustomerDialoutRule.getIntercomByCustomer);
router.get('/CustomerDialoutRule/getAssociatedExtensions', validateRequest.validateBodyRequest(intercomSchema.getAssociatedExtensions), authorize, CustomerDialoutRule.getAssociatedExtensions);
router.post('/CustomerDialoutRule/getDialouFilter', validateRequest.validateBodyRequest(customerDialoutSchema.filterDialoutRule), authorize, CustomerDialoutRule.getDialouFilter);
router.post('/CustomerDialoutRule/saveIntercomDialout', validateRequest.validateBodyRequest(intercomSchema.saveIntercomDialout), authorize, CustomerDialoutRule.saveIntercomDialout);
router.post('/CustomerDialoutRule/updateIntercomDialout', validateRequest.validateBodyRequest(intercomSchema.updateIntercomDialout), authorize, CustomerDialoutRule.updateIntercomDialout);
router.post('/CustomerDialoutRule/getInternalDialoutByFilter', validateRequest.validateBodyRequest(intercomSchema.getInternalDialoutByFilter), authorize, CustomerDialoutRule.getInternalDialoutByFilter);
router.post('/CustomerDialoutRule/deleteIntercomRule', validateRequest.validateBodyRequest(intercomSchema.deleteIntercomRule), authorize, CustomerDialoutRule.deleteIntercomRule);




//Broadcasting
router.post('/broadcasting/addBC', validateRequest.validateBodyRequest(broadcastSchema.addBC), authorize, broadcast.addBC);
router.post('/broadcasting/saveParticipants', authorize, broadcast.saveParticipants);
router.post('/broadcasting/getBC', validateRequest.validateBodyRequest(broadcastSchema.getBC), authorize, broadcast.viewBC);
router.get('/broadcasting/getSingleBC', authorize, broadcast.viewSingleBCFullDetails);
router.get('/broadcasting/getBroadcastParticipants', authorize, broadcast.getBroadcastParticipants);
router.put('/broadcasting/updateBC', validateRequest.validateBodyRequest(broadcastSchema.updateBC), authorize, broadcast.updateBC);
router.patch('/broadcasting/partiallyUpdateBC', validateRequest.validateBodyRequest(broadcastSchema.partiallyUpdateBC), authorize, broadcast.partiallyUpdateBC);
router.get('/broadcasting/getCdrInfo', authorize, broadcast.viewBC_CDR);
router.post('/broadcasting/getCdrByFilters', validateRequest.validateBodyRequest(broadcastSchema.getCdrByFilters), authorize, broadcast.getBC_CdrByFilters);
router.get('/broadcastCount', authorize, broadcast.getBroadcastCount);
router.delete('/broadcast/deleteBC', authorize, broadcast.deleteBC);
router.get('/broadcasting/isBroadcastExist', authorize, broadcast.getIsBroadcastExist);

// Softphone logs
router.get('/softPhone/contacts', softphone_authorize, softPhone.getContact);
router.get('/softPhone/callhistory', softphone_authorize, softPhone.getCallHistory);

//SMS
router.get('/sms/getAllSMS', authorize, SMS.viewAllSMS);
router.post('/sms/createSMSPlan', validateRequest.validateBodyRequest(smsSchema.createSMSPlan), authorize, SMS.createSMSPlan);
router.post('/sms/createSMSPlanByFilters', validateRequest.validateBodyRequest(smsSchema.createSMSPlanByFilters), authorize, SMS.createSMSPlanFilters);
router.get('/sms/viewSMSById', authorize, SMS.getSMSById);
router.put('/sms/updateSMSPlan', validateRequest.validateBodyRequest(smsSchema.updateSMSPlan), authorize, SMS.updateSMSPlan);
router.post('/sms/createSMSApi', validateRequest.validateBodyRequest(smsSchema.createSMSApi), authorize, SMS.createSMSApi);
router.get('/sms/getAllSMSApi', authorize, SMS.viewAllSMSApi);
router.get('/sms/viewAllSMSProvider', authorize, SMS.viewAllSMSProvider);
router.get('/sms/viewSMSApiById', authorize, SMS.getSMSApiById);
router.put('/sms/updateSMSApi', validateRequest.validateBodyRequest(smsSchema.updateSMSApi), authorize, SMS.updateSMSApi);
router.post('/sms/viewSMSApiByFilters', authorize, SMS.viewSMSPlanFilters);
router.get('/sms/getSMSCategory', authorize, SMS.viewSMSCategories);
router.post('/sms/createSMSTemplate', validateRequest.validateBodyRequest(smsSchema.createSMSTemplate), authorize, SMS.createSMSTemplate);
router.get('/sms/getSMSTemplate', authorize, SMS.viewSMSTemplate);
router.post('/sms/viewSMSTemplateByFilters', validateRequest.validateBodyRequest(smsSchema.viewSMSTemplateByFilters), authorize, SMS.viewSMSTemplateFilters);
router.put('/sms/updateSMSTemplate', validateRequest.validateBodyRequest(smsSchema.updateSMSTemplate), authorize, SMS.updateSMSTemplate);
router.put('/sms/updateSMSTemplateStatus', authorize, SMS.updateSMSTemplateStatus);
router.delete('/sms/deleteSMSApi', authorize, SMS.deleteSMSApi);
router.delete('/sms/deleteSMSPlan', authorize, SMS.deleteSMSPlan);
router.delete('/sms/deleteSMSTemplate', authorize, SMS.deleteSMSTemplate);
router.post('/sms/createService', validateRequest.validateBodyRequest(smsSchema.CreateSMSService), authorize, SMS.CreateSMSService);
router.get('/sms/getSMSService', authorize, SMS.viewSMSConfigService);
router.get('/sms/associateUsers', authorize, SMS.viewSMSPlanAssociateUsers);
router.get('/sms/customer_sms_id', authorize, SMS.getCustomerSMSid);
router.post('/sms/getCustomerRemainingSMS', authorize, SMS.getCustomerSMSInfo);
router.post('/sms/resetCustomerSMSPackage', authorize, SMS.resetCustomerSMSPackage);
router.get('/sms/getAdminSMSReportInfo', authorize, SMS.getAdminSMSReportInfo);
router.post('/sms/getAdminSMSReportByFilters', validateRequest.validateBodyRequest(smsSchema.getAdminSMSReportByFilters), authorize, SMS.getAdminSMSReportByFilters);
router.get('/sms/getCustomerSMSReportInfo', authorize, SMS.getCustomerSMSReportInfo);
router.get('/sms/auditbymsg', authorize, SMS.auditbymsg);// for dialog 
router.get('/sms/getProviderAssociateSms', authorize, SMS.getProviderAssociateSms);

router.post('/sms/getCustomerSMSReportByFilters', validateRequest.validateBodyRequest(smsSchema.getCustomerSMSReportByFilters), authorize, SMS.getCustomerSMSReportByFilters);
router.post('/sms/createSMSCharge', authorize, SMS.createSMSCharge);
router.post('/sms/send', authorize, SMS.sendSms);

//Appointment
router.post('/appointment/createAppotmentIVR', validateRequest.validateBodyRequest(appointmentSchema.createAppointmentIVR), authorize, appointment.createAppointmentIVR);
router.get('/appointment/getAllAppotmentIVR', authorize, appointment.viewAllAppointmentIVR);
router.get('/appointment/viewAppointmentHistory', authorize, appointment.viewAppointmentHistory);

router.post('/appointment/getAppointmentIVRByFilters', validateRequest.validateBodyRequest(appointmentSchema.getAppointmentIVRByFilters), authorize, appointment.getAppointmentIVRByFilters);
// router.post('/appointment/getAppointmentHistoryByFilters', authorize, appointment.getAppointmentHistoryByFilters); //filter appointment History od data

router.put('/appointment/updateAppointmentIVR', validateRequest.validateBodyRequest(appointmentSchema.updateAppointmentIVR), authorize, appointment.updateAppointmentIVR);
router.delete('/appointment/deleteAppointmentIVR', authorize, appointment.deleteAppointmentIVR);
router.get('/appointment/getCdrInfo', authorize, appointment.viewAppointment_CDR);
router.post('/appointment/getCdrByFilters', validateRequest.validateBodyRequest(appointmentSchema.getCdrByFilters), authorize, appointment.getAppointment_CdrByFilters);

//Realtime-dashboard
router.get('/dashboard/getRegisteredExtension', authorize, dashboard.getRegisteredExtension);
router.post('/dashboard/FilterRegisteredExtension', authorize, dashboard.FilterRegisteredExtension);
router.post('/dashboard/FilterRegisteredAllExtension', authorize, dashboard.FilterRegisteredAllExtension);
router.get('/realtime-dashboard/getCustomerFullDetails', authorize, dashboard.getCustomerFullDetails);
router.get('/realtime-dashboard/getCustomerCallDetails', authorize, dashboard.getCustomerCallDetails);
router.get('/realtime-dashboard/allCallDetails', authorize, dashboard.getAllCallDetails);
router.get('/realtime-dashboard/getAllResellerCallDetails', authorize, dashboard.getAllResellerCallDetails);
router.get('/dashboard/getCustomerExtension', authorize, dashboard.getCustomerExtensionInfo);


//permission
router.post('/permission/getAdminUrls', authorize, permission.getAdminUrls);
router.post('/permission/create', validateRequest.validateBodyRequest(premissionSchema.createPermission), authorize, permission.createPermission);
router.post('/permission/getPermissionList', authorize, permission.getPermissionList);
router.post('/permission/getResellerPermission', authorize, permission.getResellerPermission);
router.post('/permission/getPermissionById', authorize, permission.getPermissionById);
router.post('/permission/getPermissionByUserId', validateRequest.validateBodyRequest(resellerSchema.getPermissionByUserId), authorize, permission.getPermissionByUserId);
router.post('/permission/update', validateRequest.validateBodyRequest(premissionSchema.updatePermission), authorize, permission.updatePermission);
router.post('/permission/getPermissionUsers', validateRequest.validateBodyRequest(premissionSchema.getPermissionUsers), authorize, permission.getPermissionUsers);
router.post('/permission/createExtraPermission', authorize, permission.createExtraPermission);
router.post('/permission/getExtraPermission', authorize, permission.getExtraPermission);
router.post('/permission/deletePermission', authorize, permission.deletePermission);
router.post('/permission/verifyName', authorize, permission.verifyName);
router.post('/permission/getPermissionListByFilter', authorize, permission.getPermissionListByFilter);
router.get('/permission/getSubAdminPer', authorize, permission.getSubAdminPer);

//API Integration
router.post('/esl_api', authorize, backendAPIintegration.createCallQueueAPI);

//Call Rate Group
router.post('/callPlan/createCallRateGroup', authorize, callRateGroup.createCallRateGroup);
router.post('/callPlan/viewCallRateGroup', authorize, callRateGroup.viewCallRateGroup);
router.post('/callPlanRate/getCallRateGroupByFilters', authorize, callRateGroup.getCallRateGroupByFilters);
router.get('/callPlan/getAllRatesFromGroup', authorize, callRateGroup.getAllRatesFromGroup);
router.post('/callPlanRate/ViewgetCallRateGroup', authorize, callRateGroup.ViewgetCallRateGroup);
router.post('/callPlan/associateCallRates', authorize, callRateGroup.getAssociateCallRates);
router.get('/callPlan/checkCallRateMapping', authorize, callRateGroup.checkCallRateMapping);


//IM-Group
router.get('/imGroup/viewImGroup', authorize, imGroup.viewImGroup);
router.post('/imGroup/deleteImGroup', authorize, imGroup.deleteImGroup);
router.post('/imGroup/createImGroup', validateRequest.validateBodyRequest(imSchema.createImGroup), authorize, imGroup.createImGroup);
router.get('/imGroup/getGroupById', authorize, imGroup.getGroupById);
router.post('/imGroup/updateImGroup', authorize, imGroup.updateImGroup);
router.post('/imGroup/filterImGroup', validateRequest.validateBodyRequest(imSchema.filterImGroup), authorize, imGroup.filterImGroup);


//Minute Plan
router.post('/callPlan/createBundlePlan', authorize, bundlePlan.createBundlePlan);
router.post('/callPlan/viewBundlePlan', authorize, bundlePlan.viewBundlePlan);
router.post('/callPlan/updateBundlePlan', authorize, bundlePlan.updateBundlePlan);
router.post('/callPlan/getBundlePlanByFilters', authorize, bundlePlan.getBundlePlanByFilters);
router.post('/minutePlan/viewCustomerBundlePlan',validateRequest.validateBodyRequest(TCSchema.viewCustomerBundlePlan), authorize, bundlePlan.viewCustomerBundlePlan);
router.post('/minutePlan/viewCustomerBundlePlanAllRates', authorize, bundlePlan.viewCustomerBundlePlanAllRates);

router.post('/minutePlan/viewCustomerRoamingPlan', validateRequest.validateBodyRequest(callPlanSchema.viewCustomerRoamingPlan), authorize, bundlePlan.viewCustomerRoamingPlan);
router.post('/minutePlan/viewCustomerDidBundlePlan', validateRequest.validateBodyRequest(callPlanSchema.viewCustomerDidBundlePlan), authorize, bundlePlan.viewCustomerDidBundlePlan);
router.post('/minutePlan/viewCustomerBoosterPlan', validateRequest.validateBodyRequest(callPlanSchema.viewCustomerBoosterPlan), authorize, bundlePlan.viewCustomerBoosterPlan);
router.post('/minutePlan/purchaseBoosterPlan', validateRequest.validateBodyRequest(bundlePlanSchema.purchaseBoosterPlanSchema), authorize, bundlePlan.purchaseBoosterPlanByCustomers);
router.post('/minutePlan/viewExtensionCallMinutes', authorize, bundlePlan.viewExtensionCallMinute);
router.get('/minutePlan/viewBoosterHistory', authorize, bundlePlan.viewBoosterPlanHistory);
router.post('/minutePlan/getBoosterPlanHistoryByFilters', validateRequest.validateBodyRequest(callPlanSchema.getBoosterPlanHistoryByFilters), authorize, bundlePlan.getBoosterPlanHistoryByFilters);
router.post('/minutePlan/viewBundleAndRoamingHistory', validateRequest.validateBodyRequest(callPlanSchema.viewBundleAndRoamingHistory), authorize, bundlePlan.viewBundleAndRoamingPlanHistory);
router.post('/minutePlan/viewBundleAndRoamingHistoryByFilters', authorize, bundlePlan.viewBundleAndRoamingHistoryByFilters);
router.get('/minutePlan/getBundleAndRoamingAuditLogsByPlan', authorize, bundlePlan.getBundleAndRoamingAuditLogsByPlan);
router.get('/callPlan/getAllUsersFromPlan', authorize, bundlePlan.getAllUsersFromMinutePlan);
router.get('/callPlan/getAllUsersFromBoosterPlan', authorize, bundlePlan.getAllUsersFromBoosterMinutePlan);
router.delete('/callPlan/deleteMinutePlan', authorize, bundlePlan.deleteMinutePlan);
router.delete('/callPlan/deleteBoosterPlan', authorize, bundlePlan.deleteBoosterPlan);
router.post('/minutePlan/viewCustomerTeleconsultancyPlan', authorize, bundlePlan.viewCustomerTeleconsultancyPlan);
router.post('/minutePlan/viewCustomerOutgoingBundlePlan', authorize, bundlePlan.viewCustomerOutgoingBundlePlan);
router.post('/minutePlan/viewBoosterPlanByType', authorize, bundlePlan.viewBoosterPlanByType);
router.post('/minutePlan/viewCustomerAccordingByType', authorize, bundlePlan.viewCustomerBasedByType);
router.post('/minutePlan/getCustomerBoosterPlanByFilters',validateRequest.validateBodyRequest(TCSchema.getCustomerBoosterPlanByFilters), authorize, bundlePlan.getCustomerBoosterPlanByFilters);
router.get('/minutePlan/getBoosterAssociateRates', authorize, bundlePlan.getBoosterAssociateRates);
router.post('/minutePlan/getBundlePlanByFilters', validateRequest.validateBodyRequest(bundlePlanSchema.filterBundlePlan), authorize, bundlePlan.getMinutePlanForPackageCretion);
router.get('/minutePlan/getAllMinutePlanBasedOnPackage', authorize, bundlePlan.getAllMinutePlanBasedOnPackaedId);
router.get('/minutePlan/getCallPlanRateOfCustomer', authorize, bundlePlan.getCallPlanRateOfCustomer);
router.post('/minute/getAllMappedPackage', validateRequest.validateBodyRequest(smsSchema.minuteAssociatePackage), authorize, bundlePlan.minuteAssociatePackage);

//Report
router.get('/report/getCallDateHourWise', authorize, report.viewCallDateHourWise);
router.post('/report/getCallDateHourWiseByFilters', validateRequest.validateBodyRequest(reportModuleSchema.getCallDateHourWiseByFilters), authorize, report.getCallDateHourWiseByFilters);
router.get('/report/getCallChargesDateWise', authorize, report.viewCallChargesDateWise);
router.post('/report/getCallChargesDateWiseByFilters', authorize, report.getCallChargesDateWiseByFilters);
router.get('/report/getCustomersChargesDateWise', authorize, report.viewCustomersChargesDateWise);
router.post('/report/getCustomersChargesDateWiseByFilters', authorize, report.getCustomersChargesDateWiseByFilters);
router.get('/report/getCustomersCallDetails', authorize, report.viewCustomersCallDetails);
router.post('/report/getCustomersCallDetailsByFilters', validateRequest.validateBodyRequest(reportModuleSchema.getCustomersCallDetailsByFilters), authorize, report.getCustomersCallDetailsByFilters);
router.get('/report/getProvidersCallChargesDateWise', authorize, report.viewProvidersCallChargesDateWise);
router.post('/report/getProvidersCallChargesDateWiseByFilters', authorize, report.getProvidersCallChargesDateWiseByFilters);
router.get('/report/getMinutePlanCallDetails', authorize, report.getMinutePlanCallDetails);
router.post('/report/getMinutePlanCallDetailsByFilters', authorize, report.getMinutePlanCallDetailsByFilters);

// ALL BACKEND API lOGS
router.get('/apiLogs/auditbyId', authorize, activityLog.auditbyId);// for dialoge
router.get('/apiLogs/getAllApiLog', authorize, activityLog.getAllBackendAPILog);
router.post('/apiLogs/getApiLogByFilter', validateRequest.validateBodyRequest(auditLogSchema.getApiLogByFilter), authorize, activityLog.getAllBackendAPILogByFilter);
router.get('/apiLogs/packageAuditLog', authorize, activityLog.getAllPackageAuditLog);
router.post('/apiLogs/packageAuditLogByFilter', authorize, validateRequest.validateBodyRequest(auditLogSchema.getAllPackageAuditLogByFilter), activityLog.getAllPackageAuditLogByFilter);
router.get('/apiLogs/getCountryListActive', authorize, activityLog.getCountryListActive);


//C2C
router.get('/c2c/getStatus', authorize, activityLog.getC2CStatus);

//RESELLER
router.get('/reseller/user_list', authorize, reseller.getReseller);
router.get('/reseller/getResellerID', authorize, reseller.getResellerID);
router.get('/reseller/getResellerRupeeID', authorize, reseller.getResellerRupeeID);
router.post('/reseller/filterReseller', validateRequest.validateBodyRequest(resellerSchema.filterReseller), authorize, reseller.getResellerByFilter);
router.get('/reseller/getproduct', authorize, reseller.getResellerProduct);

//plugin
router.post('/plugin/getPluginByCustomer', validateRequest.validateBodyRequest(pluginSchema.customerPlugin), authorize, plugin.getPluginByCustomer)
router.post('/plugin/createPlugin', authorize, plugin.createPlugin);
router.post('/plugin/updatePluginDetails', authorize, plugin.updatePluginDetails);
router.get('/plugin/deletePlugin', authorize, plugin.deletePlugin);
router.get('/plugin/getPluginByFilter', authorize, plugin.getPluginByFilter);
router.post('/plugin/getPluginById', authorize, plugin.getPluginByID);
router.get('/plugin/getCountryByDest', authorize, plugin.getCountryByDest);

//Product Profile
router.post('/pbx/setLogoProfile', authorize, user.setLogo); // Yash kashyap
router.get('/pbx/getLogoPath', authorize, user.getLogoProfile); // Yash kashyap

//Trunk
router.post('/trunk/postTrunkList', authorize, validateRequest.validateBodyRequest(trunkSchema.postTrunkList), trunk.postTrunkList);
router.post('/trunk/postTrunkRouting', authorize, validateRequest.validateBodyRequest(trunkSchema.postTrunkRouting), trunk.postTrunkRouting);
router.post('/trunk/updateTrunkList', validateRequest.validateBodyRequest(trunkSchema.updateTrunkList), authorize, trunk.updateTrunkList);
router.post('/trunk/updateRouting', authorize, validateRequest.validateBodyRequest(trunkSchema.updateRouting), trunk.updateRouting);
router.get('/trunk/getTrunkList', authorize, trunk.getTrunkList);
router.post('/trunk/getGeneralPrompt', authorize, trunk.getGeneralPrompt);
router.post('/trunk/getTrunkById', validateRequest.validateBodyRequest(trunkSchema.trunkById), authorize, trunk.getTrunkById);
router.get('/trunk/getActiveCustomers', authorize, trunk.getActiveCustomers);
router.get('/trunk/getSofiaProfile', authorize, trunk.getSofiaProfile);
router.post('/trunk/deleteTrunk', authorize, trunk.deleteTrunk);
router.post('/trunk/deleteRoute', authorize, trunk.deleteRoute);
router.post('/trunk/getTrunkLIstByFilter', validateRequest.validateBodyRequest(trunkSchema.filterTrunkList), authorize, trunk.getTrunkLIstByFilter);
router.post('/trunk/getTrunkRoutingByFilter', validateRequest.validateBodyRequest(trunkSchema.getTrunkRoutingByFilter), authorize, trunk.getTrunkRoutingByFilter);
router.post('/trunk/getTrunkListById', validateRequest.validateBodyRequest(trunkSchema.trunkListById), authorize, trunk.getTrunkListById);
router.post('/trunk/getTrunkRoutingById', authorize, trunk.getTrunkRoutingById);
router.post('/trunk/getTrunkRouting', validateRequest.validateBodyRequest(trunkSchema.trunkRoutingList), authorize, trunk.getTrunkRouting);

// Audit logs routes
router.post('/audit/getAuditLogByFilter', validateRequest.validateBodyRequest(auditLogSchema.getAuditLogByFilter), authorize, audit.getAuditLogByFilter);
router.get('/audit/getAuditInfo', authorize, audit.getAuditInfo);
router.get('/audit/getAuditLog', authorize, audit.getAuditLog);
router.get('/audit/getSmtpAuditLog', authorize, audit.getSmtpAuditLog);
router.post('/audit/getSmtpAuditLogByFilter', validateRequest.validateBodyRequest(auditLogSchema.getSmtpAuditLogByFilter), authorize, audit.getSmtpAuditLogByFilter);

//OBD
router.get('/obd/getIvr', authorize, obd.getIvr);
router.get('/obd/viewSMSActive', authorize, obd.viewSMSActive);
router.get('/obd/getObdByCustomer', authorize, obd.getObdByCustomer);
router.get('/obd/getOdbById', authorize, obd.getOdbById);
router.get('/obd/getOBDReport', authorize, obd.getOBDReport);
// router.get('/obd/obdreportstatusNotlive', authorize, obd.obdreportstatusNotlive); 
router.post('/obd/getObdCDRByFilter', authorize, obd.getObdCDRByFilter);
router.post('/obd/getObdApiCDRByFilter', authorize, obd.getObdApiCDRByFilter);
router.get('/obd/getObdParticipants', authorize, obd.getObdParticipants);
router.get('/obd/getWhatsappTemp', authorize, obd.getWhatsappTemp);
router.post('/obd/createObd', authorize, obd.createIVR);
router.post('/obd/updateObd', authorize, obd.updateObd);
router.post('/obd/getObdByFilter', authorize, obd.getObdByFilter);
router.get('/obd/deleteObd', authorize, obd.deleteObd);
router.patch('/obd/partiallyUpdateOC', authorize, obd.partiallyUpdateOC);
router.patch('/obd/partiallyUpdateOCStop', authorize, obd.partiallyUpdateOCStop);
router.get('/obd/getobdCDR', authorize, obd.getobdCDR);
router.get('/obd/getobdApiCDR', authorize, obd.getobdApiCDR);
router.get('/obd/getOBDRecording', authorize, obd.getOBDRecording);
router.get('/obd/getStatusOBD', authorize, obd.getStatusOBD);
router.get('/obd/getOBDassocieateCDR', authorize, obd.getOBDassocieateCDR);
router.post('/obd/getOBDreportFilter', authorize, obd.getOBDreportFilter);
router.get('/obd/livecallforOBD', authorize, obd.livecallforOBD);
router.post('/obd/getOBDRecordingByFilter', authorize, obd.getOBDRecordingByFilter);
router.post('/obd/deleteOBDRecording', authorize, obd.deleteOBDRecording);
router.patch('/obd/insetDidInObd', authorize, obd.insertDidInObd);





// WHATSAPP
router.post('/whatsapp/addTemplate', authorize, whatsapp.createWhatsappTemplate);
router.post('/whatsapp/templateListing', authorize, whatsapp.getTemplate);
router.post('/whatsapp/deleteTemplate', authorize, whatsapp.deleteTemplate);
router.get('/whatsapp/getTemplateById', authorize, whatsapp.getTemplateById);
router.post('/whatsapp/updateTemplate', authorize, whatsapp.updateTemplateDetail);
router.get('/whatsapp/providerListing', authorize, whatsapp.providerList);
router.post('/socialMedia/addChannel', authorize, whatsapp.createSocialMediaChannel);
router.get('/socialMedial/socialChannelListing', authorize, whatsapp.getMediaChannel);
router.post('/socialMedial/deleteSocialGroup', authorize, whatsapp.deleteSocialGroup);
router.get('/socialMedial/getSocialById', authorize, whatsapp.getSocialById);
router.post('/socialMedial/updateSocialMediaChannel', authorize, whatsapp.updateSocialMediaChannel);
router.post('/socialMedial/getSocialFilter', authorize, whatsapp.getSocialFilter);

//VOICEBOT  
router.post('/voicebot/createVoicebot', authorize, validateRequest.validateBodyRequest(voicebotSchema.createVoicebot), voicebot.createVoicebot);
router.post('/voicebot/updateVoicebotData', authorize, validateRequest.validateBodyRequest(voicebotSchema.updateVoicebotData), voicebot.updateVoicebotData);
router.post('/voicebot/getVoicebotListByFilter', authorize, validateRequest.validateBodyRequest(voicebotSchema.getVoicebotListByFilter), voicebot.getVoicebotListByFilter);
router.get('/voicebot/getVoicebotList', authorize, voicebot.getVoicebotList);
router.post('/voicebot/getVoicebotById', authorize, voicebot.getVoicebotById);
router.get('/voicebot/getVoicebotCDR', authorize, voicebot.getVoicebotCDR);
router.get('/voicebot/getVoicebotCount', authorize, voicebot.getVoicebotCount);
router.post('/voicebot/getVoicebotCDRByFilter', authorize, validateRequest.validateBodyRequest(voicebotSchema.getVoicebotCDRByFilter), voicebot.getVoicebotCDRByFilter);
router.post('/voicebot/deleteVoicebot', authorize, voicebot.deleteVoicebot);




router.get('/user/getScriptURL', authorize, user.getScriptURL);
router.get('/user/getCustomerIdByExtensionId', authorize, user.getCustomerIdByExtensionId);
router.get('/user/getResellerCredByCust', authorize, user.getResellerCredByCust);
router.get('/user/getSubadminCredById', authorize, user.getSubadminCredById);
router.get('/user/getResellerCredById', authorize, user.getResellerCredById);


router.post('/call_connection/createApiIntegration', authorize, thirdPartyIntegration.createApiIntegration);
router.get('/call-connection/getApiIntegration', authorize, thirdPartyIntegration.getApiIntegration);
router.get('/call-connection/getApiIntegrationById', authorize, thirdPartyIntegration.getApiIntegrationById);
router.delete('/call-connection/deleteIntegration', authorize, thirdPartyIntegration.deleteApiIntegration);
router.post('/call-connection/getApiIntegrationByFilter', authorize, thirdPartyIntegration.getApiIntegrationByFilter);

router.get('/email/emailExpireToken', auth.emailExpireToken);
//JWT Token Apply
router.get('/extensionDashboard/getExtensionDashboardSpeeddial', authorize, extensionDashboard.getExtensionDashboardSpeeddial);
router.get('/extensionDashboard/getExtensionDashboardCallForward', authorize, extensionDashboard.getExtensionDashboardCallForward);
router.get('/extensionDashboard/getExtensionDashboardFeatures', authorize, extensionDashboard.getExtensionDashboardFeatures);
router.get('/extensionDashboard/getExtensionDashboardVoiceMail', authorize, extensionDashboard.getExtensionDashboardVoiceMail);

router.get('/extension/getExtensionName', authorize, extension.getExtensionName);
router.post('/extension/extensionEmailExist', authorize, extension.extensionEmailExist);

router.get('/extension/getCustomerExtensionFeatures', authorize, extension.getCustomerExtensionFeatures);
router.post('/extension/getExtensionFeaturesByFilters', validateRequest.validateBodyRequest(extensionSchema.getExtensionFeaturesByFilters), authorize, extension.getExtensionFeaturesByFilters);
router.get('/user/getCustomerName', authorize, user.getCustomerName);
router.get('/user/getCustomerEmail', authorize, user.getCustomerEmail);
// router.get('/getProductProfile',authorize,user.getProductLogo);

router.post('/emailTemplate/viewEmailTemplate', authorize, emailTemplate.viewEmailTemplate);
router.post('/emailTemplate/getEmailTemplateByFilters', validateRequest.validateBodyRequest(emailCategorySchema.getEmailTemplateByFilters), authorize, emailTemplate.getEmailTemplateByFilters);
router.post('/emailTemplate/deleteEmailTemplate', authorize, emailTemplate.deleteEmailTemplate);
router.put('/emailTemplate/updateEmailTemplateStatus', validateRequest.validateBodyRequest(emailCategorySchema.updateEmailTemplateStatus), authorize, emailTemplate.updateEmailTemplateStatus);
router.get('/emailTemplate/getEmailContentUsingCategory', authorize, emailTemplate.getEmailContentUsingCategory);
router.post('/emailTemplate/createEmailTemplate', validateRequest.validateBodyRequest(emailCategorySchema.createEmailTemplate), authorize, emailTemplate.createEmailTemplate);
router.get('/emailTemplate/checkExistedCategory', authorize, emailTemplate.checkExistedCategory);
router.post('/emailTemplate/checkMultipleStatus', validateRequest.validateBodyRequest(emailCategorySchema.checkMultipleStatus), authorize, emailTemplate.checkMultipleStatus);
router.get('/emailTemplate/countEmailTemplate', authorize, emailTemplate.countEmailTemplate);
router.get('/emailTemplate/getProductEmailCategory', authorize, emailTemplate.getProductEmailCategory);;
// router.get('/getProductProfile',authorize,user.getProductLogo);
router.put('/auth/updatePassword/user', authorize, auth.updatePassword);
router.post('/auth/getMenuListForOcPbx', authorize, auth.getMenuListForOcPbx);
router.post('/auth/makeNotificationAsRead', validateRequest.validateBodyRequest(authSchema.notificationAsRead), authorize, auth.makeNotificationAsRead);



//dynamic ivr
router.get('/dynamicIvr/getDynamicIvrLIst', authorize, dynamicIvr.getDynamicIvrList);
router.post('/dynamicIvr/filterDynamicIvrList', authorize, dynamicIvr.filterDynamicIvrList);
router.post('/dynamicIvr/saveDynamicIvr', authorize, dynamicIvr.saveDynamicIvr);





module.exports = router;
//  ????